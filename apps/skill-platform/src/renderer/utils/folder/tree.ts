import type { IFolder } from '@/types/modules';

/** 树形文件夹节点 */
export interface IFolderTreeNode extends IFolder {
  children: IFolderTreeNode[];
  depth: number;
}

/** 将扁平文件夹列表转换为树形结构 */
export function buildFolderTree(folders: IFolder[]): IFolderTreeNode[] {
  const folderMap = new Map<string, IFolderTreeNode>();
  const rootNodes: IFolderTreeNode[] = [];

  folders.forEach((folder) => {
    folderMap.set(folder.id, { ...folder, children: [], depth: 0 });
  });

  folders.forEach((folder) => {
    const node = folderMap.get(folder.id)!;
    if (folder.parentId && folderMap.has(folder.parentId)) {
      const parent = folderMap.get(folder.parentId)!;
      parent.children.push(node);
    } else {
      rootNodes.push(node);
    }
  });

  function setDepth(nodes: IFolderTreeNode[], depth: number, visited: Set<string>) {
    nodes.forEach((node) => {
      if (visited.has(node.id)) {
        return;
      }
      visited.add(node.id);
      node.depth = depth;
      node.children.sort((a, b) => a.order - b.order);
      setDepth(node.children, depth + 1, visited);
    });
  }
  rootNodes.sort((a, b) => a.order - b.order);
  setDepth(rootNodes, 0, new Set());

  return rootNodes;
}

/** 获取根级文件夹（没有 parentId 的） */
export function getRootFolders(folders: IFolder[]): IFolder[] {
  return folders.filter((f) => !f.parentId).sort((a, b) => a.order - b.order);
}

/** 获取指定文件夹的子文件夹 */
export function getChildFolders(folders: IFolder[], parentId: string): IFolder[] {
  return folders.filter((f) => f.parentId === parentId).sort((a, b) => a.order - b.order);
}

/** 获取文件夹的完整路径（用于面包屑导航） */
export function getFolderPath(folders: IFolder[], folderId: string): IFolder[] {
  const path: IFolder[] = [];
  const visited = new Set<string>();
  let current = folders.find((f) => f.id === folderId);

  while (current) {
    if (visited.has(current.id)) {
      break;
    }
    visited.add(current.id);
    path.unshift(current);
    current = current.parentId ? folders.find((f) => f.id === current!.parentId) : undefined;
  }

  return path;
}

/** 获取文件夹的深度（0 = 根级） */
export function getFolderDepth(folders: IFolder[], folderId: string): number {
  return getFolderPath(folders, folderId).length - 1;
}

/** 获取文件夹的所有后代 ID（用于防止循环引用） */
export function getAllDescendantIds(folders: IFolder[], folderId: string): Set<string> {
  const descendants = new Set<string>();

  function collectDescendants(parentId: string) {
    folders.forEach((folder) => {
      if (folder.parentId === parentId && !descendants.has(folder.id)) {
        descendants.add(folder.id);
        collectDescendants(folder.id);
      }
    });
  }

  collectDescendants(folderId);
  return descendants;
}

/** 获取文件夹子树的最大相对深度（用于嵌套限制） */
export function getMaxDescendantDepth(folders: IFolder[], folderId: string): number {
  let maxDepth = 0;
  const visited = new Set<string>();
  function walk(parentId: string, depth: number) {
    folders.forEach((folder) => {
      if (folder.parentId === parentId && !visited.has(folder.id)) {
        visited.add(folder.id);
        if (depth > maxDepth) {
          maxDepth = depth;
        }
        walk(folder.id, depth + 1);
      }
    });
  }
  walk(folderId, 1);
  return maxDepth;
}

/** 最大嵌套深度限制（根目录 + 一层子文件夹） */
export const MAX_FOLDER_DEPTH = 2;

/** 检查是否可以将文件夹设为某个父级（防止循环引用） */
export function canSetParent(
  folders: IFolder[],
  folderId: string,
  newParentId: string | undefined,
): boolean {
  if (!newParentId) {
    return true;
  }
  if (folderId === newParentId) {
    return false;
  }

  const descendants = getAllDescendantIds(folders, folderId);
  if (descendants.has(newParentId)) {
    return false;
  }

  const parentDepth = getFolderDepth(folders, newParentId);
  const maxDescendantDepth = getMaxDescendantDepth(folders, folderId);
  return parentDepth + 1 + maxDescendantDepth <= MAX_FOLDER_DEPTH - 1;
}

/** 检查是否可以在指定父级下创建新文件夹（深度限制） */
export function canCreateInParent(folders: IFolder[], parentId: string | undefined): boolean {
  if (!parentId) {
    return true;
  }
  const depth = getFolderDepth(folders, parentId);
  return depth < MAX_FOLDER_DEPTH - 1;
}
