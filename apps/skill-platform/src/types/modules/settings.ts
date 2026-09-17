/**
 * Settings type definitions
 * 设置类型定义
 */

import type { EAIProtocol } from './ai';
import type { ISkillProject } from './skill';

/** AI 模型类型 */
export type EAIModelType = 'chat' | 'image' | 'embedding';

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

export interface ISettings {
  theme: ETheme;
  aiModels?: IAIModelConfig[];
  defaultFolderId?: string;
  backgroundImageFileName?: string;
  backgroundImageOpacity?: number;
  backgroundImageBlur?: number;
  customPlatformRootPaths?: Record<string, string>;
  customSkillPlatformPaths?: Record<string, string>;
  skillPlatformOrder?: string[];
  skillProjects?: ISkillProject[];
}

/** 商店/远端同步等设备侧策略 */
export interface IDeviceManagementSettings {
  syncCadence?: 'manual' | '15m' | '1h' | '1d';
  storeAutoSync?: boolean;
  storeSyncCadence?: 'manual' | '1h' | '1d';
}

export type ETheme = 'light' | 'dark' | 'system';
/** 应用界面语言（当前仅支持简体中文） */
export type ELanguage = 'zh';

export const DEFAULT_SETTINGS: ISettings = {
  theme: 'system',
  backgroundImageOpacity: 0.22,
  backgroundImageBlur: 14,
  customPlatformRootPaths: {},
  customSkillPlatformPaths: {},
  skillPlatformOrder: [],
  skillProjects: [],
};
