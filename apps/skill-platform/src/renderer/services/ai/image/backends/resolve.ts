import {
  detectDashScopeImageBackend,
  detectFluxBackend,
  detectGeminiImageBackend,
  detectIdeogramBackend,
  detectOpenAiImagesBackend,
  detectRecraftBackend,
  detectReplicateBackend,
  detectStabilityBackend,
} from './detect';
import { EImageBackend, type IImageBackendConfig } from './types';

interface IImageBackendRule {
  backend: EImageBackend;
  detect: (config: IImageBackendConfig) => boolean;
}

/** 按优先级排列；越具体的后端越靠前 */
const IMAGE_BACKEND_RULES: IImageBackendRule[] = [
  { backend: EImageBackend.EDashscopeMultimodal, detect: detectDashScopeImageBackend },
  { backend: EImageBackend.EFlux, detect: detectFluxBackend },
  { backend: EImageBackend.EIdeogram, detect: detectIdeogramBackend },
  { backend: EImageBackend.ERecraft, detect: detectRecraftBackend },
  { backend: EImageBackend.EReplicate, detect: detectReplicateBackend },
  { backend: EImageBackend.EStability, detect: detectStabilityBackend },
  { backend: EImageBackend.EGemini, detect: detectGeminiImageBackend },
  { backend: EImageBackend.EOpenAiImages, detect: detectOpenAiImagesBackend },
];

/** 解析当前配置应使用的生图后端；无法生图时返回 null */
export function resolveImageBackend(config: IImageBackendConfig): EImageBackend | null {
  for (const rule of IMAGE_BACKEND_RULES) {
    if (rule.detect(config)) {
      return rule.backend;
    }
  }
  return null;
}

/** 当前配置是否为生图模型（分类与生图调用链共用同一解析逻辑） */
export function isImageModel(config: IImageBackendConfig): boolean {
  return resolveImageBackend(config) !== null;
}

/** @deprecated 使用 isImageModel；保留别名便于渐进迁移 */
export function isImageGenerationConfig(config: IImageBackendConfig): boolean {
  return isImageModel(config);
}
