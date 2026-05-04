import type { TreeDataNode } from 'antd';
import type { IMomoTreeNode } from '../types';

/** 在树中查找节点 */
export function findTreeNode(nodes: IMomoTreeNode[], nodeId: string): IMomoTreeNode | null {
  for (const node of nodes) {
    if (node.id === nodeId) {
      return node;
    }
    if (node.children?.length) {
      const found = findTreeNode(node.children, nodeId);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

/** 判断 targetId 是否为 ancestorId 的子孙节点（含自身） */
export function isDescendantOf(
  nodes: IMomoTreeNode[],
  targetId: string,
  ancestorId: string,
): boolean {
  if (targetId === ancestorId) {
    return true;
  }

  const ancestor = findTreeNode(nodes, ancestorId);
  if (!ancestor?.children?.length) {
    return false;
  }

  const walk = (children: IMomoTreeNode[]): boolean => {
    for (const child of children) {
      if (child.id === targetId) {
        return true;
      }
      if (child.children?.length && walk(child.children)) {
        return true;
      }
    }
    return false;
  };

  return walk(ancestor.children);
}

/** 收集第一层目录节点 id（用于默认展开） */
export function collectFirstLevelFolderIds(nodes: IMomoTreeNode[]): string[] {
  return nodes.filter((node) => node.kind === 'folder').map((node) => node.id);
}

/** 收集所有目录节点 id（用于移动目标选择） */
export function collectFolderIds(nodes: IMomoTreeNode[]): string[] {
  const ids: string[] = [];
  const walk = (list: IMomoTreeNode[]) => {
    for (const node of list) {
      if (node.kind === 'folder') {
        ids.push(node.id);
        if (node.children?.length) {
          walk(node.children);
        }
      }
    }
  };
  walk(nodes);
  return ids;
}

/** 统计目录下非目录节点数量（含所有子级） */
export function countNonFolderDescendants(nodes: IMomoTreeNode[], folderId: string): number {
  const folder = findTreeNode(nodes, folderId);
  if (!folder?.children?.length) {
    return 0;
  }

  let count = 0;
  const walk = (list: IMomoTreeNode[]) => {
    for (const node of list) {
      if (node.kind === 'file') {
        count += 1;
      } else if (node.children?.length) {
        walk(node.children);
      }
    }
  };
  walk(folder.children);
  return count;
}

/** 构建「移动到」弹窗用的树形目标数据（含根节点，兼容 TreeSelect） */
export function buildMoveTargetTreeData(
  nodes: IMomoTreeNode[],
  moveNodeId: string,
  rootId: string,
  rootLabel: string,
): TreeDataNode[] {
  const buildFolderNodes = (list: IMomoTreeNode[]): TreeDataNode[] => {
    const result: TreeDataNode[] = [];
    for (const node of list) {
      if (node.kind !== 'folder') {
        continue;
      }
      if (node.id === moveNodeId) {
        continue;
      }
      if (isDescendantOf(nodes, node.id, moveNodeId)) {
        continue;
      }
      const childFolders = node.children?.filter((child) => child.kind === 'folder') ?? [];
      result.push({
        key: node.id,
        value: node.id,
        title: node.name,
        children: childFolders.length ? buildFolderNodes(node.children!) : undefined,
      });
    }
    return result;
  };

  return [
    {
      key: rootId,
      value: rootId,
      title: rootLabel,
      children: buildFolderNodes(nodes),
    },
  ];
}
