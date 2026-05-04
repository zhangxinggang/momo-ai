import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type { IPromptVersion } from '@/types/modules';
import { ipcRenderer } from 'electron';

export const versionApi = {
  getAll: (promptId: string) => ipcRenderer.invoke(IPC_CHANNELS.VERSION_GET_ALL, promptId),
  create: (promptId: string, note?: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.VERSION_CREATE, promptId, note),
  rollback: (promptId: string, version: number) =>
    ipcRenderer.invoke(IPC_CHANNELS.VERSION_ROLLBACK, promptId, version),
  delete: (versionId: string) => ipcRenderer.invoke(IPC_CHANNELS.VERSION_DELETE, versionId),
  insertDirect: (version: IPromptVersion) =>
    ipcRenderer.invoke(IPC_CHANNELS.VERSION_INSERT_DIRECT, version),
};
