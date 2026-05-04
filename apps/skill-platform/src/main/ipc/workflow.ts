import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type { DCreateWorkflow, DUpdateWorkflow } from '@/types/modules';
import { ipcMain } from 'electron';

import type { WorkflowController } from '../database/controller/workflow';

/**
 * 注册工作流 IPC
 */
export function registerWorkflowIPC(workflowDb: WorkflowController): void {
  ipcMain.handle(IPC_CHANNELS.WORKFLOW_CREATE, async (_event, data: DCreateWorkflow) => {
    return workflowDb.create(data);
  });

  ipcMain.handle(IPC_CHANNELS.WORKFLOW_GET, async (_event, id: string) => {
    return workflowDb.getById(id);
  });

  ipcMain.handle(IPC_CHANNELS.WORKFLOW_GET_ALL, async () => {
    return workflowDb.getAll();
  });

  ipcMain.handle(
    IPC_CHANNELS.WORKFLOW_UPDATE,
    async (_event, id: string, data: DUpdateWorkflow) => {
      return workflowDb.update(id, data);
    },
  );

  ipcMain.handle(IPC_CHANNELS.WORKFLOW_DELETE, async (_event, id: string) => {
    return workflowDb.delete(id);
  });
}
