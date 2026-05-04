/**
 * 知识库服务：集合、文档、入库与检索（无用户维度）
 */

import type {
  DKbSegmentSettings,
  DKbUploadFile,
  EKbSegmentMode,
  IKbChunkItem,
  IKbCollection,
  IKbDocument,
  IKbEmbeddingConfig,
  IKbLlmConfig,
  IKbSearchItem,
  IKbUploadResultItem,
} from '@/types/modules/kb';
import type { ISegmentSettings } from '@momo/knowledge';
import { DEFAULT_SEGMENT_SETTINGS } from '@momo/knowledge';
import type { Database } from 'better-sqlite3';
import { createHash } from 'crypto';
import path from 'path';

import { splitDocumentText } from './document-splitter';
import { embedBatch } from './embedding';
import { extractText } from './file-parser';
import { hybridSearch } from './hybrid-search';
import { rerank } from './rerank';

function toSegmentSettings(payload?: DKbSegmentSettings): ISegmentSettings {
  if (!payload) {
    return DEFAULT_SEGMENT_SETTINGS;
  }
  return {
    separator: payload.separator,
    maxChunkLength: payload.maxChunkLength,
    chunkOverlap: payload.chunkOverlap,
    preprocess: payload.preprocess,
    splitMode: payload.splitMode,
  };
}

function decodeFilename(name: string): string {
  const s = name || 'unnamed';
  try {
    const looksMojibake = /Ã|Â|â|€|¢|„|™|œ|\uFFFD/.test(s);
    const originalHasCJK = /[\u4E00-\u9FFF]/.test(s);
    const converted = Buffer.from(s, 'latin1').toString('utf8');
    const convertedHasCJK = /[\u4E00-\u9FFF]/.test(converted);
    if (looksMojibake || (convertedHasCJK && !originalHasCJK)) {
      return converted || s;
    }
    return s;
  } catch {
    return s;
  }
}

function fixGarbledUtf8(text: string): string {
  if (!text) {
    return text;
  }
  try {
    const s = String(text);
    const looksMojibake = /Ã|Â|â|€|¢|„|™|œ|\uFFFD/.test(s);
    const repaired = Buffer.from(s, 'latin1').toString('utf8');
    const repairedHasCJK = /[\u4E00-\u9FFF]/.test(repaired);
    const originalHasCJK = /[\u4E00-\u9FFF]/.test(s);
    if (looksMojibake || (repairedHasCJK && !originalHasCJK)) {
      return repaired;
    }
    return s;
  } catch {
    return text;
  }
}

export class KbService {
  constructor(private readonly db: Database) {}

  listCollections(groupId?: number): IKbCollection[] {
    if (groupId != null) {
      return this.db
        .prepare(
          'SELECT id, name, description, group_id, created_at FROM kb_collections WHERE group_id=? ORDER BY id DESC',
        )
        .all(groupId) as IKbCollection[];
    }
    return this.db
      .prepare(
        'SELECT id, name, description, group_id, created_at FROM kb_collections ORDER BY id DESC',
      )
      .all() as IKbCollection[];
  }

  createCollection(name: string, description?: string, groupId?: number): IKbCollection {
    const result = this.db
      .prepare('INSERT INTO kb_collections(name, description, group_id) VALUES(?,?,?)')
      .run(name, description ?? null, groupId ?? null);
    return {
      id: Number(result.lastInsertRowid),
      name,
      description,
      group_id: groupId ?? null,
    };
  }

  updateCollection(
    id: number,
    payload: Partial<{ name: string; description: string; group_id: number | null }>,
  ): void {
    const row = this.db.prepare('SELECT id FROM kb_collections WHERE id=?').get(id);
    if (!row) {
      throw new Error('未找到集合');
    }
    const fields: string[] = [];
    const vals: unknown[] = [];
    if (typeof payload.name === 'string') {
      fields.push('name=?');
      vals.push(payload.name);
    }
    if (typeof payload.description === 'string') {
      fields.push('description=?');
      vals.push(payload.description);
    }
    if (typeof payload.group_id !== 'undefined') {
      fields.push('group_id=?');
      vals.push(payload.group_id);
    }
    if (!fields.length) {
      return;
    }
    const sql = `UPDATE kb_collections SET ${fields.join(', ')}, updated_at=CURRENT_TIMESTAMP WHERE id=?`;
    vals.push(id);
    this.db.prepare(sql).run(...vals);
  }

  deleteCollection(id: number): void {
    const row = this.db.prepare('SELECT id FROM kb_collections WHERE id=?').get(id);
    if (!row) {
      throw new Error('未找到集合');
    }
    this.db.prepare('DELETE FROM kb_collections WHERE id=?').run(id);
  }

