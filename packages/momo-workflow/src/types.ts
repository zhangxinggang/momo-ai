import type { Edge, Node } from '@xyflow/react';
import type { ComponentType, MouseEvent } from 'react';

/** 内置资源节点 data（IPrompt / ISkill 等） */
export interface IWorkflowResourceNodeData extends Record<string, unknown> {
  resourceKind: 'prompt' | 'skill';
  resourceId: string;
  /** 展示用标题缓存 */
  label?: string;
  /** 节点名称（工作流内唯一，用于目录与展示） */
  nodeName?: string;
  /** 节点备注 */
  remark?: string;
  /** 提示词节点：系统提示词（可覆盖关联提示词） */
  systemPrompt?: string;
  /** 提示词节点：用户提示词（可覆盖关联提示词） */
  userPrompt?: string;
  /** 节点执行对话模型（覆盖全局默认） */
  executionModel?: string;
  /** 节点关联知识库 */
  kbCollectionId?: number;
  /** 节点工作区目录 */
  workspacePaths?: string[];
}

export const WORKFLOW_NODE_TYPE_PROMPT = 'promptResource';
export const WORKFLOW_NODE_TYPE_SKILL = 'skillResource';
export const WORKFLOW_NODE_TYPE_START = 'workflowStart';
export const WORKFLOW_NODE_TYPE_END = 'workflowEnd';
export const WORKFLOW_NODE_TYPE_PARALLEL = 'parallelGroup';

/** 并行容器节点 data */
export interface IWorkflowParallelNodeData extends Record<string, unknown> {
  /** 展示标题，默认「并行节点」 */
  label?: string;
  /** 工作流内唯一名称（可选，用于目录标识） */
  nodeName?: string;
  /** 子节点 id 列表，顺序决定 Tab / hover / 合并上下文顺序 */
  childNodeIds: string[];
}

/** 起止节点 data */
export interface IWorkflowTerminalNodeData extends Record<string, unknown> {
  terminalKind: 'start' | 'end';
  label?: string;
}

/** 画布拖放载荷（palette → canvas） */
export interface IWorkflowPaletteDragPayload {
  kind: 'prompt' | 'skill' | 'start' | 'end' | 'parallel';
  resourceId?: string;
  label?: string;
}

export const WORKFLOW_DRAG_MIME = 'application/momo-workflow';

/** 是否为侧栏拖入画布的拖拽 */
export function isPaletteDragEvent(event: Pick<DragEvent, 'dataTransfer'>): boolean {
  return Array.from(event.dataTransfer.types).includes(WORKFLOW_DRAG_MIME);
}

export interface IWorkflowGraph {
  nodes: Node[];
  edges: Edge[];
}

export interface IWorkflowEditorNodeEvent {
  event: MouseEvent;
  node: Node;
}

export interface IProps {
  className?: string;
  /** 受控：节点列表 */
  nodes?: Node[];
  /** 受控：边列表 */
  edges?: Edge[];
  /** 节点/边变更（拖拽、连线、删除等） */
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  /** 图整体变更 */
  onGraphChange?: (graph: IWorkflowGraph) => void;
  /** 点击节点 */
  onNodeClick?: (payload: IWorkflowEditorNodeEvent) => void;
  /** 删除节点（键盘 Delete 或节点上的删除按钮）；返回 false 则取消删除 */
  onNodeDelete?: (payload: IWorkflowEditorNodeEvent) => boolean | Promise<boolean | void> | void;
  /** 编辑节点（节点上的编辑按钮） */
  onNodeEdit?: (payload: IWorkflowEditorNodeEvent) => void;
  /** 是否只读（禁止连线、拖拽、删除） */
  readOnly?: boolean;
  /** 右上角面板提示文案 */
  panelHint?: string;
  /** 是否显示小地图 */
  showMiniMap?: boolean;
  /** 自定义节点类型（与内置类型合并） */
  nodeTypes?: Record<string, ComponentType<unknown>>;
  /** 从侧栏拖入画布；targetParallelId 表示落入并行容器内 */
  onCanvasDrop?: (payload: {
    flowPosition: { x: number; y: number };
    dragData: IWorkflowPaletteDragPayload;
    targetParallelId?: string;
  }) => void;
  /** 挂载后自动 fitView（加载已有图时） */
  fitViewOnMount?: boolean;
}
