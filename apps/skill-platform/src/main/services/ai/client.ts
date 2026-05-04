/**
 * Lightweight AI client for the main process.
 * Used exclusively for safety scanning — keeps the surface area minimal.
 * Supports any OpenAI-compatible endpoint (OpenAI, Anthropic via proxy,
 * Gemini via OpenAI compat layer, etc.).
 */

import type { EAIProtocol, ISafetyScanAiConfig } from '@/types/modules';

export interface DAIChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DAIChatResult {
  content: string;
}

function resolveAIProtocol(
  config: Pick<ISafetyScanAiConfig, 'apiProtocol' | 'provider' | 'apiUrl'>,
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

function getBaseUrl(apiUrl: string): string {
  if (!apiUrl) return '';
  let url = apiUrl.trim();
  if (url.endsWith('#')) {
    return url.slice(0, -1);
  }
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  for (const suffix of [
    '/chat/completions',
    '/completions',
    '/models',
    '/embeddings',
    '/images/generations',
    '/messages',
  ]) {
    if (url.endsWith(suffix)) {
      return url.slice(0, -suffix.length);
    }
  }
  return url;
}

function buildChatEndpoint(apiUrl: string, protocol: EAIProtocol): string {
  const trimmed = apiUrl.trim();
  const explicit = trimmed.endsWith('#');
  const baseUrl = getBaseUrl(explicit ? trimmed.slice(0, -1) : trimmed).replace(/\/$/, '');

  if (explicit) {
    if (protocol === 'anthropic') {
      return baseUrl.endsWith('/messages') ? baseUrl : `${baseUrl}/messages`;
    }
    return baseUrl.endsWith('/chat/completions') ? baseUrl : `${baseUrl}/chat/completions`;
  }

  if (protocol === 'gemini') {
    if (baseUrl.endsWith('/openai')) {
      return `${baseUrl}/chat/completions`;
    }
    if (baseUrl.match(/\/v\d+(?:beta)?$/)) {
      return `${baseUrl}/openai/chat/completions`;
    }
    return `${baseUrl}/v1beta/openai/chat/completions`;
  }

  if (protocol === 'anthropic') {
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

/**
 * Build request headers for the given provider.
 */
function buildHeaders(config: ISafetyScanAiConfig, protocol: EAIProtocol): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (protocol === 'anthropic') {
    headers['x-api-key'] = config.apiKey;
    headers['anthropic-version'] = '2023-06-01';
  } else {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }

  return headers;
}

const AI_REQUEST_TIMEOUT_MS = 60_000;

/**
 * Send a non-streaming chat completion request and return the assistant
 * response content.  Throws on network/API errors.
 */
export async function chatCompletion(
  config: ISafetyScanAiConfig,
  messages: DAIChatMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    responseFormat?: { type: 'text' | 'json_object' };
  },
): Promise<DAIChatResult> {
  if (!config.apiKey) {
    throw new Error('AI API Key is not configured');
  }
  if (!config.apiUrl) {
    throw new Error('AI API URL is not configured');
  }
  if (!config.model) {
    throw new Error('AI model is not configured');
  }

  const protocol = resolveAIProtocol(config);
  const endpoint = buildChatEndpoint(config.apiUrl, protocol);
  const headers = buildHeaders(config, protocol);

  const isGemini = protocol === 'gemini';
  const isAnthropic = protocol === 'anthropic';
  const model = isGemini ? config.model.replace(/^models\//, '') : config.model;

  const body: Record<string, unknown> = isAnthropic
    ? {
        model,
        max_tokens: options?.maxTokens ?? 4096,
        messages: messages
          .filter((message) => message.role !== 'system')
          .map((message) => ({
            role: message.role === 'assistant' ? 'assistant' : 'user',
            content: message.content,
          })),
        stream: false,
      }
    : {
        model,
        messages,
        temperature: options?.temperature ?? 0.3,
        max_tokens: options?.maxTokens ?? 4096,
        stream: false,
      };

  if (!isAnthropic && options?.responseFormat) {
    body.response_format = options.responseFormat;
  }
  if (isAnthropic) {
    const systemMessage = messages.find((message) => message.role === 'system');
    if (systemMessage?.content) {
      body.system = systemMessage.content;
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AI_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let errorMessage = `AI API request failed (${response.status})`;
      try {
        const errorJson = JSON.parse(errorText) as Record<string, unknown>;
        const inner = errorJson.error as Record<string, unknown> | undefined;
        errorMessage = (inner?.message as string) ?? (errorJson.message as string) ?? errorMessage;
      } catch {
        // Use default error message
      }
      throw new Error(errorMessage);
    }

    const json = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
      content?: Array<{ type?: string; text?: string }>;
    };

    const content = isAnthropic
      ? (json.content || [])
          .filter((item) => item?.type === 'text' && typeof item.text === 'string')
          .map((item) => item.text)
          .join('')
      : json.choices?.[0]?.message?.content;
    if (typeof content !== 'string') {
      throw new Error('AI API returned an unexpected response format');
    }

    return { content };
  } finally {
    clearTimeout(timeout);
  }
}
