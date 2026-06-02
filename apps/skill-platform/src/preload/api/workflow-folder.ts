import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type {
  DCreateWorkflowFolder,
  DUpdateWorkflowFolder,
  IWorkflowFolder,
} from '@/types/modules';
import { ipcRenderer } from 'electron';

export const workflowFolderApi = {
  create: (data: DCreateWorkflowFolder) =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKFLOW_FOLDER_CREATE, data) as Promise<IWorkflowFolder>,
  getAll: () =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKFLOW_FOLDER_GET_ALL) as Promise<IWorkflowFolder[]>,
  update: (id: string, data: DUpdateWorkflowFolder) =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKFLOW_FOLDER_UPDATE, id, data) as Promise<IWorkflowFolder>,
  delete: (id: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKFLOW_FOLDER_DELETE, id) as Promise<boolean>,
  updateOrders: (updates: { id: string; order: number }[]) =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKFLOW_FOLDER_UPDATE_ORDERS, updates) as Promise<void>,
};
