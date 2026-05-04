import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type { DCreateWorkflow, DUpdateWorkflow, IWorkflow } from '@/types/modules';
import { ipcRenderer } from 'electron';

export const workflowApi = {
  create: (data: DCreateWorkflow) => ipcRenderer.invoke(IPC_CHANNELS.WORKFLOW_CREATE, data),
  get: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.WORKFLOW_GET, id),
  getAll: () => ipcRenderer.invoke(IPC_CHANNELS.WORKFLOW_GET_ALL) as Promise<IWorkflow[]>,
  update: (id: string, data: DUpdateWorkflow) =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKFLOW_UPDATE, id, data),
  delete: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.WORKFLOW_DELETE, id),
};
