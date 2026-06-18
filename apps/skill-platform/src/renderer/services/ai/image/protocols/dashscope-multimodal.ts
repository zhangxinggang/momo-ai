import { detectDashScopeImageBackend } from '../backends';
import type { DImageGenerationResponse, IAIConfig } from '../../types';
import type { IImageGenerateOptions, IImageProtocolAdapter } from './types';

function resolveDashScopeHost(apiUrl: string): string {
  if (/dashscope-intl\.aliyuncs\.com/i.test(apiUrl)) {
    return 'https://dashscope-intl.aliyuncs.com';
  }
  return 'https://dashscope.aliyuncs.com';
}

function buildDashScopeMultimodalEndpoint(apiUrl: string): string {
  const trimmed = apiUrl.trim();
  const explicit = trimmed.endsWith('#');
  const rawValue = explicit ? trimmed.slice(0, -1) : trimmed;
  const normalized = rawValue.replace(/\/$/, '');

  if (normalized.includes('/services/aigc/multimodal-generation/generation')) {
    return normalized;
  }

  return `${resolveDashScopeHost(normalized)}/api/v1/services/aigc/multimodal-generation/generation`;
}

function normalizeDashScopeSize(size?: string): string | undefined {
  if (!size) {
    return undefined;
  }
  return size.replace(/x/gi, '*');
}

function buildImagePayload(image: { mimeType: string; base64: string }): string {
  const trimmed = image.base64.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const mimeType = image.mimeType || 'image/png';
  return `data:${mimeType};base64,${trimmed}`;
}

function buildDashScopeContent(
  prompt: string,
  referenceImages?: IImageGenerateOptions['referenceImages'],
): Array<{ text?: string; image?: string }> {
  const content: Array<{ text?: string; image?: string }> = [];

  for (const image of referenceImages ?? []) {
    content.push({ image: buildImagePayload(image) });
  }

  content.push({ text: prompt });
  return content;
}

function parseDashScopeErrorMessage(errorText: string, fallback: string): string {
  try {
    const errorJson = JSON.parse(errorText);
    return (
      errorJson.message ||
      errorJson.error?.message ||
      errorJson.code ||
      (typeof errorJson.error === 'string' ? errorJson.error : null) ||
      fallback
    );
  } catch {
    return errorText ? `${fallback}: ${errorText.slice(0, 500)}` : fallback;
  }
}

function extractImagesFromDashScopeResponse(result: Record<string, unknown>): DImageGenerationResponse['data'] {
  const output = result.output as Record<string, unknown> | undefined;
  const choices = (output?.choices ?? output?.results) as Array<Record<string, unknown>> | undefined;
  const message = choices?.[0]?.message as Record<string, unknown> | undefined;
  const content = message?.content as Array<Record<string, unknown>> | undefined;

  if (!Array.isArray(content)) {
    return [];
  }

  const images: DImageGenerationResponse['data'] = [];
  for (const part of content) {
    const imageUrl = part.image;
    if (typeof imageUrl === 'string' && imageUrl.trim()) {
      if (imageUrl.startsWith('data:image/')) {
        images.push({ b64_json: imageUrl.replace(/^data:image\/[^;]+;base64,/, '') });
      } else {
        images.push({ url: imageUrl });
      }
    }
  }

  return images;
}

async function generateDashScopeMultimodalImage(
  config: IAIConfig,
  prompt: string,
  options?: IImageGenerateOptions,
): Promise<DImageGenerationResponse> {
  const { apiKey, apiUrl, model } = config;
  const endpoint = buildDashScopeMultimodalEndpoint(apiUrl);

  const parameters: Record<string, unknown> = {
    n: options?.n ?? 1,
  };

  const normalizedSize = normalizeDashScopeSize(options?.size);
  if (normalizedSize) {
    parameters.size = normalizedSize;
  }

  const body = {
    model,
    input: {
      messages: [
        {
          role: 'user',
          content: buildDashScopeContent(prompt, options?.referenceImages),
        },
      ],
    },
    parameters,
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(parseDashScopeErrorMessage(errorText, `DashScope 生图失败 (${response.status})`));
  }

  const result = (await response.json()) as Record<string, unknown>;
  const images = extractImagesFromDashScopeResponse(result);

  if (images.length === 0) {
    throw new Error('DashScope 响应中未包含图片，请确认模型支持生图');
  }

  return {
    created: Date.now(),
    data: images,
  };
}

export const dashscopeMultimodalAdapter: IImageProtocolAdapter = {
  id: 'dashscope-multimodal',
  detect: detectDashScopeImageBackend,
  generate: generateDashScopeMultimodalImage,
};

export {
  buildDashScopeMultimodalEndpoint,
  detectDashScopeImageBackend as detectDashScopeImageModel,
  normalizeDashScopeSize,
};
