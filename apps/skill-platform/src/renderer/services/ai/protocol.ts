import type { EAIProtocol } from '@/types/modules';

import { EImageBackend, resolveImageBackend } from './image/backends';
import { buildDashScopeMultimodalEndpoint } from './image/protocols/dashscope-multimodal';
import type { TResolvedProtocol } from './internal/types';
import type { IAIConfig } from './types';
import { getBaseUrl } from './url';

const KIMI_CODING_USER_AGENT = 'KimiCLI/1.0';

function isKimiCodingApiUrl(apiUrl?: string): boolean {
  if (!apiUrl) {
    return false;
  }
  return apiUrl.trim().toLowerCase().includes('api.kimi.com');
}

function applyKimiCodingHeaders(
  headers: Record<string, string>,
  apiUrl?: string,
): Record<string, string> {
  if (!isKimiCodingApiUrl(apiUrl)) {
    return headers;
  }
  return {
    ...headers,
    'User-Agent': KIMI_CODING_USER_AGENT,
  };
}

export function resolveAIProtocol(
  config: Pick<IAIConfig, 'apiProtocol' | 'provider' | 'apiUrl'>,
): EAIProtocol {
  if (
    config.apiProtocol === 'openai' ||
    config.apiProtocol === 'gemini' ||
    config.apiProtocol === 'anthropic'
  ) {
    return config.apiProtocol;
  }

  const provider = config.provider?.toLowerCase() || '';
  const apiUrl = config.apiUrl?.toLowerCase() || '';

  if (provider === 'anthropic' || apiUrl.includes('api.anthropic.com')) {
    return 'anthropic';
  }

  if (
    provider === 'google' ||
    provider === 'gemini' ||
    apiUrl.includes('generativelanguage.googleapis.com')
  ) {
    return 'gemini';
  }

  return 'openai';
}

export function resolveProtocolBase(apiUrl: string, protocol: EAIProtocol): TResolvedProtocol {
  const trimmed = apiUrl.trim();
  const explicit = trimmed.endsWith('#');
  const rawValue = explicit ? trimmed.slice(0, -1) : trimmed;
  const baseUrl = getBaseUrl(rawValue);

  return {
    protocol,
    explicit,
    baseUrl,
  };
}

export function buildChatEndpointFromBase(resolved: TResolvedProtocol): string {
  const baseUrl = resolved.baseUrl.replace(/\/$/, '');
  if (!baseUrl) {
    return '';
  }

  if (resolved.explicit) {
    if (resolved.protocol === 'anthropic') {
      return baseUrl.endsWith('/messages') ? baseUrl : `${baseUrl}/messages`;
    }
    return baseUrl.endsWith('/chat/completions') ? baseUrl : `${baseUrl}/chat/completions`;
  }

  if (resolved.protocol === 'gemini') {
    if (baseUrl.endsWith('/openai')) {
      return `${baseUrl}/chat/completions`;
    }
    if (baseUrl.match(/\/v\d+(?:beta)?$/)) {
      return `${baseUrl}/openai/chat/completions`;
    }
    return `${baseUrl}/v1beta/openai/chat/completions`;
  }

  if (resolved.protocol === 'anthropic') {
    if (baseUrl.match(/\/v\d+$/)) {
      return `${baseUrl}/messages`;
    }
    return `${baseUrl}/v1/messages`;
  }

  if (baseUrl.match(/\/v\d+$/)) {
    return `${baseUrl}/chat/completions`;
  }

  return `${baseUrl}/v1/chat/completions`;
}

export function buildModelsEndpointFromBase(resolved: TResolvedProtocol): string {
  const baseUrl = resolved.baseUrl.replace(/\/$/, '');
  if (!baseUrl) {
    return '';
  }

  if (resolved.protocol === 'gemini') {
    const geminiBaseUrl = baseUrl.replace(/\/openai$/, '');
    if (geminiBaseUrl.match(/\/v\d+(?:beta)?$/)) {
      return `${geminiBaseUrl}/models`;
    }
    return `${geminiBaseUrl}/v1beta/models`;
  }

  if (resolved.protocol === 'anthropic') {
    if (baseUrl.match(/\/v\d+$/)) {
      return `${baseUrl}/models`;
    }
    return `${baseUrl}/v1/models`;
  }

  if (baseUrl.match(/\/v\d+$/)) {
    return `${baseUrl}/models`;
  }

  return `${baseUrl}/v1/models`;
}

