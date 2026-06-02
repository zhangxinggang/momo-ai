import type { IAIModelConfig, IChatModelParams, IImageModelParams } from '@renderer/types/settings';

import { DEFAULT_CHAT_PARAMS, DEFAULT_IMAGE_PARAMS, PROVIDER_OPTIONS } from './constants';
import type { IModelFormState, IModelOption, IProviderOption } from './types';

const MODEL_CATEGORY_CONFIG: Array<{
  category: string;
  idKeywords?: string[];
  ownerKeywords?: string[];
}> = [
  { category: 'GPT', idKeywords: ['gpt', 'o1-', 'o3-'], ownerKeywords: ['openai'] },
  { category: 'Claude', idKeywords: ['claude'], ownerKeywords: ['anthropic'] },
  { category: 'Gemini', idKeywords: ['gemini'], ownerKeywords: ['google', 'vertexai'] },
  { category: 'DeepSeek', idKeywords: ['deepseek'], ownerKeywords: ['deepseek'] },
  { category: 'Qwen', idKeywords: ['qwen', 'qwq'], ownerKeywords: ['qwen', 'aliyun', 'dashscope'] },
  { category: 'Doubao', idKeywords: ['doubao'], ownerKeywords: ['doubao', 'volcengine'] },
  { category: 'GLM', idKeywords: ['glm', 'zhipu'], ownerKeywords: ['zhipu'] },
  {
    category: 'Kimi',
    idKeywords: ['moonshot', 'kimi', 'moonshot-v1'],
    ownerKeywords: ['moonshot', 'kimi'],
  },
  { category: 'Mistral', idKeywords: ['mistral', 'mixtral'], ownerKeywords: ['mistral'] },
  { category: 'Yi', idKeywords: ['yi-'], ownerKeywords: ['01-ai', 'zeroone', 'zero-one'] },
  { category: 'ERNIE', idKeywords: ['ernie', 'wenxin'], ownerKeywords: ['baidu', 'wenxin'] },
  { category: 'Spark', idKeywords: ['spark', 'xunfei'], ownerKeywords: ['xunfei', 'iflytek'] },
  { category: 'Hunyuan', idKeywords: ['hunyuan'], ownerKeywords: ['tencent'] },
];

const PROVIDER_CATEGORY_MAP: Record<string, string> = {
  openai: 'GPT',
  anthropic: 'Claude',
  google: 'Gemini',
  deepseek: 'DeepSeek',
  qwen: 'Qwen',
  doubao: 'Doubao',
  zhipu: 'GLM',
  kimi: 'Kimi',
  moonshot: 'Kimi',
  mistral: 'Mistral',
  yi: 'Yi',
  ernie: 'ERNIE',
  spark: 'Spark',
  hunyuan: 'Hunyuan',
};

export function cloneDefaultChatParams(): IModelFormState['chatParams'] {
  return { ...DEFAULT_CHAT_PARAMS };
}

export function cloneDefaultImageParams(): IModelFormState['imageParams'] {
  return { ...DEFAULT_IMAGE_PARAMS };
}

function formatCustomParams(customParams?: Record<string, string | number | boolean>): string {
  if (!customParams || Object.keys(customParams).length === 0) {
    return '';
  }
  return JSON.stringify(customParams, null, 2);
}

function parseCustomParams(
  text: string,
): { success: true; value: Record<string, string | number | boolean> } | { success: false } {
  if (!text.trim()) {
    return { success: true, value: {} };
  }

  try {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { success: false };
    }

    const result: Record<string, string | number | boolean> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
        return { success: false };
      }
      result[key] = value;
    }

    return { success: true, value: result };
  } catch {
    return { success: false };
  }
}

export function buildChatParams(form: IModelFormState): IChatModelParams | null {
  const customParams = parseCustomParams(form.chatParams.customParamsText);
  if (!customParams.success) {
    return null;
  }

  return {
    temperature: form.chatParams.temperature,
    maxTokens: form.chatParams.maxTokens,
    topP: form.chatParams.topP,
    topK: form.chatParams.topK.trim() ? Number(form.chatParams.topK) : undefined,
    frequencyPenalty: form.chatParams.frequencyPenalty,
    presencePenalty: form.chatParams.presencePenalty,
    stream: form.chatParams.stream,
    enableThinking: form.chatParams.enableThinking,
    customParams: Object.keys(customParams.value).length > 0 ? customParams.value : undefined,
  };
}

export function buildImageParams(form: IModelFormState): IImageModelParams {
  return {
    size: form.imageParams.size,
    quality: form.imageParams.quality,
    style: form.imageParams.style,
    n: form.imageParams.n,
  };
}

