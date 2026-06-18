/** 生图后端标识，与协议/供应商路由一一对应 */
export enum EImageBackend {
  /** DashScope 多模态生图 */
  EDashscopeMultimodal = 'dashscope-multimodal',
  /** FLUX (Black Forest Labs) */
  EFlux = 'flux',
  /** Ideogram */
  EIdeogram = 'ideogram',
  /** Recraft */
  ERecraft = 'recraft',
  /** Replicate */
  EReplicate = 'replicate',
  /** Stability AI */
  EStability = 'stability',
  /** Google Gemini / Imagen */
  EGemini = 'gemini',
  /** OpenAI 兼容 /images/generations */
  EOpenAiImages = 'openai-images',
}

export type IImageBackendConfig = Pick<
  import('../../types').IAIConfig,
  'type' | 'provider' | 'apiUrl' | 'model'
>;
