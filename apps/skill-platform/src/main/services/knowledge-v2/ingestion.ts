import fs from 'node:fs/promises';
import path from 'node:path';

import type {
  IKbDirectoryImportRequest,
  IKbEmbeddingConfig,
  IKbFileImportRequest,
  IKbImportResultItem,
  IKbIngestOptions,
} from '@/types/modules/kb';

import { createChunks } from './chunker';
import { type IKnowledgeStorage } from './database';
import { embedTexts } from './embedding';
import { KnowledgeError, toKnowledgeError } from './error';
import type { IIngestJobPayload } from './model';
import {
  inferMime,
  isSupportedKnowledgeFile,
  parseKnowledgeFile,
  sha256FileBuffer,
} from './parser';
import { KnowledgeRepository } from './repository';
import { LanceVectorIndex } from './vector-index';

const MAX_FILE_BYTES = 100 * 1024 * 1024;
const MAX_DIRECTORY_FILES = 10_000;
const DEFAULT_IGNORED_DIRECTORIES = new Set([
  '.git',
  'node_modules',
  '.idea',
  '.vscode',
  'dist',
  'out',
]);

interface IQueuedJob {
  collectionId: string;
  documentId: string;
  revisionId: string;
  jobId: string;
  payload: IIngestJobPayload;
}

export class KnowledgeIngestion {
  private queueTail: Promise<void> = Promise.resolve();
  private readonly activeControllers = new Map<string, AbortController>();

  constructor(
    private readonly storage: IKnowledgeStorage,
    private readonly repository: KnowledgeRepository,
    private readonly vectorIndex: LanceVectorIndex,
  ) {}

  async importFiles(request: IKbFileImportRequest): Promise<IKbImportResultItem[]> {
    this.repository.requireCollection(request.collectionId);
    if (!request.filePaths.length) {
      throw new KnowledgeError({
        code: 'NO_FILES_SELECTED',
        stage: 'source',
        message: '请选择至少一个文件',
        allowedManualActions: ['reimport'],
      });
    }
    const results: IKbImportResultItem[] = [];
    for (const filePath of request.filePaths) {
      results.push(
        await this.prepareFile({
          collectionId: request.collectionId,
          filePath,
          sourceType: 'file',
          ingest: request.ingest,
          embedding: request.embedding,
        }),
      );
    }
    return results;
  }

  async importDirectory(request: IKbDirectoryImportRequest): Promise<IKbImportResultItem[]> {
    this.repository.requireCollection(request.collectionId);
    const root = await fs.realpath(request.directoryPath);
    const stat = await fs.stat(root);
    if (!stat.isDirectory()) {
      throw new KnowledgeError({
        code: 'SOURCE_NOT_DIRECTORY',
        stage: 'source',
        message: '所选路径不是目录',
        details: { directoryPath: request.directoryPath },
        allowedManualActions: ['reimport'],
      });
    }
    const files = await this.walkDirectory(root, request.recursive !== false, request.ignore || []);
    if (!files.length) {
      throw new KnowledgeError({
        code: 'DIRECTORY_HAS_NO_SUPPORTED_FILES',
        stage: 'source',
        message: '目录中没有支持的文档',
        details: { directoryPath: root },
        allowedManualActions: ['reimport'],
      });
    }
    const output: IKbImportResultItem[] = [];
    for (const filePath of files) {
      output.push(
        await this.prepareFile({
          collectionId: request.collectionId,
          filePath,
          sourceType: 'directory',
          sourceUri: root,
          relativePath: path.relative(root, filePath),
          ingest: request.ingest,
          embedding: request.embedding,
        }),
      );
    }
    return output;
  }

