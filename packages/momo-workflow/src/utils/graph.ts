import type { Edge, Node } from '@xyflow/react';

import type {
  IWorkflowParallelNodeData,
  IWorkflowResourceNodeData,
  IWorkflowTerminalNodeData,
} from '../types';
import { WORKFLOW_NODE_TYPE_END, WORKFLOW_NODE_TYPE_START } from '../types';
import { getMacroNodes, isParallelNode, isResourceNode } from './parallel-graph';

export interface IWorkflowResourceStep {
  nodeId: string;
  resourceKind: 'prompt' | 'skill';
  resourceId: string;
  nodeName: string;
  label?: string;
}

export interface IWorkflowParallelStep {
  kind: 'parallel';
  nodeId: string;
  nodeName: string;
  label?: string;
  children: IWorkflowResourceStep[];
}

export interface IWorkflowSingleStep {
  kind: 'resource';
  step: IWorkflowResourceStep;
}

export type IWorkflowStep = IWorkflowParallelStep | IWorkflowSingleStep;

export interface IWorkflowGraphValidation {
  ok: boolean;
  message?: string;
}

export interface IWorkflowResourceChainValidation {
  ok: boolean;
  message?: string;
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

function sortNodeIdsByPosition(nodes: Node[], ids: string[]): string[] {
  return [...ids].sort((a, b) => {
    const pa = nodes.find((n) => n.id === a)?.position.x ?? 0;
    const pb = nodes.find((n) => n.id === b)?.position.x ?? 0;
    if (pa !== pb) {
      return pa - pb;
    }
    const ya = nodes.find((n) => n.id === a)?.position.y ?? 0;
    const yb = nodes.find((n) => n.id === b)?.position.y ?? 0;
    return ya - yb;
  });
}

function toResourceStep(node: Node<IWorkflowResourceNodeData>): IWorkflowResourceStep {
  const d = node.data;
  return {
    nodeId: node.id,
    resourceKind: d.resourceKind,
    resourceId: d.resourceId,
    nodeName: d.nodeName?.trim() || d.label?.trim() || d.resourceId,
    label: d.label,
  };
}

function buildParallelChildren(
  nodes: Node[],
  parallelNode: Node<IWorkflowParallelNodeData>,
): IWorkflowResourceStep[] {
  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  return (parallelNode.data.childNodeIds ?? [])
    .map((childId) => nodeById.get(childId))
    .filter((n): n is Node<IWorkflowResourceNodeData> => !!n && isResourceNode(n))
    .map(toResourceStep);
}

function topologicalSortMacroNodes(
  macroNodes: Node[],
  edges: Edge[],
): { ok: true; orderedIds: string[] } | { ok: false; error: 'graphCycle' } {
  if (macroNodes.length === 0) {
    return { ok: true, orderedIds: [] };
  }

  const idSet = new Set(macroNodes.map((n) => n.id));
  const adj = new Map<string, string[]>();
  const indeg = new Map<string, number>();

  for (const n of macroNodes) {
    adj.set(n.id, []);
    indeg.set(n.id, 0);
  }

  for (const e of edges) {
    if (!idSet.has(e.source) || !idSet.has(e.target)) {
      continue;
    }
    adj.get(e.source)!.push(e.target);
    indeg.set(e.target, (indeg.get(e.target) ?? 0) + 1);
  }

  let queue = sortNodeIdsByPosition(
    macroNodes,
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
      if (next === 0) {
        nextZero.push(t);
      }
    }
    queue = sortNodeIdsByPosition(macroNodes, [...queue, ...nextZero]);
  }

  if (orderedIds.length !== macroNodes.length) {
    return { ok: false, error: 'graphCycle' };
  }

  return { ok: true, orderedIds };
}

/**
 * 从画布得到宏观拓扑有序步骤；存在环时返回 graphCycle
 */
export function buildWorkflowSteps(
  nodes: Node[],
  edges: Edge[],
): { ok: true; steps: IWorkflowStep[] } | { ok: false; error: 'graphCycle' } {
  const macroNodes = getMacroNodes(nodes);
  const sorted = topologicalSortMacroNodes(macroNodes, edges);
  if (!sorted.ok) {
    return { ok: false, error: 'graphCycle' };
  }

  const nodeById = new Map(macroNodes.map((n) => [n.id, n]));
  const steps: IWorkflowStep[] = [];

  for (const id of sorted.orderedIds) {
    const node = nodeById.get(id);
    if (!node) {
      continue;
    }
    if (isParallelNode(node)) {
      steps.push({
        kind: 'parallel',
        nodeId: id,
        nodeName: node.data.nodeName?.trim() || node.data.label?.trim() || '并行节点',
        label: node.data.label,
        children: buildParallelChildren(nodes, node),
      });
      continue;
    }
    if (isResourceNode(node)) {
      steps.push({ kind: 'resource', step: toResourceStep(node) });
    }
  }

  return { ok: true, steps };
}

