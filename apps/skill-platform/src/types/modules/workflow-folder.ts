/** 工作流侧栏目录（独立于提示词 folders 表） */

export interface IWorkflowFolder {
  id: string;
  name: string;
  parentId?: string;
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface DCreateWorkflowFolder {
  name: string;
  parentId?: string;
  order?: number;
}

export interface DUpdateWorkflowFolder {
  name?: string;
  parentId?: string;
  order?: number;
}
