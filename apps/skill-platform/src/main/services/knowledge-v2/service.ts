import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import type {
  IKbDirectoryImportRequest,
  IKbEmbeddingConfig,
  IKbFileImportRequest,
  IKbIngestOptions,
  IKbRetrievalRequest,
} from '@/types/modules/kb';

import { createChunks, estimateTokens } from './chunker';
import { openKnowledgeStorage, type IKnowledgeStorage } from './database';
import { embedTexts } from './embedding';
import { KnowledgeError } from './error';
import { KnowledgeIngestion } from './ingestion';
import { parseKnowledgeFile } from './parser';
import { KnowledgeRepository } from './repository';
import { KnowledgeRetrieval } from './retrieval';
import { LanceVectorIndex } from './vector-index';

export class KnowledgeV2Service {
  readonly storage: IKnowledgeStorage;
  readonly repository: KnowledgeRepository;
  readonly vectorIndex: LanceVectorIndex;
  readonly ingestion: KnowledgeIngestion;
  readonly retrieval: KnowledgeRetrieval;

  constructor(rootPath: string) {
    this.storage = openKnowledgeStorage(rootPath);
    this.repository = new KnowledgeRepository(this.storage.db);
    this.vectorIndex = new LanceVectorIndex(this.storage.lancePath);
    this.ingestion = new KnowledgeIngestion(this.storage, this.repository, this.vectorIndex);
    this.retrieval = new KnowledgeRetrieval(this.repository, this.vectorIndex);
  }

  listCollections() {
    return this.repository.listCollections();
  }

  createCollection(name: string, description?: string) {
    return this.repository.createCollection(name, description);
  }

  updateCollection(id: string, patch: { name?: string; description?: string }) {
    return this.repository.updateCollection(id, patch);
  }

  async deleteCollection(id: string): Promise<void> {
    const collection = this.repository.requireCollection(id);
    if (collection.embeddingProfileId !== 'unconfigured') {
      await this.vectorIndex.deleteCollection(collection.embeddingProfileId, id);
    }
    this.repository.deleteCollection(id);
  }

  importFiles(request: IKbFileImportRequest) {
    return this.ingestion.importFiles(request);
  }

  importDirectory(request: IKbDirectoryImportRequest) {
    return this.ingestion.importDirectory(request);
  }

  pasteText(input: {
    collectionId: string;
    text: string;
    filename?: string;
    ingest: IKbIngestOptions;
    embedding: IKbEmbeddingConfig;
  }) {
    return this.ingestion.pasteText(input);
  }

  listDocuments(collectionId: string) {
    return this.repository.listDocuments(collectionId);
  }

  getDocument(documentId: string) {
    return this.repository.getDocument(documentId);
  }

  listChunks(documentId: string, page?: number, pageSize?: number, keyword?: string) {
    return this.repository.listChunks(documentId, page, pageSize, keyword);
  }

  getChunk(chunkId: string) {
    return this.repository.getChunk(chunkId);
  }

  async editChunk(chunkId: string, content: string, embedding: IKbEmbeddingConfig) {
    const edit = this.repository.beginChunkEdit(chunkId, content);
    try {
      const embedded = await embedTexts([edit.content], embedding, { cache: this.repository });
      if (embedded.fingerprint !== edit.fingerprint) {
        throw new KnowledgeError({
          code: 'EMBEDDING_PROFILE_MISMATCH',
          stage: 'embedding',
          message: '当前嵌入配置与该知识库索引不一致',
          details: { expected: edit.fingerprint, actual: embedded.fingerprint },
          allowedManualActions: ['reconfigure', 'open_logs'],
        });
      }
      this.repository.beginChunkEditIndex({
        jobId: edit.jobId,
        collectionId: edit.collectionId,
        documentId: edit.documentId,
        revisionId: edit.revisionId,
        fingerprint: edit.fingerprint,
      });
      await this.vectorIndex.replaceChunk(edit.fingerprint, edit.chunkId, {
        chunk_id: edit.newChunkId,
        collection_id: edit.collectionId,
        document_id: edit.documentId,
        revision_id: edit.revisionId,
        parent_chunk_id: edit.parentChunkId,
        enabled: true,
        content: edit.content,
        heading_path: edit.headingPath,
        source_path: edit.sourcePath,
        page: edit.page,
        vector: embedded.vectors[0],
      });
      this.repository.completeChunkEdit({
        ...edit,
        tokenCount: estimateTokens(edit.content),
      });
      return { jobId: edit.jobId };
    } catch (error) {
      const knowledgeError =
        error instanceof KnowledgeError
          ? error
          : new KnowledgeError({
              code: 'CHUNK_EDIT_FAILED',
              stage: 'vector_index',
              message: error instanceof Error ? error.message : String(error),
              allowedManualActions: ['retry', 'reconfigure', 'open_logs'],
              cause: error,
            });
      this.repository.failChunkEdit(edit.versionId, edit.jobId, knowledgeError);
      throw knowledgeError;
    }
  }

