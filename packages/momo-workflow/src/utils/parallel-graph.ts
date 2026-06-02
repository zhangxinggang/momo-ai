import type { Edge, Node } from '@xyflow/react';

import {
  WORKFLOW_NODE_TYPE_PARALLEL,
  type IWorkflowParallelNodeData,
  type IWorkflowResourceNodeData,
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

/** 宏观图节点：并行容器 + 无 parentId 的顶层资源节点 */
export function getMacroNodes(nodes: Node[]): Node[] {
  return nodes.filter((n) => {
    if (isParallelNode(n)) {
      return true;
    }
    if (isResourceNode(n) && !n.parentId) {
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
  return !!node && isResourceNode(node) && !node.parentId;
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

/** 将资源节点挂载到并行容器 */
export function attachResourceNodeToParallel(
  nodes: Node[],
  parallelId: string,
  childId: string,
): Node[] {
  const parallel = nodes.find((n) => n.id === parallelId);
  const child = nodes.find((n) => n.id === childId);
  if (!parallel || !isParallelNode(parallel) || !child || !isResourceNode(child)) {
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