export function buildHeadersForProtocol(
  protocol: EAIProtocol,
  apiKey: string,
  options?: {
    accept?: string;
    contentType?: boolean;
    useNativeGeminiAuth?: boolean;
    apiUrl?: string;
  },
): Record<string, string> {
  const headers: Record<string, string> = {};
  if (options?.contentType !== false) {
    headers['Content-Type'] = 'application/json';
  }
  if (options?.accept) {
    headers.Accept = options.accept;
  }

  if (protocol === 'anthropic') {
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
    return applyKimiCodingHeaders(headers, options?.apiUrl);
  }

  if (protocol === 'gemini' && options?.useNativeGeminiAuth) {
    headers['x-goog-api-key'] = apiKey;
    return applyKimiCodingHeaders(headers, options?.apiUrl);
  }

  headers.Authorization = `Bearer ${apiKey}`;
  return applyKimiCodingHeaders(headers, options?.apiUrl);
}

export function getApiEndpointPreview(apiUrl: string, protocol: EAIProtocol = 'openai'): string {
  if (!apiUrl) return '';
  return buildChatEndpointFromBase(resolveProtocolBase(apiUrl, protocol));
}

/**
 * Get image generation API endpoint preview (for display)
 * 如果用户输入以 # 结尾，则不自动填充后续路径
 * 获取生图 API 端点预览（用于显示）
 */
export function getImageApiEndpointPreview(
  apiUrl: string,
  modelHint?: Pick<IAIConfig, 'provider' | 'model'>,
): string {
  if (!apiUrl) return '';

  // If ends with #, just return the part before # without any auto-fill
  // 如果以 # 结尾，直接返回 # 之前的部分，不进行任何自动填充
  if (apiUrl.trim().endsWith('#')) {
    return apiUrl.trim().slice(0, -1);
  }

  const backendHint: IAIConfig = {
    provider: modelHint?.provider ?? '',
    apiUrl,
    apiKey: '',
    model: modelHint?.model ?? '',
    type: 'image',
  };
  const backend = resolveImageBackend(backendHint);

  if (backend === EImageBackend.EDashscopeMultimodal) {
    return buildDashScopeMultimodalEndpoint(apiUrl);
  }

  const baseUrl = getBaseUrl(apiUrl);

  // Gemini is not OpenAI's images/generations specification
  // Gemini（Google Generative ELanguage API）并非 OpenAI 的 images/generations 规范
  if (backend === EImageBackend.EGemini || baseUrl.includes('generativelanguage.googleapis.com')) {
    const geminiBaseUrl = baseUrl.replace(/\/openai$/, '');
    if (geminiBaseUrl.match(/\/v\d+(?:beta)?$/)) {
      return geminiBaseUrl + '/models';
    }
    return geminiBaseUrl + '/v1beta/models';
  }

  let endpoint = apiUrl.replace(/\/$/, '');

  // If already contains images/generations, use directly
  // 如果已经包含 images/generations，直接使用
  if (endpoint.includes('/images/generations')) {
    return endpoint;
  } else if (endpoint.endsWith('/chat/completions')) {
    // Replace chat/completions with images/generations
    // 替换 chat/completions 为 images/generations
    return endpoint.replace(/\/chat\/completions$/, '/images/generations');
  } else if (endpoint.match(/\/v\d+$/)) {
    // If ends with /v1, /v2, /v3, etc., append /images/generations
    // 如果以 /v1, /v2, /v3 等结尾，追加 /images/generations
    return endpoint + '/images/generations';
  } else {
    // Default append /v1/images/generations
    // 默认追加 /v1/images/generations
    return endpoint + '/v1/images/generations';
  }
}
