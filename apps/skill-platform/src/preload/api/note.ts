import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type { ENoteType } from '@/types/modules';
import { ipcRenderer } from 'electron';

export const noteApi = {
  listTree: () => ipcRenderer.invoke(IPC_CHANNELS.NOTE_LIST_TREE),
  createFolder: (parentPath: string | null, name: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.NOTE_CREATE_FOLDER, parentPath, name),
  createFile: (parentPath: string | null, name: string, noteType?: ENoteType) =>
    ipcRenderer.invoke(IPC_CHANNELS.NOTE_CREATE_FILE, parentPath, name, noteType),
  readFile: (filePath: string) => ipcRenderer.invoke(IPC_CHANNELS.NOTE_READ_FILE, filePath),
  writeFile: (filePath: string, content: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.NOTE_WRITE_FILE, filePath, content),
  rename: (nodePath: string, newName: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.NOTE_RENAME, nodePath, newName),
  delete: (nodePath: string) => ipcRenderer.invoke(IPC_CHANNELS.NOTE_DELETE, nodePath),
  move: (sourcePath: string, targetParentPath: string | null) =>
    ipcRenderer.invoke(IPC_CHANNELS.NOTE_MOVE, sourcePath, targetParentPath),
  copyFile: (filePath: string) => ipcRenderer.invoke(IPC_CHANNELS.NOTE_COPY_FILE, filePath),
  exportPdf: (payload: { title: string; content: string; defaultName: string }) =>
    ipcRenderer.invoke(IPC_CHANNELS.NOTE_EXPORT_PDF, payload) as Promise<{
      success: boolean;
      canceled?: boolean;
      filePath?: string;
    }>,
};
