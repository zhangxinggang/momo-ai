import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import { app, ipcMain, shell } from 'electron';
import fs from 'fs';

function expandShellPath(folderPath: string): string {
  if (folderPath.startsWith('~')) {
    return folderPath.replace('~', app.getPath('home'));
  }
  if (folderPath.includes('%APPDATA%')) {
    return folderPath.replace('%APPDATA%', app.getPath('appData'));
  }
  return folderPath;
}

/** 注册 shell 打开路径与外部链接 IPC */
export function registerShellIPC(): void {
  ipcMain.handle(IPC_CHANNELS.SHELL_OPEN_PATH, async (_event, folderPath: string) => {
    if (typeof folderPath !== 'string' || folderPath.trim().length === 0) {
      return {
        success: false,
        error: 'shell:openPath requires a non-empty folderPath string',
      };
    }

    const realPath = expandShellPath(folderPath);

    try {
      const stat = fs.statSync(realPath);
      if (!stat.isFile() && !stat.isDirectory()) {
        return { success: false, error: 'Path is not a file or directory' };
      }
    } catch {
      // 路径尚不存在时由 shell.openPath 处理错误
    }

    try {
      const openError = await shell.openPath(realPath);
      if (openError) {
        return { success: false, error: openError };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });

  ipcMain.handle(IPC_CHANNELS.SHELL_OPEN_EXTERNAL, async (_event, url: string) => {
    if (typeof url !== 'string' || url.trim().length === 0) {
      return {
        success: false,
        error: 'shell:openExternal requires a non-empty url string',
      };
    }

    const normalized = url.trim();
    if (!/^https?:\/\//i.test(normalized)) {
      return {
        success: false,
        error: 'Only http/https links are allowed',
      };
    }

    try {
      await shell.openExternal(normalized);
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  });
}
