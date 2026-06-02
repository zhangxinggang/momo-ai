/** 工作流业务实例（一次独立执行记录） */

export interface IWorkflowBusiness {
  id: string;
  workflowId: string;
  name: string;
  remark: string;
  createdAt: number;
  updatedAt: number;
}

export interface DCreateWorkflowBusiness {
  workflowId: string;
  name: string;
  remark?: string;
}

export interface DUpdateWorkflowBusiness {
  name?: string;
  remark?: string;
}