  listDocuments(collectionId: number): IKbDocument[] {
    const row = this.db.prepare('SELECT id FROM kb_collections WHERE id=?').get(collectionId);
    if (!row) {
      throw new Error('未找到集合');
    }
    const sql = `SELECT d.id as docId, d.filename, d.ext, d.mime, d.size, d.status, d.error, d.progress, d.created_at,
                        d.segment_mode,
                        (SELECT COUNT(1) FROM kb_chunks c WHERE c.doc_id = d.id AND c.idx != -1) as chunk_count
                 FROM kb_documents d WHERE d.collection_id=? ORDER BY d.created_at DESC`;
    const items = this.db.prepare(sql).all(collectionId) as IKbDocument[];
    return items.map((r) => ({
      ...r,
      filename: fixGarbledUtf8(r.filename),
    }));
  }

  async uploadFiles(
    collectionId: number,
    files: DKbUploadFile[],
  ): Promise<{
    items: IKbUploadResultItem[];
    skipped: { filename: string; size: number; reason: string }[];
  }> {
    const collection = this.db
      .prepare('SELECT id FROM kb_collections WHERE id=?')
      .get(collectionId);
    if (!collection) {
      throw new Error('未找到集合');
    }
    if (!files.length) {
      throw new Error('未收到文件');
    }

    const inserted: IKbUploadResultItem[] = [];
    const skipped: { filename: string; size: number; reason: string }[] = [];

    for (const f of files) {
      const buffer = Buffer.from(f.data);
      const sha = createHash('sha256').update(buffer).digest('hex');
      const filename = decodeFilename(f.filename || 'unnamed');
      const ext = (f.ext || path.extname(filename).replace('.', '')).toLowerCase();
      const mime = f.mime || '';
      const size = f.size || buffer.length;

      const { text } = await extractText({ buffer, mime, ext });
      const isEmpty = !text || text.replace(/\s/g, '').length === 0;
      if (isEmpty) {
        skipped.push({ filename, size, reason: '空文档或无法解析内容，已跳过' });
        continue;
      }

      const docResult = this.db
        .prepare(
          `INSERT INTO kb_documents(collection_id, filename, ext, mime, size, sha256, status)
           VALUES(?,?,?,?,?,?,?)`,
        )
        .run(collectionId, filename, ext, mime, size, sha, 'uploaded');
      const docId = Number(docResult.lastInsertRowid);

      this.db
        .prepare(
          'INSERT INTO kb_chunks(collection_id, doc_id, idx, content, tokens, start_pos, end_pos) VALUES(?,?,?,?,?,?,?)',
        )
        .run(collectionId, docId, -1, text, Math.ceil(text.length / 4), 0, text.length);

      inserted.push({ docId, filename, size });
    }

    if (!inserted.length) {
      throw new Error('全部文件为空或无法解析，已跳过');
    }

    return { items: inserted, skipped };
  }

  async previewFileSegments(
    file: DKbUploadFile,
    segmentSettings?: DKbSegmentSettings,
    limit = 12,
    llmConfig?: IKbLlmConfig,
  ): Promise<{ idx: number; content: string }[]> {
    const buffer = Buffer.from(file.data);
    const filename = decodeFilename(file.filename || 'unnamed');
    const ext = (file.ext || path.extname(filename).replace('.', '')).toLowerCase();
    const mime = file.mime || '';
    const { text } = await extractText({ buffer, mime, ext });
    if (!text || text.replace(/\s/g, '').length === 0) {
      throw new Error('空文档或无法解析内容');
    }

    const settings = toSegmentSettings(segmentSettings);
    const pieces = await splitDocumentText(text, settings, llmConfig);
    return pieces.slice(0, limit).map((piece) => ({
      idx: piece.idx,
      content: piece.content,
    }));
  }

  async pasteText(
    collectionId: number,
    text: string,
    filename?: string,
  ): Promise<{ docId: number }> {
    const collection = this.db
      .prepare('SELECT id FROM kb_collections WHERE id=?')
      .get(collectionId);
    if (!collection) {
      throw new Error('未找到集合');
    }
    const safeName = decodeFilename(filename || `pasted-${Date.now()}.txt`);
    const size = Buffer.byteLength(text, 'utf8');
    const sha = createHash('sha256').update(text).digest('hex');
    const docResult = this.db
      .prepare(
        `INSERT INTO kb_documents(collection_id, filename, ext, mime, size, sha256, status, progress)
         VALUES(?,?,?,?,?,?,?,?)`,
      )
      .run(collectionId, safeName, 'txt', 'text/plain', size, sha, 'uploaded', 0);
    const docId = Number(docResult.lastInsertRowid);
    this.db
      .prepare(
        'INSERT INTO kb_chunks(collection_id, doc_id, idx, content, tokens, start_pos, end_pos) VALUES(?,?,?,?,?,?,?)',
      )
      .run(collectionId, docId, -1, text, Math.ceil(text.length / 4), 0, text.length);
    return { docId };
  }

