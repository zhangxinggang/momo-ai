import { createHash, randomUUID } from 'node:crypto';

import type {
  DKbSegmentSettings,
  EKbDocumentStatus,
  EKnowledgeStage,
  IKbChunkItem,
  IKbCollection,
  IKbDocument,
} from '@/types/modules/kb';
import type { Database } from 'better-sqlite3';

import type { IChunkDraft } from './chunker';
import { KnowledgeError } from './error';
import type {
  IActiveScope,
  IHydratedChunkRow,
  IIngestJobPayload,
  IRankedCandidateRow,
  IStoredIngestPayload,
} from './model';
import { toStoredIngestPayload } from './model';
import type { ICanonicalDocument } from './parser';

const DEFAULT_SEGMENT_SETTINGS: DKbSegmentSettings = {
  separator: '\n\n',
  maxChunkLength: 320,
  chunkOverlap: 40,
  preprocess: { normalizeWhitespace: true, removeUrlsAndEmails: false },
  splitMode: 'code',
};

function placeholders(values: unknown[]): string {
  return values.map(() => '?').join(',');
}

function parseJson<T>(value: string | null | undefined, field: string): T {
  if (!value) {
    throw new KnowledgeError({
      code: 'KNOWLEDGE_DATA_INVALID',
      stage: 'initialize',
      message: `知识库字段 ${field} 缺失，请由客户检查或删除损坏数据`,
      details: { field },
      allowedManualActions: ['open_logs', 'delete'],
    });
  }
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    throw new KnowledgeError({
      code: 'KNOWLEDGE_DATA_INVALID',
      stage: 'initialize',
      message: `知识库字段 ${field} 不是有效 JSON，请由客户检查或删除损坏数据`,
      details: { field },
      allowedManualActions: ['open_logs', 'delete'],
      cause: error,
    });
  }
}

