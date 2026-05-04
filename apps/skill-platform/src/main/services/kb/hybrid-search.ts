/**
 * 混合检索：FTS5 BM25 + 向量相似度
 */

import type { IKbEmbeddingConfig } from '@/types/modules/kb';
import type { Database } from 'better-sqlite3';

import { cosine, embedBatch } from './embedding';

function minMaxNorm(values: number[]): number[] {
  if (!values.length) {
    return [];
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max - min < 1e-9) {
    return values.map(() => 0.5);
  }
  return values.map((v) => (v - min) / (max - min));
}

interface IBm25Row {
  chunk_id: number;
  bm25: number;
}

interface IVectorRow {
  chunk_id: number;
  doc_id: number;
  idx: number;
  content: string;
  vector: Buffer;
  cos?: number;
  bm25?: number | null;
  hybrid?: number;
}

function searchBm25(db: Database, collectionId: number, query: string, limit: number): IBm25Row[] {
  const sql = `SELECT rowid AS chunk_id, bm25(kb_chunks_fts) AS bm25
               FROM kb_chunks_fts
               WHERE kb_chunks_fts MATCH ? AND collection_id=?
               LIMIT ?`;
  return db.prepare(sql).all(query, collectionId, limit) as IBm25Row[];
}

async function vectorSearch(
  db: Database,
  collectionId: number,
  query: string,
  config: IKbEmbeddingConfig,
  candidateLimit = 1000,
): Promise<IVectorRow[]> {
  const sql = `SELECT e.chunk_id, e.vector, c.doc_id, c.idx, c.content
               FROM kb_embeddings e
               JOIN kb_chunks c ON e.chunk_id = c.id
               WHERE e.collection_id = ? AND c.idx != -1
               ORDER BY c.id DESC LIMIT ?`;
  const rows = db.prepare(sql).all(collectionId, candidateLimit) as IVectorRow[];
  const [qv] = await embedBatch([query], config);

  const scored = rows.map((r) => {
    const buf = r.vector;
    const storedVec = Array.from(new Float32Array(buf.buffer, buf.byteOffset, buf.byteLength / 4));
    return { ...r, cos: cosine(qv, storedVec) };
  });
  scored.sort((a, b) => (b.cos ?? 0) - (a.cos ?? 0));
  return scored.slice(0, 200);
}

export interface IHybridSearchHit {
  chunk_id: number;
  doc_id: number;
  idx: number;
  content: string;
  hybrid: number;
  bm25?: number | null;
  cos?: number;
}

export async function hybridSearch(options: {
  db: Database;
  collectionId: number;
  query: string;
  embeddingConfig: IKbEmbeddingConfig;
  alpha?: number;
  topK?: number;
}): Promise<IHybridSearchHit[]> {
  const { db, collectionId, query, embeddingConfig } = options;
  const alpha = options.alpha ?? 0.5;
  const topK = options.topK ?? 50;

  const [bm25Rows, vecRows] = await Promise.all([
    Promise.resolve(searchBm25(db, collectionId, query, 50)),
    vectorSearch(db, collectionId, query, embeddingConfig),
  ]);

  const bm25Map = new Map<number, number>();
  for (const r of bm25Rows) {
    bm25Map.set(r.chunk_id, r.bm25);
  }

  const union = new Map<number, IVectorRow>();
  for (const r of vecRows) {
    union.set(r.chunk_id, { ...r, bm25: bm25Map.get(r.chunk_id) ?? null });
  }
  for (const r of bm25Rows) {
    if (!union.has(r.chunk_id)) {
      union.set(r.chunk_id, {
        chunk_id: r.chunk_id,
        doc_id: 0,
        idx: 0,
        content: '',
        vector: Buffer.alloc(0),
        bm25: r.bm25,
      });
    }
  }

  const items = Array.from(union.values());
  const bm25Vals = items.map((x) => (x.bm25 == null ? 0 : -x.bm25));
  const vecVals = items.map((x) => x.cos ?? 0);
  const bm25N = minMaxNorm(bm25Vals);
  const vecN = minMaxNorm(vecVals);

  const scored = items.map((x, i) => ({
    chunk_id: x.chunk_id,
    doc_id: x.doc_id,
    idx: x.idx,
    content: x.content,
    hybrid: alpha * bm25N[i] + (1 - alpha) * vecN[i],
  }));
  scored.sort((a, b) => b.hybrid - a.hybrid);
  return scored.slice(0, topK);
}
