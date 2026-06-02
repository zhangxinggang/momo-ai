import type { EAIProtocol } from '@/types/modules';

/** 主题模式 */
export type EThemeMode = 'light' | 'dark' | 'system';

/** AI 模型类型 */
export type EAIModelType = 'chat' | 'image';

/** 对话模型参数配置 */
export interface IChatModelParams {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stream?: boolean;
  enableThinking?: boolean;
  customParams?: Record<string, string | number | boolean>;
}

/** 图像模型参数配置 */
export interface IImageModelParams {
  size?: string;
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  n?: number;
}

/** AI 模型配置 */
export interface IAIModelConfig {
  id: string;
  type: EAIModelType;
  name?: string;
  provider: string;
  apiProtocol?: EAIProtocol;
  apiKey: string;
  apiUrl: string;
  model: string;
  isDefault?: boolean;
  chatParams?: IChatModelParams;
  imageParams?: IImageModelParams;
}

export type ECreationMode = 'manual' | 'quick';
export type ETranslationMode = 'immersive' | 'full';
export type EAIUsageScenario =
  | 'quickAdd'
  | 'promptTest'
  | 'imageTest'
  | 'translation'
  | 'textSegment';

export type IScenarioModelDefaults = Partial<Record<EAIUsageScenario, string>>;
