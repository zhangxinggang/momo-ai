import type { ISafetyScanAiConfig } from '@/types/modules';
import type { IAIModelConfig } from '@renderer/types/settings';

/** 从用户配置的 AI 模型中提取安全扫描配置 */
export function getSafetyScanAIConfig(aiModels: IAIModelConfig[]): ISafetyScanAiConfig | undefined {
  const chatModels = aiModels.filter((m) => (m.type ?? 'chat') === 'chat');
  const model = chatModels.find((m) => m.isDefault) ?? chatModels[0];
  if (!model?.apiKey || !model?.apiUrl || !model?.model) {
    return undefined;
  }
  return {
    provider: model.provider,
    apiProtocol: model.apiProtocol,
    apiKey: model.apiKey,
    apiUrl: model.apiUrl,
    model: model.model,
  };
}
