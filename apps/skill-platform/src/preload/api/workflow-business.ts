import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type {
  DCreateWorkflowBusiness,
  DUpdateWorkflowBusiness,
  IWorkflowBusiness,
} from '@/types/modules';
import { ipcRenderer } from 'electron';

export const workflowBusinessApi = {
  create: (data: DCreateWorkflowBusiness) =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKFLOW_BUSINESS_CREATE, data) as Promise<IWorkflowBusiness>,
  getAll: (workflowId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKFLOW_BUSINESS_GET_ALL, workflowId) as Promise<
      IWorkflowBusiness[]
    >,
  update: (id: string, data: DUpdateWorkflowBusiness) =>
    ipcRenderer.invoke(
      IPC_CHANNELS.WORKFLOW_BUSINESS_UPDATE,
      id,
      data,
    ) as Promise<IWorkflowBusiness | null>,
  delete: (id: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKFLOW_BUSINESS_DELETE, id) as Promise<boolean>,
  deleteByWorkflow: (workflowId: string) =>
    ipcRenderer.invoke(
      IPC_CHANNELS.WORKFLOW_BUSINESS_DELETE_BY_WORKFLOW,
      workflowId,
    ) as Promise<void>,
  hasAny: (workflowId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.WORKFLOW_BUSINESS_HAS_ANY, workflowId) as Promise<boolean>,
};
