import type { DImageGenerationResponse, IAIConfig, IImageReferenceAttachment } from '../../types';

export interface IImageGenerateOptions {
  size?: string;
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  n?: number;
  response_format?: 'url' | 'b64_json';
  aspect_ratio?: string;
  referenceImages?: IImageReferenceAttachment[];
}

export interface IImageProtocolAdapter {
  id: string;
  detect(config: IAIConfig): boolean;
  generate(
    config: IAIConfig,
    prompt: string,
    options?: IImageGenerateOptions,
  ): Promise<DImageGenerationResponse>;
}
