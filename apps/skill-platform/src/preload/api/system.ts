import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import { ipcRenderer } from 'electron';

export const systemApi = {
  getUploadUrl: (): Promise<string> => ipcRenderer.invoke(IPC_CHANNELS.SYSTEM_GET_UPLOAD_URL),
};
