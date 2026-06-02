import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type { DCreateWorkflowBusiness, DUpdateWorkflowBusiness } from '@/types/modules';
import { ipcMain } from 'electron';

import type { WorkflowBusinessController } from '../database/controller/workflow-business';

/**
 * 注册工作流业务实例 IPC
 */
export function registerWorkflowBusinessIPC(controller: WorkflowBusinessController): void {
  ipcMain.handle(
    IPC_CHANNELS.WORKFLOW_BUSINESS_CREATE,
    async (_event, data: DCreateWorkflowBusiness) => {
      return controller.create(data);
    },
  );

  ipcMain.handle(IPC_CHANNELS.WORKFLOW_BUSINESS_GET_ALL, async (_event, workflowId: string) => {
    return controller.getAllByWorkflowId(workflowId);
  });

  ipcMain.handle(
    IPC_CHANNELS.WORKFLOW_BUSINESS_UPDATE,
    async (_event, id: string, data: DUpdateWorkflowBusiness) => {
      return controller.update(id, data);
    },
  );

  ipcMain.handle(IPC_CHANNELS.WORKFLOW_BUSINESS_DELETE, async (_event, id: string) => {
    return controller.delete(id);
  });

  ipcMain.handle(
    IPC_CHANNELS.WORKFLOW_BUSINESS_DELETE_BY_WORKFLOW,
    async (_event, workflowId: string) => {
      return controller.deleteByWorkflowId(workflowId);
    },
  );

  ipcMain.handle(IPC_CHANNELS.WORKFLOW_BUSINESS_HAS_ANY, async (_event, workflowId: string) => {
    return controller.hasAny(workflowId);
  });
}
