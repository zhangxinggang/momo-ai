import type { IPromptVersion } from '@/types/modules';
import type {
  ISkill,
  ISkillFileSnapshot,
  ISkillLocalFileEntry,
  ISkillVersion,
} from '@/types/modules/skill';
import type {
  EExportScope,
  IDatabaseBackup,
  IImportSkippedStats,
  IParsedBackup,
  IPromptHubFile,
} from './backup-format';
import {
  DB_BACKUP_VERSION,
  createEmptySkippedStats,
  hasMeaningfulBackupContent,
  normalizeImportedBackup,
  parsePromptHubBackupFile,
  parsePromptHubBackupFileContent,
} from './backup-format';
import { clearDatabase, getAllFolders, getAllPrompts, getDatabase } from './index';
export type {
  EExportScope,
  IDatabaseBackup,
  IImportSkippedStats,
  IParsedBackup,
  IPromptHubFile,
} from './backup-format';

// ── settings / AI 快照：从本地存储抽取与恢复（原 settings-snapshot 模块并入） ──
const PRIMARY_SETTINGS_KEY = 'prompthub-settings';
const LEGACY_SETTINGS_KEY = 'settings-storage';

export interface IAIConfigSnapshot {
  aiModels?: any[];
  scenarioModelDefaults?: Record<string, string>;
  aiProvider?: string;
  aiApiProtocol?: string;
  aiApiKey?: string;
  aiApiUrl?: string;
  aiModel?: string;
}

export interface ISettingsStateSnapshot {
  state?: any;
  settingsUpdatedAt?: string;
}

function readStoredSettings():
  | {
      key: string;
      data: { state?: any; version?: number };
    }
  | undefined {
  try {
    const primary = localStorage.getItem(PRIMARY_SETTINGS_KEY);
    const legacy = localStorage.getItem(LEGACY_SETTINGS_KEY);
    const raw = primary || legacy;
    if (!raw) return undefined;

    return {
      key: primary ? PRIMARY_SETTINGS_KEY : LEGACY_SETTINGS_KEY,
      data: JSON.parse(raw),
    };
  } catch (error) {
    console.warn('Failed to read stored settings:', error);
    return undefined;
  }
}

function getAiConfigSnapshot(options?: {
  includeRootApiKey?: boolean;
}): IAIConfigSnapshot | undefined {
  const stored = readStoredSettings();
  const state = stored?.data?.state;
  if (!state) return undefined;

  try {
    const filteredModels = (state.aiModels || []).map((model: any) => {
      const { apiKey, ...rest } = model || {};
      return rest;
    });

    return {
      aiModels: filteredModels,
      scenarioModelDefaults: state.scenarioModelDefaults || {},
      aiProvider: state.aiProvider,
      aiApiProtocol: state.aiApiProtocol,
      ...(options?.includeRootApiKey ? { aiApiKey: state.aiApiKey } : {}),
      aiApiUrl: state.aiApiUrl,
      aiModel: state.aiModel,
    };
  } catch (error) {
    console.warn('Failed to build AI config snapshot:', error);
    return undefined;
  }
}

function getSettingsStateSnapshot(options?: {
  excludeFields?: readonly string[];
  updatedAt?: string;
}): ISettingsStateSnapshot | undefined {
  const stored = readStoredSettings();
  const state = stored?.data?.state;
  if (!state) return undefined;

  try {
    const filteredState = { ...state };
    for (const field of options?.excludeFields || []) {
      delete filteredState[field];
    }

    return {
      state: filteredState,
      settingsUpdatedAt: options?.updatedAt ?? state.settingsUpdatedAt,
    };
  } catch (error) {
    console.warn('Failed to build settings snapshot:', error);
    return undefined;
  }
}

