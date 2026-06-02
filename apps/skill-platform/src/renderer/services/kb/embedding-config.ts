import type { IKbEmbeddingConfig } from '@/types/modules/kb';

import type { IAIModelConfig } from '@renderer/types/settings';

const DEFAULT_EMBEDDING_MODEL = 'text-embedding-v4';

/**
 * 从 AI 工作台模型列表解析知识库嵌入配置
 */
export function resolveKbEmbeddingConfig(aiModels: IAIModelConfig[]): IKbEmbeddingConfig | null {
  const embeddingModel = aiModels.find(
    (m) =>
      (m.model || '').includes('embedding') ||
      (m.model || '').includes('text-embedding') ||
      (m.name || '').toLowerCase().includes('embedding'),
  );

  const dashscopeLike = aiModels.find(
    (m) =>
      (m.provider || '').toLowerCase().includes('dashscope') ||
      (m.provider || '').toLowerCase().includes('qwen') ||
      (m.apiUrl || '').includes('dashscope'),
  );

  const kimiLike = aiModels.find(
    (m) =>
      (m.provider || '').toLowerCase() === 'kimi' ||
      (m.provider || '').toLowerCase() === 'moonshot' ||
      (m.apiUrl || '').includes('moonshot.cn') ||
      (m.apiUrl || '').includes('api.kimi.com'),
  );

  const picked =
    embeddingModel || dashscopeLike || kimiLike || aiModels.find((m) => m.apiKey && m.apiUrl);
  if (!picked?.apiKey?.trim() || !picked.apiUrl?.trim()) {
    return null;
  }

  return {
    apiKey: picked.apiKey,
    baseUrl: picked.apiUrl,
    model: embeddingModel?.model || DEFAULT_EMBEDDING_MODEL,
    rerankModel: 'qwen3-rerank',
  };
}
