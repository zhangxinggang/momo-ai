import crypto from 'crypto';
import fsp from 'fs/promises';
import path from 'path';

import { getPlatformById, type ISkillPlatform } from '@/types/constants/platforms';
import { KNOWN_RULE_FILE_TEMPLATES } from '@/types/constants/rules';
import type {
  DCreateRuleProject,
  ERuleConflictResolutionStrategy,
  ERuleFileGroup,
  ERuleSyncStatus,
  ICustomRuleFileId,
  IKnownRuleFileId,
  IRuleBackupRecord,
  IRuleFileContent,
  IRuleFileDescriptor,
  IRuleFileId,
  IRuleRecord,
} from '@/types/modules/rules';

import { RuleDB } from '../../database/rule';

type CustomRuleFileId = ICustomRuleFileId;
type CreateRuleProjectInput = DCreateRuleProject;
type KnownRuleFileId = IKnownRuleFileId;
type RuleBackupRecord = IRuleBackupRecord;
type RuleConflictResolutionStrategy = ERuleConflictResolutionStrategy;
type RuleFileContent = IRuleFileContent;
type RuleFileDescriptor = IRuleFileDescriptor;
type RuleFileGroup = ERuleFileGroup;
type RuleFileId = IRuleFileId;
type RuleRecord = IRuleRecord;
type RuleSyncStatus = ERuleSyncStatus;
type SkillPlatform = ISkillPlatform;

const RULE_META_FILE_NAME = '_rule.json';

type ProjectRuleId = `project:${string}`;

export interface ExtraGlobalRuleTemplate {
  id: CustomRuleFileId;
  platformId: RuleFileDescriptor['platformId'];
  platformName: string;
  platformIcon: string;
  platformDescription: string;
  name: string;
  description: string;
  group: RuleFileGroup;
}

interface ImportRuleBackupRecordsOptions {
  replace?: boolean;
}

