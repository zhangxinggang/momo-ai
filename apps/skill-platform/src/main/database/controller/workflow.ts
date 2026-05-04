import type { DCreateWorkflow, DUpdateWorkflow, IWorkflow } from '@/types/modules';

import { WorkflowService } from '../service/workflow';

/** 工作流对外接口 */
export class WorkflowController {
  private readonly service = new WorkflowService();

  create(data: DCreateWorkflow): Promise<IWorkflow> {
    return this.service.create(data);
  }

  getById(id: string): Promise<IWorkflow | null> {
    return this.service.getById(id);
  }

  getAll(): Promise<IWorkflow[]> {
    return this.service.getAll();
  }

  update(id: string, data: DUpdateWorkflow): Promise<IWorkflow | null> {
    return this.service.update(id, data);
  }

  delete(id: string): Promise<boolean> {
    return this.service.delete(id);
  }
}
