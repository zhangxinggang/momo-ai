import type { Edge, Node } from '@xyflow/react';

import type { IWorkflowResourceNodeData, IWorkflowTerminalNodeData } from '../types';
import { WORKFLOW_NODE_TYPE_END, WORKFLOW_NODE_TYPE_START } from '../types';

export interface IWorkflowResourceStep {
  nodeId: string;
  resourceKind: 'prompt' | 'skill';
  resourceId: string;
  nodeName: string;
  label?: string;
}

const EMPTY_GRAPH_JSON = JSON.stringify({ nodes: [], edges: [] });

export function parseWorkflowGraphJson(raw: string): { nodes: Node[]; edges: Edge[] } {
  try {
    const parsed = JSON.parse(raw) as { nodes?: Node[]; edges?: Edge[] };
    return {
      nodes: Array.isArray(parsed.nodes) ? parsed.nodes : [],
      edges: Array.isArray(parsed.edges) ? parsed.edges : [],
    };
  } catch {
    return { nodes: [], edges: [] };
  }
}

export function stringifyWorkflowGraph(nodes: Node[], edges: Edge[]): string {
  return JSON.stringify({ nodes, edges });
}

export function emptyWorkflowGraphJson(): string {
  return EMPTY_GRAPH_JSON;
}

function isResourceNode(node: Node): node is Node<IWorkflowResourceNodeData> {
  const d = node.data as IWorkflowResourceNodeData | undefined;
  return (
    !!d &&
    (d.resourceKind === 'prompt' || d.resourceKind === 'skill') &&
    typeof d.resourceId === 'string' &&
    d.resourceId.length > 0
  );
}

function sortNodeIdsByPosition(resourceNodes: Node[], ids: string[]): string[] {
  return [...ids].sort((a, b) => {
    const pa = resourceNodes.find((n) => n.id === a)?.position.x ?? 0;
    const pb = resourceNodes.find((n) => n.id === b)?.position.x ?? 0;
    if (pa !== pb) return pa - pb;
    const ya = resourceNodes.find((n) => n.id === a)?.position.y ?? 0;
    const yb = resourceNodes.find((n) => n.id === b)?.position.y ?? 0;
    return ya - yb;
  });
}

/**
 * 从画布得到拓扑有序的资源步；存在环时返回 graphCycle
 */
export function buildWorkflowResourceSteps(
  nodes: Node[],
  edges: Edge[],
): { ok: true; steps: IWorkflowResourceStep[] } | { ok: false; error: 'graphCycle' } {
  const resourceNodes = nodes.filter(isResourceNode);
  if (resourceNodes.length === 0) {
    return { ok: true, steps: [] };
  }

  const idSet = new Set(resourceNodes.map((n) => n.id));
  const adj = new Map<string, string[]>();
  const indeg = new Map<string, number>();

  for (const n of resourceNodes) {
    adj.set(n.id, []);
    indeg.set(n.id, 0);
  }

  for (const e of edges) {
    if (!idSet.has(e.source) || !idSet.has(e.target)) continue;
    adj.get(e.source)!.push(e.target);
    indeg.set(e.target, (indeg.get(e.target) ?? 0) + 1);
  }

  let queue = sortNodeIdsByPosition(
    resourceNodes,
    [...indeg.entries()].filter(([, d]) => d === 0).map(([id]) => id),
  );

  const orderedIds: string[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    orderedIds.push(id);
    const nextZero: string[] = [];
    for (const t of adj.get(id) ?? []) {
      const next = (indeg.get(t) ?? 0) - 1;
      indeg.set(t, next);
      if (next === 0) nextZero.push(t);
    }
    queue = sortNodeIdsByPosition(resourceNodes, [...queue, ...nextZero]);
  }

  if (orderedIds.length !== resourceNodes.length) {
    return { ok: false, error: 'graphCycle' };
  }

  const nodeById = new Map(resourceNodes.map((n) => [n.id, n]));
  const steps: IWorkflowResourceStep[] = orderedIds.map((id) => {
    const n = nodeById.get(id)!;
    const d = n.data;
    return {
      nodeId: id,
      resourceKind: d.resourceKind,
      resourceId: d.resourceId,
      nodeName: d.nodeName?.trim() || d.label?.trim() || d.resourceId,
      label: d.label,
    };
  });

  return { ok: true, steps };
}

