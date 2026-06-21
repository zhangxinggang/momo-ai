import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import { app, ipcMain } from 'electron';

/** 注册用户数据目录相关 IPC */
export function registerDataIPC(): void {
  ipcMain.handle(IPC_CHANNELS.DATA_GET_PATH, () => {
    return app.getPath('userData');
  });

  ipcMain.handle(IPC_CHANNELS.DATA_GET_STATUS, () => {
    return {
      currentPath: app.getPath('userData'),
    };
  });
}
