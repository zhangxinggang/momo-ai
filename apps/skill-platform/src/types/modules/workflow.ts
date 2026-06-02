/**
 * 工作流定义（画布 JSON 与 @xyflow/react 序列化结构兼容，由渲染层解析）
 */

export interface IWorkflow {
  id: string;
  name: string;
  /** JSON 字符串：{ nodes: unknown[]; edges: unknown[] } */
  graphJson: string;
  folderId?: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface DCreateWorkflow {
  name: string;
  /** 可选，默认空图 */
  graphJson?: string;
  folderId?: string | null;
}

export interface DUpdateWorkflow {
  name?: string;
  graphJson?: string;
  folderId?: string | null;
}

/** 工作流图中资源节点在 LangGraph 执行序列中的步 */
export interface IWorkflowResourceStep {
  nodeId: string;
  resourceKind: 'prompt' | 'skill';
  resourceId: string;
  nodeName: string;
  label?: string;
}
