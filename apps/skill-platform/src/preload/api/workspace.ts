import { ipcRenderer } from 'electron';

import { IPC_CHANNELS } from '@/types/constants/ipc-channels';

export const workspaceApi = {
  listDir: (dirPath: string) => ipcRenderer.invoke(IPC_CHANNELS.WORKSPACE_LIST_DIR, dirPath),
  readFile: (filePath: string) => ipcRenderer.invoke(IPC_CHANNELS.WORKSPACE_READ_FILE, filePath),
};