  async ingestDocument(
    docId: number,
    embeddingConfig: IKbEmbeddingConfig,
    options?: {
      segmentSettings?: DKbSegmentSettings;
      segmentMode?: EKbSegmentMode;
      llmConfig?: IKbLlmConfig;
    },
  ): Promise<{ chunks: number; dim: number }> {
    const doc = this.db.prepare('SELECT * FROM kb_documents WHERE id=?').get(docId) as
      | { id: number; collection_id: number }
      | undefined;
    if (!doc) {
      throw new Error('文档不存在');
    }

    this.db
      .prepare('UPDATE kb_documents SET status=?, progress=10, error=NULL WHERE id=?')
      .run('processing', docId);

    try {
      const rawRow = this.db
        .prepare('SELECT content FROM kb_chunks WHERE doc_id=? AND idx=-1')
        .get(docId) as { content?: string } | undefined;
      const raw = rawRow?.content || '';

      if (!raw || String(raw).replace(/\s/g, '').length === 0) {
        this.db
          .prepare('UPDATE kb_documents SET status=?, error=?, progress=? WHERE id=?')
          .run('error', '空文档，无法入库', 0, docId);
        throw new Error('空文档，无法入库');
      }

      const settings = toSegmentSettings(options?.segmentSettings);

      if (options?.segmentMode || options?.segmentSettings) {
        this.db
          .prepare('UPDATE kb_documents SET segment_mode=?, segment_settings=? WHERE id=?')
          .run(
            options?.segmentMode ?? (settings.splitMode === 'llm' ? 'general' : 'fixed'),
            JSON.stringify(settings),
            docId,
          );
      }

      this.db
        .prepare(
          'DELETE FROM kb_embeddings WHERE chunk_id IN (SELECT id FROM kb_chunks WHERE doc_id=? AND idx >= 0)',
        )
        .run(docId);
      this.db.prepare('DELETE FROM kb_chunks WHERE doc_id=? AND idx >= 0').run(docId);

      const pieces = await splitDocumentText(raw, settings, options?.llmConfig);
      const collectionId = doc.collection_id;
      const chunkIds: number[] = [];

      for (const p of pieces) {
        const r = this.db
          .prepare(
            'INSERT INTO kb_chunks(collection_id, doc_id, idx, content, tokens, start_pos, end_pos) VALUES(?,?,?,?,?,?,?)',
          )
          .run(collectionId, docId, p.idx, p.content, p.tokens, p.start_pos, p.end_pos);
        chunkIds.push(Number(r.lastInsertRowid));
      }

      this.db.prepare('UPDATE kb_documents SET progress=? WHERE id=?').run(40, docId);

      const vectors = await embedBatch(
        pieces.map((x) => x.content),
        embeddingConfig,
      );
      const dim = vectors[0]?.length || 0;

      for (let i = 0; i < vectors.length; i++) {
        const vecBuf = Buffer.from(new Float32Array(vectors[i]).buffer);
        this.db
          .prepare(
            'INSERT OR REPLACE INTO kb_embeddings(chunk_id, collection_id, vector, dim) VALUES(?,?,?,?)',
          )
          .run(chunkIds[i], collectionId, vecBuf, dim);

        if (i % 5 === 0 || i === vectors.length - 1) {
          const pct = 40 + Math.round(((i + 1) / vectors.length) * 55);
          this.db
            .prepare('UPDATE kb_documents SET progress=? WHERE id=?')
            .run(Math.min(95, pct), docId);
        }
      }

      this.db
        .prepare('UPDATE kb_documents SET status=?, progress=? WHERE id=?')
        .run('ready', 100, docId);
      return { chunks: chunkIds.length, dim };
    } catch (e) {
      let userMessage = '入库失败';
      const err = e instanceof Error ? e : new Error(String(e));
      if (err.message.includes('batch size is invalid')) {
        userMessage = '文档过大，批处理失败';
      } else if (err.message.includes('嵌入')) {
        userMessage = err.message;
      } else {
        userMessage = err.message || userMessage;
      }
      this.db
        .prepare('UPDATE kb_documents SET status=?, error=?, progress=? WHERE id=?')
        .run('error', userMessage, 0, docId);
      throw new Error(userMessage);
    }
  }

  getDocumentProgress(docId: number): IKbDocument | null {
    const row = this.db
      .prepare(
        `SELECT d.id as docId, d.filename, d.status, d.progress, d.error, d.created_at
         FROM kb_documents d WHERE d.id=?`,
      )
      .get(docId) as IKbDocument | undefined;
    return row ?? null;
  }

