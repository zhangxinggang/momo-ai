import type {
  IKbDirectoryImportRequest,
  IKbEmbeddingConfig,
  IKbFileImportRequest,
  IKbIngestOptions,
  IKbRetrievalRequest,
  IKbRetrievalResult,
} from '@/types/modules/kb';

import { parseChatAttachment, type IAttachmentParseInput } from './attachment-parser';
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

  parseAttachment(input: IAttachmentParseInput): Promise<{ text: string; snippet: string }> {
    return parseChatAttachment(input);
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

  async retrieveForChat(request: IKbRetrievalRequest): Promise<IKbRetrievalResult> {
    try {
      return await this.retrieval.retrieve(request);
    } catch (error) {
      if (!(error instanceof KnowledgeError) || error.code !== 'INDEX_NOT_READY') {
        throw error;
      }
      return {
        status: 'no_match',
        query: request.query,
        evidence: [],
        citations: [],
        context: '所选知识库暂无可检索内容或尚未完成首次索引。',
      };
    }
  }

  async close(): Promise<void> {
    await this.vectorIndex.close();
    this.storage.db.close();
  }
}
