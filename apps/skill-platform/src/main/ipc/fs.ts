import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import { ipcMain } from 'electron';
import fs from 'fs';

/** 注册文件系统路径检查 IPC */
export function registerFsIPC(): void {
  ipcMain.handle(IPC_CHANNELS.FS_PATH_EXISTS, async (_event, targetPath: string) => {
    if (!targetPath?.trim()) {
      return false;
    }
    try {
      return fs.existsSync(targetPath);
    } catch {
      return false;
    }
  });
}
