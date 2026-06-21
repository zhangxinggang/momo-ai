import type { IPromptExportResult, IPromptImportResult } from '@/types/modules';

import { getIoIpc } from '../ipc';

export function isIoApiAvailable(): boolean {
  return !!getIoIpc();
}

/** 导出提示词到 JSON 文件（空数组表示导出全部） */
export async function exportPrompts(promptIds: string[]): Promise<IPromptExportResult> {
  const api = getIoIpc();
  if (!api?.export) {
    throw new Error('当前环境不支持提示词导出');
  }
  return api.export(promptIds) as Promise<IPromptExportResult>;
}

/** 从 JSON 字符串或文件对话框导入提示词 */
export async function importPrompts(data?: string): Promise<IPromptImportResult> {
  const api = getIoIpc();
  if (!api?.import) {
    throw new Error('当前环境不支持提示词导入');
  }
  return api.import(data ?? '') as Promise<IPromptImportResult>;
}
