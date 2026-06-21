import type { IFolder, IPrompt, IPromptVersion } from '@/types/modules';

import { getFolderIpc, getPromptIpc, getVersionIpc } from '../ipc';

export function isPromptPersistenceAvailable(): boolean {
  return !!getPromptIpc()?.getAll;
}

export function isFolderPersistenceAvailable(): boolean {
  return !!getFolderIpc()?.getAll;
}

export function isVersionPersistenceAvailable(): boolean {
  return !!getVersionIpc()?.getAll;
}

export async function ipcGetAllPrompts(): Promise<IPrompt[] | null> {
  const api = getPromptIpc();
  if (!api?.getAll) {
    return null;
  }
  return (await api.getAll()) ?? [];
}

export async function ipcGetPrompt(id: string): Promise<IPrompt | null | undefined> {
  const api = getPromptIpc();
  if (!api?.get) {
    return null;
  }
  return (await api.get(id)) ?? undefined;
}

export async function ipcCreatePrompt(
  data: Omit<IPrompt, 'id' | 'createdAt' | 'updatedAt' | 'version'>,
): Promise<IPrompt | null> {
  const api = getPromptIpc();
  if (!api?.create) {
    return null;
  }
  return api.create({
    title: data.title,
    systemPrompt: data.systemPrompt ?? undefined,
    systemPromptEn: data.systemPromptEn ?? undefined,
    userPrompt: data.userPrompt,
    userPromptEn: data.userPromptEn ?? undefined,
    variables: data.variables,
    tags: data.tags,
    folderId: data.folderId ?? undefined,
    source: data.source ?? undefined,
  });
}

export async function ipcUpdatePrompt(id: string, data: Partial<IPrompt>): Promise<IPrompt | null> {
  const api = getPromptIpc();
  if (!api?.update) {
    return null;
  }
  const updated = await api.update(id, {
    title: data.title,
    systemPrompt: data.systemPrompt ?? undefined,
    systemPromptEn: data.systemPromptEn ?? undefined,
    userPrompt: data.userPrompt,
    userPromptEn: data.userPromptEn ?? undefined,
    variables: data.variables,
    tags: data.tags,
    folderId: data.folderId ?? undefined,
    isFavorite: data.isFavorite,
    isPinned: data.isPinned,
    usageCount: data.usageCount,
    source: data.source ?? undefined,
    lastAiResponse: data.lastAiResponse ?? undefined,
  });
  if (!updated) {
    throw new Error(`IPrompt not found: ${id}`);
  }
  return updated;
}

export async function ipcDeletePrompt(id: string): Promise<boolean> {
  const api = getPromptIpc();
  if (!api?.delete) {
    return false;
  }
  await api.delete(id);
  return true;
}

export async function ipcMovePrompts(ids: string[], folderId: string): Promise<boolean> {
  const api = getPromptIpc();
  if (!api?.update) {
    return false;
  }
  await Promise.all(ids.map((id) => api.update(id, { folderId })));
  return true;
}

export async function ipcGetPromptVersions(promptId: string): Promise<IPromptVersion[] | null> {
  const api = getVersionIpc();
  if (!api?.getAll) {
    return null;
  }
  return (await api.getAll(promptId)) ?? [];
}

export async function ipcCreatePromptVersion(promptId: string): Promise<IPromptVersion | null> {
  const api = getVersionIpc();
  if (!api?.create) {
    return null;
  }
  const version = await api.create(promptId);
  if (!version) {
    throw new Error(`Failed to create version for prompt: ${promptId}`);
  }
  return version;
}

export async function ipcDeletePromptVersion(versionId: string): Promise<boolean> {
  const api = getVersionIpc();
  if (!api?.delete) {
    return false;
  }
  await api.delete(versionId);
  return true;
}

export async function ipcGetAllFolders(): Promise<IFolder[] | null> {
  const api = getFolderIpc();
  if (!api?.getAll) {
    return null;
  }
  return (await api.getAll()) ?? [];
}

export async function ipcCreateFolder(
  data: Omit<IFolder, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<IFolder | null> {
  const api = getFolderIpc();
  if (!api?.create) {
    return null;
  }
  return api.create({
    name: data.name,
    icon: data.icon,
    parentId: data.parentId,
    isPrivate: data.isPrivate,
    visibility: data.visibility,
  });
}

export async function ipcUpdateFolder(id: string, data: Partial<IFolder>): Promise<IFolder | null> {
  const api = getFolderIpc();
  if (!api?.update) {
    return null;
  }
  const updated = await api.update(id, {
    name: data.name,
    icon: data.icon,
    parentId: data.parentId,
    order: data.order,
    isPrivate: data.isPrivate,
    visibility: data.visibility,
  });
  if (!updated) {
    throw new Error(`Folder not found: ${id}`);
  }
  return updated;
}

export async function ipcDeleteFolder(id: string): Promise<boolean> {
  const api = getFolderIpc();
  if (!api?.delete) {
    return false;
  }
  await api.delete(id);
  return true;
}

export async function ipcUpdateFolderOrders(
  updates: { id: string; order: number }[],
): Promise<boolean> {
  const api = getFolderIpc();
  if (!api?.update) {
    return false;
  }
  await Promise.all(updates.map(({ id, order }) => api.update(id, { order })));
  return true;
}
