import { ipcRenderer } from 'electron';

import { IPC_CHANNELS } from '@/types/constants/ipc-channels';

export const workspaceApi = {
  listDir: (dirPath: string) => ipcRenderer.invoke(IPC_CHANNELS.WORKSPACE_LIST_DIR, dirPath),
  listTree: (dirPath: string) => ipcRenderer.invoke(IPC_CHANNELS.WORKSPACE_LIST_TREE, dirPath),
  grep: (dirPath: string, keywords: string[]) =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKSPACE_GREP, { dirPath, keywords }),
  readSnippet: (dirPath: string, relativePath: string, line: number) =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKSPACE_READ_SNIPPET, { dirPath, relativePath, line }),
  readFile: (filePath: string) => ipcRenderer.invoke(IPC_CHANNELS.WORKSPACE_READ_FILE, filePath),
};
