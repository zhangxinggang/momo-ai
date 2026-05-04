/**
 * 知识库类型定义
 */

export interface IKbCollection {
  id: number;
  name: string;
  description?: string;
  group_id?: number | null;
  created_at?: string;
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

export interface IKbDocument {
  docId: number;
  filename: string;
  ext?: string;
  mime?: string;
  size?: number;
  status?: string;
  error?: string;
  progress?: number;
  created_at?: string;
  chunk_count?: number;
  segment_mode?: EKbSegmentMode;
}

export interface IKbChunkItem {
  chunkId: number;
  docId: number;
  idx: number;
  content: string;
}

export interface IKbSearchItem {
  chunkId: number;
  docId: number;
  docName: string;
  idx: number;
  content: string;
  score: number;
  rerankScore: number | null;
}

/** 向量嵌入 API 配置（由渲染进程从 AI 工作台传入） */
export interface IKbEmbeddingConfig {
  apiKey: string;
  baseUrl: string;
  model?: string;
  rerankModel?: string;
}

/** 大语言模型切分 API 配置（由渲染进程从对话模型解析） */
export interface IKbLlmConfig {
  apiKey: string;
  apiUrl: string;
  model: string;
  provider?: string;
  apiProtocol?: 'openai' | 'gemini' | 'anthropic';
}

export interface IKbIngestOptions {
  segmentSettings?: DKbSegmentSettings;
  segmentMode?: EKbSegmentMode;
  llmConfig?: IKbLlmConfig;
}

export interface DKbUploadFile {
  filename: string;
  mime?: string;
  ext?: string;
  size: number;
  data: Uint8Array;
}

export interface IKbUploadResultItem {
  docId: number;
  filename: string;
  size: number;
}
