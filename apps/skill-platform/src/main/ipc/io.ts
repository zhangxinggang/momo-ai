import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type { IPromptExportResult, IPromptImportResult } from '@/types/modules';
import { getMainWindow } from '@momo/electron';
import { dialog, ipcMain } from 'electron';
import fs from 'fs';

import type { FolderDB, PromptDB } from '../database';
import { syncPromptWorkspaceFromDatabase } from '../services/prompt';
import {
  exportPromptBackup,
  importPromptBackupPayload,
  parsePromptBackupJson,
} from '../services/prompt/backup';

/** 注册提示词导入导出 IPC */
export function registerIoIPC(promptDb: PromptDB, folderDb: FolderDB): void {
  const syncWorkspace = async () => {
    await syncPromptWorkspaceFromDatabase(promptDb, folderDb);
  };

  ipcMain.handle(
    IPC_CHANNELS.EXPORT_PROMPTS,
    async (_, promptIds: string[]): Promise<IPromptExportResult> => {
      const ids = Array.isArray(promptIds)
        ? promptIds.filter((id) => typeof id === 'string' && id.trim().length > 0)
        : [];

      const result = await exportPromptBackup({
        promptDb,
        folderDb,
        promptIds: ids,
        saveToPath: async (payload) => {
          const dialogResult = await dialog.showSaveDialog(getMainWindow()!, {
            title: '导出提示词',
            defaultPath: `prompts-backup-${new Date().toISOString().slice(0, 10)}.json`,
            filters: [{ name: 'JSON', extensions: ['json'] }],
          });

          if (dialogResult.canceled || !dialogResult.filePath) {
            return { canceled: true };
          }

          fs.writeFileSync(dialogResult.filePath, JSON.stringify(payload, null, 2), 'utf8');
          return { canceled: false, path: dialogResult.filePath };
        },
      });

      return result;
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.IMPORT_PROMPTS,
    async (_, data?: string): Promise<IPromptImportResult> => {
      let content = typeof data === 'string' ? data.trim() : '';

      if (!content) {
        const dialogResult = await dialog.showOpenDialog(getMainWindow()!, {
          title: '导入提示词',
          properties: ['openFile'],
          filters: [{ name: 'JSON', extensions: ['json'] }],
        });

        if (dialogResult.canceled || dialogResult.filePaths.length === 0) {
          return { canceled: true };
        }

        content = fs.readFileSync(dialogResult.filePaths[0], 'utf8');
      }

      const payload = parsePromptBackupJson(content);
      const imported = await importPromptBackupPayload(promptDb, folderDb, payload);
      await syncWorkspace();

      return {
        canceled: false,
        ...imported,
      };
    },
  );
}
