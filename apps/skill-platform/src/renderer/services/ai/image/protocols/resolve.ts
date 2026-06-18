import type { IAIConfig } from '../../types';
import { dashscopeMultimodalAdapter } from './dashscope-multimodal';
import type { IImageGenerateOptions, IImageProtocolAdapter } from './types';

const IMAGE_PROTOCOL_ADAPTERS: IImageProtocolAdapter[] = [dashscopeMultimodalAdapter];

/** 解析当前模型应使用的生图协议适配器 */
export function resolveImageProtocolAdapter(config: IAIConfig): IImageProtocolAdapter | null {
  for (const adapter of IMAGE_PROTOCOL_ADAPTERS) {
    if (adapter.detect(config)) {
      return adapter;
    }
  }
  return null;
}

/** 通过协议适配器生图；无匹配协议时返回 null */
export async function generateImageViaProtocol(
  config: IAIConfig,
  prompt: string,
  options?: IImageGenerateOptions,
) {
  const adapter = resolveImageProtocolAdapter(config);
  if (!adapter) {
    return null;
  }
  return adapter.generate(config, prompt, options);
}

export type { IImageGenerateOptions, IImageProtocolAdapter } from './types';