/** 历史配置中 provider 可能为 moonshot，与 kimi 共用同一套 API */
const LEGACY_PROVIDER_ALIASES: Record<string, string> = {
  moonshot: 'kimi',
};

export function getProviderInfo(providerId: string): IProviderOption | undefined {
  const normalizedId = LEGACY_PROVIDER_ALIASES[providerId] ?? providerId;
  return PROVIDER_OPTIONS.find((item) => item.id === normalizedId);
}

export function getProviderLabel(providerId: string): string {
  return getProviderInfo(providerId)?.name || providerId || 'Unknown';
}

export function getModelCategory(model: {
  id?: string;
  model?: string;
  owned_by?: string;
  provider?: string;
}): string {
  const provider = model.provider?.toLowerCase() || '';
  if (provider && provider !== 'custom' && PROVIDER_CATEGORY_MAP[provider]) {
    return PROVIDER_CATEGORY_MAP[provider];
  }

  const id = (model.model || model.id || '').toLowerCase();
  const owner = model.owned_by?.toLowerCase() || '';

  for (const item of MODEL_CATEGORY_CONFIG) {
    if (item.ownerKeywords?.some((keyword) => owner.includes(keyword))) {
      return item.category;
    }
  }

  for (const item of MODEL_CATEGORY_CONFIG) {
    if (item.idKeywords?.some((keyword) => id.includes(keyword))) {
      return item.category;
    }
  }

  if (id.includes('embedding') || id.includes('text-embedding')) return 'Embedding';
  if (id.includes('whisper') || id.includes('tts')) return 'Audio';
  if (id.includes('dall-e') || id.includes('stable-diffusion')) return 'Image';
  return 'Other';
}

export function getEndpointCategory(provider: string, models: IAIModelConfig[]): string {
  const providerCategory = PROVIDER_CATEGORY_MAP[provider.toLowerCase()];
  if (providerCategory) {
    return providerCategory;
  }
  return models[0] ? getModelCategory(models[0]) : 'Other';
}

export function getEndpointHost(apiUrl: string, fallback: string): string {
  try {
    return new URL(apiUrl).host;
  } catch {
    return apiUrl || fallback;
  }
}

export function getModelDisplayName(
  model: IAIModelConfig | null | undefined,
  fallback: string,
): string {
  if (!model) {
    return fallback;
  }
  return model.name?.trim() || model.model;
}

export function buildEndpointGroupKey(model: IAIModelConfig): string {
  return `${model.provider}::${model.apiProtocol}::${model.apiUrl}`;
}

export function getProtocolLabel(protocol: IModelFormState['apiProtocol']): string {
  switch (protocol) {
    case 'gemini':
      return 'Gemini';
    case 'anthropic':
      return 'Anthropic';
    case 'openai':
    default:
      return 'OpenAI';
  }
}

export function buildModelOptions(models: IAIModelConfig[]): IModelOption[] {
  return models.map((model) => ({
    value: model.id,
    label: model.name?.trim() || model.model,
  }));
}

export function createFormFromModel(model: IAIModelConfig): IModelFormState {
  const chatParams = model.chatParams;
  const imageParams = model.imageParams;

  return {
    type: model.type ?? 'chat',
    name: model.name || '',
    provider: model.provider,
    apiProtocol: model.apiProtocol,
    apiKey: model.apiKey,
    apiUrl: model.apiUrl,
    model: model.model,
    chatParams: {
      temperature: chatParams?.temperature ?? DEFAULT_CHAT_PARAMS.temperature,
      maxTokens: chatParams?.maxTokens ?? DEFAULT_CHAT_PARAMS.maxTokens,
      topP: chatParams?.topP ?? DEFAULT_CHAT_PARAMS.topP,
      topK: chatParams?.topK != null ? String(chatParams.topK) : '',
      frequencyPenalty: chatParams?.frequencyPenalty ?? DEFAULT_CHAT_PARAMS.frequencyPenalty,
      presencePenalty: chatParams?.presencePenalty ?? DEFAULT_CHAT_PARAMS.presencePenalty,
      stream: chatParams?.stream ?? DEFAULT_CHAT_PARAMS.stream,
      enableThinking: chatParams?.enableThinking ?? DEFAULT_CHAT_PARAMS.enableThinking,
      customParamsText: formatCustomParams(chatParams?.customParams),
    },
    imageParams: {
      size: imageParams?.size ?? DEFAULT_IMAGE_PARAMS.size,
      quality: imageParams?.quality ?? DEFAULT_IMAGE_PARAMS.quality,
      style: imageParams?.style ?? DEFAULT_IMAGE_PARAMS.style,
      n: imageParams?.n ?? DEFAULT_IMAGE_PARAMS.n,
    },
  };
}
