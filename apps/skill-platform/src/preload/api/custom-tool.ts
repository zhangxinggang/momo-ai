import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type { ICustomToolSaveInput } from '@/types/modules';
import { ipcRenderer } from 'electron';

export const customToolApi = {
  listTree: () => ipcRenderer.invoke(IPC_CHANNELS.TOOL_LIST_TREE),
  createFolder: (parentPath: string | null, name: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.TOOL_CREATE_FOLDER, parentPath, name),
  createFile: (parentPath: string | null, name: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.TOOL_CREATE_FILE, parentPath, name),
  readFile: (toolPath: string) => ipcRenderer.invoke(IPC_CHANNELS.TOOL_READ_FILE, toolPath),
  writeFile: (toolPath: string, input: ICustomToolSaveInput) =>
    ipcRenderer.invoke(IPC_CHANNELS.TOOL_WRITE_FILE, toolPath, input),
  rename: (nodePath: string, newName: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.TOOL_RENAME, nodePath, newName),
  delete: (nodePath: string) => ipcRenderer.invoke(IPC_CHANNELS.TOOL_DELETE, nodePath),
  move: (sourcePath: string, targetParentPath: string | null) =>
    ipcRenderer.invoke(IPC_CHANNELS.TOOL_MOVE, sourcePath, targetParentPath),
};
