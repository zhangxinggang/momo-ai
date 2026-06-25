import type { Edge, Node } from '@xyflow/react';

import {
  WORKFLOW_NODE_TYPE_PARALLEL,
  WORKFLOW_NODE_TYPE_WEBPAGE,
  type IWorkflowParallelNodeData,
  type IWorkflowResourceNodeData,
  type IWorkflowWebpageNodeData,
} from '../types';

export function isParallelNode(node: Node): node is Node<IWorkflowParallelNodeData> {
  return node.type === WORKFLOW_NODE_TYPE_PARALLEL;
}

export function isResourceNode(node: Node): node is Node<IWorkflowResourceNodeData> {
  const d = node.data as IWorkflowResourceNodeData | undefined;
  return (
    !!d &&
    (d.resourceKind === 'prompt' || d.resourceKind === 'skill') &&
    typeof d.resourceId === 'string' &&
    d.resourceId.length > 0
  );
}

export function isWebpageNode(node: Node): node is Node<IWorkflowWebpageNodeData> {
  return node.type === WORKFLOW_NODE_TYPE_WEBPAGE;
}

/** 可挂并行 / 可作宏观叶子：资源或网页（不含并行容器） */
export function isLeafNode(
  node: Node,
): node is Node<IWorkflowResourceNodeData> | Node<IWorkflowWebpageNodeData> {
  return isResourceNode(node) || isWebpageNode(node);
}

/** 宏观图节点：并行容器 + 无 parentId 的顶层叶子节点 */
export function getMacroNodes(nodes: Node[]): Node[] {
  return nodes.filter((n) => {
    if (isParallelNode(n)) {
      return true;
    }
    if (isLeafNode(n) && !n.parentId) {
      return true;
    }
    return false;
  });
}

export function isFreeResourceNode(nodes: Node[], edges: Edge[], nodeId: string): boolean {
  const hasEdge = edges.some((e) => e.source === nodeId || e.target === nodeId);
  if (hasEdge) {
    return false;
  }
  const node = nodes.find((n) => n.id === nodeId);
  return !!node && isLeafNode(node) && !node.parentId;
}

export const PARALLEL_CHILD_SLOT_WIDTH = 180;
export const PARALLEL_BASE_WIDTH = 280;
export const PARALLEL_BASE_HEIGHT = 160;
export const RESOURCE_NODE_WIDTH = 160;
export const RESOURCE_NODE_HEIGHT = 72;

export function getParallelSize(childCount: number): { width: number; height: number } {
  return {
    width: Math.max(PARALLEL_BASE_WIDTH, 48 + childCount * PARALLEL_CHILD_SLOT_WIDTH),
    height: PARALLEL_BASE_HEIGHT,
  };
}

export function getChildPositionInParallel(childIndex: number): { x: number; y: number } {
  return { x: 24 + childIndex * PARALLEL_CHILD_SLOT_WIDTH, y: 48 };
}

export function isPointInsideParallel(
  point: { x: number; y: number },
  parallel: Node<IWorkflowParallelNodeData>,
): boolean {
  const width = Number(parallel.style?.width ?? PARALLEL_BASE_WIDTH);
  const height = Number(parallel.style?.height ?? PARALLEL_BASE_HEIGHT);
  return (
    point.x >= parallel.position.x &&
    point.x <= parallel.position.x + width &&
    point.y >= parallel.position.y &&
    point.y <= parallel.position.y + height
  );
}

/** 查找坐标点所在的并行容器（自上而下取最上层） */
export function findParallelNodeAtPoint(
  nodes: Node[],
  point: { x: number; y: number },
): Node<IWorkflowParallelNodeData> | null {
  const parallelNodes = nodes.filter(isParallelNode);
  for (let i = parallelNodes.length - 1; i >= 0; i--) {
    const parallel = parallelNodes[i]!;
    if (isPointInsideParallel(point, parallel)) {
      return parallel;
    }
  }
  return null;
}

/** 将叶子节点（prompt / skill / webpage）挂载到并行容器 */
export function attachResourceNodeToParallel(
  nodes: Node[],
  parallelId: string,
  childId: string,
): Node[] {
  const parallel = nodes.find((n) => n.id === parallelId);
  const child = nodes.find((n) => n.id === childId);
  if (!parallel || !isParallelNode(parallel) || !child || !isLeafNode(child)) {
    return nodes;
  }

  const childIds = parallel.data.childNodeIds ?? [];
  const nextChildIds = childIds.includes(childId) ? childIds : [...childIds, childId];
  const childIndex = nextChildIds.indexOf(childId);
  const size = getParallelSize(nextChildIds.length);
  const childPosition = getChildPositionInParallel(childIndex);

  return nodes.map((n) => {
    if (n.id === parallelId) {
      return {
        ...n,
        data: { ...n.data, childNodeIds: nextChildIds },
        style: { ...n.style, width: size.width, height: size.height },
      };
    }
    if (n.id === childId) {
      return {
        ...n,
        parentId: parallelId,
        extent: 'parent' as const,
        position: childPosition,
      };
    }
    return n;
  });
}

export function createParallelNode(params?: {
  label?: string;
  nodeName?: string;
  position?: { x: number; y: number };
  nodeId?: string;
}): Node<IWorkflowParallelNodeData> {
  const id = params?.nodeId ?? `wf-par-${crypto.randomUUID()}`;
  return {
    id,
    type: WORKFLOW_NODE_TYPE_PARALLEL,
    position: params?.position ?? { x: 200, y: 120 },
    data: {
      label: params?.label ?? '并行节点',
      nodeName: params?.nodeName,
      childNodeIds: [],
    },
    style: { width: 280, height: 160 },
  };
}

export function createWebpageNode(params?: {
  label?: string;
  nodeName?: string;
  remark?: string;
  url?: string;
  position?: { x: number; y: number };
  nodeId?: string;
}): Node<IWorkflowWebpageNodeData> {
  const id = params?.nodeId ?? `wf-web-${crypto.randomUUID()}`;
  const label = params?.label ?? '网页节点';
  return {
    id,
    type: WORKFLOW_NODE_TYPE_WEBPAGE,
    position: params?.position ?? { x: 0, y: 0 },
    data: {
      label,
      nodeName: params?.nodeName?.trim() || label,
      remark: params?.remark,
      url: params?.url,
    },
  };
}
