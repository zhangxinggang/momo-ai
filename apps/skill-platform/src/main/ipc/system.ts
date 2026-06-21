import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import { getAppConfig, getSystemLogo, getUploadUrl } from '@momo/electron';
import { ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';

function pathToDataUrl(filePath: string | undefined): string | undefined {
  if (!filePath || !fs.existsSync(filePath)) {
    return undefined;
  }
  const ext = path.extname(filePath).slice(1).toLowerCase();
  const mimeMap: Record<string, string> = {
    png: 'image/png',
    ico: 'image/x-icon',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
  };
  const mime = mimeMap[ext] ?? 'application/octet-stream';
  const base64 = fs.readFileSync(filePath).toString('base64');
  return `data:${mime};base64,${base64}`;
}

/** 注册内置 HTTP 服务相关 IPC */
export function registerSystemIPC(): void {
  ipcMain.handle(IPC_CHANNELS.SYSTEM_GET_UPLOAD_URL, () => getUploadUrl());
  ipcMain.handle(IPC_CHANNELS.SYSTEM_GET_APP_CONFIG, () => getAppConfig());
  ipcMain.handle(IPC_CHANNELS.SYSTEM_GET_SYSTEM_LOGO, () => {
    return pathToDataUrl(getSystemLogo());
  });
}
