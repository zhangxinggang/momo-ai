import type {
  DCreateWorkflowBusiness,
  DUpdateWorkflowBusiness,
  IWorkflowBusiness,
} from '@/types/modules';

import { WorkflowBusinessService } from '../service/workflow-business';

/** 工作流业务实例对外接口 */
export class WorkflowBusinessController {
  private readonly service = new WorkflowBusinessService();

  create(data: DCreateWorkflowBusiness): Promise<IWorkflowBusiness> {
    return this.service.create(data);
  }

  getAllByWorkflowId(workflowId: string): Promise<IWorkflowBusiness[]> {
    return this.service.getAllByWorkflowId(workflowId);
  }

  update(id: string, data: DUpdateWorkflowBusiness): Promise<IWorkflowBusiness | null> {
    return this.service.update(id, data);
  }

  delete(id: string): Promise<boolean> {
    return this.service.delete(id);
  }

  deleteByWorkflowId(workflowId: string): Promise<void> {
    return this.service.deleteByWorkflowId(workflowId);
  }

  hasAny(workflowId: string): Promise<boolean> {
    return this.service.hasAny(workflowId);
  }
}
