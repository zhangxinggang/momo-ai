import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type { DCreateWorkflowFolder, DUpdateWorkflowFolder } from '@/types/modules';
import { ipcMain } from 'electron';

import type { WorkflowFolderController } from '../database/controller/workflow-folder';

/** 注册工作流侧栏目录 IPC */
export function registerWorkflowFolderIPC(controller: WorkflowFolderController): void {
  ipcMain.handle(IPC_CHANNELS.WORKFLOW_FOLDER_CREATE, async (_event, data: DCreateWorkflowFolder) =>
    controller.create(data),
  );

  ipcMain.handle(IPC_CHANNELS.WORKFLOW_FOLDER_GET_ALL, async () => controller.getAll());

  ipcMain.handle(
    IPC_CHANNELS.WORKFLOW_FOLDER_UPDATE,
    async (_event, id: string, data: DUpdateWorkflowFolder) => controller.update(id, data),
  );

  ipcMain.handle(IPC_CHANNELS.WORKFLOW_FOLDER_DELETE, async (_event, id: string) =>
    controller.delete(id),
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKFLOW_FOLDER_UPDATE_ORDERS,
    async (_event, updates: { id: string; order: number }[]) => controller.updateOrders(updates),
  );
}
