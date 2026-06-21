import type { IFolder } from './folder';
import type { IPrompt } from './prompt';

/** 提示词 JSON 备份包 */
export interface IPromptBackupPayload {
  version: 1;
  exportedAt: string;
  folders: IFolder[];
  prompts: IPrompt[];
}

export interface IPromptExportResult {
  canceled: boolean;
  path?: string;
  promptCount?: number;
  folderCount?: number;
}

export interface IPromptImportResult {
  canceled: boolean;
  promptCount?: number;
  folderCount?: number;
}
