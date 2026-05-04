/**
 * Settings type definitions
 * 设置类型定义
 */

import type { ISkillProject } from './skill';

export interface ISettings {
  theme: ETheme;
  defaultFolderId?: string;
  backgroundImageFileName?: string;
  backgroundImageOpacity?: number;
  backgroundImageBlur?: number;
  customPlatformRootPaths?: Record<string, string>;
  customSkillPlatformPaths?: Record<string, string>;
  skillPlatformOrder?: string[];
  skillProjects?: ISkillProject[];
}

/** 商店/远端同步等设备侧策略（Web 端由 localStorage 承载，不写入 SQLite Settings） */
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
