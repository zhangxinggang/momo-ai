import type { IKbEmbeddingConfig } from '@/types/modules/kb';

import { getEmbeddingScenarioModels, isConfiguredModel } from '@renderer/services/ai/defaults';
import type { IAIModelConfig, IScenarioModelDefaults } from '@renderer/types/settings';

export function resolveKbEmbeddingModel(
  aiModels: IAIModelConfig[],
  scenarioModelDefaults?: IScenarioModelDefaults,
): IAIModelConfig | null {
  const embeddingModels = getEmbeddingScenarioModels(aiModels);
  const selectedId = scenarioModelDefaults?.knowledgeEmbedding;
  if (selectedId) {
    const selected = embeddingModels.find((model) => model.id === selectedId);
    if (selected) return selected;
  }
  return embeddingModels.find((model) => model.isDefault) ?? embeddingModels[0] ?? null;
}

/**
 * 从 AI 工作台模型列表解析知识库嵌入配置
 */
export function resolveKbEmbeddingConfig(
  aiModels: IAIModelConfig[],
  scenarioModelDefaults?: IScenarioModelDefaults,
): IKbEmbeddingConfig | null {
  const embeddingModel = resolveKbEmbeddingModel(aiModels, scenarioModelDefaults);
  if (!isConfiguredModel(embeddingModel)) {
    return null;
  }

  return {
    apiKey: embeddingModel.apiKey,
    baseUrl: embeddingModel.apiUrl,
    model: embeddingModel.model,
  };
}