/**
 * 从画布得到拓扑有序的资源步（并行组内子节点按 childNodeIds 展开）；存在环时返回 graphCycle
 */
export function buildWorkflowResourceSteps(
  nodes: Node[],
  edges: Edge[],
): { ok: true; steps: IWorkflowResourceStep[] } | { ok: false; error: 'graphCycle' } {
  const built = buildWorkflowSteps(nodes, edges);
  if (!built.ok) {
    return { ok: false, error: 'graphCycle' };
  }

  const steps: IWorkflowResourceStep[] = [];
  for (const step of built.steps) {
    if (step.kind === 'resource') {
      steps.push(step.step);
    } else {
      steps.push(...step.children);
    }
  }

  return { ok: true, steps };
}

/** 并行组是否全部子节点产出就绪 */
export function isParallelGroupOutputReady(
  children: IWorkflowResourceStep[],
  runResults: Record<string, string>,
  nodeHasFiles: Record<string, boolean>,
): boolean {
  return children.every((child) => {
    const hasRunResult = !!runResults[child.nodeId]?.trim();
    const hasFiles = nodeHasFiles[child.nodeId] ?? false;
    return hasRunResult && hasFiles;
  });
}

function validateParallelStructure(nodes: Node[]): IWorkflowGraphValidation {
  const nodeById = new Map(nodes.map((n) => [n.id, n]));

  for (const node of nodes) {
    if (!isParallelNode(node)) {
      continue;
    }
    const childIds = node.data.childNodeIds ?? [];
    for (const childId of childIds) {
      const child = nodeById.get(childId);
      if (!child || !isResourceNode(child)) {
        return { ok: false, message: '请将并行节点与子节点正确关联' };
      }
      if (child.parentId !== node.id) {
        return { ok: false, message: '请将并行节点与子节点正确关联' };
      }
    }
  }

  for (const node of nodes) {
    if (!isResourceNode(node) || !node.parentId) {
      continue;
    }
    const parent = nodeById.get(node.parentId);
    if (!parent || !isParallelNode(parent)) {
      return { ok: false, message: '请将并行节点与子节点正确关联' };
    }
    if (!(parent.data.childNodeIds ?? []).includes(node.id)) {
      return { ok: false, message: '请将并行节点与子节点正确关联' };
    }
  }

  return { ok: true };
}

function validateChildEdges(nodes: Node[], edges: Edge[]): IWorkflowGraphValidation {
  for (const edge of edges) {
    const source = nodes.find((n) => n.id === edge.source);
    const target = nodes.find((n) => n.id === edge.target);
    if (source?.parentId || target?.parentId) {
      return { ok: false, message: '并行节点内的子节点不能对外连线' };
    }
  }
  return { ok: true };
}

function validateMacroChain(nodes: Node[], edges: Edge[]): IWorkflowGraphValidation {
  const macroNodes = getMacroNodes(nodes);
  const count = macroNodes.length;
  if (count <= 1) {
    return { ok: true };
  }

  const idSet = new Set(macroNodes.map((n) => n.id));
  const macroEdges = edges.filter((e) => idSet.has(e.source) && idSet.has(e.target));

  const incomingCount = new Map<string, number>();
  const outgoingCount = new Map<string, number>();
  for (const id of idSet) {
    incomingCount.set(id, 0);
    outgoingCount.set(id, 0);
  }

  for (const edge of macroEdges) {
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

  if (macroEdges.length !== count - 1) {
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

/** 校验工作流图（含并行容器） */
export function validateWorkflowGraph(nodes: Node[], edges: Edge[]): IWorkflowGraphValidation {
  const parallelValidation = validateParallelStructure(nodes);
  if (!parallelValidation.ok) {
    return parallelValidation;
  }

  const childEdgeValidation = validateChildEdges(nodes, edges);
  if (!childEdgeValidation.ok) {
    return childEdgeValidation;
  }

  return validateMacroChain(nodes, edges);
}

/**
 * 校验资源节点是否串联为单链（兼容旧调用，内部转 validateWorkflowGraph）
 */
export function validateWorkflowResourceChain(
  nodes: Node[],
  edges: Edge[],
): IWorkflowResourceChainValidation {
  return validateWorkflowGraph(nodes, edges);
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
  executionModel?: string;
  kbCollectionId?: number;
  workspacePaths?: string[];
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
      executionModel: params.executionModel,
      kbCollectionId: params.kbCollectionId,
      workspacePaths: params.workspacePaths,
    },
  };
}

export { createParallelNode } from './parallel-graph';
