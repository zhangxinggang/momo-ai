import type {
  DKbSegmentSettings,
  EKbSegmentMode,
  IKbChunkItem,
  IKbCollection,
  IKbDocument,
  IKbEmbeddingConfig,
  IKbLlmConfig,
  IKbSearchItem,
  IKbUploadResultItem,
} from '@/types/modules/kb';

import type { IAIModelConfig, IScenarioModelDefaults } from '@renderer/types/settings';

import { getKbAiModels } from './context';
import { resolveKbEmbeddingConfig } from './embedding-config';
import { requireKbLlmConfig } from './llm-config';

/** 知识库嵌入相关可选参数（可注入模型列表，避免服务层强依赖 store） */
export interface IKbEmbeddingOptions {
  aiModels?: IAIModelConfig[];
  scenarioModelDefaults?: IScenarioModelDefaults;
}

function getKbApi() {
  if (!window.api?.kb) {
    throw new Error('知识库 API 不可用，请在桌面客户端中使用');
  }
  const kb = window.api.kb;
  if (typeof kb.listChunks !== 'function') {
    throw new Error('知识库 API 版本过旧，请完全重启应用后再试');
  }
  return kb;
}

function requireEmbeddingConfig(options?: IKbEmbeddingOptions): IKbEmbeddingConfig {
  const models = options?.aiModels ?? getKbAiModels();
  const config = resolveKbEmbeddingConfig(models);
  if (!config) {
    throw new Error('请先在设置中配置 DashScope 或嵌入模型（API Key 与 Base URL）');
  }
  return config;
}

function resolveLlmConfigForSplit(
  segmentSettings: DKbSegmentSettings | undefined,
  options?: IKbEmbeddingOptions,
): IKbLlmConfig | undefined {
  if (segmentSettings?.splitMode !== 'llm') {
    return undefined;
  }
  return requireKbLlmConfig(options?.aiModels ?? getKbAiModels(), options?.scenarioModelDefaults);
}

export async function kbListCollections(groupId?: number): Promise<IKbCollection[]> {
  return getKbApi().listCollections(groupId);
}

export async function kbCreateCollection(
  name: string,
  description?: string,
  groupId?: number,
): Promise<IKbCollection> {
  return getKbApi().createCollection(name, description, groupId);
}

export async function kbDeleteCollection(id: number): Promise<void> {
  await getKbApi().deleteCollection(id);
}

export async function kbUpdateCollection(
  id: number,
  payload: Partial<{ name: string; description: string; group_id: number | null }>,
): Promise<void> {
  await getKbApi().updateCollection(id, payload);
}

export async function kbUploadFiles(
  collectionId: number,
  files: File[],
): Promise<IKbUploadResultItem[]> {
  const payloads = await Promise.all(
    files.map(async (file) => {
      const buffer = await file.arrayBuffer();
      const ext = file.name.includes('.') ? file.name.split('.').pop() || '' : '';
      return {
        filename: file.name,
        mime: file.type,
        ext,
        size: file.size,
        data: new Uint8Array(buffer),
      };
    }),
  );
  const result = await getKbApi().uploadFiles(collectionId, payloads);
  return result.items;
}

export async function kbListDocuments(collectionId: number): Promise<IKbDocument[]> {
  return getKbApi().listDocuments(collectionId);
}

export async function kbIngestDocument(
  docId: number,
  options?: IKbEmbeddingOptions & {
    segmentSettings?: DKbSegmentSettings;
    segmentMode?: EKbSegmentMode;
  },
): Promise<void> {
  const embeddingConfig = requireEmbeddingConfig(options);
  await getKbApi().ingestDocument(docId, embeddingConfig, {
    segmentSettings: options?.segmentSettings,
    segmentMode: options?.segmentMode,
    llmConfig: resolveLlmConfigForSplit(options?.segmentSettings, options),
  });
}

export async function kbListChunks(
  docId: number,
  page = 1,
  pageSize = 20,
  keyword?: string,
): Promise<{ items: IKbChunkItem[]; total: number }> {
  return getKbApi().listChunks(docId, page, pageSize, keyword);
}

export async function kbUpdateChunk(chunkId: number, content: string): Promise<void> {
  await getKbApi().updateChunk(chunkId, content);
}

export async function kbDeleteChunks(chunkIds: number[]): Promise<void> {
  await getKbApi().deleteChunks(chunkIds);
}

export async function kbResegmentDocument(
  docId: number,
  segmentSettings: DKbSegmentSettings,
  segmentMode: EKbSegmentMode,
  options?: IKbEmbeddingOptions,
): Promise<void> {
  const embeddingConfig = requireEmbeddingConfig(options);
  await getKbApi().resegmentDocument(
    docId,
    embeddingConfig,
    segmentSettings,
    segmentMode,
    resolveLlmConfigForSplit(segmentSettings, options),
  );
}

export async function kbDeleteDocument(docId: number): Promise<void> {
  await getKbApi().deleteDocument(docId);
}

export async function kbGetDocumentProgress(docId: number): Promise<IKbDocument | null> {
  const resp = await getKbApi().getDocument(docId);
  return resp.item;
}

export async function kbPasteText(
  collectionId: number,
  text: string,
  filename?: string,
): Promise<{ docId: number }> {
  return getKbApi().pasteText(collectionId, text, filename);
}

export async function kbPreviewFileSegments(
  file: File,
  segmentSettings: DKbSegmentSettings,
  limit = 12,
  options?: IKbEmbeddingOptions,
): Promise<{ idx: number; content: string }[]> {
  const buffer = await file.arrayBuffer();
  const ext = file.name.includes('.') ? file.name.split('.').pop() || '' : '';
  const payload = {
    filename: file.name,
    mime: file.type,
    ext,
    size: file.size,
    data: new Uint8Array(buffer),
  };
  const kb = getKbApi();
  if (typeof kb.previewFileSegments !== 'function') {
    throw new Error('知识库预览 API 不可用，请完全重启应用后再试');
  }
  return kb.previewFileSegments(
    payload,
    segmentSettings,
    limit,
    resolveLlmConfigForSplit(segmentSettings, options),
  );
}

export async function kbSearch(
  collectionId: number,
  query: string,
  topK = 10,
  options?: IKbEmbeddingOptions,
): Promise<IKbSearchItem[]> {
  const embeddingConfig = requireEmbeddingConfig(options);
  const resp = await getKbApi().search(collectionId, query, embeddingConfig, topK);
  return resp.items;
}

export { resolveKbEmbeddingConfig } from './embedding-config';
export { requireKbLlmConfig, resolveKbLlmConfig } from './llm-config';
