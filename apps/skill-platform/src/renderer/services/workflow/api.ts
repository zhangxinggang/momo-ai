import type {
  DCreateWorkflow,
  DCreateWorkflowFolder,
  DUpdateWorkflow,
  DUpdateWorkflowFolder,
  IWorkflow,
  IWorkflowFolder,
} from '@/types/modules';

import { getWorkflowFolderIpc, getWorkflowIpc } from '../ipc';

export function isWorkflowAvailable(): boolean {
  return !!getWorkflowIpc();
}

export function isWorkflowFolderAvailable(): boolean {
  return !!getWorkflowFolderIpc()?.getAll;
}

export async function listWorkflows(): Promise<IWorkflow[]> {
  return getWorkflowIpc()?.getAll() ?? [];
}

export async function getWorkflow(id: string): Promise<IWorkflow | null> {
  return getWorkflowIpc()?.get(id) ?? null;
}

export async function createWorkflow(data: DCreateWorkflow): Promise<IWorkflow> {
  const api = getWorkflowIpc();
  if (!api?.create) {
    throw new Error('当前环境不支持工作流持久化（需桌面端）');
  }
  return api.create(data);
}

export async function updateWorkflow(id: string, data: DUpdateWorkflow): Promise<IWorkflow> {
  const api = getWorkflowIpc();
  if (!api?.update) {
    throw new Error('当前环境不支持工作流持久化（需桌面端）');
  }
  return api.update(id, data);
}

export async function deleteWorkflow(id: string): Promise<void> {
  const api = getWorkflowIpc();
  if (!api?.delete) {
    throw new Error('当前环境不支持工作流持久化（需桌面端）');
  }
  await api.delete(id);
}

export async function listWorkflowFolders(): Promise<IWorkflowFolder[]> {
  return getWorkflowFolderIpc()?.getAll() ?? [];
}

export async function createWorkflowFolder(data: DCreateWorkflowFolder): Promise<IWorkflowFolder> {
  const api = getWorkflowFolderIpc();
  if (!api?.create) {
    throw new Error('当前环境不支持工作流目录（需桌面端）');
  }
  return api.create(data);
}

export async function updateWorkflowFolder(
  id: string,
  data: DUpdateWorkflowFolder,
): Promise<IWorkflowFolder> {
  const api = getWorkflowFolderIpc();
  if (!api?.update) {
    throw new Error('当前环境不支持工作流目录（需桌面端）');
  }
  return api.update(id, data);
}

export async function deleteWorkflowFolder(id: string): Promise<void> {
  const api = getWorkflowFolderIpc();
  if (!api?.delete) {
    throw new Error('当前环境不支持工作流目录（需桌面端）');
  }
  await api.delete(id);
}

export async function updateWorkflowFolderOrders(
  updates: { id: string; order: number }[],
): Promise<void> {
  const api = getWorkflowFolderIpc();
  if (!api?.updateOrders) {
    throw new Error('当前环境不支持工作流目录（需桌面端）');
  }
  await api.updateOrders(updates);
}