  async pasteText(input: {
    collectionId: string;
    text: string;
    filename?: string;
    ingest: IKbIngestOptions;
    embedding: IKbEmbeddingConfig;
  }): Promise<IKbImportResultItem> {
    this.repository.requireCollection(input.collectionId);
    const content = input.text.trim();
    if (!content) {
      throw new KnowledgeError({
        code: 'PASTED_TEXT_EMPTY',
        stage: 'source',
        message: '粘贴文本不能为空',
        allowedManualActions: ['reimport'],
      });
    }
    const filename =
      (input.filename?.trim() || `粘贴文本-${new Date().toISOString()}`).replace(
        /[\\/:*?"<>|]/g,
        '-',
      ) + '.txt';
    const bytes = Buffer.from(content, 'utf8');
    const blobHash = sha256FileBuffer(bytes);
    const blobPath = path.join(this.storage.blobPath, `${blobHash}.txt`);
    await this.writeBlob(blobPath, bytes);
    const created = this.repository.createImport({
      collectionId: input.collectionId,
      sourceType: 'pasted',
      sourceUri: `pasted:${blobHash}`,
      displayName: filename,
      filename,
      ext: '.txt',
      mime: 'text/plain',
      size: bytes.byteLength,
      blobHash,
      payload: {
        sourcePath: `pasted:${blobHash}`,
        blobPath,
        filename,
        ingest: input.ingest,
        embedding: input.embedding,
      },
    });
    this.enqueue({
      collectionId: input.collectionId,
      documentId: created.docId,
      revisionId: created.revisionId,
      jobId: created.jobId,
      payload: {
        sourcePath: `pasted:${blobHash}`,
        blobPath,
        filename,
        ingest: input.ingest,
        embedding: input.embedding,
      },
    });
    return { docId: created.docId, jobId: created.jobId, filename, size: bytes.byteLength };
  }

  retryJob(jobId: string, embedding: IKbEmbeddingConfig): { jobId: string; docId: string } {
    const retry = this.repository.createRetry(jobId, embedding);
    const document = this.repository.getDocument(retry.docId)!;
    this.enqueue({
      collectionId: document.collectionId,
      documentId: retry.docId,
      revisionId: retry.revisionId,
      jobId: retry.jobId,
      payload: retry.payload,
    });
    return { jobId: retry.jobId, docId: retry.docId };
  }

  cancelJob(jobId: string): boolean {
    const controller = this.activeControllers.get(jobId);
    if (controller) {
      controller.abort();
      return true;
    }
    return this.repository.cancelQueuedJob(jobId);
  }

  private async prepareFile(input: {
    collectionId: string;
    filePath: string;
    sourceType: 'file' | 'directory';
    sourceUri?: string;
    relativePath?: string;
    ingest: IKbIngestOptions;
    embedding: IKbEmbeddingConfig;
  }): Promise<IKbImportResultItem> {
    const realPath = await fs.realpath(input.filePath);
    const stat = await fs.stat(realPath);
    if (!stat.isFile()) {
      throw new KnowledgeError({
        code: 'SOURCE_NOT_FILE',
        stage: 'source',
        message: `所选路径不是文件：${input.filePath}`,
        allowedManualActions: ['reimport'],
      });
    }
    if (!isSupportedKnowledgeFile(realPath)) {
      throw new KnowledgeError({
        code: 'UNSUPPORTED_DOCUMENT_TYPE',
        stage: 'source',
        message: `不支持的文档类型：${path.extname(realPath) || '(无扩展名)'}`,
        details: { filePath: realPath },
        allowedManualActions: ['reimport'],
      });
    }
    if (stat.size <= 0 || stat.size > MAX_FILE_BYTES) {
      throw new KnowledgeError({
        code: stat.size <= 0 ? 'SOURCE_EMPTY' : 'SOURCE_FILE_TOO_LARGE',
        stage: 'source',
        message:
          stat.size <= 0 ? '不能导入空文件' : `文件超过 ${MAX_FILE_BYTES / 1024 / 1024}MB 限制`,
        details: { filePath: realPath, size: stat.size },
        allowedManualActions: ['reimport'],
      });
    }
    const bytes = await fs.readFile(realPath);
    const blobHash = sha256FileBuffer(bytes);
    const ext = path.extname(realPath).toLowerCase();
    const blobPath = path.join(this.storage.blobPath, `${blobHash}${ext}`);
    await this.writeBlob(blobPath, bytes);
    const filename = path.basename(realPath);
    const payload: IIngestJobPayload = {
      sourcePath: realPath,
      blobPath,
      filename,
      relativePath: input.relativePath,
      ingest: input.ingest,
      embedding: input.embedding,
    };
    const created = this.repository.createImport({
      collectionId: input.collectionId,
      sourceType: input.sourceType,
      sourceUri: input.sourceUri || realPath,
      displayName: input.sourceType === 'directory' ? input.sourceUri || realPath : filename,
      filename,
      relativePath: input.relativePath,
      ext,
      mime: inferMime(realPath),
      size: stat.size,
      blobHash,
      payload,
    });
    this.enqueue({
      collectionId: input.collectionId,
      documentId: created.docId,
      revisionId: created.revisionId,
      jobId: created.jobId,
      payload,
    });
    return { docId: created.docId, jobId: created.jobId, filename, size: stat.size };
  }

  private async writeBlob(blobPath: string, bytes: Buffer): Promise<void> {
    try {
      await fs.writeFile(blobPath, bytes, { flag: 'wx' });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
    }
  }

  private async walkDirectory(
    root: string,
    recursive: boolean,
    ignore: string[],
  ): Promise<string[]> {
    const output: string[] = [];
    const visit = async (directory: string): Promise<void> => {
      const entries = await fs.readdir(directory, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isSymbolicLink()) continue;
        const fullPath = path.join(directory, entry.name);
        const relative = path.relative(root, fullPath).replace(/\\/g, '/');
        if (ignore.some((pattern) => relative === pattern || relative.startsWith(`${pattern}/`)))
          continue;
        if (entry.isDirectory()) {
          if (recursive && !DEFAULT_IGNORED_DIRECTORIES.has(entry.name)) await visit(fullPath);
        } else if (entry.isFile() && isSupportedKnowledgeFile(fullPath)) {
          output.push(fullPath);
          if (output.length > MAX_DIRECTORY_FILES) {
            throw new KnowledgeError({
              code: 'DIRECTORY_FILE_LIMIT_EXCEEDED',
              stage: 'source',
              message: `目录中的支持文件超过 ${MAX_DIRECTORY_FILES} 个，请缩小范围后重新导入`,
              allowedManualActions: ['reimport'],
            });
          }
        }
      }
    };
    await visit(root);
    return output.sort((left, right) => left.localeCompare(right));
  }

