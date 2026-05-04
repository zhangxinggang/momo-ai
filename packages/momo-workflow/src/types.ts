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
}

export const WORKFLOW_NODE_TYPE_PROMPT = 'promptResource';
export const WORKFLOW_NODE_TYPE_SKILL = 'skillResource';
export const WORKFLOW_NODE_TYPE_START = 'workflowStart';
export const WORKFLOW_NODE_TYPE_END = 'workflowEnd';

/** 起止节点 data */
export interface IWorkflowTerminalNodeData extends Record<string, unknown> {
  terminalKind: 'start' | 'end';
  label?: string;
}

/** 画布拖放载荷（palette → canvas） */
export interface IWorkflowPaletteDragPayload {
  kind: 'prompt' | 'skill' | 'start' | 'end';
  resourceId?: string;
  label?: string;
}

export const WORKFLOW_DRAG_MIME = 'application/momo-workflow';

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
  /** 删除节点（键盘 Delete 或节点上的删除按钮） */
  onNodeDelete?: (payload: IWorkflowEditorNodeEvent) => void;
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
  /** 从侧栏拖入画布 */
  onCanvasDrop?: (payload: {
    flowPosition: { x: number; y: number };
    dragData: IWorkflowPaletteDragPayload;
  }) => void;
  /** 挂载后自动 fitView（加载已有图时） */
  fitViewOnMount?: boolean;
}
