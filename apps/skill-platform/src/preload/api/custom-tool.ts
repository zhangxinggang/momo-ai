import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import { ipcRenderer } from 'electron';

export const customToolApi = {
  listTree: () => ipcRenderer.invoke(IPC_CHANNELS.TOOL_LIST_TREE),
  createFolder: (parentPath: string | null, name: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.TOOL_CREATE_FOLDER, parentPath, name),
  createFile: (parentPath: string | null, name: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.TOOL_CREATE_FILE, parentPath, name),
  readFile: (filePath: string) => ipcRenderer.invoke(IPC_CHANNELS.TOOL_READ_FILE, filePath),
  writeFile: (filePath: string, content: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.TOOL_WRITE_FILE, filePath, content),
  rename: (nodePath: string, newName: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.TOOL_RENAME, nodePath, newName),
  delete: (nodePath: string) => ipcRenderer.invoke(IPC_CHANNELS.TOOL_DELETE, nodePath),
  move: (sourcePath: string, targetParentPath: string | null) =>
    ipcRenderer.invoke(IPC_CHANNELS.TOOL_MOVE, sourcePath, targetParentPath),
  readSnapEditHtml: () => ipcRenderer.invoke(IPC_CHANNELS.TOOL_READ_SNAPEDIT_HTML),
};