function collectionFromRow(row: Record<string, unknown>): IKbCollection {
  return {
    id: String(row.id),
    name: String(row.name),
    description: row.description ? String(row.description) : undefined,
    embeddingProfileId: String(row.embedding_profile_id),
    retrievalProfileId: String(row.retrieval_profile_id),
    parserProfileId: String(row.parser_profile_id),
    status: row.status === 'error' ? 'error' : 'ready',
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}

function chunkFromRow(row: Record<string, unknown>): IKbChunkItem {
  return {
    chunkId: String(row.id),
    docId: String(row.document_id),
    revisionId: String(row.revision_id),
    parentChunkId: row.parent_chunk_id ? String(row.parent_chunk_id) : undefined,
    idx: Number(row.idx),
    kind: String(row.kind) as IKbChunkItem['kind'],
    content: String(row.content),
    tokenCount: Number(row.token_count),
    headingPath: parseJson<string[]>(
      row.heading_path_json ? String(row.heading_path_json) : undefined,
      'kb_chunks.heading_path_json',
    ),
    page: row.page == null ? undefined : Number(row.page),
    pageEnd: row.page_end == null ? undefined : Number(row.page_end),
    sheet: row.sheet ? String(row.sheet) : undefined,
    cellRange: row.cell_range ? String(row.cell_range) : undefined,
    enabled: Boolean(row.enabled),
    origin: row.origin === 'manual' ? 'manual' : 'parsed',
  };
}

export class KnowledgeRepository {
  constructor(private readonly db: Database) {}

  getEmbedding(profileKey: string, contentHash: string) {
    const row = this.db
      .prepare(
        'SELECT vector_json,dimension FROM kb_embedding_cache WHERE profile_key=? AND content_hash=?',
      )
      .get(profileKey, contentHash) as { vector_json: string; dimension: number } | undefined;
    if (!row) return undefined;
    const vector = parseJson<number[]>(row.vector_json, 'kb_embedding_cache.vector_json');
    if (
      !Array.isArray(vector) ||
      vector.length !== Number(row.dimension) ||
      vector.some((value) => !Number.isFinite(value))
    ) {
      throw new KnowledgeError({
        code: 'EMBEDDING_CACHE_INVALID',
        stage: 'embedding',
        message: '嵌入缓存数据损坏，请由客户清理知识库缓存后手动重试',
        details: { profileKey, contentHash },
        allowedManualActions: ['rebuild_index', 'open_logs'],
      });
    }
    return { vector, dimension: Number(row.dimension) };
  }

  putEmbedding(profileKey: string, contentHash: string, vector: number[], dimension: number): void {
    this.db
      .prepare(
        `INSERT INTO kb_embedding_cache(profile_key,content_hash,vector_json,dimension,created_at)
         VALUES (?,?,?,?,?)
         ON CONFLICT(profile_key,content_hash) DO UPDATE SET
           vector_json=excluded.vector_json,dimension=excluded.dimension,created_at=excluded.created_at`,
      )
      .run(profileKey, contentHash, JSON.stringify(vector), dimension, Date.now());
  }

  createCollection(name: string, description?: string): IKbCollection {
    const normalized = name.trim();
    if (!normalized) {
      throw new KnowledgeError({
        code: 'COLLECTION_NAME_REQUIRED',
        stage: 'source',
        message: '知识库名称不能为空',
        allowedManualActions: ['reconfigure'],
      });
    }
    const id = randomUUID();
    const now = Date.now();
    try {
      this.db
        .prepare(
          `INSERT INTO kb_collections
           (id,name,description,embedding_profile_id,retrieval_profile_id,parser_profile_id,status,created_at,updated_at)
           VALUES (?,?,?,?,?,?,?,?,?)`,
        )
        .run(
          id,
          normalized,
          description?.trim() || null,
          'unconfigured',
          'hybrid-v2',
          'xberg-v1',
          'ready',
          now,
          now,
        );
    } catch (error) {
      throw new KnowledgeError({
        code: 'COLLECTION_CREATE_FAILED',
        stage: 'source',
        message: error instanceof Error ? error.message : String(error),
        allowedManualActions: ['reconfigure', 'open_logs'],
        cause: error,
      });
    }
    return this.getCollection(id)!;
  }

  listCollections(): IKbCollection[] {
    return (
      this.db.prepare('SELECT * FROM kb_collections ORDER BY updated_at DESC').all() as Record<
        string,
        unknown
      >[]
    ).map(collectionFromRow);
  }

  getCollection(id: string): IKbCollection | null {
    const row = this.db.prepare('SELECT * FROM kb_collections WHERE id=?').get(id) as
      | Record<string, unknown>
      | undefined;
    return row ? collectionFromRow(row) : null;
  }

  requireCollection(id: string): IKbCollection {
    const collection = this.getCollection(id);
    if (!collection) {
      throw new KnowledgeError({
        code: 'COLLECTION_NOT_FOUND',
        stage: 'source',
        message: `知识库不存在：${id}`,
        allowedManualActions: ['reconfigure'],
      });
    }
    return collection;
  }

  updateCollection(id: string, patch: { name?: string; description?: string }): IKbCollection {
    this.requireCollection(id);
    const current = this.getCollection(id)!;
    const name = patch.name === undefined ? current.name : patch.name.trim();
    if (!name) {
      throw new KnowledgeError({
        code: 'COLLECTION_NAME_REQUIRED',
        stage: 'source',
        message: '知识库名称不能为空',
        allowedManualActions: ['reconfigure'],
      });
    }
    this.db
      .prepare('UPDATE kb_collections SET name=?, description=?, updated_at=? WHERE id=?')
      .run(
        name,
        patch.description === undefined
          ? current.description || null
          : patch.description.trim() || null,
        Date.now(),
        id,
      );
    return this.getCollection(id)!;
  }

  deleteCollection(id: string): void {
    this.requireCollection(id);
    this.db.prepare('DELETE FROM kb_collections WHERE id=?').run(id);
    this.db.prepare('DELETE FROM kb_chunks_fts_words WHERE collection_id=?').run(id);
    this.db.prepare('DELETE FROM kb_chunks_fts_trigram WHERE collection_id=?').run(id);
  }

  createImport(input: {
    collectionId: string;
    sourceType: 'file' | 'directory' | 'pasted';
    sourceUri: string;
    displayName: string;
    filename: string;
    relativePath?: string;
    ext?: string;
    mime: string;
    size: number;
    blobHash: string;
    payload: IIngestJobPayload;
  }): { sourceId: string; docId: string; revisionId: string; jobId: string } {
    this.requireCollection(input.collectionId);
    const sourceId = randomUUID();
    const docId = randomUUID();
    const revisionId = randomUUID();
    const jobId = randomUUID();
    const now = Date.now();
    const storedPayload = toStoredIngestPayload(input.payload);
    const transaction = this.db.transaction(() => {
      this.db
        .prepare(
          `INSERT INTO kb_sources
           (id,collection_id,type,uri,display_name,config_json,sync_mode,sync_status,last_synced_at,created_at,updated_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        )
        .run(
          sourceId,
          input.collectionId,
          input.sourceType,
          input.sourceUri,
          input.displayName,
          JSON.stringify({ recursive: input.sourceType === 'directory' }),
          'snapshot',
          'queued',
          null,
          now,
          now,
        );
      this.db
        .prepare(
          `INSERT INTO kb_documents
           (id,collection_id,source_id,filename,relative_path,ext,mime,size,segment_mode,segment_settings_json,status,stage,progress,created_at,updated_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        )
        .run(
          docId,
          input.collectionId,
          sourceId,
          input.filename,
          input.relativePath || null,
          input.ext || null,
          input.mime,
          input.size,
          input.payload.ingest.segmentMode || 'fixed',
          JSON.stringify(input.payload.ingest.segmentSettings || DEFAULT_SEGMENT_SETTINGS),
          'queued',
          'source',
          0,
          now,
          now,
        );
      this.db
        .prepare(
          `INSERT INTO kb_document_revisions
           (id,document_id,source_id,source_uri,relative_path,blob_hash,status,created_at)
           VALUES (?,?,?,?,?,?,?,?)`,
        )
        .run(
          revisionId,
          docId,
          sourceId,
          input.sourceUri,
          input.relativePath || null,
          input.blobHash,
          'queued',
          now,
        );
      this.db
        .prepare(
          `INSERT INTO kb_jobs
           (id,type,collection_id,document_id,revision_id,status,stage,progress,payload_json,created_at)
           VALUES (?,?,?,?,?,?,?,?,?,?)`,
        )
        .run(
          jobId,
          'ingest',
          input.collectionId,
          docId,
          revisionId,
          'queued',
          'source',
          0,
          JSON.stringify(storedPayload),
          now,
        );
    });
    transaction();
    return { sourceId, docId, revisionId, jobId };
  }

  createRetry(
    jobId: string,
    embedding: IIngestJobPayload['embedding'],
  ): {
    docId: string;
    revisionId: string;
    jobId: string;
    payload: IIngestJobPayload;
  } {
    const previous = this.db.prepare('SELECT * FROM kb_jobs WHERE id=?').get(jobId) as
      | Record<string, unknown>
      | undefined;
    if (!previous || !['failed', 'interrupted', 'cancelled'].includes(String(previous.status))) {
      throw new KnowledgeError({
        code: 'JOB_NOT_RETRYABLE',
        stage: 'source',
        message: '只能手动重试失败、已中断或已取消的任务',
        jobId,
        allowedManualActions: ['open_logs'],
      });
    }
    const stored = parseJson<IStoredIngestPayload>(
      previous.payload_json ? String(previous.payload_json) : undefined,
      'kb_jobs.payload_json',
    );
    const docId = String(previous.document_id);
    const oldRevision = this.db
      .prepare('SELECT * FROM kb_document_revisions WHERE id=?')
      .get(previous.revision_id) as Record<string, unknown>;
    const revisionId = randomUUID();
    const nextJobId = randomUUID();
    const now = Date.now();
    const payload: IIngestJobPayload = { ...stored, embedding };
    const redacted = toStoredIngestPayload(payload);
    const transaction = this.db.transaction(() => {
      this.db
        .prepare(
          `INSERT INTO kb_document_revisions
           (id,document_id,source_id,source_uri,relative_path,blob_hash,status,created_at)
           VALUES (?,?,?,?,?,?,?,?)`,
        )
        .run(
          revisionId,
          docId,
          oldRevision.source_id,
          oldRevision.source_uri,
          oldRevision.relative_path,
          oldRevision.blob_hash,
          'queued',
          now,
        );
      this.db
        .prepare(
          `INSERT INTO kb_jobs
           (id,type,collection_id,document_id,revision_id,status,stage,progress,payload_json,created_at)
           VALUES (?,?,?,?,?,?,?,?,?,?)`,
        )
        .run(
          nextJobId,
          'ingest',
          previous.collection_id,
          docId,
          revisionId,
          'queued',
          'source',
          0,
          JSON.stringify(redacted),
          now,
        );
      this.db
        .prepare(
          `UPDATE kb_documents SET status='queued',stage='source',progress=0,error_code=NULL,error_message=NULL,updated_at=? WHERE id=?`,
        )
        .run(now, docId);
    });
    transaction();
    return { docId, revisionId, jobId: nextJobId, payload };
  }

  updateStage(input: {
    documentId: string;
    revisionId: string;
    jobId: string;
    status: EKbDocumentStatus;
    stage: EKnowledgeStage;
    progress: number;
  }): void {
    const now = Date.now();
    const jobStatus = input.status === 'queued' ? 'queued' : 'running';
    const transaction = this.db.transaction(() => {
      this.db
        .prepare(
          `UPDATE kb_documents SET status=?,stage=?,progress=?,error_code=NULL,error_message=NULL,updated_at=? WHERE id=?`,
        )
        .run(input.status, input.stage, input.progress, now, input.documentId);
      this.db
        .prepare(
          `UPDATE kb_jobs SET status=?,stage=?,progress=?,started_at=COALESCE(started_at,?) WHERE id=?`,
        )
        .run(jobStatus, input.stage, input.progress, now, input.jobId);
      this.db
        .prepare('UPDATE kb_document_revisions SET status=? WHERE id=?')
        .run(input.status, input.revisionId);
    });
    transaction();
  }

  beginRevisionIndex(input: {
    jobId: string;
    collectionId: string;
    documentId: string;
    revisionId: string;
    embeddingFingerprint: string;
    expectedCount: number;
  }): void {
    const now = Date.now();
    this.db
      .prepare(
        `INSERT INTO kb_index_outbox
         (id,operation,collection_id,document_id,revision_id,embedding_profile_fingerprint,
          expected_count,status,created_at,updated_at)
         VALUES (?,'upsert_revision',?,?,?,?,?,'pending',?,?)`,
      )
      .run(
        input.jobId,
        input.collectionId,
        input.documentId,
        input.revisionId,
        input.embeddingFingerprint,
        input.expectedCount,
        now,
        now,
      );
  }

  activateRevision(input: {
    collectionId: string;
    documentId: string;
    revisionId: string;
    jobId: string;
    document: ICanonicalDocument;
    artifactUri: string;
    embeddingFingerprint: string;
    chunks: IChunkDraft[];
  }): void {
    const currentProfile = this.requireCollection(input.collectionId).embeddingProfileId;
    if (currentProfile !== 'unconfigured' && currentProfile !== input.embeddingFingerprint) {
      throw new KnowledgeError({
        code: 'EMBEDDING_PROFILE_MISMATCH',
        stage: 'embedding',
        message: '该知识库已绑定其他嵌入模型或向量维度，请新建知识库或恢复原配置',
        documentId: input.documentId,
        jobId: input.jobId,
        details: { expected: currentProfile, actual: input.embeddingFingerprint },
        allowedManualActions: ['reconfigure', 'reimport', 'open_logs'],
      });
    }
    const now = Date.now();
    const insertChunk = this.db.prepare(
      `INSERT INTO kb_chunks
       (id,collection_id,document_id,revision_id,parent_chunk_id,stable_key,idx,kind,content,embedding_text,content_hash,
        token_count,heading_path_json,page,page_end,sheet,cell_range,metadata_json,enabled,origin,created_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    );
    const transaction = this.db.transaction(() => {
      this.db.prepare('DELETE FROM kb_chunks_fts_words WHERE document_id=?').run(input.documentId);
      this.db
        .prepare('DELETE FROM kb_chunks_fts_trigram WHERE document_id=?')
        .run(input.documentId);
      for (const chunk of input.chunks) {
        insertChunk.run(
          chunk.id,
          input.collectionId,
          input.documentId,
          input.revisionId,
          chunk.parentChunkId || null,
          chunk.stableKey,
          chunk.idx,
          chunk.kind,
          chunk.content,
          chunk.embeddingText,
          chunk.contentHash,
          chunk.tokenCount,
          JSON.stringify(chunk.headingPath),
          chunk.page || null,
          chunk.pageEnd || null,
          chunk.sheet || null,
          chunk.cellRange || null,
          JSON.stringify(chunk.metadata),
          1,
          'parsed',
          now,
          now,
        );
        if (chunk.kind === 'child') {
          this.db
            .prepare(
              'INSERT INTO kb_chunks_fts_words(content,chunk_id,document_id,collection_id) VALUES (?,?,?,?)',
            )
            .run(chunk.content, chunk.id, input.documentId, input.collectionId);
          this.db
            .prepare(
              'INSERT INTO kb_chunks_fts_trigram(content,chunk_id,document_id,collection_id) VALUES (?,?,?,?)',
            )
            .run(chunk.content, chunk.id, input.documentId, input.collectionId);
        }
      }
      this.db
        .prepare(
          `UPDATE kb_document_revisions SET content_hash=?,parser_id=?,parser_version=?,parser_config_hash=?,
           embedding_profile_fingerprint=?,artifact_uri=?,quality_score=?,notices_json=?,status='ready',activated_at=? WHERE id=?`,
        )
        .run(
          input.document.contentHash,
          input.document.parserId,
          input.document.parserVersion,
          'default',
          input.embeddingFingerprint,
          input.artifactUri,
          input.document.qualityScore,
          JSON.stringify(input.document.notices),
          now,
          input.revisionId,
        );
      this.db
        .prepare(
          `UPDATE kb_documents SET active_revision_id=?,mime=?,status='ready',stage='vector_index',progress=100,
           error_code=NULL,error_message=NULL,updated_at=? WHERE id=?`,
        )
        .run(input.revisionId, input.document.mime, now, input.documentId);
      this.db
        .prepare(
          `UPDATE kb_jobs SET status='succeeded',stage='vector_index',progress=100,finished_at=?,error_code=NULL,error_message=NULL WHERE id=?`,
        )
        .run(now, input.jobId);
      this.db
        .prepare("UPDATE kb_index_outbox SET status='completed',updated_at=? WHERE id=?")
        .run(now, input.jobId);
      this.db
        .prepare(
          `UPDATE kb_sources SET sync_status='ready',last_synced_at=?,updated_at=? WHERE id=(SELECT source_id FROM kb_documents WHERE id=?)`,
        )
        .run(now, now, input.documentId);
      this.db
        .prepare('UPDATE kb_collections SET embedding_profile_id=?,updated_at=? WHERE id=?')
        .run(input.embeddingFingerprint, now, input.collectionId);
    });
    transaction();
  }

  markFailed(input: {
    documentId: string;
    revisionId: string;
    jobId: string;
    stage: EKnowledgeStage;
    code: string;
    message: string;
    status?: 'failed' | 'interrupted' | 'cancelled';
  }): void {
    const now = Date.now();
    const status = input.status || 'failed';
    const documentStatus = status === 'cancelled' ? 'failed' : status;
    const transaction = this.db.transaction(() => {
      this.db
        .prepare(
          'UPDATE kb_documents SET status=?,stage=?,progress=0,error_code=?,error_message=?,updated_at=? WHERE id=?',
        )
        .run(documentStatus, input.stage, input.code, input.message, now, input.documentId);
      this.db
        .prepare('UPDATE kb_document_revisions SET status=? WHERE id=?')
        .run(status, input.revisionId);
      this.db
        .prepare(
          'UPDATE kb_jobs SET status=?,stage=?,error_code=?,error_message=?,finished_at=? WHERE id=?',
        )
        .run(status, input.stage, input.code, input.message, now, input.jobId);
      this.db
        .prepare(
          `UPDATE kb_index_outbox SET status='failed',error_code=?,error_message=?,updated_at=?
           WHERE id=? AND status='pending'`,
        )
        .run(input.code, input.message, now, input.jobId);
    });
    transaction();
  }

  listDocuments(collectionId: string): IKbDocument[] {
    this.requireCollection(collectionId);
    const rows = this.db
      .prepare(
        `SELECT d.*,
          (SELECT COUNT(*) FROM kb_chunks c WHERE c.document_id=d.id AND c.revision_id=d.active_revision_id AND c.kind='child' AND c.enabled=1) AS chunk_count
         FROM kb_documents d WHERE d.collection_id=? AND d.deleted_at IS NULL ORDER BY d.updated_at DESC`,
      )
      .all(collectionId) as Record<string, unknown>[];
    return rows.map((row) => this.documentFromRow(row));
  }

  getDocument(documentId: string): IKbDocument | null {
    const row = this.db
      .prepare(
        `SELECT d.*,
          (SELECT COUNT(*) FROM kb_chunks c WHERE c.document_id=d.id AND c.revision_id=d.active_revision_id AND c.kind='child' AND c.enabled=1) AS chunk_count
         FROM kb_documents d WHERE d.id=? AND d.deleted_at IS NULL`,
      )
      .get(documentId) as Record<string, unknown> | undefined;
    return row ? this.documentFromRow(row) : null;
  }

  private documentFromRow(row: Record<string, unknown>): IKbDocument {
    return {
      docId: String(row.id),
      collectionId: String(row.collection_id),
      sourceId: row.source_id ? String(row.source_id) : undefined,
      filename: String(row.filename),
      relativePath: row.relative_path ? String(row.relative_path) : undefined,
      ext: row.ext ? String(row.ext) : undefined,
      mime: String(row.mime),
      size: Number(row.size),
      status: String(row.status) as EKbDocumentStatus,
      stage: row.stage ? (String(row.stage) as EKnowledgeStage) : undefined,
      errorCode: row.error_code ? String(row.error_code) : undefined,
      error: row.error_message ? String(row.error_message) : undefined,
      progress: Number(row.progress),
      createdAt: Number(row.created_at),
      updatedAt: Number(row.updated_at),
      chunkCount: Number(row.chunk_count || 0),
      segmentMode: row.segment_mode === 'general' ? 'general' : 'fixed',
      activeRevisionId: row.active_revision_id ? String(row.active_revision_id) : undefined,
    };
  }

  listChunks(
    documentId: string,
    page = 1,
    pageSize = 20,
    keyword?: string,
  ): { items: IKbChunkItem[]; total: number } {
    const document = this.getDocument(documentId);
    if (!document?.activeRevisionId) return { items: [], total: 0 };
    const params: unknown[] = [documentId, document.activeRevisionId];
    let where = `document_id=? AND revision_id=? AND kind='child' AND enabled=1`;
    if (keyword?.trim()) {
      where += " AND content LIKE ? ESCAPE '\\'";
      params.push(`%${keyword.trim().replace(/[\\%_]/g, '\\$&')}%`);
    }
    const total = Number(
      (
        this.db
          .prepare(`SELECT COUNT(*) AS count FROM kb_chunks WHERE ${where}`)
          .get(...params) as { count: number }
      ).count,
    );
    const rows = this.db
      .prepare(`SELECT * FROM kb_chunks WHERE ${where} ORDER BY idx LIMIT ? OFFSET ?`)
      .all(...params, pageSize, (Math.max(1, page) - 1) * pageSize) as Record<string, unknown>[];
    return {
      total,
      items: rows.map(chunkFromRow),
    };
  }

  getChunk(chunkId: string): IKbChunkItem {
    const row = this.db
      .prepare(
        `SELECT c.* FROM kb_chunks c
         JOIN kb_documents d ON d.id=c.document_id AND d.active_revision_id=c.revision_id
         WHERE c.id=? AND c.kind='child' AND c.enabled=1
           AND d.status='ready' AND d.deleted_at IS NULL`,
      )
      .get(chunkId) as Record<string, unknown> | undefined;
    if (!row) {
      throw new KnowledgeError({
        code: 'CHUNK_NOT_FOUND',
        stage: 'retrieve',
        message: `引用分块不存在或已失效：${chunkId}`,
        details: { chunkId },
        allowedManualActions: ['open_logs'],
      });
    }
    return chunkFromRow(row);
  }

  getActiveScope(requestedCollectionIds?: string[]): IActiveScope {
    const collectionIds = requestedCollectionIds?.length
      ? requestedCollectionIds
      : this.listCollections().map((collection) => collection.id);
    if (!collectionIds.length) {
      throw new KnowledgeError({
        code: 'INDEX_NOT_READY',
        stage: 'retrieve',
        message: '没有可检索的知识库，请先导入并完成索引',
        allowedManualActions: ['reimport'],
      });
    }
    const collections = collectionIds.map((id) => this.requireCollection(id));
    const fingerprints = new Set(collections.map((item) => item.embeddingProfileId));
    if (fingerprints.has('unconfigured')) {
      throw new KnowledgeError({
        code: 'INDEX_NOT_READY',
        stage: 'retrieve',
        message: '所选知识库尚未完成首次索引',
        allowedManualActions: ['reimport', 'open_logs'],
      });
    }
    if (fingerprints.size !== 1) {
      throw new KnowledgeError({
        code: 'EMBEDDING_PROFILE_MISMATCH',
        stage: 'retrieve',
        message: '所选知识库使用了不同的嵌入配置，不能在一次检索中混用',
        allowedManualActions: ['reconfigure'],
      });
    }
    const rows = this.db
      .prepare(
        `SELECT d.collection_id,d.active_revision_id,
                (SELECT COUNT(*) FROM kb_chunks c
                 WHERE c.document_id=d.id AND c.revision_id=d.active_revision_id
                   AND c.kind='child' AND c.enabled=1) AS vector_count
         FROM kb_documents d
         WHERE d.collection_id IN (${placeholders(collectionIds)}) AND d.status='ready'
           AND d.deleted_at IS NULL AND d.active_revision_id IS NOT NULL`,
      )
      .all(...collectionIds) as Array<{
      collection_id: string;
      active_revision_id: string;
      vector_count: number;
    }>;
    if (!rows.length) {
      throw new KnowledgeError({
        code: 'INDEX_NOT_READY',
        stage: 'retrieve',
        message: '所选知识库没有已就绪文档',
        allowedManualActions: ['reimport', 'open_logs'],
      });
    }
    const readyCollections = new Set(rows.map((row) => row.collection_id));
    const missingCollections = collectionIds.filter((id) => !readyCollections.has(id));
    if (missingCollections.length) {
      throw new KnowledgeError({
        code: 'INDEX_NOT_READY',
        stage: 'retrieve',
        message: '部分所选知识库没有已就绪文档，已终止本次检索。',
        details: { collectionIds: missingCollections },
        allowedManualActions: ['reimport', 'open_logs'],
      });
    }
    const revisionIds = rows.map((row) => row.active_revision_id);
    const unresolvedOutbox = this.db
      .prepare(
        `SELECT id,operation,status,document_id,revision_id,error_code,error_message
         FROM kb_index_outbox
         WHERE collection_id IN (${placeholders(collectionIds)})
           AND revision_id IN (${placeholders(revisionIds)})
           AND status!='completed'
         ORDER BY updated_at DESC LIMIT 1`,
      )
      .get(...collectionIds, ...revisionIds) as Record<string, unknown> | undefined;
    if (unresolvedOutbox) {
      throw new KnowledgeError({
        code: 'INDEX_UPDATE_INCOMPLETE',
        stage: 'retrieve',
        message: '当前活动索引存在未完成的跨存储更新，请由客户检查任务并手动重建索引。',
        details: {
          outboxId: String(unresolvedOutbox.id),
          operation: String(unresolvedOutbox.operation),
          status: String(unresolvedOutbox.status),
          documentId: String(unresolvedOutbox.document_id),
          revisionId: String(unresolvedOutbox.revision_id),
          errorCode: unresolvedOutbox.error_code ? String(unresolvedOutbox.error_code) : undefined,
          error: unresolvedOutbox.error_message
            ? String(unresolvedOutbox.error_message)
            : undefined,
        },
        allowedManualActions: ['rebuild_index', 'open_logs'],
      });
    }
    return {
      collectionIds,
      revisionIds,
      embeddingFingerprint: [...fingerprints][0],
      expectedVectorCount: rows.reduce((sum, row) => sum + Number(row.vector_count), 0),
    };
  }

  searchSparse(input: {
    table: 'kb_chunks_fts_words' | 'kb_chunks_fts_trigram';
    match: string;
    scope: IActiveScope;
    documentIds?: string[];
    limit: number;
  }): IRankedCandidateRow[] {
    const params: unknown[] = [
      input.match,
      ...input.scope.collectionIds,
      ...input.scope.revisionIds,
    ];
    let docFilter = '';
    if (input.documentIds?.length) {
      docFilter = ` AND c.document_id IN (${placeholders(input.documentIds)})`;
      params.push(...input.documentIds);
    }
    params.push(input.limit);
    const rows = this.db
      .prepare(
        `SELECT f.chunk_id AS chunkId, bm25(${input.table}) AS score
         FROM ${input.table} f
         JOIN kb_chunks c ON c.id=f.chunk_id
         JOIN kb_documents d ON d.id=c.document_id AND d.active_revision_id=c.revision_id
         WHERE ${input.table} MATCH ?
           AND c.collection_id IN (${placeholders(input.scope.collectionIds)})
           AND c.revision_id IN (${placeholders(input.scope.revisionIds)})
           AND c.enabled=1 AND d.status='ready'${docFilter}
         ORDER BY bm25(${input.table}) ASC LIMIT ?`,
      )
      .all(...params) as Array<{ chunkId: string; score: number }>;
    return rows.map((row, index) => ({ chunkId: row.chunkId, rank: index + 1, score: -row.score }));
  }

  searchMetadata(
    query: string,
    scope: IActiveScope,
    documentIds: string[] | undefined,
    limit: number,
  ): IRankedCandidateRow[] {
    const escaped = `%${query.replace(/[\\%_]/g, '\\$&')}%`;
    const params: unknown[] = [
      ...scope.collectionIds,
      ...scope.revisionIds,
      escaped,
      escaped,
      escaped,
    ];
    let documentFilter = '';
    if (documentIds?.length) {
      documentFilter = ` AND c.document_id IN (${placeholders(documentIds)})`;
      params.push(...documentIds);
    }
    params.push(limit);
    const rows = this.db
      .prepare(
        `SELECT c.id AS chunkId
         FROM kb_chunks c JOIN kb_documents d ON d.id=c.document_id AND d.active_revision_id=c.revision_id
         WHERE c.collection_id IN (${placeholders(scope.collectionIds)})
           AND c.revision_id IN (${placeholders(scope.revisionIds)}) AND c.kind='child' AND c.enabled=1
           AND (d.filename LIKE ? ESCAPE '\\' OR d.relative_path LIKE ? ESCAPE '\\' OR c.heading_path_json LIKE ? ESCAPE '\\')
           ${documentFilter}
         ORDER BY d.updated_at DESC,c.idx ASC LIMIT ?`,
      )
      .all(...params) as Array<{ chunkId: string }>;
    return rows.map((row, index) => ({ chunkId: row.chunkId, rank: index + 1 }));
  }

  hydrateChunks(chunkIds: string[]): IHydratedChunkRow[] {
    if (!chunkIds.length) return [];
    return this.db
      .prepare(
        `SELECT c.id AS chunk_id,c.*,d.filename,d.relative_path,s.uri AS source_uri,k.name AS collection_name
         FROM kb_chunks c
         JOIN kb_documents d ON d.id=c.document_id AND d.active_revision_id=c.revision_id
         JOIN kb_collections k ON k.id=c.collection_id
         LEFT JOIN kb_sources s ON s.id=d.source_id
         WHERE c.id IN (${placeholders(chunkIds)}) AND c.enabled=1 AND d.status='ready'`,
      )
      .all(...chunkIds) as IHydratedChunkRow[];
  }

  hydrateParents(parentIds: string[]): Map<string, IHydratedChunkRow> {
    return new Map(this.hydrateChunks(parentIds).map((row) => [row.chunk_id, row]));
  }

  saveTrace(input: {
    id: string;
    query: string;
    rewrittenQuery: string;
    request: unknown;
    result: unknown;
    timings: Record<string, number>;
  }): void {
    this.db
      .prepare(
        `INSERT INTO kb_retrieval_traces
         (id,query,rewritten_query,request_json,result_json,timings_json,created_at) VALUES (?,?,?,?,?,?,?)`,
      )
      .run(
        input.id,
        input.query,
        input.rewrittenQuery,
        JSON.stringify(input.request),
        JSON.stringify(input.result),
        JSON.stringify(input.timings),
        Date.now(),
      );
  }

  listJobs(limit = 100) {
    const rows = this.db
      .prepare('SELECT * FROM kb_jobs ORDER BY created_at DESC LIMIT ?')
      .all(limit) as Record<string, unknown>[];
    return rows.map((row) => ({
      id: String(row.id),
      type: String(row.type) as 'ingest' | 'reindex' | 'edit_chunk' | 'delete',
      collectionId: row.collection_id ? String(row.collection_id) : undefined,
      documentId: row.document_id ? String(row.document_id) : undefined,
      revisionId: row.revision_id ? String(row.revision_id) : undefined,
      status: String(row.status) as
        | 'queued'
        | 'running'
        | 'succeeded'
        | 'failed'
        | 'cancelled'
        | 'interrupted',
      stage: row.stage ? (String(row.stage) as EKnowledgeStage) : undefined,
      progress: Number(row.progress),
      errorCode: row.error_code ? String(row.error_code) : undefined,
      error: row.error_message ? String(row.error_message) : undefined,
      createdAt: Number(row.created_at),
      startedAt: row.started_at ? Number(row.started_at) : undefined,
      finishedAt: row.finished_at ? Number(row.finished_at) : undefined,
    }));
  }

  beginChunkEdit(chunkId: string, rawContent: string) {
    const content = rawContent.trim();
    if (!content) {
      throw new KnowledgeError({
        code: 'CHUNK_CONTENT_REQUIRED',
        stage: 'chunk',
        message: '分段内容不能为空',
        allowedManualActions: ['reconfigure'],
      });
    }
    const row = this.db
      .prepare(
        `SELECT c.*,d.filename,d.relative_path,k.embedding_profile_id
         FROM kb_chunks c
         JOIN kb_documents d ON d.id=c.document_id AND d.active_revision_id=c.revision_id
         JOIN kb_collections k ON k.id=c.collection_id
         WHERE c.id=? AND c.kind='child' AND c.enabled=1 AND d.status='ready'`,
      )
      .get(chunkId) as Record<string, unknown> | undefined;
    if (!row) {
      throw new KnowledgeError({
        code: 'CHUNK_NOT_FOUND',
        stage: 'chunk',
        message: `当前活动版本中不存在分段：${chunkId}`,
        allowedManualActions: ['open_logs'],
      });
    }
    const versionId = randomUUID();
    const newChunkId = randomUUID();
    const jobId = randomUUID();
    const now = Date.now();
    const contentHash = createHash('sha256').update(content).digest('hex');
    const transaction = this.db.transaction(() => {
      this.db
        .prepare(
          `INSERT INTO kb_chunk_versions
           (id,chunk_id,content,embedding_text,content_hash,origin,status,created_at)
           VALUES (?,?,?,?,?,'manual','indexing',?)`,
        )
        .run(versionId, chunkId, content, content, contentHash, now);
      this.db
        .prepare(
          `INSERT INTO kb_jobs
           (id,type,collection_id,document_id,revision_id,status,stage,progress,payload_json,created_at,started_at)
           VALUES (?,'edit_chunk',?,?,?,'running','embedding',25,?, ?, ?)`,
        )
        .run(
          jobId,
          row.collection_id,
          row.document_id,
          row.revision_id,
          JSON.stringify({ chunkId, versionId }),
          now,
          now,
        );
    });
    transaction();
    return {
      chunkId,
      newChunkId,
      versionId,
      jobId,
      content,
      contentHash,
      collectionId: String(row.collection_id),
      documentId: String(row.document_id),
      revisionId: String(row.revision_id),
      parentChunkId: row.parent_chunk_id ? String(row.parent_chunk_id) : '',
      fingerprint: String(row.embedding_profile_id),
      headingPath: String(row.heading_path_json),
      sourcePath: row.relative_path ? String(row.relative_path) : String(row.filename),
      page: row.page == null ? -1 : Number(row.page),
    };
  }

  beginChunkEditIndex(input: {
    jobId: string;
    collectionId: string;
    documentId: string;
    revisionId: string;
    fingerprint: string;
  }): void {
    const now = Date.now();
    this.db
      .prepare(
        `INSERT INTO kb_index_outbox
         (id,operation,collection_id,document_id,revision_id,embedding_profile_fingerprint,
          expected_count,status,created_at,updated_at)
         VALUES (?,'edit_chunk',?,?,?,?,1,'pending',?,?)`,
      )
      .run(
        input.jobId,
        input.collectionId,
        input.documentId,
        input.revisionId,
        input.fingerprint,
        now,
        now,
      );
  }

  completeChunkEdit(input: {
    chunkId: string;
    newChunkId: string;
    versionId: string;
    jobId: string;
    content: string;
    contentHash: string;
    tokenCount: number;
    documentId: string;
    collectionId: string;
  }): void {
    const now = Date.now();
    const transaction = this.db.transaction(() => {
      this.db
        .prepare(
          `INSERT INTO kb_chunks
           (id,collection_id,document_id,revision_id,parent_chunk_id,stable_key,idx,kind,content,embedding_text,
            content_hash,token_count,heading_path_json,page,page_end,sheet,cell_range,metadata_json,enabled,origin,created_at,updated_at)
           SELECT ?,collection_id,document_id,revision_id,parent_chunk_id,stable_key || ':manual:' || ?,idx,kind,?,?,?, ?,
                  heading_path_json,page,page_end,sheet,cell_range,metadata_json,1,'manual',?,?
           FROM kb_chunks WHERE id=? AND enabled=1`,
        )
        .run(
          input.newChunkId,
          input.versionId.slice(0, 8),
          input.content,
          input.content,
          input.contentHash,
          input.tokenCount,
          now,
          now,
          input.chunkId,
        );
      this.db
        .prepare('UPDATE kb_chunks SET enabled=0,updated_at=? WHERE id=?')
        .run(now, input.chunkId);
      this.db.prepare('DELETE FROM kb_chunks_fts_words WHERE chunk_id=?').run(input.chunkId);
      this.db.prepare('DELETE FROM kb_chunks_fts_trigram WHERE chunk_id=?').run(input.chunkId);
      this.db
        .prepare(
          'INSERT INTO kb_chunks_fts_words(content,chunk_id,document_id,collection_id) VALUES (?,?,?,?)',
        )
        .run(input.content, input.newChunkId, input.documentId, input.collectionId);
      this.db
        .prepare(
          'INSERT INTO kb_chunks_fts_trigram(content,chunk_id,document_id,collection_id) VALUES (?,?,?,?)',
        )
        .run(input.content, input.newChunkId, input.documentId, input.collectionId);
      this.db
        .prepare("UPDATE kb_chunk_versions SET status='active' WHERE id=?")
        .run(input.versionId);
      this.db
        .prepare(
          "UPDATE kb_jobs SET status='succeeded',stage='vector_index',progress=100,finished_at=? WHERE id=?",
        )
        .run(now, input.jobId);
      this.db
        .prepare("UPDATE kb_index_outbox SET status='completed',updated_at=? WHERE id=?")
        .run(now, input.jobId);
      this.db.prepare('UPDATE kb_documents SET updated_at=? WHERE id=?').run(now, input.documentId);
    });
    transaction();
  }

  failChunkEdit(versionId: string, jobId: string, error: KnowledgeError): void {
    const now = Date.now();
    const transaction = this.db.transaction(() => {
      this.db
        .prepare(
          "UPDATE kb_chunk_versions SET status='failed',error_code=?,error_message=? WHERE id=?",
        )
        .run(error.code, error.message, versionId);
      this.db
        .prepare(
          "UPDATE kb_jobs SET status='failed',stage=?,error_code=?,error_message=?,finished_at=? WHERE id=?",
        )
        .run(error.stage, error.code, error.message, now, jobId);
      this.db
        .prepare(
          "UPDATE kb_index_outbox SET status='failed',error_code=?,error_message=?,updated_at=? WHERE id=?",
        )
        .run(error.code, error.message, now, jobId);
    });
    transaction();
  }

  getChunksForDelete(chunkIds: string[]) {
    if (!chunkIds.length) return [];
    const rows = this.db
      .prepare(
        `SELECT c.id,c.collection_id,c.document_id,k.embedding_profile_id
         FROM kb_chunks c
         JOIN kb_documents d ON d.id=c.document_id AND d.active_revision_id=c.revision_id
         JOIN kb_collections k ON k.id=c.collection_id
         WHERE c.id IN (${placeholders(chunkIds)}) AND c.kind='child' AND c.enabled=1`,
      )
      .all(...chunkIds) as Record<string, unknown>[];
    if (rows.length !== new Set(chunkIds).size) {
      throw new KnowledgeError({
        code: 'CHUNK_NOT_FOUND',
        stage: 'chunk',
        message: '部分待删除分段不属于当前活动版本',
        allowedManualActions: ['open_logs'],
      });
    }
    return rows.map((row) => ({
      chunkId: String(row.id),
      collectionId: String(row.collection_id),
      documentId: String(row.document_id),
      fingerprint: String(row.embedding_profile_id),
    }));
  }

  deleteChunks(chunkIds: string[]): void {
    if (!chunkIds.length) return;
    const transaction = this.db.transaction(() => {
      for (const chunkId of chunkIds) {
        this.db.prepare('DELETE FROM kb_chunks_fts_words WHERE chunk_id=?').run(chunkId);
        this.db.prepare('DELETE FROM kb_chunks_fts_trigram WHERE chunk_id=?').run(chunkId);
      }
      this.db
        .prepare(`DELETE FROM kb_chunks WHERE id IN (${placeholders(chunkIds)})`)
        .run(...chunkIds);
    });
    transaction();
  }

  cancelQueuedJob(jobId: string): boolean {
    const result = this.db
      .prepare(
        `UPDATE kb_jobs SET status='cancelled',error_code='JOB_CANCELLED',error_message='任务已由客户取消',finished_at=? WHERE id=? AND status='queued'`,
      )
      .run(Date.now(), jobId);
    if (result.changes) {
      this.db
        .prepare(
          `UPDATE kb_documents SET status='failed',error_code='JOB_CANCELLED',error_message='任务已由客户取消',updated_at=?
           WHERE id=(SELECT document_id FROM kb_jobs WHERE id=?)`,
        )
        .run(Date.now(), jobId);
    }
    return result.changes > 0;
  }

  deleteDocument(documentId: string): { collectionId: string; fingerprint?: string } {
    const document = this.getDocument(documentId);
    if (!document) {
      throw new KnowledgeError({
        code: 'DOCUMENT_NOT_FOUND',
        stage: 'source',
        message: `文档不存在：${documentId}`,
        allowedManualActions: ['open_logs'],
      });
    }
    const collection = this.requireCollection(document.collectionId);
    const transaction = this.db.transaction(() => {
      this.db.prepare('DELETE FROM kb_chunks_fts_words WHERE document_id=?').run(documentId);
      this.db.prepare('DELETE FROM kb_chunks_fts_trigram WHERE document_id=?').run(documentId);
      this.db.prepare('DELETE FROM kb_documents WHERE id=?').run(documentId);
    });
    transaction();
    return {
      collectionId: document.collectionId,
      fingerprint:
        collection.embeddingProfileId === 'unconfigured'
          ? undefined
          : collection.embeddingProfileId,
    };
  }
}

export { DEFAULT_SEGMENT_SETTINGS };
