import type { ICustomToolTreeNode, IReadCustomToolFileResult } from '@/types/modules';

import { getCustomToolIpc } from '../ipc';

function getCustomToolApi() {
  return getCustomToolIpc();
}

export function isCustomToolApiAvailable(): boolean {
  return !!getCustomToolIpc();
}

export async function listCustomToolTree(): Promise<ICustomToolTreeNode[]> {
  const api = getCustomToolApi();
  if (!api?.listTree) {
    return [];
  }
  return api.listTree();
}

export async function readCustomToolFile(filePath: string): Promise<IReadCustomToolFileResult> {
  const api = getCustomToolApi();
  if (!api?.readFile) {
    throw new Error('当前环境不支持工具读写');
  }
  return api.readFile(filePath);
}

export async function writeCustomToolFile(filePath: string, content: string): Promise<void> {
  const api = getCustomToolApi();
  if (!api?.writeFile) {
    throw new Error('当前环境不支持工具读写');
  }
  await api.writeFile(filePath, content);
}

export async function createCustomToolFolder(
  parentPath: string | null,
  name: string,
): Promise<void> {
  const api = getCustomToolApi();
  if (!api?.createFolder) {
    throw new Error('当前环境不支持工具目录');
  }
  await api.createFolder(parentPath, name);
}

/** 创建工具包（文件夹 + tool.json + index.html） */
export async function createCustomToolFile(
  parentPath: string | null,
  name: string,
): Promise<{ id: string; kind: string }> {
  const api = getCustomToolApi();
  if (!api?.createFile) {
    throw new Error('当前环境不支持创建工具');
  }
  return api.createFile(parentPath, name);
}

export async function renameCustomTool(
  nodePath: string,
  newName: string,
): Promise<{ id: string; kind: string }> {
  const api = getCustomToolApi();
  if (!api?.rename) {
    throw new Error('当前环境不支持工具重命名');
  }
  return api.rename(nodePath, newName);
}

export async function deleteCustomTool(nodePath: string): Promise<void> {
  const api = getCustomToolApi();
  if (!api?.delete) {
    throw new Error('当前环境不支持工具删除');
  }
  await api.delete(nodePath);
}

export async function moveCustomTool(
  sourcePath: string,
  targetParentPath: string | null,
): Promise<{ id: string }> {
  const api = getCustomToolApi();
  if (!api?.move) {
    throw new Error('当前环境不支持工具移动');
  }
  return api.move(sourcePath, targetParentPath);
}

export async function readSnapEditHtml(): Promise<string> {
  const api = getCustomToolApi();
  if (!api?.readSnapEditHtml) {
    throw new Error('无法加载 snapEdit');
  }
  return api.readSnapEditHtml();
}