interface StoredRuleMeta {
  id: RuleFileId;
  scope: 'global' | 'project';
  platformId: RuleFileDescriptor['platformId'];
  platformName: string;
  platformIcon: string;
  platformDescription: string;
  canonicalFileName: string;
  description: string;
  managedPath: string;
  targetPath: string;
  projectRootPath?: string | null;
  syncStatus?: RuleSyncStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RulesWorkspaceServiceDeps {
  getRulesDir: () => string;
  createRuleDb: () => RuleDB;
  getPlatformGlobalRulePath: (platform: SkillPlatform) => string | null;
  getPlatformRootDir: (platform: SkillPlatform) => string;
  getExtraGlobalRuleTemplates?: () => ExtraGlobalRuleTemplate[];
  getExtraGlobalRuleTargetPath?: (template: ExtraGlobalRuleTemplate) => string;
}

export interface RulesWorkspaceService {
  listRuleDescriptors: () => Promise<RuleFileDescriptor[]>;
  listCachedRuleDescriptors: () => Promise<RuleFileDescriptor[]>;
  scanRuleDescriptors: () => Promise<RuleFileDescriptor[]>;
  getProjectMetaById: (ruleId: ProjectRuleId) => Promise<StoredRuleMeta | null>;
  resolveRuleMeta: (ruleId: RuleFileId) => Promise<StoredRuleMeta>;
  readRuleContent: (ruleId: RuleFileId) => Promise<RuleFileContent>;
  saveRuleContent: (ruleId: RuleFileId, content: string) => Promise<RuleFileContent>;
  resolveRuleConflict: (
    ruleId: RuleFileId,
    strategy: RuleConflictResolutionStrategy,
  ) => Promise<RuleFileContent>;
  createProjectRule: (input: CreateRuleProjectInput) => Promise<RuleFileDescriptor>;
  bootstrapRuleWorkspace: () => Promise<void>;
  removeProjectRule: (projectId: string) => Promise<void>;
  exportRuleBackupRecords: () => Promise<RuleBackupRecord[]>;
  importRuleBackupRecords: (
    records: RuleBackupRecord[],
    options?: ImportRuleBackupRecordsOptions,
  ) => Promise<void>;
}

function isProjectRuleFileId(ruleId: RuleFileId): ruleId is ProjectRuleId {
  return ruleId.startsWith('project:');
}

function isCustomRuleFileId(ruleId: RuleFileId): ruleId is CustomRuleFileId {
  return ruleId.startsWith('custom:');
}

function slugify(input: string | null | undefined): string {
  const normalized = (input ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || 'rule';
}

function hashContent(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function resolveDisplayedRuleFileName(canonicalFileName: string, targetPath: string): string {
  const targetFileName = path.basename(targetPath);
  return targetFileName || canonicalFileName;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fsp.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fsp.readFile(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeJsonFile(filePath: string, value: unknown): Promise<void> {
  await fsp.mkdir(path.dirname(filePath), { recursive: true });
  await fsp.writeFile(filePath, JSON.stringify(value, null, 2), 'utf-8');
}

function ruleGroupForKnownId(ruleId: RuleFileId): RuleFileGroup {
  if (isProjectRuleFileId(ruleId)) {
    return 'workspace';
  }

  if (isCustomRuleFileId(ruleId)) {
    return 'assistant';
  }

  return KNOWN_RULE_FILE_TEMPLATES[ruleId].group;
}

export function createRulesWorkspaceService(
  deps: RulesWorkspaceServiceDeps,
): RulesWorkspaceService {
  function getAllGlobalRuleTemplates(): Array<
    (typeof KNOWN_RULE_FILE_TEMPLATES)[KnownRuleFileId] | ExtraGlobalRuleTemplate
  > {
    return [
      ...Object.values(KNOWN_RULE_FILE_TEMPLATES),
      ...(deps.getExtraGlobalRuleTemplates?.() ?? []),
    ];
  }

  function getActiveCustomRuleIds(): Set<CustomRuleFileId> {
    return new Set((deps.getExtraGlobalRuleTemplates?.() ?? []).map((template) => template.id));
  }

  function getRuleDb(): RuleDB {
    return deps.createRuleDb();
  }

  function getRuleProjectsRoot(): string {
    return path.join(deps.getRulesDir(), 'projects');
  }

  function getRuleMetaPath(managedPath: string): string {
    return path.join(path.dirname(managedPath), RULE_META_FILE_NAME);
  }

  function getManagedPlatformRulePath(ruleId: KnownRuleFileId): string {
    const template = KNOWN_RULE_FILE_TEMPLATES[ruleId];
    const platform = getPlatformById(template.platformId);
    if (!platform) {
      throw new Error(`未知规则平台: ${template.platformId}`);
    }

    const rulePath = deps.getPlatformGlobalRulePath(platform);
    if (!rulePath) {
      throw new Error(`平台 ${template.platformId} 未定义规则文件路径`);
    }

    return rulePath;
  }

  function getManagedCustomRulePath(template: ExtraGlobalRuleTemplate): string {
    return path.join(deps.getRulesDir(), 'global', template.platformId, template.name);
  }

  function getManagedCopyPathForGlobal(ruleId: KnownRuleFileId): string {
    const template = KNOWN_RULE_FILE_TEMPLATES[ruleId];
    return path.join(deps.getRulesDir(), 'global', template.platformId, template.name);
  }

  function buildGlobalMeta(ruleId: KnownRuleFileId): StoredRuleMeta {
    const template = KNOWN_RULE_FILE_TEMPLATES[ruleId];
    return {
      id: ruleId,
      scope: 'global',
      platformId: template.platformId,
      platformName: template.platformName,
      platformIcon: template.platformIcon,
      platformDescription: template.platformDescription,
      canonicalFileName: template.name,
      description: template.description,
      managedPath: getManagedCopyPathForGlobal(ruleId),
      targetPath: getManagedPlatformRulePath(ruleId),
      syncStatus: 'target-missing',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  function buildCustomGlobalMeta(template: ExtraGlobalRuleTemplate): StoredRuleMeta {
    const targetPath =
      deps.getExtraGlobalRuleTargetPath?.(template) ?? getManagedCustomRulePath(template);
    return {
      id: template.id,
      scope: 'global',
      platformId: template.platformId,
      platformName: template.platformName,
      platformIcon: template.platformIcon,
      platformDescription: template.platformDescription,
      canonicalFileName: template.name,
      description: template.description,
      managedPath: getManagedCustomRulePath(template),
      targetPath,
      syncStatus: 'target-missing',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async function writeManagedRule(meta: StoredRuleMeta, content: string): Promise<void> {
    await fsp.mkdir(path.dirname(meta.managedPath), { recursive: true });
    await fsp.writeFile(meta.managedPath, content, 'utf-8');
  }

  async function writeTargetRule(meta: StoredRuleMeta, content: string): Promise<RuleSyncStatus> {
    try {
      await fsp.mkdir(path.dirname(meta.targetPath), { recursive: true });
      await fsp.writeFile(meta.targetPath, content, 'utf-8');
      return 'synced';
    } catch {
      return 'sync-error';
    }
  }

  async function readStoredMeta(metaPath: string): Promise<StoredRuleMeta | null> {
    return readJsonFile<StoredRuleMeta>(metaPath);
  }

  async function writeMeta(meta: StoredRuleMeta): Promise<void> {
    await writeJsonFile(getRuleMetaPath(meta.managedPath), meta);
  }

  async function syncStatusForMeta(meta: StoredRuleMeta): Promise<RuleSyncStatus> {
    if (!(await fileExists(meta.targetPath))) {
      return 'target-missing';
    }

    try {
      const managedExists = await fileExists(meta.managedPath);
      const [managedContent, targetContent] = await Promise.all([
        managedExists ? fsp.readFile(meta.managedPath, 'utf-8') : Promise.resolve(''),
        fsp.readFile(meta.targetPath, 'utf-8'),
      ]);

      return hashContent(managedContent) === hashContent(targetContent) ? 'synced' : 'out-of-sync';
    } catch {
      return 'sync-error';
    }
  }

  async function buildDescriptor(meta: StoredRuleMeta): Promise<RuleFileDescriptor> {
    const exists = await fileExists(meta.targetPath);
    return {
      id: meta.id,
      platformId: meta.platformId,
      platformName: meta.platformName,
      platformIcon: meta.platformIcon,
      platformDescription: meta.platformDescription,
      name: resolveDisplayedRuleFileName(meta.canonicalFileName, meta.targetPath),
      description: meta.description,
      path: meta.targetPath,
      targetPath: meta.targetPath,
      managedPath: meta.managedPath,
      projectRootPath: meta.projectRootPath ?? null,
      exists,
      group: meta.scope === 'project' ? 'workspace' : ruleGroupForKnownId(meta.id),
      syncStatus: await syncStatusForMeta(meta),
    };
  }

  function descriptorFromRuleRecord(record: RuleRecord): RuleFileDescriptor {
    return {
      id: record.id,
      platformId: record.platformId,
      platformName: record.platformName,
      platformIcon: record.platformIcon,
      platformDescription: record.platformDescription,
      name: resolveDisplayedRuleFileName(record.canonicalFileName, record.targetPath),
      description: record.description,
      path: record.targetPath,
      targetPath: record.targetPath,
      managedPath: record.managedPath,
      projectRootPath: record.projectRootPath ?? null,
      exists: record.syncStatus !== 'target-missing',
      group: record.scope === 'project' ? 'workspace' : ruleGroupForKnownId(record.id),
      syncStatus: record.syncStatus,
    };
  }

  function toRuleRecord(
    meta: StoredRuleMeta,
    currentVersion: number,
    contentHash: string,
  ): RuleRecord {
    return {
      id: meta.id,
      scope: meta.scope,
      platformId: meta.platformId,
      platformName: meta.platformName,
      platformIcon: meta.platformIcon,
      platformDescription: meta.platformDescription,
      canonicalFileName: meta.canonicalFileName,
      description: meta.description,
      managedPath: meta.managedPath,
      targetPath: meta.targetPath,
      projectRootPath: meta.projectRootPath ?? null,
      syncStatus: meta.syncStatus ?? 'target-missing',
      currentVersion,
      contentHash,
      createdAt: meta.createdAt,
      updatedAt: meta.updatedAt,
    };
  }

  async function syncRuleIndex(meta: StoredRuleMeta, content?: string): Promise<void> {
    const db = getRuleDb();
    const resolvedContent =
      content ??
      ((await fileExists(meta.managedPath)) ? await fsp.readFile(meta.managedPath, 'utf-8') : '');
    db.upsert(toRuleRecord(meta, 0, hashContent(resolvedContent)));
  }

  async function ensureGlobalRuleMaterialized(
    ruleId: KnownRuleFileId | CustomRuleFileId,
  ): Promise<StoredRuleMeta> {
    const customTemplate = deps
      .getExtraGlobalRuleTemplates?.()
      .find((template) => template.id === ruleId);
    const baseMeta = customTemplate
      ? buildCustomGlobalMeta(customTemplate)
      : buildGlobalMeta(ruleId as KnownRuleFileId);
    const metaPath = getRuleMetaPath(baseMeta.managedPath);
    const existingMeta = await readStoredMeta(metaPath);
    const meta = existingMeta
      ? {
          ...existingMeta,
          targetPath: baseMeta.targetPath,
          platformName: baseMeta.platformName,
          platformIcon: baseMeta.platformIcon,
          platformDescription: baseMeta.platformDescription,
          canonicalFileName: baseMeta.canonicalFileName,
          description: baseMeta.description,
        }
      : baseMeta;

    if (!(await fileExists(meta.managedPath))) {
      const targetExists = await fileExists(meta.targetPath);
      if (targetExists) {
        const importedContent = await fsp.readFile(meta.targetPath, 'utf-8');
        await writeManagedRule(meta, importedContent);
      }
    }

    meta.syncStatus = await syncStatusForMeta(meta);
    await writeMeta(meta);
    await syncRuleIndex(meta);
    return meta;
  }

  async function listProjectMetaPaths(): Promise<string[]> {
    const root = getRuleProjectsRoot();
    if (!(await fileExists(root))) {
      return [];
    }

    const entries = await fsp.readdir(root, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(root, entry.name, RULE_META_FILE_NAME));
  }

  async function listRuleDescriptors(): Promise<RuleFileDescriptor[]> {
    return scanRuleDescriptors();
  }

  async function listCachedRuleDescriptors(): Promise<RuleFileDescriptor[]> {
    const records = getRuleDb().getAll();
    if (records.length > 0) {
      const activeCustomRuleIds = getActiveCustomRuleIds();
      const all = records.map(descriptorFromRuleRecord);
      const filtered = (
        await Promise.all(
          all.map(async (descriptor) => {
            if (descriptor.id.startsWith('project:')) {
              return descriptor;
            }

            if (descriptor.platformId.startsWith('custom:')) {
              return activeCustomRuleIds.has(descriptor.id as CustomRuleFileId) ? descriptor : null;
            }

            if (descriptor.exists) {
              return descriptor;
            }

            const platform = getPlatformById(descriptor.platformId);
            if (!platform) {
              return null;
            }

            const rootDir = deps.getPlatformRootDir(platform);
            return (await fileExists(rootDir)) ? descriptor : null;
          }),
        )
      ).filter((item): item is RuleFileDescriptor => item !== null);

      return filtered;
    }

    return scanRuleDescriptors();
  }

  async function scanRuleDescriptors(): Promise<RuleFileDescriptor[]> {
    const allGlobalDescriptors = await Promise.all(
      getAllGlobalRuleTemplates().map(async (template) =>
        buildDescriptor(await ensureGlobalRuleMaterialized(template.id)),
      ),
    );

    const globalDescriptors = (
      await Promise.all(
        allGlobalDescriptors.map(async (descriptor) => {
          if (descriptor.exists) {
            return descriptor;
          }

          if (descriptor.platformId.startsWith('custom:')) {
            return descriptor;
          }

          const platform = getPlatformById(descriptor.platformId);
          if (!platform) {
            return null;
          }

          const rootDir = deps.getPlatformRootDir(platform);
          return (await fileExists(rootDir)) ? descriptor : null;
        }),
      )
    ).filter((item): item is RuleFileDescriptor => item !== null);

    const projectDescriptors = await Promise.all(
      (await listProjectMetaPaths()).map(async (metaPath) => {
        const meta = await readStoredMeta(metaPath);
        if (!meta) {
          return null;
        }

        return buildDescriptor(meta);
      }),
    );

    return [
      ...globalDescriptors,
      ...projectDescriptors.filter((item): item is RuleFileDescriptor => item !== null),
    ];
  }

  async function getProjectMetaById(ruleId: ProjectRuleId): Promise<StoredRuleMeta | null> {
    const metaPaths = await listProjectMetaPaths();
    for (const metaPath of metaPaths) {
      const meta = await readStoredMeta(metaPath);
      if (meta?.id === ruleId) {
        return meta;
      }
    }

    return null;
  }

  async function resolveRuleMeta(ruleId: RuleFileId): Promise<StoredRuleMeta> {
    if (isProjectRuleFileId(ruleId)) {
      const projectMeta = await getProjectMetaById(ruleId);
      if (!projectMeta) {
        throw new Error(`未知规则文件 ID: ${ruleId}`);
      }

      return projectMeta;
    }

    return ensureGlobalRuleMaterialized(ruleId);
  }

  async function readRuleContent(ruleId: RuleFileId): Promise<RuleFileContent> {
    const meta = await resolveRuleMeta(ruleId);
    const syncStatus = await syncStatusForMeta(meta);
    const nextMeta: StoredRuleMeta = {
      ...meta,
      syncStatus,
    };
    if (syncStatus !== meta.syncStatus) {
      await writeMeta(nextMeta);
    }
    const descriptor = await buildDescriptor(nextMeta);
    const content = (await fileExists(meta.managedPath))
      ? await fsp.readFile(meta.managedPath, 'utf-8')
      : descriptor.exists
        ? await fsp.readFile(meta.targetPath, 'utf-8')
        : '';
    const targetContent =
      syncStatus === 'out-of-sync' && (await fileExists(meta.targetPath))
        ? await fsp.readFile(meta.targetPath, 'utf-8')
        : undefined;
    if (syncStatus !== meta.syncStatus) {
      await writeMeta(nextMeta);
    }
    await syncRuleIndex(nextMeta, content);

    return {
      ...descriptor,
      content,
      targetContent,
    };
  }

  async function saveRuleContent(ruleId: RuleFileId, content: string): Promise<RuleFileContent> {
    const meta = await resolveRuleMeta(ruleId);

    await writeManagedRule(meta, content);

    const syncStatus = await writeTargetRule(meta, content);

    const nextMeta: StoredRuleMeta = {
      ...meta,
      syncStatus,
      updatedAt: new Date().toISOString(),
    };

    await writeMeta(nextMeta);
    await syncRuleIndex(nextMeta, content);

    const descriptor = await buildDescriptor(nextMeta);
    return {
      ...descriptor,
      content,
    };
  }

  async function resolveRuleConflict(
    ruleId: RuleFileId,
    strategy: RuleConflictResolutionStrategy,
  ): Promise<RuleFileContent> {
    if (strategy !== 'use-managed' && strategy !== 'use-target') {
      throw new Error(`未知冲突解决策略: ${strategy}`);
    }

    const meta = await resolveRuleMeta(ruleId);
    const managedContent = (await fileExists(meta.managedPath))
      ? await fsp.readFile(meta.managedPath, 'utf-8')
      : '';

    if (strategy === 'use-managed') {
      const syncStatus = await writeTargetRule(meta, managedContent);
      const nextMeta: StoredRuleMeta = {
        ...meta,
        syncStatus,
        updatedAt: new Date().toISOString(),
      };
      await writeMeta(nextMeta);
      await syncRuleIndex(nextMeta, managedContent);

      const descriptor = await buildDescriptor(nextMeta);
      return {
        ...descriptor,
        content: managedContent,
      };
    }

    if (!(await fileExists(meta.targetPath))) {
      throw new Error(`无法解决冲突，目标文件不存在: ${meta.targetPath}`);
    }

    const targetContent = await fsp.readFile(meta.targetPath, 'utf-8');
    await writeManagedRule(meta, targetContent);
    const nextMeta: StoredRuleMeta = {
      ...meta,
      syncStatus: await syncStatusForMeta(meta),
      updatedAt: new Date().toISOString(),
    };

    await writeMeta(nextMeta);
    await syncRuleIndex(nextMeta, targetContent);

    const descriptor = await buildDescriptor(nextMeta);
    return {
      ...descriptor,
      content: targetContent,
    };
  }

  async function createProjectRule(input: CreateRuleProjectInput): Promise<RuleFileDescriptor> {
    const name = input.name.trim();
    const rootPath = input.rootPath.trim();
    if (!name || !rootPath) {
      throw new Error('项目规则名称和根目录路径不能为空');
    }

    const existingProjectMeta = await Promise.all(
      (await listProjectMetaPaths()).map((metaPath) => readStoredMeta(metaPath)),
    );
    const duplicate = existingProjectMeta.find(
      (meta) => meta?.projectRootPath?.toLowerCase() === rootPath.toLowerCase(),
    );
    if (duplicate) {
      throw new Error('该项目根目录已存在');
    }

    const projectId = input.id ?? crypto.randomUUID();
    const ruleId = `project:${projectId}` as RuleFileId;
    const dirName = `${slugify(name)}__${projectId}`;
    const managedPath = path.join(getRuleProjectsRoot(), dirName, 'AGENTS.md');
    const targetPath = path.join(rootPath, 'AGENTS.md');
    const now = new Date().toISOString();
    const meta: StoredRuleMeta = {
      id: ruleId,
      scope: 'project',
      platformId: 'workspace',
      platformName: name,
      platformIcon: 'FolderRoot',
      platformDescription: `Project rules from ${rootPath}`,
      canonicalFileName: 'AGENTS.md',
      description: 'Project rule file loaded from a user-managed directory.',
      managedPath,
      targetPath,
      projectRootPath: rootPath,
      syncStatus: 'target-missing',
      createdAt: now,
      updatedAt: now,
    };

    const targetExists = await fileExists(targetPath);
    const initialContent = targetExists ? await fsp.readFile(targetPath, 'utf-8') : '';
    await writeManagedRule(meta, initialContent);

    await writeMeta(meta);
    await syncRuleIndex(meta);
    return buildDescriptor(meta);
  }

  async function removeMissingProjectRules(importedRecords: RuleBackupRecord[]): Promise<void> {
    const importedProjectIds = new Set(
      importedRecords.map((record) => record.id).filter(isProjectRuleFileId),
    );

    const metaPaths = await listProjectMetaPaths();
    for (const metaPath of metaPaths) {
      const meta = await readStoredMeta(metaPath);
      if (!meta || !isProjectRuleFileId(meta.id)) {
        continue;
      }

      if (!importedProjectIds.has(meta.id)) {
        await removeProjectRule(meta.id.slice('project:'.length));
      }
    }
  }

  async function bootstrapRuleWorkspace(): Promise<void> {
    await fsp.mkdir(deps.getRulesDir(), { recursive: true });
    await fsp.mkdir(getRuleProjectsRoot(), { recursive: true });
  }

  async function removeProjectRule(projectId: string): Promise<void> {
    const ruleId: ProjectRuleId = `project:${projectId}`;
    const meta = await getProjectMetaById(ruleId);
    if (!meta) {
      return;
    }

    await fsp.rm(path.dirname(meta.managedPath), { recursive: true, force: true });
    getRuleDb().delete(meta.id);
  }

  async function exportRuleBackupRecords(): Promise<RuleBackupRecord[]> {
    const descriptors = await listRuleDescriptors();
    return Promise.all(
      descriptors.map(async (descriptor) => {
        const content = await readRuleContent(descriptor.id);
        return {
          id: content.id,
          platformId: content.platformId,
          platformName: content.platformName,
          platformIcon: content.platformIcon,
          platformDescription: content.platformDescription,
          name: content.name,
          description: content.description,
          path: content.path,
          managedPath: content.managedPath,
          targetPath: content.targetPath,
          projectRootPath: content.projectRootPath ?? null,
          syncStatus: content.syncStatus,
          content: content.content,
        } satisfies RuleBackupRecord;
      }),
    );
  }

  async function importRuleBackupRecords(
    records: RuleBackupRecord[],
    options: ImportRuleBackupRecordsOptions = {},
  ): Promise<void> {
    await bootstrapRuleWorkspace();

    if (options.replace) {
      await removeMissingProjectRules(records);
    }

    for (const record of records) {
      if (isProjectRuleFileId(record.id)) {
        const projectId = record.id.slice('project:'.length);
        const existing = await getProjectMetaById(record.id);
        if (!existing) {
          await createProjectRule({
            id: projectId,
            name: record.platformName,
            rootPath: record.projectRootPath ?? path.dirname(record.targetPath ?? record.path),
          });
        }
      }

      const meta = await resolveRuleMeta(record.id);
      await writeManagedRule(meta, record.content);
      const restoredSyncStatus = await writeTargetRule(meta, record.content);
      const nextMeta: StoredRuleMeta = {
        ...meta,
        syncStatus: restoredSyncStatus,
        updatedAt: new Date().toISOString(),
      };
      await writeMeta(nextMeta);
      await syncRuleIndex(nextMeta, record.content);
    }
  }

  return {
    listRuleDescriptors,
    listCachedRuleDescriptors,
    scanRuleDescriptors,
    getProjectMetaById,
    resolveRuleMeta,
    readRuleContent,
    saveRuleContent,
    resolveRuleConflict,
    createProjectRule,
    bootstrapRuleWorkspace,
    removeProjectRule,
    exportRuleBackupRecords,
    importRuleBackupRecords,
  };
}