  listChunks(
    docId: number,
    page = 1,
    pageSize = 20,
    keyword?: string,
  ): { items: IKbChunkItem[]; total: number } {
    const kw = keyword?.trim();
    let countSql = 'SELECT COUNT(1) as cnt FROM kb_chunks WHERE doc_id=? AND idx >= 0';
    let listSql =
      'SELECT id as chunkId, doc_id as docId, idx, content FROM kb_chunks WHERE doc_id=? AND idx >= 0';
    const params: unknown[] = [docId];
    if (kw) {
      countSql += ' AND content LIKE ?';
      listSql += ' AND content LIKE ?';
      params.push(`%${kw}%`);
    }
    listSql += ' ORDER BY idx ASC LIMIT ? OFFSET ?';
    const totalRow = this.db.prepare(countSql).get(...params) as { cnt: number };
    const offset = (Math.max(1, page) - 1) * pageSize;
    const items = this.db.prepare(listSql).all(...params, pageSize, offset) as IKbChunkItem[];
    return { items, total: totalRow?.cnt ?? 0 };
  }

  updateChunk(chunkId: number, content: string): void {
    this.db.prepare('UPDATE kb_chunks SET content=? WHERE id=?').run(content, chunkId);
  }

  deleteChunks(chunkIds: number[]): void {
    if (!chunkIds.length) {
      return;
    }
    const placeholders = chunkIds.map(() => '?').join(',');
    this.db
      .prepare(`DELETE FROM kb_embeddings WHERE chunk_id IN (${placeholders})`)
      .run(...chunkIds);
    this.db.prepare(`DELETE FROM kb_chunks WHERE id IN (${placeholders})`).run(...chunkIds);
  }

  async resegmentDocument(
    docId: number,
    embeddingConfig: IKbEmbeddingConfig,
    segmentSettings: DKbSegmentSettings,
    segmentMode: EKbSegmentMode,
    llmConfig?: IKbLlmConfig,
  ): Promise<{ chunks: number; dim: number }> {
    return this.ingestDocument(docId, embeddingConfig, { segmentSettings, segmentMode, llmConfig });
  }

  deleteDocument(docId: number): void {
    const row = this.db.prepare('SELECT id FROM kb_documents WHERE id=?').get(docId);
    if (!row) {
      throw new Error('文档不存在');
    }
    this.db.prepare('DELETE FROM kb_documents WHERE id=?').run(docId);
  }

  async search(
    collectionId: number,
    query: string,
    embeddingConfig: IKbEmbeddingConfig,
    topK = 10,
  ): Promise<IKbSearchItem[]> {
    const collection = this.db
      .prepare('SELECT id FROM kb_collections WHERE id=?')
      .get(collectionId);
    if (!collection) {
      throw new Error('未找到集合');
    }

    const hybrid = await hybridSearch({
      db: this.db,
      collectionId,
      query,
      embeddingConfig,
      topK: 50,
    });

    const RERANK_INPUT_MAX = 10;
    const candidates = hybrid.slice(0, RERANK_INPUT_MAX);
    const docs = candidates.map((h) => h.content);

    let reranked: { index: number; score: number }[];
    try {
      reranked = await rerank(
        query,
        docs,
        embeddingConfig,
        Math.min(topK, RERANK_INPUT_MAX, docs.length),
      );
    } catch {
      reranked = candidates.map((c, i) => ({ index: i, score: c.hybrid }));
    }

    const idSet = new Set(reranked.map((r) => candidates[r.index].chunk_id));
    const items = candidates
      .map((h, i) => ({
        ...h,
        rerankScore: reranked.find((r) => r.index === i)?.score ?? null,
        i,
      }))
      .filter((x) => idSet.has(x.chunk_id))
      .sort((a, b) => (b.rerankScore ?? 0) - (a.rerankScore ?? 0))
      .slice(0, topK);

    const docIds = [...new Set(items.map((x) => x.doc_id))];
    const docNames: Record<number, string> = {};
    if (docIds.length) {
      const placeholders = docIds.map(() => '?').join(',');
      const rows = this.db
        .prepare(`SELECT id, filename FROM kb_documents WHERE id IN (${placeholders})`)
        .all(...docIds) as { id: number; filename: string }[];
      for (const r of rows) {
        docNames[r.id] = fixGarbledUtf8(r.filename);
      }
    }

    return items.map((x) => ({
      chunkId: x.chunk_id,
      docId: x.doc_id,
      docName: docNames[x.doc_id] || `doc-${x.doc_id}`,
      idx: x.idx,
      content: x.content,
      score: x.hybrid,
      rerankScore: x.rerankScore,
    }));
  }
}

export function getKbService(db: Database): KbService {
  return new KbService(db);
}