export interface IWorkflowResourceChainValidation {
  ok: boolean;
  message?: string;
}

/**
 * 校验资源节点是否串联为单链：节点数 > 1 时须全部连接，且每节点最多一条入边、一条出边
 */
export function validateWorkflowResourceChain(
  nodes: Node[],
  edges: Edge[],
): IWorkflowResourceChainValidation {
  const resourceNodes = nodes.filter(isResourceNode);
  const count = resourceNodes.length;
  if (count <= 1) {
    return { ok: true };
  }

  const idSet = new Set(resourceNodes.map((n) => n.id));
  const resourceEdges = edges.filter((e) => idSet.has(e.source) && idSet.has(e.target));

  const incomingCount = new Map<string, number>();
  const outgoingCount = new Map<string, number>();
  for (const id of idSet) {
    incomingCount.set(id, 0);
    outgoingCount.set(id, 0);
  }

  for (const edge of resourceEdges) {
    incomingCount.set(edge.target, (incomingCount.get(edge.target) ?? 0) + 1);
    outgoingCount.set(edge.source, (outgoingCount.get(edge.source) ?? 0) + 1);
  }

  for (const id of idSet) {
    const inCount = incomingCount.get(id) ?? 0;
    const outCount = outgoingCount.get(id) ?? 0;
    if (inCount > 1 || outCount > 1) {
      return {
        ok: false,
        message: '每个节点只能有一个连接和被连接，请将节点进行串联',
      };
    }
  }

  if (resourceEdges.length !== count - 1) {
    return { ok: false, message: '请将节点进行串联' };
  }

  let headCount = 0;
  let tailCount = 0;
  for (const id of idSet) {
    const inCount = incomingCount.get(id) ?? 0;
    const outCount = outgoingCount.get(id) ?? 0;
    if (inCount === 0) {
      headCount += 1;
    }
    if (outCount === 0) {
      tailCount += 1;
    }
    if (inCount === 0 && outCount === 0) {
      return { ok: false, message: '请将节点进行串联' };
    }
  }

  if (headCount !== 1 || tailCount !== 1) {
    return { ok: false, message: '请将节点进行串联' };
  }

  return { ok: true };
}

export function createStartNode(params?: {
  label?: string;
  position?: { x: number; y: number };
  nodeId?: string;
}): Node<IWorkflowTerminalNodeData> {
  const id = params?.nodeId ?? `wf-start-${crypto.randomUUID()}`;
  return {
    id,
    type: WORKFLOW_NODE_TYPE_START,
    position: params?.position ?? { x: 80, y: 80 },
    data: {
      terminalKind: 'start',
      label: params?.label,
    },
  };
}

export function createEndNode(params?: {
  label?: string;
  position?: { x: number; y: number };
  nodeId?: string;
}): Node<IWorkflowTerminalNodeData> {
  const id = params?.nodeId ?? `wf-end-${crypto.randomUUID()}`;
  return {
    id,
    type: WORKFLOW_NODE_TYPE_END,
    position: params?.position ?? { x: 480, y: 80 },
    data: {
      terminalKind: 'end',
      label: params?.label,
    },
  };
}

export function createResourceNode(params: {
  resourceKind: 'prompt' | 'skill';
  resourceId: string;
  label?: string;
  nodeName?: string;
  remark?: string;
  systemPrompt?: string;
  userPrompt?: string;
  position?: { x: number; y: number };
  nodeId?: string;
}): Node<IWorkflowResourceNodeData> {
  const id = params.nodeId ?? `wf-${crypto.randomUUID()}`;
  const defaultName = params.nodeName?.trim() || params.label?.trim() || params.resourceId;
  return {
    id,
    type: params.resourceKind === 'prompt' ? 'promptResource' : 'skillResource',
    position: params.position ?? { x: 0, y: 0 },
    data: {
      resourceKind: params.resourceKind,
      resourceId: params.resourceId,
      label: params.label,
      nodeName: defaultName,
      remark: params.remark,
      systemPrompt: params.systemPrompt,
      userPrompt: params.userPrompt,
    },
  };
}
