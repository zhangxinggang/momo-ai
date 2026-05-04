import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import { ipcRenderer } from 'electron';

export const ioApi = {
  export: (ids: string[]) => ipcRenderer.invoke(IPC_CHANNELS.EXPORT_PROMPTS, ids),
  import: (data: string) => ipcRenderer.invoke(IPC_CHANNELS.IMPORT_PROMPTS, data),
};
