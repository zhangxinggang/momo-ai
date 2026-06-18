import type { IImageBackendConfig } from './types';

function normalizeHint(config: IImageBackendConfig): {
  providerLower: string;
  apiUrlLower: string;
  modelLower: string;
  isImageType: boolean;
} {
  return {
    providerLower: (config.provider || '').toLowerCase(),
    apiUrlLower: (config.apiUrl || '').toLowerCase(),
    modelLower: (config.model || '').toLowerCase(),
    isImageType: config.type === 'image',
  };
}

/** DashScope / 通义 多模态生图 */
export function detectDashScopeImageBackend(config: IImageBackendConfig): boolean {
  const { providerLower, apiUrlLower, modelLower, isImageType } = normalizeHint(config);

  const isDashScopeContext =
    providerLower.includes('qwen') ||
    providerLower.includes('dashscope') ||
    providerLower.includes('aliyun') ||
    apiUrlLower.includes('dashscope');

  if (isImageType) {
    return isDashScopeContext;
  }

  return isDashScopeContext && /qwen-image|wanx|wan2\.|text-to-image/.test(modelLower);
}

/** FLUX (Black Forest Labs) */
export function detectFluxBackend(config: IImageBackendConfig): boolean {
  const { providerLower, apiUrlLower, isImageType } = normalizeHint(config);
  if (providerLower === 'flux' || apiUrlLower.includes('bfl.ai')) {
    return true;
  }
  return isImageType && providerLower.includes('flux');
}

/** Ideogram */
export function detectIdeogramBackend(config: IImageBackendConfig): boolean {
  const { providerLower, apiUrlLower, isImageType } = normalizeHint(config);
  if (providerLower === 'ideogram' || apiUrlLower.includes('ideogram.ai')) {
    return true;
  }
  return isImageType && providerLower.includes('ideogram');
}

/** Recraft */
export function detectRecraftBackend(config: IImageBackendConfig): boolean {
  const { providerLower, apiUrlLower, isImageType } = normalizeHint(config);
  if (providerLower === 'recraft' || apiUrlLower.includes('recraft.ai')) {
    return true;
  }
  return isImageType && providerLower.includes('recraft');
}

/** Replicate */
export function detectReplicateBackend(config: IImageBackendConfig): boolean {
  const { providerLower, apiUrlLower, isImageType } = normalizeHint(config);
  if (providerLower === 'replicate' || apiUrlLower.includes('replicate.com')) {
    return true;
  }
  return isImageType && providerLower.includes('replicate');
}

/** Stability AI */
export function detectStabilityBackend(config: IImageBackendConfig): boolean {
  const { providerLower, apiUrlLower, isImageType } = normalizeHint(config);
  if (providerLower === 'stability' || apiUrlLower.includes('stability.ai')) {
    return true;
  }
  return isImageType && providerLower.includes('stability');
}

/** Google Gemini / Imagen 生图 */
export function detectGeminiImageBackend(config: IImageBackendConfig): boolean {
  const { providerLower, apiUrlLower, modelLower, isImageType } = normalizeHint(config);

  const isGoogleProvider = providerLower === 'google' || providerLower === 'gemini';
  const isGeminiApiUrl = apiUrlLower.includes('generativelanguage.googleapis.com');

  if (isImageType && (isGoogleProvider || isGeminiApiUrl)) {
    return true;
  }

  if (isGeminiApiUrl) {
    return /imagen|image-generation|gemini.*image/.test(modelLower);
  }

  return false;
}

/** OpenAI 兼容 /images/generations（显式 image 类型兜底） */
export function detectOpenAiImagesBackend(config: IImageBackendConfig): boolean {
  return config.type === 'image';
}
