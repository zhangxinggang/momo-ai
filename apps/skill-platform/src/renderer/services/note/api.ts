import type { ENoteType, INoteTreeNode } from '@/types/modules';

import { getNoteIpc } from '../ipc';

function getNoteApi() {
  return getNoteIpc();
}

export function isNoteApiAvailable(): boolean {
  return !!getNoteIpc();
}

export async function bootstrapCursorRules(): Promise<void> {
  const api = getNoteApi();
  if (api?.bootstrapCursorRules) {
    await api.bootstrapCursorRules();
  }
}

export async function listNoteTree(): Promise<INoteTreeNode[]> {
  const api = getNoteApi();
  if (!api?.listTree) {
    return [];
  }
  return api.listTree();
}

export async function readNoteFile(filePath: string): Promise<string | { content?: string }> {
  const api = getNoteApi();
  if (!api?.readFile) {
    throw new Error('当前环境不支持笔记读写');
  }
  return api.readFile(filePath);
}

export async function writeNoteFile(filePath: string, content: string): Promise<void> {
  const api = getNoteApi();
  if (!api?.writeFile) {
    throw new Error('当前环境不支持笔记读写');
  }
  await api.writeFile(filePath, content);
}

export async function createNoteFolder(parentPath: string | null, name: string): Promise<void> {
  const api = getNoteApi();
  if (!api?.createFolder) {
    throw new Error('当前环境不支持笔记目录');
  }
  await api.createFolder(parentPath, name);
}

export async function createNoteFile(
  parentPath: string | null,
  name: string,
  noteType?: ENoteType,
): Promise<{ id: string } | string> {
  const api = getNoteApi();
  if (!api?.createFile) {
    throw new Error('当前环境不支持笔记文件');
  }
  return api.createFile(parentPath, name, noteType);
}

export async function renameNote(
  nodePath: string,
  newName: string,
): Promise<{ id: string; kind: string }> {
  const api = getNoteApi();
  if (!api?.rename) {
    throw new Error('当前环境不支持笔记重命名');
  }
  return api.rename(nodePath, newName);
}

export async function deleteNote(nodePath: string): Promise<void> {
  const api = getNoteApi();
  if (!api?.delete) {
    throw new Error('当前环境不支持笔记删除');
  }
  await api.delete(nodePath);
}

export async function moveNote(
  sourcePath: string,
  targetParentPath: string | null,
): Promise<{ id: string }> {
  const api = getNoteApi();
  if (!api?.move) {
    throw new Error('当前环境不支持笔记移动');
  }
  return api.move(sourcePath, targetParentPath);
}

export async function copyNoteFile(filePath: string): Promise<{ id: string }> {
  const api = getNoteApi();
  if (!api?.copyFile) {
    throw new Error('当前环境不支持笔记复制');
  }
  return api.copyFile(filePath);
}