function restoreAiConfigSnapshot(aiConfig: IAIConfigSnapshot | undefined): void {
  if (!aiConfig) return;

  try {
    const stored = readStoredSettings();
    const targetKey = stored?.key || PRIMARY_SETTINGS_KEY;
    const data = stored?.data || { state: {} };
    if (!data.state) data.state = {};

    if (aiConfig.aiModels) data.state.aiModels = aiConfig.aiModels;
    if (aiConfig.scenarioModelDefaults) {
      data.state.scenarioModelDefaults = aiConfig.scenarioModelDefaults;
    }
    if (aiConfig.aiProvider) data.state.aiProvider = aiConfig.aiProvider;
    if (aiConfig.aiApiProtocol) data.state.aiApiProtocol = aiConfig.aiApiProtocol;
    if (aiConfig.aiApiKey) data.state.aiApiKey = aiConfig.aiApiKey;
    if (aiConfig.aiApiUrl) data.state.aiApiUrl = aiConfig.aiApiUrl;
    if (aiConfig.aiModel) data.state.aiModel = aiConfig.aiModel;

    localStorage.setItem(targetKey, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to restore AI config snapshot:', error);
  }
}

function restoreSettingsStateSnapshot(
  snapshot: ISettingsStateSnapshot | undefined,
  options?: { preserveLocalFields?: readonly string[] },
): void {
  if (!snapshot?.state) return;

  try {
    const stored = readStoredSettings();
    const targetKey = stored?.key || PRIMARY_SETTINGS_KEY;
    const currentState = stored?.data?.state || {};
    const nextState = { ...snapshot.state };

    for (const field of options?.preserveLocalFields || []) {
      if (currentState[field] !== undefined) {
        nextState[field] = currentState[field];
      }
    }

    localStorage.setItem(
      targetKey,
      JSON.stringify({
        ...(stored?.data || {}),
        state: nextState,
      }),
    );
  } catch (error) {
    console.warn('Failed to restore settings state snapshot:', error);
  }
}

const DB_VERSION = DB_BACKUP_VERSION;
const VERSION_STORE = 'versions';
const IMAGE_BATCH_SIZE = 10;
const IMAGE_MAX_SIZE_BYTES = 10 * 1024 * 1024;
const IMAGE_MAX_COUNT = 500;
const VIDEO_BATCH_SIZE = 5;
const VIDEO_MAX_SIZE_BYTES = 100 * 1024 * 1024;
const VIDEO_MAX_COUNT = 100;
const SKILL_CONCURRENCY = 5;

interface IMediaCollectionLimits {
  maxCount?: number;
  maxSizeBytes?: number;
}

async function processBatched<T, R>(
  items: T[],
  batchSize: number,
  processor: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }
  return results;
}

async function collectImages(
  _prompts: Awaited<ReturnType<typeof getAllPrompts>>,
  _limits?: IMediaCollectionLimits,
): Promise<{ [fileName: string]: string }> {
  return {};
}

async function collectVideos(
  _prompts: Awaited<ReturnType<typeof getAllPrompts>>,
  _limits?: IMediaCollectionLimits,
): Promise<{ [fileName: string]: string }> {
  return {};
}