  private enqueue(job: IQueuedJob): void {
    this.queueTail = this.queueTail
      .then(() => this.process(job))
      .catch((error) => {
        console.error('[knowledge-v2] queued job failed:', error);
      });
  }

  private async process(job: IQueuedJob): Promise<void> {
    const controller = new AbortController();
    this.activeControllers.set(job.jobId, controller);
    try {
      this.assertNotCancelled(controller.signal);
      this.repository.updateStage({ ...job, status: 'parsing', stage: 'parse', progress: 10 });
      const document = await parseKnowledgeFile(job.payload.blobPath, {
        forceOcr: job.payload.ingest.forceOcr,
      });
      this.assertNotCancelled(controller.signal);
      const artifactUri = path.join(this.storage.artifactPath, `${job.revisionId}.json`);
      await fs.writeFile(artifactUri, JSON.stringify(document), 'utf8');

      this.repository.updateStage({ ...job, status: 'chunking', stage: 'chunk', progress: 35 });
      const chunks = createChunks(document, job.payload.ingest.segmentSettings);
      const childChunks = chunks.filter((chunk) => chunk.kind === 'child');
      if (!childChunks.length) {
        throw new KnowledgeError({
          code: 'CHUNKING_EMPTY',
          stage: 'chunk',
          message: '切分后没有可检索文本，请调整源文件或切分配置后手动重试',
          allowedManualActions: ['reconfigure', 'reimport', 'open_logs'],
        });
      }

      this.assertNotCancelled(controller.signal);
      this.repository.updateStage({
        ...job,
        status: 'embedding',
        stage: 'embedding',
        progress: 55,
      });
      const embedded = await embedTexts(
        childChunks.map((chunk) => chunk.embeddingText),
        job.payload.embedding,
        { cache: this.repository, signal: controller.signal },
      );
      const collection = this.repository.requireCollection(job.collectionId);
      if (
        collection.embeddingProfileId !== 'unconfigured' &&
        collection.embeddingProfileId !== embedded.fingerprint
      ) {
        throw new KnowledgeError({
          code: 'EMBEDDING_PROFILE_MISMATCH',
          stage: 'embedding',
          message: '该知识库已绑定其他嵌入模型或向量维度，请恢复原配置或新建知识库',
          details: { expected: collection.embeddingProfileId, actual: embedded.fingerprint },
          allowedManualActions: ['reconfigure', 'reimport', 'open_logs'],
        });
      }

      this.assertNotCancelled(controller.signal);
      this.repository.updateStage({
        ...job,
        status: 'indexing',
        stage: 'vector_index',
        progress: 80,
      });
      this.repository.beginRevisionIndex({
        jobId: job.jobId,
        collectionId: job.collectionId,
        documentId: job.documentId,
        revisionId: job.revisionId,
        embeddingFingerprint: embedded.fingerprint,
        expectedCount: childChunks.length,
      });
      await this.vectorIndex.upsert(
        embedded.fingerprint,
        childChunks.map((chunk, index) => ({
          chunk_id: chunk.id,
          collection_id: job.collectionId,
          document_id: job.documentId,
          revision_id: job.revisionId,
          parent_chunk_id: chunk.parentChunkId || '',
          enabled: true,
          content: chunk.content,
          heading_path: chunk.headingPath.join(' > '),
          source_path: job.payload.relativePath || job.payload.sourcePath,
          page: chunk.page || -1,
          vector: embedded.vectors[index],
        })),
        job.payload.embedding.distance || 'cosine',
      );
      await this.vectorIndex.assertScopeCount({
        fingerprint: embedded.fingerprint,
        collectionIds: [job.collectionId],
        revisionIds: [job.revisionId],
        expectedCount: childChunks.length,
      });
      this.repository.activateRevision({
        collectionId: job.collectionId,
        documentId: job.documentId,
        revisionId: job.revisionId,
        jobId: job.jobId,
        document,
        artifactUri,
        embeddingFingerprint: embedded.fingerprint,
        chunks,
      });
    } catch (error) {
      const knowledgeError = toKnowledgeError(error, {
        code: 'INGEST_FAILED',
        stage: 'source',
        documentId: job.documentId,
        jobId: job.jobId,
        allowedManualActions: ['retry', 'reconfigure', 'reimport', 'open_logs'],
      });
      this.repository.markFailed({
        documentId: job.documentId,
        revisionId: job.revisionId,
        jobId: job.jobId,
        stage: knowledgeError.stage,
        code: knowledgeError.code,
        message: knowledgeError.message,
        status: knowledgeError.code === 'JOB_CANCELLED' ? 'cancelled' : 'failed',
      });
    } finally {
      this.activeControllers.delete(job.jobId);
    }
  }

  private assertNotCancelled(signal: AbortSignal): void {
    if (signal.aborted) {
      throw new KnowledgeError({
        code: 'JOB_CANCELLED',
        stage: 'source',
        message: '任务已由客户取消',
        allowedManualActions: ['retry', 'open_logs'],
      });
    }
  }
}
