import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import { getUploadUrl } from '@momo/electron';
import { ipcMain } from 'electron';

/** 注册内置 HTTP 服务相关 IPC */
export function registerSystemIPC(): void {
  ipcMain.handle(IPC_CHANNELS.SYSTEM_GET_UPLOAD_URL, () => getUploadUrl());
}
