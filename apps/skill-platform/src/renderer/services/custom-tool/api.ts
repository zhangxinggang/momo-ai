import type {
  ICustomToolDocument,
  ICustomToolSaveInput,
  ICustomToolTreeNode,
} from '@/types/modules';
import type { IApiRequestConfig, IApiRequestResponse } from '@momo/api-request/core';

import { getAppApi } from '../app-api';
import { getCustomToolIpc } from '../ipc';

export async function listCustomToolTree(): Promise<ICustomToolTreeNode[]> {
  return (await getCustomToolIpc()?.listTree?.()) ?? [];
}

export async function readCustomTool(toolPath: string): Promise<ICustomToolDocument> {
  const api = getCustomToolIpc();
  if (!api?.readFile) throw new Error('当前环境不支持读取自定义工具');
  return api.readFile(toolPath);
}

export async function saveCustomTool(
  toolPath: string,
  input: ICustomToolSaveInput,
): Promise<ICustomToolDocument> {
  const api = getCustomToolIpc();
  if (!api?.writeFile) throw new Error('当前环境不支持保存自定义工具');
  return api.writeFile(toolPath, input);
}

export async function createCustomToolFolder(parentPath: string | null, name: string) {
  const api = getCustomToolIpc();
  if (!api?.createFolder) throw new Error('当前环境不支持工具目录');
  return api.createFolder(parentPath, name);
}

export async function createCustomTool(parentPath: string | null, name: string) {
  const api = getCustomToolIpc();
  if (!api?.createFile) throw new Error('当前环境不支持创建工具');
  return api.createFile(parentPath, name);
}

export async function renameCustomTool(nodePath: string, newName: string) {
  const api = getCustomToolIpc();
  if (!api?.rename) throw new Error('当前环境不支持工具重命名');
  return api.rename(nodePath, newName);
}

export async function deleteCustomTool(nodePath: string): Promise<void> {
  const api = getCustomToolIpc();
  if (!api?.delete) throw new Error('当前环境不支持删除工具');
  await api.delete(nodePath);
}

export async function moveCustomTool(sourcePath: string, targetParentPath: string | null) {
  const api = getCustomToolIpc();
  if (!api?.move) throw new Error('当前环境不支持移动工具');
  return api.move(sourcePath, targetParentPath);
}

export async function executeConfiguredApiRequest(
  config: IApiRequestConfig,
): Promise<IApiRequestResponse> {
  const api = getAppApi()?.apiRequest;
  if (!api?.execute) throw new Error('当前环境不支持接口请求');
  return api.execute(config);
}
