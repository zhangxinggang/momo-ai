import type {
  IFolder,
  IPromptBackupPayload,
  IPromptExportResult,
  IPromptImportResult,
} from '@/types/modules';

import type { FolderDB, PromptDB } from '../../database';

function collectFolderAncestors(
  folderId: string | null | undefined,
  folderMap: Map<string, IFolder>,
  collected: Map<string, IFolder>,
): void {
  if (!folderId) {
    return;
  }
  const folder = folderMap.get(folderId);
  if (!folder || collected.has(folder.id)) {
    return;
  }
  collected.set(folder.id, folder);
  collectFolderAncestors(folder.parentId, folderMap, collected);
}

export async function buildPromptBackupPayload(
  promptDb: PromptDB,
  folderDb: FolderDB,
  promptIds: string[],
): Promise<IPromptBackupPayload> {
  const allPrompts = await promptDb.getAll();
  const allFolders = await folderDb.getAll();
  const folderMap = new Map(allFolders.map((folder) => [folder.id, folder]));

  const selectedPrompts =
    promptIds.length > 0
      ? allPrompts.filter((prompt) => promptIds.includes(prompt.id))
      : allPrompts;

  const folderCollected = new Map<string, IFolder>();
  for (const prompt of selectedPrompts) {
    collectFolderAncestors(prompt.folderId, folderMap, folderCollected);
  }

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    folders: Array.from(folderCollected.values()),
    prompts: selectedPrompts,
  };
}

function sortFoldersByDepth(folders: IFolder[]): IFolder[] {
  const folderMap = new Map(folders.map((folder) => [folder.id, folder]));

  const getDepth = (folder: IFolder): number => {
    let depth = 0;
    let parentId = folder.parentId;
    while (parentId) {
      const parent = folderMap.get(parentId);
      if (!parent) {
        break;
      }
      depth += 1;
      parentId = parent.parentId;
    }
    return depth;
  };

  return [...folders].sort((left, right) => getDepth(left) - getDepth(right));
}

export async function importPromptBackupPayload(
  promptDb: PromptDB,
  folderDb: FolderDB,
  payload: IPromptBackupPayload,
): Promise<{ promptCount: number; folderCount: number }> {
  if (payload.version !== 1) {
    throw new Error('不支持的提示词备份版本');
  }

  const folders = sortFoldersByDepth(payload.folders ?? []);
  let folderCount = 0;
  for (const folder of folders) {
    await folderDb.insertFolderDirect(folder);
    folderCount += 1;
  }

  let promptCount = 0;
  for (const prompt of payload.prompts ?? []) {
    await promptDb.insertPromptDirect(prompt);
    promptCount += 1;
  }

  return { promptCount, folderCount };
}

export function parsePromptBackupJson(content: string): IPromptBackupPayload {
  const parsed = JSON.parse(content) as Partial<IPromptBackupPayload>;
  if (parsed.version !== 1 || !Array.isArray(parsed.prompts)) {
    throw new Error('提示词备份文件格式无效');
  }
  return {
    version: 1,
    exportedAt: parsed.exportedAt ?? new Date().toISOString(),
    folders: parsed.folders ?? [],
    prompts: parsed.prompts,
  };
}

export type IPromptBackupExportOptions = {
  promptDb: PromptDB;
  folderDb: FolderDB;
  promptIds: string[];
  saveToPath: (payload: IPromptBackupPayload) => Promise<IPromptExportResult>;
};

export async function exportPromptBackup(
  options: IPromptBackupExportOptions,
): Promise<IPromptExportResult> {
  const payload = await buildPromptBackupPayload(
    options.promptDb,
    options.folderDb,
    options.promptIds,
  );
  if (payload.prompts.length === 0) {
    return { canceled: true, promptCount: 0, folderCount: 0 };
  }
  const result = await options.saveToPath(payload);
  return {
    ...result,
    promptCount: payload.prompts.length,
    folderCount: payload.folders.length,
  };
}

export type IPromptBackupImportOptions = {
  promptDb: PromptDB;
  folderDb: FolderDB;
  content: string;
};

export async function importPromptBackup(
  options: IPromptBackupImportOptions,
): Promise<IPromptImportResult> {
  const payload = parsePromptBackupJson(options.content);
  const imported = await importPromptBackupPayload(options.promptDb, options.folderDb, payload);
  return {
    canceled: false,
    ...imported,
  };
}
