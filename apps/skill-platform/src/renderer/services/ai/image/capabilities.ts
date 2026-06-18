import type { IAIConfig } from '../types';
import { EImageBackend, isImageModel, resolveImageBackend } from './backends';

/** 生图模型能力 */
export enum EImageCapability {
  ETextToImage = 'text-to-image',
  EImageEdit = 'image-edit',
  EMultiImageEdit = 'multi-image-edit',
}

export interface IImageModelCapabilities {
  capabilities: EImageCapability[];
  maxReferenceImages: number;
  defaultSize?: string;
}

const IMAGE_EDIT_MODEL_PATTERN = /qwen-image-edit|image-edit|edit-plus|edit-max/i;

/** 当前配置是否为生图模型 */
export { isImageModel, isImageModel as isImageGenerationConfig } from './backends';

/** 解析生图模型能力（文生图 / 参考图编辑） */
export function resolveImageModelCapabilities(
  config: Pick<IAIConfig, 'type' | 'model' | 'provider' | 'apiUrl'>,
): IImageModelCapabilities {
  if (!isImageModel(config)) {
    return {
      capabilities: [],
      maxReferenceImages: 0,
    };
  }

  const backend = resolveImageBackend(config);
  const modelLower = (config.model || '').toLowerCase();

  if (backend === EImageBackend.EDashscopeMultimodal && IMAGE_EDIT_MODEL_PATTERN.test(modelLower)) {
    return {
      capabilities: [
        EImageCapability.ETextToImage,
        EImageCapability.EImageEdit,
        EImageCapability.EMultiImageEdit,
      ],
      maxReferenceImages: modelLower.includes('edit-max') || modelLower.includes('edit-plus') ? 6 : 3,
      defaultSize: '1024*1024',
    };
  }

  if (backend === EImageBackend.EDashscopeMultimodal || backend === EImageBackend.EGemini) {
    return {
      capabilities: [EImageCapability.ETextToImage, EImageCapability.EImageEdit],
      maxReferenceImages: backend === EImageBackend.EGemini ? 14 : 3,
      defaultSize: '1024*1024',
    };
  }

  return {
    capabilities: [EImageCapability.ETextToImage],
    maxReferenceImages: 0,
  };
}

/** 是否支持传入参考图 */
export function supportsReferenceImages(
  config: Pick<IAIConfig, 'type' | 'model' | 'provider' | 'apiUrl'>,
): boolean {
  const caps = resolveImageModelCapabilities(config);
  return caps.maxReferenceImages > 0;
}
