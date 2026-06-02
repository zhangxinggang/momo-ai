import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type { DCreatePrompt, DPromptSearch, DUpdatePrompt, IPrompt } from '@/types/modules';
import { ipcRenderer } from 'electron';

export const promptApi = {
  create: (data: DCreatePrompt) => ipcRenderer.invoke(IPC_CHANNELS.PROMPT_CREATE, data),
  get: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.PROMPT_GET, id),
  getAll: () => ipcRenderer.invoke(IPC_CHANNELS.PROMPT_GET_ALL),
  update: (id: string, data: DUpdatePrompt) =>
    ipcRenderer.invoke(IPC_CHANNELS.PROMPT_UPDATE, id, data),
  delete: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.PROMPT_DELETE, id),
  search: (query: DPromptSearch) => ipcRenderer.invoke(IPC_CHANNELS.PROMPT_SEARCH, query),
  copy: (id: string, variables: Record<string, string>) =>
    ipcRenderer.invoke(IPC_CHANNELS.PROMPT_COPY, id, variables),
  insertDirect: (prompt: IPrompt) => ipcRenderer.invoke(IPC_CHANNELS.PROMPT_INSERT_DIRECT, prompt),
  syncWorkspace: () => ipcRenderer.invoke(IPC_CHANNELS.PROMPT_SYNC_WORKSPACE),
};
