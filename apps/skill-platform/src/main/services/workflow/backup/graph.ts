interface IWorkflowGraphNode {
  id?: string;
  type?: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

interface IWorkflowGraph {
  nodes?: IWorkflowGraphNode[];
  edges?: unknown[];
  [key: string]: unknown;
}

function parseGraphJson(graphJson: string): IWorkflowGraph {
  let parsed: unknown;
  try {
    parsed = JSON.parse(graphJson);
  } catch {
    throw new Error('工作流图 JSON 无效');
  }
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('工作流图 JSON 无效');
  }
  return parsed as IWorkflowGraph;
}

/** 导出前清空本机路径类字段并计数 */
export function sanitizeWorkflowGraphJson(graphJson: string): {
  graphJson: string;
  strippedLocalPathCount: number;
} {
  const graph = parseGraphJson(graphJson);
  const nodes = Array.isArray(graph.nodes) ? graph.nodes : [];
  let strippedLocalPathCount = 0;

  for (const node of nodes) {
    if (!node.data || typeof node.data !== 'object') {
      continue;
    }
    const data = { ...node.data };
    if (data.kbCollectionId !== undefined && data.kbCollectionId !== null) {
      delete data.kbCollectionId;
      strippedLocalPathCount += 1;
    }
    if (Array.isArray(data.workspacePaths) && data.workspacePaths.length > 0) {
      delete data.workspacePaths;
      strippedLocalPathCount += 1;
    } else if (data.workspacePaths !== undefined) {
      delete data.workspacePaths;
    }
    node.data = data;
  }

  return {
    graphJson: JSON.stringify({ ...graph, nodes }),
    strippedLocalPathCount,
  };
}

/** 从图中去重收集提示词与 Skill 的 resourceId */
export function collectWorkflowResourceIds(graphJson: string): {
  promptIds: string[];
  skillIds: string[];
} {
  const graph = parseGraphJson(graphJson);
  const nodes = Array.isArray(graph.nodes) ? graph.nodes : [];
  const promptIds: string[] = [];
  const skillIds: string[] = [];
  const seenPrompt = new Set<string>();
  const seenSkill = new Set<string>();

  for (const node of nodes) {
    const data = node.data;
    if (!data || typeof data !== 'object') {
      continue;
    }
    const kind = data.resourceKind;
    const resourceId = data.resourceId;
    if (typeof resourceId !== 'string' || resourceId.trim().length === 0) {
      continue;
    }
    if (kind === 'prompt' && !seenPrompt.has(resourceId)) {
      seenPrompt.add(resourceId);
      promptIds.push(resourceId);
    } else if (kind === 'skill' && !seenSkill.has(resourceId)) {
      seenSkill.add(resourceId);
      skillIds.push(resourceId);
    }
  }

  return { promptIds, skillIds };
}

/** 按 idMap 重写节点 resourceId */
export function remapWorkflowResourceIds(
  graphJson: string,
  idMap: Map<string, string>,
): string {
  const graph = parseGraphJson(graphJson);
  const nodes = Array.isArray(graph.nodes) ? graph.nodes : [];

  for (const node of nodes) {
    if (!node.data || typeof node.data !== 'object') {
      continue;
    }
    const resourceId = node.data.resourceId;
    if (typeof resourceId !== 'string') {
      continue;
    }
    const nextId = idMap.get(resourceId);
    if (nextId) {
      node.data = { ...node.data, resourceId: nextId };
    }
  }

  return JSON.stringify({ ...graph, nodes });
}
