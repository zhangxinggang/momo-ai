/** 主题模式 */
export type EThemeMode = 'light' | 'dark' | 'system';

export type {
  EAIModelType,
  IAIModelConfig,
  IChatModelParams,
  IImageModelParams,
} from '@/types/modules/settings';

export type ECreationMode = 'manual' | 'quick';
export type ETranslationMode = 'immersive' | 'full';
export type EAIUsageScenario =
  | 'quickAdd'
  | 'promptTest'
  | 'imageTest'
  | 'translation'
  | 'textSegment'
  | 'knowledgeEmbedding';

export type IScenarioModelDefaults = Partial<Record<EAIUsageScenario, string>>;