  async deleteChunks(chunkIds: string[]): Promise<void> {
    const rows = this.repository.getChunksForDelete(chunkIds);
    const groups = new Map<string, string[]>();
    for (const row of rows) {
      const ids = groups.get(row.fingerprint) || [];
      ids.push(row.chunkId);
      groups.set(row.fingerprint, ids);
    }
    for (const [fingerprint, ids] of groups) {
      await this.vectorIndex.deleteChunks(fingerprint, ids);
    }
    this.repository.deleteChunks(chunkIds);
  }

  async previewFile(filePath: string, ingest: IKbIngestOptions) {
    const document = await parseKnowledgeFile(filePath, { forceOcr: ingest.forceOcr });
    return {
      parserId: document.parserId,
      mime: document.mime,
      qualityScore: document.qualityScore,
      notices: document.notices,
      counts: document.counts,
      chunks: createChunks(document, ingest.segmentSettings)
        .filter((chunk) => chunk.kind === 'child')
        .slice(0, 20)
        .map((chunk) => ({
          idx: chunk.idx,
          content: chunk.content,
          headingPath: chunk.headingPath,
          page: chunk.page,
          sheet: chunk.sheet,
        })),
    };
  }

  async parseAttachment(input: {
    base64?: string;
    ext?: string;
    mime?: string;
  }): Promise<{ text: string; snippet: string }> {
    if (!input.base64?.trim()) {
      throw new KnowledgeError({
        code: 'ATTACHMENT_CONTENT_REQUIRED',
        stage: 'source',
        message: '附件缺少文件内容。',
        allowedManualActions: ['reimport'],
      });
    }
    const bytes = Buffer.from(input.base64, 'base64');
    if (!bytes.length || bytes.length > 100 * 1024 * 1024) {
      throw new KnowledgeError({
        code: bytes.length ? 'SOURCE_FILE_TOO_LARGE' : 'SOURCE_EMPTY',
        stage: 'source',
        message: bytes.length ? '附件超过 100MB 限制。' : '附件内容为空。',
        details: { size: bytes.length },
        allowedManualActions: ['reimport'],
      });
    }
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'aim-attachment-'));
    const ext = /^\.[a-z0-9]+$/i.test(input.ext || '') ? input.ext! : '.txt';
    const filePath = path.join(directory, 'attachment' + ext);
    try {
      await fs.writeFile(filePath, bytes);
      const document = await parseKnowledgeFile(filePath);
      return { text: document.content, snippet: document.content.slice(0, 1_000) };
    } finally {
      await fs.rm(directory, { recursive: true, force: true });
    }
  }

  retryJob(jobId: string, embedding: IKbEmbeddingConfig) {
    return this.ingestion.retryJob(jobId, embedding);
  }

  cancelJob(jobId: string) {
    return { cancelled: this.ingestion.cancelJob(jobId) };
  }

  listJobs(limit?: number) {
    return this.repository.listJobs(limit);
  }

  async deleteDocument(documentId: string): Promise<void> {
    const document = this.repository.getDocument(documentId);
    if (!document) {
      throw new KnowledgeError({
        code: 'DOCUMENT_NOT_FOUND',
        stage: 'source',
        message: `文档不存在：${documentId}`,
        allowedManualActions: ['open_logs'],
      });
    }
    const collection = this.repository.requireCollection(document.collectionId);
    if (collection.embeddingProfileId !== 'unconfigured') {
      await this.vectorIndex.deleteDocument(collection.embeddingProfileId, documentId);
    }
    this.repository.deleteDocument(documentId);
  }

  retrieve(request: IKbRetrievalRequest) {
    return this.retrieval.retrieve(request);
  }

  retrieveForChat(request: IKbRetrievalRequest) {
    return this.retrieval.retrieve(request);
  }

  async close(): Promise<void> {
    await this.vectorIndex.close();
    this.storage.db.close();
  }
}
