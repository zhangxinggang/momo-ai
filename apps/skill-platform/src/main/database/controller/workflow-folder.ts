import type {
  DCreateWorkflowFolder,
  DUpdateWorkflowFolder,
  IWorkflowFolder,
} from '@/types/modules';

import { WorkflowFolderService } from '../service/workflow-folder';

/** 工作流侧栏目录对外接口 */
export class WorkflowFolderController {
  private readonly service = new WorkflowFolderService();

  create(data: DCreateWorkflowFolder): Promise<IWorkflowFolder> {
    return this.service.create(data);
  }

  getById(id: string): Promise<IWorkflowFolder | null> {
    return this.service.getById(id);
  }

  getAll(): Promise<IWorkflowFolder[]> {
    return this.service.getAll();
  }

  update(id: string, data: DUpdateWorkflowFolder): Promise<IWorkflowFolder | null> {
    return this.service.update(id, data);
  }

  delete(id: string): Promise<boolean> {
    return this.service.delete(id);
  }

  updateOrders(updates: { id: string; order: number }[]): Promise<void> {
    return this.service.updateOrders(updates);
  }
}
