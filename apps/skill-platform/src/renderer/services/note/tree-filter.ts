import type { IMomoTreeNode } from '@momo/tree';

/** 按关键词过滤树，保留层级结构：匹配节点及其祖先路径 */
export function filterNoteTreeByQuery(nodes: IMomoTreeNode[], query: string): IMomoTreeNode[] {
  const keyword = query.trim().toLowerCase();
  if (!keyword) {
    return nodes;
  }

  const walk = (list: IMomoTreeNode[]): IMomoTreeNode[] => {
    const result: IMomoTreeNode[] = [];

    for (const node of list) {
      const nameMatch = node.name.toLowerCase().includes(keyword);

      if (node.kind === 'file') {
        if (nameMatch) {
          result.push(node);
        }
        continue;
      }

      const filteredChildren = node.children?.length ? walk(node.children) : [];
      if (nameMatch || filteredChildren.length > 0) {
        result.push({
          ...node,
          children: nameMatch ? node.children : filteredChildren,
        });
      }
    }

    return result;
  };

  return walk(nodes);
}

/** 收集树中所有目录 id，用于搜索时自动展开 */
export function collectNoteFolderIds(nodes: IMomoTreeNode[]): string[] {
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
