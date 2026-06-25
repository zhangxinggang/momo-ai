import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type { IAppConfig } from '@momo/electron';
import { ipcRenderer } from 'electron';

export const systemApi = {
  getUploadUrl: (): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_GET_UPLOAD_URL),
  getAppConfig: (): Promise<IAppConfig> => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_GET_APP_CONFIG),
  getSystemLogo: (): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_GET_SYSTEM_LOGO),
};
