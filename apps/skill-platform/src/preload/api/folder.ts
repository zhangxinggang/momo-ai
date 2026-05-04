import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type { DCreateFolder, DUpdateFolder, IFolder } from '@/types/modules';
import { ipcRenderer } from 'electron';

export const folderApi = {
  create: (data: DCreateFolder) => ipcRenderer.invoke(IPC_CHANNELS.FOLDER_CREATE, data),
  getAll: () => ipcRenderer.invoke(IPC_CHANNELS.FOLDER_GET_ALL),
  update: (id: string, data: DUpdateFolder) =>
    ipcRenderer.invoke(IPC_CHANNELS.FOLDER_UPDATE, id, data),
  delete: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.FOLDER_DELETE, id),
  reorder: (ids: string[]) => ipcRenderer.invoke(IPC_CHANNELS.FOLDER_REORDER, ids),
  insertDirect: (folder: IFolder) => ipcRenderer.invoke(IPC_CHANNELS.FOLDER_INSERT_DIRECT, folder),
};
