/** 分段模式：固定规则或通用（大模型） */
export type EDocumentSegmentMode = 'fixed' | 'general';

/** 切分方式：代码切分 / 大语言模型切分 */
export type EDocumentSplitMode = 'code' | 'llm';

export interface ITextPreprocessRules {
  /** 替换连续空格、换行、制表符 */
  normalizeWhitespace: boolean;
  /** 删除 URL 与电子邮件 */
  removeUrlsAndEmails: boolean;
}

export interface ISegmentSettings {
  separator: string;
  maxChunkLength: number;
  chunkOverlap: number;
  preprocess: ITextPreprocessRules;
  splitMode: EDocumentSplitMode;
}

/** 默认分段参数与 RAG-ChatBot-main 对齐：chunkSize=500, chunkOverlap=100 */
export const DEFAULT_SEGMENT_SETTINGS: ISegmentSettings = {
  separator: '\n\n',
  maxChunkLength: 500,
  chunkOverlap: 100,
  preprocess: {
    normalizeWhitespace: true,
    removeUrlsAndEmails: false,
  },
  splitMode: 'code',
};

export type EKnowledgeIngestStep = 'datasource' | 'segment' | 'ingest';

export interface IKnowledgeDocumentRecord {
  id: number;
  name: string;
  segmentMode: EDocumentSegmentMode;
  uploadedAt: number;
}
