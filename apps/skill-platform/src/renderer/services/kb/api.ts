import type {
  DKbSegmentSettings,
  EKbSegmentMode,
  IKbChunkItem,
  IKbCollection,
  IKbDocument,
  IKbEmbeddingConfig,
  IKbImportResultItem,
  IKbIngestOptions,
  IKbJob,
  IKbRetrievalRequest,
  IKbRetrievalResult,
} from '@/types/modules/kb';

import type { IAIModelConfig, IScenarioModelDefaults } from '@renderer/types/settings';

import { getKbIpc } from '../ipc';
import { getKbAiModels, getKbScenarioModelDefaults } from './context';
import { resolveKbEmbeddingConfig, resolveKbEmbeddingModel } from './embedding-config';

export interface IKbEmbeddingOptions {
  aiModels?: IAIModelConfig[];
  scenarioModelDefaults?: IScenarioModelDefaults;
}

export interface IKbImportOptions extends IKbEmbeddingOptions {
  segmentSettings?: DKbSegmentSettings;
  segmentMode?: EKbSegmentMode;
  forceOcr?: boolean;
}

function getKbApi() {
  const kb = getKbIpc();
  if (!kb) throw new Error('知识库 API 不可用，请在桌面客户端中使用');
  return kb;
}

export function requireKbEmbeddingConfig(options?: IKbEmbeddingOptions): IKbEmbeddingConfig {
  const aiModels = options?.aiModels ?? getKbAiModels();
  const scenarioModelDefaults = options?.scenarioModelDefaults ?? getKbScenarioModelDefaults();
  const model = resolveKbEmbeddingModel(aiModels, scenarioModelDefaults);
  const config = resolveKbEmbeddingConfig(aiModels, scenarioModelDefaults);
  if (!config) {
    if (model) {
      throw new Error(
        `知识库嵌入模型“${model.name?.trim() || model.model || '未命名'}”配置不完整，请在“设置 → AI 模型”中补全 API Key、API 地址和模型名称`,
      );
    }
    throw new Error(
      '尚未配置知识库嵌入模型。请在“设置 → AI 模型”中添加“嵌入模型（知识库）”；“文本切分”是对话模型，不能代替嵌入模型',
    );
  }
  return config;
}

function toIngestOptions(options?: IKbImportOptions): IKbIngestOptions {
  return {
    segmentSettings: options?.segmentSettings,
    segmentMode: options?.segmentMode,
    forceOcr: options?.forceOcr,
  };
}

export const kbListCollections = (): Promise<IKbCollection[]> => getKbApi().listCollections();

export const kbCreateCollection = (name: string, description?: string): Promise<IKbCollection> =>
  getKbApi().createCollection(name, description);

export const kbUpdateCollection = (
  id: string,
  patch: { name?: string; description?: string },
): Promise<IKbCollection> => getKbApi().updateCollection(id, patch);

export const kbDeleteCollection = (id: string): Promise<void> => getKbApi().deleteCollection(id);

export const kbListDocuments = (collectionId: string): Promise<IKbDocument[]> =>
  getKbApi().listDocuments(collectionId);

export const kbGetDocument = (documentId: string): Promise<IKbDocument | null> =>
  getKbApi().getDocument(documentId);

export const kbDeleteDocument = (documentId: string): Promise<void> =>
  getKbApi().deleteDocument(documentId);

export const kbListChunks = (
  documentId: string,
  page = 1,
  pageSize = 20,
  keyword?: string,
): Promise<{ items: IKbChunkItem[]; total: number }> =>
  getKbApi().listChunks(documentId, page, pageSize, keyword);

export const kbGetChunk = (chunkId: string): Promise<IKbChunkItem> => getKbApi().getChunk(chunkId);

export const kbEditChunk = (
  chunkId: string,
  content: string,
  options?: IKbEmbeddingOptions,
): Promise<{ jobId: string }> =>
  getKbApi().editChunk(chunkId, content, requireKbEmbeddingConfig(options));

export const kbDeleteChunks = (chunkIds: string[]): Promise<void> =>
  getKbApi().deleteChunks(chunkIds);

export function kbImportFiles(
  collectionId: string,
  files: File[],
  options?: IKbImportOptions,
): Promise<IKbImportResultItem[]> {
  const api = getKbApi();
  const filePaths = files.map((file) => api.getPathForFile(file));
  if (filePaths.some((filePath) => !filePath)) {
    throw new Error('无法取得文件系统路径，请重新选择文件');
  }
  return api.importFiles({
    collectionId,
    filePaths,
    ingest: toIngestOptions(options),
    embedding: requireKbEmbeddingConfig(options),
  });
}

export const kbImportDirectory = (
  collectionId: string,
  directoryPath: string,
  options?: IKbImportOptions & { recursive?: boolean; ignore?: string[] },
): Promise<IKbImportResultItem[]> =>
  getKbApi().importDirectory({
    collectionId,
    directoryPath,
    recursive: options?.recursive,
    ignore: options?.ignore,
    ingest: toIngestOptions(options),
    embedding: requireKbEmbeddingConfig(options),
  });

export const kbPickDirectory = (): Promise<string | undefined> => getKbApi().pickDirectory();

export const kbPasteText = (
  collectionId: string,
  text: string,
  filename: string | undefined,
  options?: IKbImportOptions,
): Promise<IKbImportResultItem> =>
  getKbApi().pasteText({
    collectionId,
    text,
    filename,
    ingest: toIngestOptions(options),
    embedding: requireKbEmbeddingConfig(options),
  });

export async function kbPreviewFile(file: File, options?: IKbImportOptions) {
  const api = getKbApi();
  const filePath = api.getPathForFile(file);
  if (!filePath) throw new Error('无法取得文件系统路径，请重新选择文件');
  return api.previewFile(filePath, toIngestOptions(options));
}

export const kbRetrieve = (
  request: Omit<IKbRetrievalRequest, 'embedding'>,
  options?: IKbEmbeddingOptions,
): Promise<IKbRetrievalResult> =>
  getKbApi().retrieve({ ...request, embedding: requireKbEmbeddingConfig(options) });

export const kbRetrieveForChat = (
  request: Omit<IKbRetrievalRequest, 'embedding'>,
  options?: IKbEmbeddingOptions,
): Promise<IKbRetrievalResult> =>
  getKbApi().retrieveForChat({ ...request, embedding: requireKbEmbeddingConfig(options) });

export const kbListJobs = (limit?: number): Promise<IKbJob[]> => getKbApi().listJobs(limit);

export const kbRetryJob = (
  jobId: string,
  options?: IKbEmbeddingOptions,
): Promise<IKbImportResultItem> => getKbApi().retryJob(jobId, requireKbEmbeddingConfig(options));

export const kbCancelJob = (jobId: string): Promise<{ cancelled: boolean }> =>
  getKbApi().cancelJob(jobId);

export { resolveKbEmbeddingConfig, resolveKbEmbeddingModel } from './embedding-config';
