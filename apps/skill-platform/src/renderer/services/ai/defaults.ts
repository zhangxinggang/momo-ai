import type {
  EAIUsageScenario,
  IAIModelConfig,
  IScenarioModelDefaults,
} from '@renderer/types/settings';
import type { IAIConfig } from './types';

/** 模型名/显示名命中以下模式时，视为可用于生图场景（即使类型仍为对话模型） */
const IMAGE_CAPABLE_MODEL_PATTERN =
  /dall-e|dalle|flux|stable-diffusion|stable_diffusion|midjourney|imagen|gpt-image|image-preview|seedream|wanx|text-to-image|text2image|qwen-image|[-_]image[-_]|[-_]image$/i;

export function isImageCapableModel(model: IAIModelConfig): boolean {
  if (model.type === 'image') {
    return true;
  }
  const hint = `${model.model || ''} ${model.name || ''}`.toLowerCase();
  return IMAGE_CAPABLE_MODEL_PATTERN.test(hint);
}

export function getImageScenarioModels(aiModels: IAIModelConfig[]): IAIModelConfig[] {
  return aiModels.filter(isImageCapableModel);
}

export function getModelsByType(
  aiModels: IAIModelConfig[],
  type: 'chat' | 'image',
): IAIModelConfig[] {
  if (type === 'image') {
    return getImageScenarioModels(aiModels);
  }
  return aiModels.filter((model) => (model.type ?? 'chat') === 'chat');
}

export function resolveScenarioModel(
  aiModels: IAIModelConfig[],
  scenarioModelDefaults: IScenarioModelDefaults | undefined,
  scenario: EAIUsageScenario,
  type: 'chat' | 'image',
): IAIModelConfig | null {
  const typedModels = getModelsByType(aiModels, type);
  const scenarioModelId = scenarioModelDefaults?.[scenario];

  if (scenarioModelId) {
    const explicitModel = typedModels.find((model) => model.id === scenarioModelId);
    if (explicitModel) {
      return explicitModel;
    }
  }

  return typedModels.find((model) => model.isDefault) ?? typedModels[0] ?? null;
}

export function toAIConfig(model: IAIModelConfig): IAIConfig {
  return {
    id: model.id,
    provider: model.provider,
    apiProtocol: model.apiProtocol,
    apiKey: model.apiKey,
    apiUrl: model.apiUrl,
    model: model.model,
    type: model.type ?? 'chat',
    chatParams: model.chatParams,
    imageParams: model.imageParams,
  };
}

export function isConfiguredModel(
  model: IAIModelConfig | null | undefined,
): model is IAIModelConfig {
  return Boolean(
    model &&
    model.provider?.trim() &&
    model.apiKey?.trim() &&
    model.apiUrl?.trim() &&
    model.model?.trim(),
  );
}

interface IResolveScenarioAIConfigOptions {
  aiModels: IAIModelConfig[];
  scenarioModelDefaults: IScenarioModelDefaults | undefined;
  scenario: EAIUsageScenario;
  type: 'chat' | 'image';
  aiProvider: string;
  aiApiProtocol?: IAIConfig['apiProtocol'];
  aiApiKey: string;
  aiApiUrl: string;
  aiModel: string;
}

export function resolveScenarioAIConfig({
  aiModels,
  scenarioModelDefaults,
  scenario,
  type,
  aiProvider,
  aiApiProtocol,
  aiApiKey,
  aiApiUrl,
  aiModel,
}: IResolveScenarioAIConfigOptions): IAIConfig | null {
  const selectedModel = resolveScenarioModel(aiModels, scenarioModelDefaults, scenario, type);

  if (isConfiguredModel(selectedModel)) {
    return toAIConfig(selectedModel);
  }

  if (
    type === 'chat' &&
    aiProvider.trim() &&
    aiApiKey.trim() &&
    aiApiUrl.trim() &&
    aiModel.trim()
  ) {
    return {
      provider: aiProvider,
      apiProtocol: aiApiProtocol,
      apiKey: aiApiKey,
      apiUrl: aiApiUrl,
      model: aiModel,
      type,
    };
  }

  return null;
}
