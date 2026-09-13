import type { IKbEmbeddingConfig, IKbIngestOptions } from '@/types/modules/kb';

export interface IIngestJobPayload {
  sourcePath: string;
  blobPath: string;
  filename: string;
  relativePath?: string;
  ingest: IKbIngestOptions;
  embedding: IKbEmbeddingConfig;
}

export interface IStoredIngestPayload {
  sourcePath: string;
  blobPath: string;
  filename: string;
  relativePath?: string;
  ingest: IKbIngestOptions;
  embedding: Omit<IKbEmbeddingConfig, 'apiKey'>;
}

export function toStoredIngestPayload(payload: IIngestJobPayload): IStoredIngestPayload {
  const { apiKey: _apiKey, ...embedding } = payload.embedding;
  return { ...payload, embedding };
}

export interface IActiveScope {
  collectionIds: string[];
  revisionIds: string[];
  embeddingFingerprint: string;
  expectedVectorCount: number;
}

export interface IRankedCandidateRow {
  chunkId: string;
  rank: number;
  score?: number;
}

export interface IHydratedChunkRow {
  chunk_id: string;
  parent_chunk_id: string | null;
  document_id: string;
  collection_id: string;
  revision_id: string;
  idx: number;
  content: string;
  content_hash: string;
  token_count: number;
  heading_path_json: string;
  page: number | null;
  page_end: number | null;
  sheet: string | null;
  cell_range: string | null;
  filename: string;
  relative_path: string | null;
  source_uri: string | null;
  collection_name: string;
  origin: 'parsed' | 'manual';
}
