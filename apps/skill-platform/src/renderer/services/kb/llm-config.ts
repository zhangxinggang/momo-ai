import type { IKbLlmConfig } from '@/types/modules/kb';

import { resolveScenarioModel } from '@renderer/services/ai/defaults';
import type { IAIModelConfig, IScenarioModelDefaults } from '@renderer/types/settings';

/**
 * 从场景默认模型解析知识库 LLM 切分用的对话模型
 */
export function resolveKbLlmConfig(
  aiModels: IAIModelConfig[],
  scenarioModelDefaults?: IScenarioModelDefaults,
): IKbLlmConfig | null {
  const picked = resolveScenarioModel(aiModels, scenarioModelDefaults, 'textSegment', 'chat');
  if (!picked?.apiKey?.trim() || !picked.apiUrl?.trim() || !picked.model?.trim()) {
    return null;
  }

  return {
    apiKey: picked.apiKey,
    apiUrl: picked.apiUrl,
    model: picked.model,
    provider: picked.provider,
    apiProtocol: picked.apiProtocol,
  };
}

export function requireKbLlmConfig(
  aiModels: IAIModelConfig[],
  scenarioModelDefaults?: IScenarioModelDefaults,
): IKbLlmConfig {
  const config = resolveKbLlmConfig(aiModels, scenarioModelDefaults);
  if (!config) {
    throw new Error('请先在设置 → 场景默认模型中为「文本切分」配置对话模型');
  }
  return config;
}
