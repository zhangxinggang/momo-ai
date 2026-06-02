import type { IFolder, IWorkflow, IWorkflowFolder } from '@/types/modules';
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

/** 将工作流目录与工作流组装为 MomoTree 数据 */
export function buildWorkflowTree(
  folders: IWorkflowFolder[],
  workflows: IWorkflow[],
): IMomoTreeNode[] {
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

  for (const workflow of workflows) {
    const fileNode: IMomoTreeNode = {
      id: workflow.id,
      name: workflow.name,
      kind: 'file',
    };
    if (workflow.folderId && folderMap.has(workflow.folderId)) {
      folderMap.get(workflow.folderId)!.children!.push(fileNode);
    } else {
      roots.push(fileNode);
    }
  }

  return sortTreeNodes(roots);
}

/** 按关键词过滤工作流树 */
export function filterWorkflowTreeByQuery(nodes: IMomoTreeNode[], query: string): IMomoTreeNode[] {
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
export function collectWorkflowFolderIds(nodes: IMomoTreeNode[]): string[] {
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

/** 供目录工具函数使用的最小结构 */
export function toFolderLikeList(folders: IWorkflowFolder[]): IFolder[] {
  return folders.map((folder) => ({
    id: folder.id,
    name: folder.name,
    parentId: folder.parentId,
    order: folder.order,
    createdAt: new Date(folder.createdAt).toISOString(),
    updatedAt: new Date(folder.updatedAt).toISOString(),
  }));
}
