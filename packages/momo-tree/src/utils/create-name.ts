import type { EMomoTreeNodeKind, IMomoTreeNode } from '../types';

/** 规范化同级比较用的名称 */
export function normalizeSiblingName(name: string): string {
  return name.trim().toLowerCase();
}

/** 获取某父节点下的直接子节点（parentId 为 null 表示根级） */
export function getDirectChildren(
  nodes: IMomoTreeNode[],
  parentId: string | null,
): IMomoTreeNode[] {
  if (parentId === null) {
    return nodes;
  }

  const parent = findNodeInTree(nodes, parentId);
  return parent?.children ?? [];
}

function findNodeInTree(nodes: IMomoTreeNode[], nodeId: string): IMomoTreeNode | null {
  for (const node of nodes) {
    if (node.id === nodeId) {
      return node;
    }
    if (node.children?.length) {
      const found = findNodeInTree(node.children, nodeId);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

/** 同级同类型名称是否重复 */
export function hasDuplicateSiblingName(
  nodes: IMomoTreeNode[],
  parentId: string | null,
  name: string,
  kind: EMomoTreeNodeKind,
): boolean {
  const normalized = normalizeSiblingName(name);
  if (!normalized) {
    return false;
  }

  return getDirectChildren(nodes, parentId).some(
    (child) => child.kind === kind && normalizeSiblingName(child.name) === normalized,
  );
}
