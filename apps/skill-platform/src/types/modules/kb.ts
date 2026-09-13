/** Knowledge Base V2 shared contracts. V1 numeric ids and byte-upload contracts are absent. */

export type KnowledgeId = string;

export type EKnowledgeStage =
  | 'initialize'
  | 'source'
  | 'parse'
  | 'chunk'
  | 'embedding'
  | 'sparse_index'
  | 'vector_index'
  | 'query_rewrite'
  | 'retrieve'
  | 'rerank';

export type EKnowledgeManualAction =
  | 'retry'
  | 'reconfigure'
  | 'install_component'
  | 'reimport'
  | 'rebuild_index'
  | 'open_logs'
  | 'delete';

export interface IKnowledgeErrorShape {
  name: 'KnowledgeError';
  code: string;
  stage: EKnowledgeStage;
  message: string;
  documentId?: KnowledgeId;
  jobId?: KnowledgeId;
  providerRequestId?: string;
  details?: Record<string, unknown>;
  allowedManualActions: EKnowledgeManualAction[];
}

export type EKbSegmentMode = 'fixed' | 'general';

export interface DKbSegmentSettings {
  separator: string;
  maxChunkLength: number;
  chunkOverlap: number;
  preprocess: {
    normalizeWhitespace: boolean;
    removeUrlsAndEmails: boolean;
  };
  splitMode: 'code' | 'llm';
}

export interface IKbEmbeddingConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  dimension?: number;
  maxInputTokens?: number;
  normalize?: boolean;
  distance?: 'cosine' | 'dot' | 'l2';
}

export interface IKbRerankConfig {
  enabled: boolean;
  apiKey?: string;
  endpoint?: string;
  model?: string;
  timeoutMs?: number;
}

export interface IKbIngestOptions {
  segmentSettings?: DKbSegmentSettings;
  segmentMode?: EKbSegmentMode;
  forceOcr?: boolean;
}

export interface IKbCollection {
  id: KnowledgeId;
  name: string;
  description?: string;
  embeddingProfileId: string;
  retrievalProfileId: string;
  parserProfileId: string;
  status: 'ready' | 'error';
  createdAt: number;
  updatedAt: number;
}

export type EKbDocumentStatus =
  | 'queued'
  | 'parsing'
  | 'chunking'
  | 'embedding'
  | 'indexing'
  | 'ready'
  | 'failed'
  | 'interrupted'
  | 'manual_conflict';

export interface IKbDocument {
  docId: KnowledgeId;
  collectionId: KnowledgeId;
  sourceId?: KnowledgeId;
  filename: string;
  relativePath?: string;
  ext?: string;
  mime: string;
  size: number;
  status: EKbDocumentStatus;
  stage?: EKnowledgeStage;
  errorCode?: string;
  error?: string;
  progress: number;
  createdAt: number;
  updatedAt: number;
  chunkCount: number;
  segmentMode: EKbSegmentMode;
  activeRevisionId?: KnowledgeId;
}

export interface IKbChunkItem {
  chunkId: KnowledgeId;
  docId: KnowledgeId;
  revisionId: KnowledgeId;
  parentChunkId?: KnowledgeId;
  idx: number;
  kind: 'parent' | 'child' | 'manual';
  content: string;
  tokenCount: number;
  headingPath: string[];
  page?: number;
  pageEnd?: number;
  sheet?: string;
  cellRange?: string;
  enabled: boolean;
  origin: 'parsed' | 'manual';
}

export interface IKbImportResultItem {
  docId: KnowledgeId;
  jobId: KnowledgeId;
  filename: string;
  size: number;
}

export interface IKbDirectoryImportRequest {
  collectionId: KnowledgeId;
  directoryPath: string;
  recursive?: boolean;
  ignore?: string[];
  ingest: IKbIngestOptions;
  embedding: IKbEmbeddingConfig;
}

export interface IKbFileImportRequest {
  collectionId: KnowledgeId;
  filePaths: string[];
  ingest: IKbIngestOptions;
  embedding: IKbEmbeddingConfig;
}

export interface IKbConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface IKbRetrievalRequest {
  query: string;
  conversation?: IKbConversationMessage[];
  collectionIds?: KnowledgeId[];
  documentIds?: KnowledgeId[];
  topK: number;
  contextTokenBudget: number;
  mode: 'balanced' | 'precise' | 'semantic';
  rerank: 'on' | 'off';
  embedding: IKbEmbeddingConfig;
  rerankConfig?: IKbRerankConfig;
  trace: boolean;
}

export interface IKbSearchItem {
  chunkId: KnowledgeId;
  parentChunkId?: KnowledgeId;
  docId: KnowledgeId;
  collectionId: KnowledgeId;
  collectionName: string;
  revisionId: KnowledgeId;
  docName: string;
  sourcePath?: string;
  idx: number;
  content: string;
  preview: string;
  headingPath: string[];
  page?: number;
  pageEnd?: number;
  sheet?: string;
  cellRange?: string;
  denseRank?: number;
  sparseRank?: number;
  metadataRank?: number;
  rrfScore: number;
  rerankScore?: number;
  finalScore: number;
  tokenCount: number;
}

export interface IKbRetrievalTrace {
  traceId: KnowledgeId;
  originalQuery: string;
  rewrittenQuery: string;
  timings: Record<string, number>;
  candidateCounts: Record<string, number>;
  selectedChunkIds: KnowledgeId[];
}

export interface IKbRetrievalResult {
  status: 'ready' | 'no_match';
  query: string;
  evidence: IKbSearchItem[];
  citations: Array<{
    id: string;
    collectionId: KnowledgeId;
    collectionName: string;
    documentId: KnowledgeId;
    revisionId: KnowledgeId;
    chunkId: KnowledgeId;
    title: string;
    sourcePath?: string;
    headingPath: string[];
    page?: number;
    pageEnd?: number;
    sheet?: string;
    cellRange?: string;
    preview: string;
    finalScore: number;
  }>;
  context: string;
  trace?: IKbRetrievalTrace;
}

export type EKbJobStatus =
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'interrupted';

export interface IKbJob {
  id: KnowledgeId;
  type: 'ingest' | 'reindex' | 'edit_chunk' | 'delete';
  collectionId?: KnowledgeId;
  documentId?: KnowledgeId;
  revisionId?: KnowledgeId;
  status: EKbJobStatus;
  stage?: EKnowledgeStage;
  progress: number;
  errorCode?: string;
  error?: string;
  createdAt: number;
  startedAt?: number;
  finishedAt?: number;
}

export interface IKbChunkEditRequest {
  chunkId: KnowledgeId;
  content: string;
  embedding: IKbEmbeddingConfig;
}