async function collectSkillData(): Promise<{
  skills: ISkill[];
  skillVersions: ISkillVersion[];
  skillFiles: { [skillId: string]: ISkillFileSnapshot[] };
}> {
  const skills: ISkill[] = [];
  const skillVersions: ISkillVersion[] = [];
  const skillFiles: { [skillId: string]: ISkillFileSnapshot[] } = {};
  const readFailures: string[] = [];
  const skillApi = window.api?.skill;

  if (!skillApi?.getAll) {
    return { skills, skillVersions, skillFiles };
  }

  let allSkills: ISkill[] = [];
  try {
    allSkills = (await skillApi.getAll()) ?? [];
  } catch (error) {
    throw new Error(
      `Backup export failed to list skills: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  skills.push(...allSkills);

  await processBatched(allSkills, SKILL_CONCURRENCY, async (skill) => {
    const [versionsResult, filesResult] = await Promise.allSettled([
      skillApi.versionGetAll?.(skill.id),
      skillApi.readLocalFiles?.(skill.id),
    ]);

    if (versionsResult.status === 'fulfilled' && versionsResult.value) {
      skillVersions.push(...versionsResult.value);
    } else if (versionsResult.status === 'rejected') {
      readFailures.push(`skill versions ${skill.name}`);
      console.warn(`Failed to get versions for skill ${skill.name}:`, versionsResult.reason);
    }

    if (filesResult.status === 'fulfilled' && filesResult.value) {
      const fileSnapshots: ISkillFileSnapshot[] = (filesResult.value as ISkillLocalFileEntry[])
        .filter((file) => !file.isDirectory)
        .map((file) => ({
          relativePath: file.path,
          content: file.content,
        }));

      if (fileSnapshots.length > 0) {
        skillFiles[skill.id] = fileSnapshots;
      }
    } else if (filesResult.status === 'rejected') {
      readFailures.push(`skill files ${skill.name}`);
      console.warn(`Failed to read local files for skill ${skill.name}:`, filesResult.reason);
    }
  });

  if (readFailures.length > 0) {
    const preview = readFailures.slice(0, 5).join(', ');
    throw new Error(
      `Backup export failed to read ${readFailures.length} skill records: ${preview}`,
    );
  }

  return { skills, skillVersions, skillFiles };
}

function triggerBlobDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

async function gunzipToText(blob: Blob): Promise<string> {
  const stream = blob.stream().pipeThrough(new DecompressionStream('gzip'));
  return new Response(stream).text();
}

export interface IImportPreviewSummary {
  kind: IPromptHubFile['kind'] | 'legacy-payload';
  exportedAt: string;
  counts: {
    prompts: number;
    folders: number;
    versions: number;
    skills: number;
    skillVersions: number;
    skillFiles: number;
    images: number;
    videos: number;
  };
  skipped: IImportSkippedStats;
}

async function unzipExportToText(file: File): Promise<string> {
  const { unzipSync } = await import('fflate');
  const buffer = await file.arrayBuffer();
  const unzipped = unzipSync(new Uint8Array(buffer));
  const jsonEntry = unzipped['import-with-prompthub.json'];
  if (!jsonEntry) {
    throw new Error(
      'ZIP 文件中缺少 import-with-prompthub.json，无法导入。请使用 PromptHub 导出的 ZIP 文件。',
    );
  }
  return new TextDecoder().decode(jsonEntry);
}

async function readBackupFileText(file: File): Promise<string> {
  if (file.name.endsWith('.gz')) return gunzipToText(file);
  if (file.name.endsWith('.zip')) return unzipExportToText(file);
  return file.text();
}

function parsePromptHubFileKind(text: string): IImportPreviewSummary['kind'] {
  const parsed = JSON.parse(text) as unknown;
  if (
    parsed &&
    typeof parsed === 'object' &&
    'kind' in parsed &&
    (parsed.kind === 'prompthub-backup' || parsed.kind === 'prompthub-export')
  ) {
    return parsed.kind;
  }
  return 'legacy-payload';
}

export async function previewImportFile(
  file: File,
): Promise<{ backup: IDatabaseBackup; summary: IImportPreviewSummary }> {
  const text = await readBackupFileText(file);
  const kind = parsePromptHubFileKind(text);
  const parsed: IParsedBackup = parsePromptHubBackupFile(text);
  const { backup, skipped } = parsed;

  const summary: IImportPreviewSummary = {
    kind,
    exportedAt: backup.exportedAt,
    counts: {
      prompts: backup.prompts.length,
      folders: backup.folders.length,
      versions: backup.versions.length,
      skills: backup.skills?.length ?? 0,
      skillVersions: backup.skillVersions?.length ?? 0,
      skillFiles: Object.values(backup.skillFiles ?? {}).reduce(
        (count, files) => count + files.length,
        0,
      ),
      images: Object.keys(backup.images ?? {}).length,
      videos: Object.keys(backup.videos ?? {}).length,
    },
    skipped,
  };

  return { backup, summary };
}

async function getAllPromptVersions(): Promise<IPromptVersion[]> {
  if (window.api?.version?.getAll) {
    const prompts = await getAllPrompts();
    const versionLists = await Promise.all(
      prompts.map(async (prompt) => {
        const versions = await window.api?.version?.getAll?.(prompt.id);
        return versions ?? [];
      }),
    );
    return versionLists.flat();
  }

  const database = await getDatabase();
  return new Promise<IPromptVersion[]>((resolve, reject) => {
    const transaction = database.transaction(VERSION_STORE, 'readonly');
    const store = transaction.objectStore(VERSION_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function importDatabaseViaMainProcess(normalizedBackup: IDatabaseBackup): Promise<boolean> {
  if (
    !window.api?.prompt?.getAll ||
    !window.api?.prompt?.delete ||
    !window.api?.prompt?.insertDirect ||
    !window.api?.folder?.getAll ||
    !window.api?.folder?.delete ||
    !window.api?.folder?.insertDirect ||
    !window.api?.version?.insertDirect
  ) {
    return false;
  }

  const existingPrompts = await getAllPrompts();
  for (const prompt of existingPrompts) {
    await window.api.prompt.delete(prompt.id);
  }

  const existingFolders = await getAllFolders();
  for (const folder of existingFolders) {
    await window.api.folder.delete(folder.id);
  }

  for (const folder of normalizedBackup.folders) {
    await window.api.folder.insertDirect(folder);
  }

  for (const prompt of normalizedBackup.prompts) {
    await window.api.prompt.insertDirect(prompt);
  }

  for (const version of normalizedBackup.versions) {
    await window.api.version.insertDirect(version);
  }

  await window.api.prompt.syncWorkspace?.();
  return true;
}

export async function exportDatabase(options?: {
  skipVideoContent?: boolean;
  limitMedia?: boolean;
}): Promise<IDatabaseBackup> {
  const [prompts, folders, versions] = await Promise.all([
    getAllPrompts(),
    getAllFolders(),
    getAllPromptVersions(),
  ]);

  const imageLimits = options?.limitMedia
    ? {
        maxCount: IMAGE_MAX_COUNT,
        maxSizeBytes: IMAGE_MAX_SIZE_BYTES,
      }
    : undefined;
  const videoLimits = options?.limitMedia
    ? {
        maxCount: VIDEO_MAX_COUNT,
        maxSizeBytes: VIDEO_MAX_SIZE_BYTES,
      }
    : undefined;

  const [images, videos, skillData] = await Promise.all([
    collectImages(prompts, imageLimits),
    options?.skipVideoContent ? Promise.resolve(undefined) : collectVideos(prompts, videoLimits),
    collectSkillData(),
  ]);

  const settingsSnapshot = getSettingsStateSnapshot({
    updatedAt: new Date().toISOString(),
  });

  return {
    version: DB_VERSION,
    exportedAt: new Date().toISOString(),
    prompts,
    folders,
    versions,
    images,
    videos,
    aiConfig: getAiConfigSnapshot({ includeRootApiKey: true }),
    settings: settingsSnapshot ? { state: settingsSnapshot.state } : undefined,
    settingsUpdatedAt: settingsSnapshot?.settingsUpdatedAt,
    skills: skillData.skills.length > 0 ? skillData.skills : undefined,
    skillVersions: skillData.skillVersions.length > 0 ? skillData.skillVersions : undefined,
    skillFiles: Object.keys(skillData.skillFiles).length > 0 ? skillData.skillFiles : undefined,
  };
}

export async function importDatabase(backup: IDatabaseBackup): Promise<void> {
  const normalizedBackup = normalizeImportedBackup(backup);

  // Never clear local data unless the imported payload has already passed the
  // same structural validation as file-based imports.
  parsePromptHubBackupFileContent(
    JSON.stringify({
      kind: 'prompthub-backup',
      exportedAt: normalizedBackup.exportedAt,
      payload: normalizedBackup,
    }),
  );

  if (!hasMeaningfulBackupContent(normalizedBackup)) {
    throw new Error(
      'Backup restore was blocked because the imported backup is empty. ' +
        'Refusing to overwrite current data with an empty payload.',
    );
  }

  const restoredSkillIdMap = new Map<string, string>();
  const restoredSkillsByName = new Map<string, ISkill>();
  const restoreFailures: string[] = [];
  const restoredViaMainProcess = await importDatabaseViaMainProcess(normalizedBackup);

  if (!restoredViaMainProcess) {
    const database = await getDatabase();

    await clearDatabase();

    const transaction = database.transaction(['prompts', 'folders', VERSION_STORE], 'readwrite');

    const promptStore = transaction.objectStore('prompts');
    const folderStore = transaction.objectStore('folders');
    const versionStore = transaction.objectStore(VERSION_STORE);

    for (const prompt of normalizedBackup.prompts) {
      promptStore.add(prompt);
    }

    for (const folder of normalizedBackup.folders) {
      folderStore.add(folder);
    }

    for (const version of normalizedBackup.versions) {
      versionStore.add(version);
    }

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  if (normalizedBackup.images) {
    for (const [fileName, base64] of Object.entries(normalizedBackup.images)) {
      try {
        await window.electron?.saveImageBase64?.(fileName, base64);
      } catch (error) {
        restoreFailures.push(`image ${fileName}`);
        console.warn(`Failed to restore image ${fileName}:`, error);
      }
    }
  }

  if (normalizedBackup.videos) {
    for (const [fileName, base64] of Object.entries(normalizedBackup.videos)) {
      try {
        await window.electron?.saveVideoBase64?.(fileName, base64);
      } catch (error) {
        restoreFailures.push(`video ${fileName}`);
        console.warn(`Failed to restore video ${fileName}:`, error);
      }
    }
  }

  if (normalizedBackup.aiConfig) {
    restoreAiConfigSnapshot(normalizedBackup.aiConfig);
  }

  if (normalizedBackup.settings) {
    restoreSettingsStateSnapshot(normalizedBackup.settings);
  }

  try {
    await window.api?.skill?.deleteAll();
  } catch (error) {
    restoreFailures.push('existing skills cleanup');
    console.warn('Failed to clear existing skills:', error);
  }

  if (normalizedBackup.skills && normalizedBackup.skills.length > 0) {
    for (const skill of normalizedBackup.skills) {
      if (!skill.name || typeof skill.name !== 'string' || !skill.name.trim()) {
        console.warn('Skipping skill from backup with missing name:', skill.id);
        continue;
      }

      try {
        const { id: _id, created_at: _createdAt, updated_at: _updatedAt, ...createData } = skill;
        const restoredSkill = await window.api?.skill?.create(
          {
            ...createData,
            is_favorite: createData.is_favorite ?? false,
            protocol_type: createData.protocol_type ?? 'skill',
            currentVersion: createData.currentVersion,
          },
          { skipInitialVersion: true },
        );
        if (restoredSkill) {
          restoredSkillIdMap.set(skill.id, restoredSkill.id);
          restoredSkillsByName.set(restoredSkill.name, restoredSkill);
        }
      } catch (error) {
        restoreFailures.push(`skill ${skill.name}`);
        console.warn(`Failed to restore skill ${skill.name}:`, error);
      }
    }
  }

  if (normalizedBackup.skillVersions && normalizedBackup.skillVersions.length > 0) {
    const nextCurrentVersionBySkillId = new Map<string, number>();

    for (const version of normalizedBackup.skillVersions) {
      try {
        const restoredSkillId = restoredSkillIdMap.get(version.skillId) ?? version.skillId;
        const remappedVersion: ISkillVersion = {
          ...version,
          skillId: restoredSkillId,
        };
        await window.api?.skill?.insertVersionDirect(remappedVersion);
        nextCurrentVersionBySkillId.set(
          restoredSkillId,
          Math.max(nextCurrentVersionBySkillId.get(restoredSkillId) ?? 1, version.version + 1),
        );
      } catch (error) {
        restoreFailures.push(`skill version ${version.skillId}@${version.version}`);
        console.warn(
          `Failed to restore skill version ${version.skillId}@${version.version}:`,
          error,
        );
      }
    }

    for (const [skillId, currentVersion] of nextCurrentVersionBySkillId) {
      try {
        await window.api?.skill?.update(skillId, { currentVersion });
      } catch (error) {
        restoreFailures.push(`skill current version ${skillId}`);
        console.warn(`Failed to restore current version for skill ${skillId}:`, error);
      }
    }
  }

  if (normalizedBackup.skillFiles) {
    for (const [skillKey, files] of Object.entries(normalizedBackup.skillFiles)) {
      const restoredSkillId =
        restoredSkillIdMap.get(skillKey) ?? restoredSkillsByName.get(skillKey)?.id ?? skillKey;

      for (const file of files) {
        try {
          await window.api?.skill?.writeLocalFile(restoredSkillId, file.relativePath, file.content);
        } catch (error) {
          restoreFailures.push(`skill file ${skillKey}/${file.relativePath}`);
          console.warn(`Failed to restore skill file ${skillKey}/${file.relativePath}:`, error);
        }
      }
    }
  }

  if (restoreFailures.length > 0) {
    const preview = restoreFailures.slice(0, 5).join(', ');
    throw new Error(
      `Backup restore completed with ${restoreFailures.length} file errors: ${preview}`,
    );
  }
}

export function getDatabaseInfo(): { name: string; description: string } {
  return {
    name: 'PromptHubDB',
    description: '数据存储在浏览器 IndexedDB 中，位于用户数据目录下',
  };
}

export async function downloadBackup(): Promise<void> {
  const backup = await exportDatabase();
  const file: IPromptHubFile = {
    kind: 'prompthub-backup',
    exportedAt: backup.exportedAt,
    payload: backup,
  };
  const blob = new Blob([JSON.stringify(file, null, 2)], {
    type: 'application/json',
  });
  triggerBlobDownload(blob, `prompthub-backup-${new Date().toISOString().split('T')[0]}.json`);
}

export async function downloadSelectiveExport(scope: EExportScope): Promise<void> {
  const normalized: Required<EExportScope> = {
    prompts: !!scope.prompts,
    folders: !!scope.folders,
    versions: !!scope.versions,
    images: !!scope.images,
    aiConfig: !!scope.aiConfig,
    settings: !!scope.settings,
    skills: !!scope.skills,
  };

  // Build the PromptHub JSON payload (used both as fallback download and embedded in ZIP for re-import)
  const payload: Partial<IDatabaseBackup> = {
    version: DB_VERSION,
    exportedAt: new Date().toISOString(),
  };

  if (normalized.prompts) payload.prompts = await getAllPrompts();
  if (normalized.folders) payload.folders = await getAllFolders();
  if (normalized.versions) payload.versions = await getAllPromptVersions();
  if (normalized.aiConfig) {
    payload.aiConfig = getAiConfigSnapshot({ includeRootApiKey: true });
  }
  if (normalized.settings) {
    const snap = getSettingsStateSnapshot({
      updatedAt: new Date().toISOString(),
    });
    if (snap) {
      payload.settings = { state: snap.state };
      payload.settingsUpdatedAt = snap.settingsUpdatedAt;
    }
  }
  // 选择性导出为 JSON（不再打包 ZIP）。

  const exportFile: IPromptHubFile = {
    kind: 'prompthub-export',
    exportedAt: payload.exportedAt || new Date().toISOString(),
    scope: normalized,
    payload,
  };
  const exportJson = JSON.stringify(exportFile, null, 2);

  // 已不再通过主进程打包 ZIP（data:exportZip 已移除），统一下载 JSON。
  const blob = new Blob([exportJson], { type: 'application/json' });
  triggerBlobDownload(blob, `prompthub-export-${new Date().toISOString().split('T')[0]}.json`);
}

export async function restoreFromFile(file: File): Promise<IImportSkippedStats> {
  const text = await readBackupFileText(file);
  const { backup, skipped } = parsePromptHubBackupFile(text);
  await importDatabase(backup);
  return skipped;
}

export async function restoreFromBackup(backup: IDatabaseBackup): Promise<IImportSkippedStats> {
  await importDatabase(backup);
  return createEmptySkippedStats();
}
