import type { IFolder, IPrompt } from '@/types/modules';
import type { IMomoTreeNode } from '@momo/tree';

function sortTreeNodes(nodes: IMomoTreeNode[]): IMomoTreeNode[] {
  return [...nodes]
    .sort((a, b) => {
      if (a.kind !== b.kind) {
        return a.kind === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    })
    .map((node) => ({
      ...node,
      children: node.children?.length ? sortTreeNodes(node.children) : undefined,
    }));
}

/** 将文件夹与提示词组装为 MomoTree 数据 */
export function buildPromptTree(folders: IFolder[], prompts: IPrompt[]): IMomoTreeNode[] {
  const folderMap = new Map<string, IMomoTreeNode>();
  const roots: IMomoTreeNode[] = [];

  for (const folder of folders) {
    folderMap.set(folder.id, {
      id: folder.id,
      name: folder.name,
      kind: 'folder',
      children: [],
    });
  }

  for (const folder of folders) {
    const node = folderMap.get(folder.id);
    if (!node) {
      continue;
    }
    if (folder.parentId && folderMap.has(folder.parentId)) {
      folderMap.get(folder.parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  }

  for (const prompt of prompts) {
    const fileNode: IMomoTreeNode = {
      id: prompt.id,
      name: prompt.title,
      kind: 'file',
    };
    if (prompt.folderId && folderMap.has(prompt.folderId)) {
      folderMap.get(prompt.folderId)!.children!.push(fileNode);
    } else {
      roots.push(fileNode);
    }
  }

  return sortTreeNodes(roots);
}

/** 按关键词过滤提示词树 */
export function filterPromptTreeByQuery(nodes: IMomoTreeNode[], query: string): IMomoTreeNode[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return nodes;
  }

  const walk = (list: IMomoTreeNode[]): IMomoTreeNode[] => {
    const result: IMomoTreeNode[] = [];
    for (const node of list) {
      if (node.kind === 'file') {
        if (node.name.toLowerCase().includes(q)) {
          result.push(node);
        }
        continue;
      }
      const children = node.children?.length ? walk(node.children) : [];
      if (node.name.toLowerCase().includes(q) || children.length > 0) {
        result.push({
          ...node,
          children: children.length ? children : undefined,
        });
      }
    }
    return result;
  };

  return walk(nodes);
}

/** 收集树中所有目录 id */
export function collectPromptFolderIds(nodes: IMomoTreeNode[]): string[] {
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
