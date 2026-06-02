import type {
  DCreateSkill,
  DUpdateSkill,
  ESkillSafetyLevel,
  IMcpServerConfig,
  IRegistrySkill,
  ISafetyScanAiConfig,
  IScanLocalResult,
  IScannedSkill,
  ISkill,
  ISkillMcpConfig,
  ISkillProject,
  ISkillSafetyReport,
  ISkillStoreSource,
} from '@/types/modules';
import { chatCompletion } from '@renderer/services/ai';
import { resolveScenarioAIConfig } from '@renderer/services/ai/defaults';
import { isClawHubDownloadUrl } from '@renderer/services/skill/clawhub-store';
import { filterVisibleScannedSkills, filterVisibleSkills } from '@renderer/services/skill/filter';
import { normalizeSkill, normalizeSkills } from '@renderer/services/skill/normalize';
import {
  fetchRegistrySkillRemoteContent,
  isSkillHubDownloadUrl,
  resolveRegistrySkillSourceDir,
} from '@renderer/services/skill/skillhub-store';
import {
  getRegistrySkillDirectory,
  isSkillsShRegistrySkill,
} from '@renderer/services/skill/skills-sh-store';
import {
  validateStoreSourceInput,
  type ECustomStoreSourceType,
} from '@renderer/services/skill/store-source';
import {
  computeSkillContentFingerprint,
  computeSkillContentHash,
  findInstalledRegistrySkill,
  getRegistrySkillUpdateStatus,
  type IRegistrySkillUpdateCheck,
} from '@renderer/services/skill/store-update';
import { useSettingsStore } from '@renderer/store';
import type { ESkillFilterType, ESkillStoreView, ESkillViewMode } from '@renderer/types/skill';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type { ESkillFilterType, ESkillStoreView, ESkillViewMode } from '@renderer/types/skill';
// Translation cache constraints
// 翻译缓存限制
const TRANSLATION_CACHE_MAX_SIZE = 200;
const TRANSLATION_CACHE_EVICT_COUNT = 50;
const TRANSLATION_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
const REMOTE_CONTENT_CONCURRENCY = 6;
const REMOTE_REPO_SYNC_CONCURRENCY = 6;

interface IParsedGitHubSkillLocation {
  owner: string;
  repo: string;
  branch: string;
  directoryPath: string;
}

interface ITranslationCacheEntry {
  value: string;
  timestamp: number;
  sourceFingerprint?: string;
}

interface ITranslationLookup {
  value: string | null;
  hasTranslation: boolean;
  isStale: boolean;
}

export interface IScannedImportResult {
  importedCount: number;
  importedSkills: ISkill[];
  skipped: Array<{ name: string; reason: string }>;
  failed: Array<{ name: string; reason: string }>;
}

export interface ISkillSafetyBatchSummary {
  total: number;
  safe: number;
  warn: number;
  highRisk: number;
  blocked: number;
  bySkillId: Record<string, ESkillSafetyLevel>;
}

export interface IProjectSkillScanState {
  scannedSkills: IScannedSkill[];
  isScanning: boolean;
  scannedAt?: number;
  error?: string | null;
}

export type IRegistrySkillUpdateResult =
  | { status: 'updated'; skill: ISkill; check: IRegistrySkillUpdateCheck }
  | {
      status: 'up-to-date' | 'conflict' | 'local-modified' | 'not-installed';
      check: IRegistrySkillUpdateCheck;
    };

/**
 * Prune the translation cache: remove expired entries and evict oldest
 * when size exceeds the limit.
 * 清理翻译缓存：移除过期条目，超出上限时淘汰最旧条目。
 */
function pruneTranslationCache(
  cache: Record<string, ITranslationCacheEntry>,
): Record<string, ITranslationCacheEntry> {
  const now = Date.now();
  // 1. Remove expired entries / 移除过期条目
  const entries = Object.entries(cache).filter(
    ([, entry]) => now - entry.timestamp < TRANSLATION_CACHE_TTL,
  );

  // 2. If still over limit, evict oldest / 如果仍超出上限，淘汰最旧条目
  if (entries.length > TRANSLATION_CACHE_MAX_SIZE) {
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const trimmed = entries.slice(
      entries.length - (TRANSLATION_CACHE_MAX_SIZE - TRANSLATION_CACHE_EVICT_COUNT),
    );
    return Object.fromEntries(trimmed);
  }

  return Object.fromEntries(entries);
}

function getTranslationStateFromCache(
  cache: Record<string, ITranslationCacheEntry>,
  cacheKey: string,
  sourceFingerprint?: string,
): ITranslationLookup {
  const entry = cache[cacheKey];
  if (!entry) {
    return { value: null, hasTranslation: false, isStale: false };
  }

  if (Date.now() - entry.timestamp >= TRANSLATION_CACHE_TTL) {
    return { value: null, hasTranslation: false, isStale: false };
  }

  const isStale = Boolean(
    sourceFingerprint && entry.sourceFingerprint && entry.sourceFingerprint !== sourceFingerprint,
  );

  return {
    value: isStale ? null : entry.value,
    hasTranslation: true,
    isStale,
  };
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

const DEFAULT_PROJECT_SCAN_SUBDIRECTORIES = [
  '.claude/skills',
  '.agents/skills',
  'skills',
  '.gemini',
] as const;

function joinProjectPath(rootPath: string, subPath: string): string {
  const normalizedRoot = rootPath.replace(/[\\/]+$/, '');
  return `${normalizedRoot}/${subPath}`;
}

export function getProjectScanPaths(project: ISkillProject): string[] {
  const explicitPaths = (project.scanPaths || [])
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  const normalizedRootPath = project.rootPath.trim();
  if (!normalizedRootPath) {
    return explicitPaths;
  }

  return Array.from(
    new Set([
      normalizedRootPath,
      ...DEFAULT_PROJECT_SCAN_SUBDIRECTORIES.map((subPath) =>
        joinProjectPath(normalizedRootPath, subPath),
      ),
      ...explicitPaths,
    ]),
  );
}

function stripSkillFrontmatter(content: string): string {
  return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}

/**
 * Compute a numeric safety score (0-100) from a ISkillSafetyReport.
 * Higher score = safer.
 *   blocked   → 0–10   (based on finding count)
 *   high-risk → 20–40
 *   warn      → 50–70
 *   safe      → 80–100
 */
function computeSafetyScore(report: ISkillSafetyReport): number {
  const findingCount = (report.findings ?? []).length;
  switch (report.level) {
    case 'blocked':
      return Math.max(0, 10 - findingCount * 2);
    case 'high-risk':
      return Math.max(20, 40 - findingCount * 3);
    case 'warn':
      return Math.max(50, 70 - findingCount * 4);
    case 'safe':
      return Math.max(80, 100 - findingCount * 5);
    default:
      return 50;
  }
}

function hasMeaningfulSkillBody(content?: string): boolean {
  if (typeof content !== 'string') {
    return false;
  }

  const trimmed = content.trim();
  if (!trimmed) {
    return false;
  }

  const body = stripSkillFrontmatter(trimmed).trim();
  return body.length > 0;
}

function getRegistryContentFetchOptions() {
  return {
    readLocalFileByPath: (localPath: string, relativePath: string) =>
      window.api.skill.readLocalFileByPath(localPath, relativePath),
    extractSkillHubArchive: (slug: string, version?: string) =>
      window.api.skill.extractSkillHubArchive(slug, version),
    extractClawhubArchive: (slug: string) => window.api.skill.extractClawhubArchive(slug),
  };
}

function getRegistrySkillInstallName(regSkill: IRegistrySkill): string {
  return regSkill.install_name || regSkill.name;
}

function findDuplicateMySkill(skills: ISkill[], regSkill: IRegistrySkill): ISkill | undefined {
  const targetName = getRegistrySkillInstallName(regSkill).toLowerCase();
  return skills.find((skill) => skill.name.toLowerCase() === targetName);
}

function getRegistrySkillCandidates(state: ISkillState): IRegistrySkill[] {
  const remoteSkills = Object.values(state.remoteStoreEntries).flatMap((entry) => entry.skills);
  return [...state.registrySkills, ...remoteSkills];
}

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function isGitHubTreeEntry(value: unknown): value is { path: string; type: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'path' in value &&
    typeof value.path === 'string' &&
    'type' in value &&
    typeof value.type === 'string'
  );
}

function parseGitHubSkillLocation(
  sourceUrl?: string,
  contentUrl?: string,
): IParsedGitHubSkillLocation | null {
  if (sourceUrl) {
    try {
      const parsed = new URL(sourceUrl);
      if (parsed.hostname.toLowerCase() === 'github.com') {
        const parts = parsed.pathname.split('/').filter(Boolean);
        if (parts.length >= 5 && parts[2] === 'tree') {
          return {
            owner: parts[0],
            repo: parts[1],
            branch: parts[3],
            directoryPath: parts.slice(4).join('/'),
          };
        }
      }
    } catch {
      // Ignore invalid source URL and try contentUrl fallback.
    }
  }

  if (contentUrl) {
    try {
      const parsed = new URL(contentUrl);
      if (parsed.hostname.toLowerCase() === 'raw.githubusercontent.com') {
        const parts = parsed.pathname.split('/').filter(Boolean);
        if (parts.length >= 5) {
          return {
            owner: parts[0],
            repo: parts[1],
            branch: parts[2],
            directoryPath: parts.slice(3, -1).join('/'),
          };
        }
      }
    } catch {
      // Ignore invalid content URL.
    }
  }

  return null;
}

function shouldSyncRemoteRepoFile(relativePath: string): boolean {
  const ext = relativePath.includes('.')
    ? relativePath.slice(relativePath.lastIndexOf('.')).toLowerCase()
    : '';
  return (
    ext === '' ||
    [
      '.md',
      '.mdx',
      '.txt',
      '.json',
      '.yaml',
      '.yml',
      '.toml',
      '.ini',
      '.cfg',
      '.js',
      '.mjs',
      '.cjs',
      '.ts',
      '.tsx',
      '.jsx',
      '.py',
      '.rb',
      '.go',
      '.rs',
      '.java',
      '.kt',
      '.swift',
      '.sh',
      '.bash',
      '.zsh',
      '.ps1',
      '.html',
      '.css',
      '.svg',
      '.xml',
      '.sql',
      '.r',
      '.lua',
      '.php',
      '.c',
      '.cpp',
      '.h',
      '.hpp',
      '.cs',
      '.lock',
      '.gitignore',
    ].includes(ext)
  );
}

async function syncRemoteGitHubSkillRepo(
  skillId: string,
  sourceUrl?: string,
  contentUrl?: string,
): Promise<void> {
  const location = parseGitHubSkillLocation(sourceUrl, contentUrl);
  if (!location || !location.directoryPath) {
    return;
  }

  const treeRaw = await window.api.skill.fetchRemoteContent(
    `https://api.github.com/repos/${location.owner}/${location.repo}/git/trees/${location.branch}?recursive=1`,
  );
  const treeData = parseJson<{
    tree?: Array<{ path?: string; type?: string }>;
  }>(treeRaw || '{}', {});
  const directoryPrefix = `${location.directoryPath}/`;
  const files = Array.isArray(treeData.tree)
    ? treeData.tree.filter(
        (entry): entry is { path: string; type: string } =>
          isGitHubTreeEntry(entry) &&
          entry.type === 'blob' &&
          entry.path.startsWith(directoryPrefix),
      )
    : [];

  await runWithConcurrency(files, REMOTE_REPO_SYNC_CONCURRENCY, async (file) => {
    const relativePath = file.path.slice(directoryPrefix.length);
    if (!relativePath || !shouldSyncRemoteRepoFile(relativePath)) {
      return;
    }
    const rawUrl = `https://raw.githubusercontent.com/${location.owner}/${location.repo}/${location.branch}/${file.path}`;
    const content = await window.api.skill.fetchRemoteContent(rawUrl);
    await window.api.skill.writeLocalFile(skillId, relativePath, content);
  });
}

async function runWithConcurrency<T>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<void>,
): Promise<void> {
  let nextIndex = 0;

  const runWorker = async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      await worker(items[currentIndex], currentIndex);
    }
  };

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => runWorker()));
}

interface ISkillState {
  skills: ISkill[];
  selectedSkillId: string | null;
  isLoading: boolean;
  error: string | null;

  // View mode
  // 视图模式
  viewMode: ESkillViewMode;

  // Search & Filter
  searchQuery: string;
  filterType: ESkillFilterType;

  // Skill Store (registry)
  // 技能商店（注册表）
  storeView: ESkillStoreView;
  selectedProjectId: string | null;
  projectScanState: Record<string, IProjectSkillScanState>;
  registrySkills: IRegistrySkill[];
  isLoadingRegistry: boolean;
  storeSearchQuery: string;
  storeCategory: string;
  selectedRegistrySlug: string | null;
  customStoreSources: ISkillStoreSource[];
  selectedStoreSourceId: string;
  remoteStoreEntries: Record<
    string,
    {
      loadedAt: number;
      error?: string | null;
      skills: IRegistrySkill[];
      pagination?: {
        page: number;
        total: number;
        hasMore: boolean;
        nextCursor?: string;
      };
    }
  >;

  // Actions
  loadSkills: () => Promise<void>;
  selectSkill: (id: string | null) => void;
  createSkill: (data: DCreateSkill) => Promise<ISkill | null>;
  updateSkill: (id: string, data: DUpdateSkill) => Promise<ISkill | null>;
  syncSkillFromRepo: (id: string) => Promise<ISkill | null>;
  deleteSkill: (id: string) => Promise<boolean>;
  scanLocalSkills: () => Promise<IScanLocalResult>;
  scanLocalPreview: (customPaths?: string[]) => Promise<IScannedSkill[]>;
  importScannedSkills: (
    skills: IScannedSkill[],
    userTagsByPath?: Record<string, string[]>,
  ) => Promise<IScannedImportResult>;
  scanInstalledSkillSafety: (
    skillIds?: string[],
    aiConfig?: ISafetyScanAiConfig,
  ) => Promise<ISkillSafetyBatchSummary>;
  saveSafetyReport: (skillId: string, report: ISkillSafetyReport) => Promise<void>;
  installToPlatform: (
    platform: 'claude' | 'cursor',
    name: string,
    mcpConfig: ISkillMcpConfig | IMcpServerConfig,
  ) => Promise<void>;
  uninstallFromPlatform: (platform: 'claude' | 'cursor', name: string) => Promise<void>;
  getPlatformStatus: (name: string) => Promise<Record<string, boolean>>;

  // View mode actions
  // 视图模式操作
  setViewMode: (mode: ESkillViewMode) => void;

  // Search & Filter Actions
  setSearchQuery: (query: string) => void;
  setFilterType: (filter: ESkillFilterType) => void;
  filterTags: string[];
  toggleFilterTag: (tag: string) => void;
  clearFilterTags: () => void;
  getFilteredSkills: () => ISkill[];

  // Skill Store Actions
  // 技能商店操作
  setStoreView: (view: ESkillStoreView) => void;
  selectProject: (projectId: string | null) => void;
  scanProjectSkills: (project: ISkillProject) => Promise<IScannedSkill[]>;
  setProjectScanState: (projectId: string, state: IProjectSkillScanState) => void;
  getVisibleProjectScannedSkills: (
    projectId: string,
    options?: { searchQuery?: string },
  ) => IScannedSkill[];
  loadRegistry: () => void;
  computeRegistrySkillHash: (content: string) => Promise<string>;
  getRegistrySkillUpdateStatus: (skill: IRegistrySkill) => Promise<IRegistrySkillUpdateCheck>;
  updateRegistrySkill: (
    slug: string,
    options?: { overwriteLocalChanges?: boolean },
  ) => Promise<IRegistrySkillUpdateResult | null>;
  installRegistrySkill: (skill: IRegistrySkill) => Promise<ISkill | null>;
  installFromRegistry: (slug: string) => Promise<ISkill | null>;
  uninstallRegistrySkill: (slug: string) => Promise<boolean>;
  setStoreSearchQuery: (query: string) => void;
  setStoreCategory: (category: string) => void;
  selectRegistrySkill: (slug: string | null) => void;
  selectStoreSource: (id: string) => void;
  upsertRegistrySkills: (skills: IRegistrySkill[]) => void;
  addCustomStoreSource: (name: string, url: string, type?: ECustomStoreSourceType) => void;
  removeCustomStoreSource: (id: string) => void;
  toggleCustomStoreSource: (id: string) => void;
  setRemoteStoreEntry: (
    sourceId: string,
    entry: {
      loadedAt: number;
      error?: string | null;
      skills: IRegistrySkill[];
      pagination?: {
        page: number;
        total: number;
        hasMore: boolean;
        nextCursor?: string;
      };
    },
  ) => void;
  getInstalledSlugs: () => string[];
  getRecommendedSkills: () => IRegistrySkill[];
  getFilteredRegistrySkills: () => {
    installed: IRegistrySkill[];
    recommended: IRegistrySkill[];
  };

  // Deployed tracking
  // 已分发到平台的技能名称集合
  deployedSkillNames: Set<string>;
  loadDeployedStatus: () => Promise<void>;

  // Translation cache (with TTL + size limit)
  // 翻译缓存（带 TTL + 大小限制）
  translationCache: Record<string, ITranslationCacheEntry>;
  translateContent: (
    content: string,
    cacheKey: string,
    targetLang: string,
    options?: { forceRefresh?: boolean; sourceFingerprint?: string },
  ) => Promise<string | null>;
  getTranslationState: (cacheKey: string, sourceFingerprint?: string) => ITranslationLookup;
  getTranslation: (cacheKey: string) => string | null;
  clearTranslation: (cacheKey: string) => void;
}

export const useSkillStore = create<ISkillState>()(
  persist(
    (set, get) => ({
      skills: [],
      selectedSkillId: null,
      isLoading: false,
      error: null,
      viewMode: 'gallery' as ESkillViewMode,
      searchQuery: '',
      filterType: 'all',
      filterTags: [] as string[],

      // Deployed tracking
      deployedSkillNames: new Set<string>(),

      // Skill Store state
      storeView: 'my-skills' as ESkillStoreView,
      selectedProjectId: null,
      projectScanState: {},
      registrySkills: [] as IRegistrySkill[],
      isLoadingRegistry: false,
      storeSearchQuery: '',
      storeCategory: 'all',
      selectedRegistrySlug: null,
      customStoreSources: [] as ISkillStoreSource[],
      selectedStoreSourceId: '',
      remoteStoreEntries: {},

      loadSkills: async () => {
        set({ isLoading: true, error: null });
        try {
          const skills = normalizeSkills(await window.api.skill.getAll());
          set({ skills, isLoading: false });
        } catch (error) {
          console.error('Failed to load skills:', error);
          set({ error: String(error), isLoading: false });
        }
      },

      loadDeployedStatus: async () => {
        const { skills } = get();
        const deployed = new Set<string>();
        try {
          const skillNames = skills.map((s) => s.name);
          const results = await window.api.skill.getMdInstallStatusBatch(skillNames);
          for (const [name, status] of Object.entries(results)) {
            if (Object.values(status).some(Boolean)) {
              deployed.add(name);
            }
          }
        } catch (error) {
          console.warn('Failed to load deployed status:', error);
        }
        set({ deployedSkillNames: deployed });
      },

      selectSkill: (id) => {
        set({ selectedSkillId: id });
      },

      createSkill: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const newSkill = await window.api.skill.create(data);
          if (newSkill) {
            let storedSkill = normalizeSkill(newSkill);
            const repoContent =
              data.instructions || data.content || newSkill.instructions || newSkill.content || '';
            if (typeof repoContent === 'string') {
              try {
                await window.api.skill.writeLocalFile(newSkill.id, 'SKILL.md', repoContent);
                const repoPath = await window.api.skill.getRepoPath(newSkill.id);
                if (repoPath) {
                  storedSkill = { ...newSkill, local_repo_path: repoPath };
                }
              } catch (repoError) {
                console.warn(`Failed to write local repo for skill "${newSkill.name}":`, repoError);
              }
            }
            set((state) => ({
              skills: [storedSkill, ...state.skills],
              selectedSkillId: storedSkill.id,
              isLoading: false,
            }));
            return storedSkill;
          }
          return null;
        } catch (error) {
          console.error('Failed to create skill:', error);
          set({ error: String(error), isLoading: false });
          throw error;
        }
      },

      updateSkill: async (id, data) => {
        try {
          const updatedSkill = await window.api.skill.update(id, data);
          if (updatedSkill) {
            let storedSkill = normalizeSkill(updatedSkill);
            const shouldSyncRepoContent =
              Object.prototype.hasOwnProperty.call(data, 'instructions') ||
              Object.prototype.hasOwnProperty.call(data, 'content');
            const nextContent =
              data.instructions ??
              data.content ??
              updatedSkill.instructions ??
              updatedSkill.content;
            if (shouldSyncRepoContent && typeof nextContent === 'string') {
              try {
                await window.api.skill.writeLocalFile(id, 'SKILL.md', nextContent);
                const repoPath = await window.api.skill.getRepoPath(id);
                if (repoPath) {
                  storedSkill = { ...updatedSkill, local_repo_path: repoPath };
                }
              } catch (repoError) {
                console.warn(
                  `Failed to sync local repo for skill "${updatedSkill.name}":`,
                  repoError,
                );
              }
            }
            set((state) => ({
              skills: state.skills.map((s) => (s.id === id ? storedSkill : s)),
            }));
            return storedSkill;
          }
          return null;
        } catch (error) {
          console.error('Failed to update skill:', error);
          throw error;
        }
      },

      syncSkillFromRepo: async (id) => {
        try {
          const syncedSkill = await window.api.skill.syncFromRepo(id);
          if (!syncedSkill) {
            return null;
          }

          const normalizedSkill = normalizeSkill(syncedSkill);
          set((state) => ({
            skills: state.skills.map((skill) => (skill.id === id ? normalizedSkill : skill)),
          }));
          return normalizedSkill;
        } catch (error) {
          console.error('Failed to sync skill from repo:', error);
          return null;
        }
      },

      deleteSkill: async (id) => {
        try {
          const success = await window.api.skill.delete(id);
          if (success) {
            set((state) => ({
              skills: state.skills.filter((s) => s.id !== id),
              selectedSkillId: state.selectedSkillId === id ? null : state.selectedSkillId,
            }));
            return true;
          }
          return false;
        } catch (error) {
          console.error('Failed to delete skill:', error);
          return false;
        }
      },

      scanLocalSkills: async () => {
        set({ isLoading: true, error: null });
        try {
          const result: IScanLocalResult = await window.api.skill.scanLocal();
          if (result.imported > 0) {
            const skills = normalizeSkills(await window.api.skill.getAll());
            set({ skills, isLoading: false });
          } else {
            set({ isLoading: false });
          }
          return result;
        } catch (error) {
          console.error('Failed to scan local skills:', error);
          set({ error: String(error), isLoading: false });
          return { imported: 0, skipped: [] };
        }
      },

      scanLocalPreview: async (customPaths?: string[]) => {
        set({ isLoading: true, error: null });
        try {
          const scannedSkills = await window.api.skill.scanLocalPreview(customPaths);
          set({ isLoading: false });
          return scannedSkills;
        } catch (error) {
          console.error('Failed to preview local skills:', error);
          set({ error: String(error), isLoading: false });
          return [];
        }
      },

      importScannedSkills: async (
        scannedSkills: IScannedSkill[],
        userTagsByPath?: Record<string, string[]>,
      ) => {
        set({ isLoading: true, error: null });
        try {
          let importCount = 0;
          const importedSkills: ISkill[] = [];
          const skipped: IScannedImportResult['skipped'] = [];
          const failed: IScannedImportResult['failed'] = [];
          for (const scanned of scannedSkills) {
            if (!scanned.name || scanned.name.trim().length === 0) {
              skipped.push({
                name: scanned.localPath || 'unknown',
                reason: 'Missing skill name',
              });
              continue;
            }

            try {
              const userTags = userTagsByPath?.[scanned.localPath] ?? [];
              const newSkill = await window.api.skill.create({
                name: scanned.name,
                description: scanned.description,
                instructions: scanned.instructions,
                content: scanned.instructions,
                protocol_type: 'skill',
                version: scanned.version,
                author: scanned.author,
                tags: userTags,
                original_tags: scanned.tags,
                is_favorite: false,
                source_url: scanned.localPath,
                local_repo_path: scanned.localPath,
              });

              // Copy skill files from original location into local repo
              // localPath is the parent directory of SKILL.md (skill folder path)
              if (scanned.localPath) {
                try {
                  const repoPath = await window.api.skill.saveToRepo(
                    scanned.name,
                    scanned.localPath,
                  );
                  // Write back the repo path so SkillFileEditor can find the files
                  if (repoPath && newSkill?.id) {
                    await window.api.skill.update(newSkill.id, {
                      local_repo_path: repoPath,
                    });
                  }
                } catch (error: unknown) {
                  console.warn(
                    `ISkill "${scanned.name}" imported to DB but failed to copy files to local repo:`,
                    getErrorMessage(error),
                  );
                }
              }

              importCount++;
              if (newSkill) {
                importedSkills.push(normalizeSkill(newSkill));
              }
            } catch (error: unknown) {
              failed.push({
                name: scanned.name,
                reason: getErrorMessage(error) || 'Unknown import error',
              });
              console.warn(`Failed to import skill "${scanned.name}":`, getErrorMessage(error));
            }
          }
          // Refresh skills after import
          const skills = normalizeSkills(await window.api.skill.getAll());
          set({ skills, isLoading: false });
          return {
            importedCount: importCount,
            importedSkills,
            skipped,
            failed,
          };
        } catch (error) {
          console.error('Failed to import scanned skills:', error);
          set({ error: String(error), isLoading: false });
          return {
            importedCount: 0,
            importedSkills: [],
            skipped: [],
            failed: [
              {
                name: 'scan',
                reason: String(error),
              },
            ],
          };
        }
      },

      scanInstalledSkillSafety: async (skillIds, aiConfig) => {
        const targetSkills = get().skills.filter(
          (skill) => !skillIds || skillIds.includes(skill.id),
        );
        const summary: ISkillSafetyBatchSummary = {
          total: targetSkills.length,
          safe: 0,
          warn: 0,
          highRisk: 0,
          blocked: 0,
          bySkillId: {},
        };

        for (const skill of targetSkills) {
          const report = await window.api.skill.scanSafety({
            name: skill.name,
            content: skill.instructions || skill.content,
            sourceUrl: skill.source_url,
            contentUrl: skill.content_url,
            localRepoPath: skill.local_repo_path,
            aiConfig,
          });

          // Attach numeric score
          const scored: ISkillSafetyReport = {
            ...report,
            score: computeSafetyScore(report),
          };

          summary.bySkillId[skill.id] = scored.level;

          if (scored.level === 'safe') {
            summary.safe += 1;
          } else if (scored.level === 'warn') {
            summary.warn += 1;
          } else if (scored.level === 'high-risk') {
            summary.highRisk += 1;
          } else {
            summary.blocked += 1;
          }

          // Persist to DB and update in-memory store
          try {
            await window.api.skill.saveSafetyReport(skill.id, scored);
            set((state) => ({
              skills: state.skills.map((s) =>
                s.id === skill.id ? { ...s, safetyReport: scored } : s,
              ),
            }));
          } catch (err) {
            console.warn(`Failed to persist safety report for skill "${skill.name}":`, err);
          }
        }

        return summary;
      },

      saveSafetyReport: async (skillId, report) => {
        const scored: ISkillSafetyReport = {
          ...report,
          score: report.score ?? computeSafetyScore(report),
        };
        await window.api.skill.saveSafetyReport(skillId, scored);
        set((state) => ({
          skills: state.skills.map((s) => (s.id === skillId ? { ...s, safetyReport: scored } : s)),
        }));
      },

      installToPlatform: async (platform, name, mcpConfig) => {
        try {
          await window.api.skill.installToPlatform(platform, name, mcpConfig);
        } catch (error) {
          console.error(`Failed to install to ${platform}:`, error);
          throw error;
        }
      },

      uninstallFromPlatform: async (platform, name) => {
        try {
          await window.api.skill.uninstallFromPlatform(platform, name);
        } catch (error) {
          console.error(`Failed to uninstall from ${platform}:`, error);
          throw error;
        }
      },

      getPlatformStatus: async (name) => {
        try {
          return await window.api.skill.getPlatformStatus(name);
        } catch (error) {
          console.error(`Failed to get platform status for ${name}:`, error);
          return { claude: false, cursor: false };
        }
      },

      setViewMode: (mode) => {
        set({ viewMode: mode });
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
      },

      setFilterType: (filter) => {
        set({ filterType: filter });
      },

      toggleFilterTag: (tag) => {
        const { filterTags } = get();
        if (filterTags[0] === tag) {
          set({ filterTags: [] });
        } else {
          set({ filterTags: [tag] });
        }
      },

      clearFilterTags: () => {
        set({ filterTags: [] });
      },

      getFilteredSkills: () => {
        const { deployedSkillNames, filterTags, filterType, searchQuery, skills, storeView } =
          get();

        return filterVisibleSkills({
          deployedSkillNames,
          filterTags,
          filterType,
          searchQuery,
          skills,
          storeView,
        });
      },

      // ─── Skill Store Actions / 技能商店操作 ───

      setStoreView: (view) => {
        set({ storeView: view, selectedRegistrySlug: null });
      },

      selectProject: (projectId) => {
        set({ selectedProjectId: projectId });
      },

      scanProjectSkills: async (project) => {
        const uniquePaths = getProjectScanPaths(project);

        set((state) => ({
          projectScanState: {
            ...state.projectScanState,
            [project.id]: {
              ...(state.projectScanState[project.id] || {
                scannedSkills: [],
              }),
              isScanning: true,
              error: null,
            },
          },
        }));

        try {
          const scannedSkills = await get().scanLocalPreview(uniquePaths);
          const scanError = get().error;
          if (scanError) {
            throw new Error(scanError);
          }
          const nextState: IProjectSkillScanState = {
            scannedSkills,
            isScanning: false,
            scannedAt: Date.now(),
            error: null,
          };
          set((state) => ({
            projectScanState: {
              ...state.projectScanState,
              [project.id]: nextState,
            },
          }));
          return scannedSkills;
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          set((state) => ({
            projectScanState: {
              ...state.projectScanState,
              [project.id]: {
                scannedSkills: state.projectScanState[project.id]?.scannedSkills || [],
                isScanning: false,
                scannedAt: state.projectScanState[project.id]?.scannedAt,
                error: errorMessage,
              },
            },
          }));
          throw error instanceof Error ? error : new Error(errorMessage);
        }
      },

      setProjectScanState: (projectId, state) => {
        set((current) => ({
          projectScanState: {
            ...current.projectScanState,
            [projectId]: state,
          },
        }));
      },

      getVisibleProjectScannedSkills: (projectId, options) => {
        const scannedSkills = get().projectScanState[projectId]?.scannedSkills || [];
        return filterVisibleScannedSkills(scannedSkills, options?.searchQuery || '');
      },

      loadRegistry: () => {
        set({ isLoadingRegistry: false, registrySkills: [] });
      },

      computeRegistrySkillHash: computeSkillContentHash,

      getRegistrySkillUpdateStatus: async (regSkill) => {
        const remoteContent = await fetchRegistrySkillRemoteContent(
          regSkill,
          (url) => window.api.skill.fetchRemoteContent(url),
          (url) => window.api.skill.fetchRemoteBinary(url),
          getRegistryContentFetchOptions(),
        );

        return getRegistrySkillUpdateStatus(
          findInstalledRegistrySkill(get().skills, regSkill),
          regSkill,
          remoteContent,
        );
      },

      updateRegistrySkill: async (slug, options) => {
        const regSkill = getRegistrySkillCandidates(get()).find((skill) => skill.slug === slug);
        if (!regSkill) return null;

        const check = await get().getRegistrySkillUpdateStatus(regSkill);
        if (!check.installedSkill) {
          return { status: 'not-installed', check };
        }
        if (check.status === 'up-to-date') {
          return { status: 'up-to-date', check };
        }
        if (
          (check.status === 'conflict' || check.status === 'local-modified') &&
          !options?.overwriteLocalChanges
        ) {
          return { status: check.status, check };
        }

        const installedSkill = check.installedSkill;
        const now = Date.now();
        const updatedSkill = await get().updateSkill(installedSkill.id, {
          description: regSkill.description,
          instructions: check.remoteContent,
          content: check.remoteContent,
          version: regSkill.version,
          author: regSkill.author,
          source_url: regSkill.source_url,
          icon_url: regSkill.icon_url,
          icon_emoji: regSkill.icon_emoji,
          icon_background: regSkill.icon_background,
          category: regSkill.category,
          is_builtin: true,
          registry_slug: regSkill.slug,
          content_url: regSkill.content_url,
          original_tags: regSkill.tags,
          prerequisites: regSkill.prerequisites,
          compatibility: regSkill.compatibility,
          installed_content_hash: check.remoteHash,
          installed_version: regSkill.version,
          updated_from_store_at: now,
        });

        if (!updatedSkill) {
          return null;
        }
        return { status: 'updated', skill: updatedSkill, check };
      },

      installRegistrySkill: async (regSkill) => {
        try {
          const duplicateSkill = findDuplicateMySkill(get().skills, regSkill);
          if (duplicateSkill) {
            throw new Error('ISkill 已存在');
          }

          const fetchOptions = getRegistryContentFetchOptions();
          let effectiveContent = regSkill.content;
          let sourceDir = regSkill.local_path?.trim() || null;

          try {
            if (isSkillHubDownloadUrl(regSkill.content_url)) {
              const extracted = await fetchOptions.extractSkillHubArchive!(
                regSkill.slug,
                regSkill.version,
              );
              effectiveContent = extracted.content;
              sourceDir = extracted.cacheDir;
            } else if (isClawHubDownloadUrl(regSkill.content_url)) {
              const extracted = await fetchOptions.extractClawhubArchive!(regSkill.slug);
              effectiveContent = extracted.content;
              sourceDir = extracted.cacheDir;
            } else {
              effectiveContent = await fetchRegistrySkillRemoteContent(
                regSkill,
                (url) => window.api.skill.fetchRemoteContent(url),
                (url) => window.api.skill.fetchRemoteBinary(url),
                fetchOptions,
              );
              if (!sourceDir) {
                sourceDir = await resolveRegistrySkillSourceDir(regSkill);
              }
            }
          } catch (fetchError) {
            console.warn(
              `Failed to fetch fresh SKILL.md for "${regSkill.slug}", falling back to cached registry content:`,
              fetchError,
            );
          }

          if (!hasMeaningfulSkillBody(effectiveContent)) {
            throw new Error(
              `Unable to fetch the full SKILL.md for "${regSkill.name}". The registry only has summary metadata right now, so installation was blocked to avoid creating an incomplete skill.`,
            );
          }

          const skillName = getRegistrySkillInstallName(regSkill);
          const installedHash = await computeSkillContentHash(effectiveContent);
          const installedAt = Date.now();
          const newSkill = await window.api.skill.create({
            name: skillName,
            description: regSkill.description,
            instructions: effectiveContent,
            content: effectiveContent,
            protocol_type: 'skill',
            version: regSkill.version,
            author: regSkill.author,
            source_url: regSkill.source_url,
            tags: [],
            original_tags: regSkill.tags,
            is_favorite: false,
            icon_url: regSkill.icon_url,
            icon_emoji: regSkill.icon_emoji,
            category: regSkill.category,
            is_builtin: true,
            registry_slug: regSkill.slug,
            content_url: regSkill.content_url,
            installed_content_hash: installedHash,
            installed_version: regSkill.version,
            installed_at: installedAt,
            updated_from_store_at: installedAt,
            prerequisites: regSkill.prerequisites,
            compatibility: regSkill.compatibility,
          });
          if (newSkill) {
            try {
              if (isSkillsShRegistrySkill(regSkill) && regSkill.source_url) {
                const repoPath = await window.api.skill.saveRemoteGitToRepo(newSkill.id, {
                  repoUrl: regSkill.source_url,
                  directory: getRegistrySkillDirectory(regSkill),
                  installName: regSkill.install_name,
                });
                if (repoPath) {
                  await window.api.skill.syncFromRepo(newSkill.id);
                }
              } else if (sourceDir) {
                const repoPath = await window.api.skill.saveToRepo(skillName, sourceDir);
                if (repoPath) {
                  await window.api.skill.update(newSkill.id, {
                    local_repo_path: repoPath,
                  });
                }
              } else {
                await window.api.skill.writeLocalFile(newSkill.id, 'SKILL.md', effectiveContent);
                await syncRemoteGitHubSkillRepo(
                  newSkill.id,
                  regSkill.source_url,
                  regSkill.content_url,
                );
              }
            } catch (repoError) {
              console.warn(
                `Failed to create local repo for registry skill "${regSkill.slug}":`,
                repoError,
              );
              if (isSkillsShRegistrySkill(regSkill)) {
                await window.api.skill.delete(newSkill.id).catch((deleteError) => {
                  console.warn(
                    `Failed to roll back incomplete registry skill "${regSkill.slug}":`,
                    deleteError,
                  );
                });
                throw repoError;
              }
            }
            await get().loadSkills();
            return newSkill;
          }
          return null;
        } catch (error: unknown) {
          throw new Error(getErrorMessage(error) || 'Failed to install skill');
        }
      },

      installFromRegistry: async (slug) => {
        const regSkill = getRegistrySkillCandidates(get()).find((skill) => skill.slug === slug);
        if (!regSkill) return null;
        return get().installRegistrySkill(regSkill);
      },

      uninstallRegistrySkill: async (slug) => {
        const { skills, loadSkills } = get();
        const skill = skills.find((s) => s.registry_slug === slug);
        if (!skill) return false;

        try {
          const success = await window.api.skill.delete(skill.id);
          if (success) {
            await loadSkills();
            return true;
          }
          return false;
        } catch (error) {
          console.error('Failed to uninstall registry skill:', error);
          return false;
        }
      },

      setStoreSearchQuery: (query) => {
        set({ storeSearchQuery: query });
      },

      setStoreCategory: (category) => {
        set({ storeCategory: category });
      },

      selectRegistrySkill: (slug) => {
        set({ selectedRegistrySlug: slug });
      },

      selectStoreSource: (id) => {
        set({ selectedStoreSourceId: id });
      },

      upsertRegistrySkills: (incomingSkills) => {
        set((state) => {
          const merged = [...state.registrySkills];
          const indexBySlug = new Map(merged.map((skill, index) => [skill.slug, index]));

          for (const incoming of incomingSkills) {
            const index = indexBySlug.get(incoming.slug);
            if (index !== undefined) {
              merged[index] = { ...merged[index], ...incoming };
            } else {
              indexBySlug.set(incoming.slug, merged.length);
              merged.push(incoming);
            }
          }

          return { registrySkills: merged };
        });
      },

      addCustomStoreSource: (name, url, type = 'marketplace-json') => {
        const trimmedName = name.trim();
        const trimmedUrl = validateStoreSourceInput(url.trim(), type);
        if (!trimmedName || !trimmedUrl) return;

        const newId = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        set((state) => ({
          customStoreSources: [
            {
              id: newId,
              name: trimmedName,
              type,
              url: trimmedUrl,
              enabled: true,
              order: state.customStoreSources.length,
              createdAt: Date.now(),
            },
            ...state.customStoreSources,
          ],
          selectedStoreSourceId: newId,
        }));
      },

      removeCustomStoreSource: (id) => {
        set((state) => {
          const nextSources = state.customStoreSources.filter((source) => source.id !== id);
          const nextSelectedStoreSourceId =
            state.selectedStoreSourceId === id ? '' : state.selectedStoreSourceId;
          const nextRemoteStoreEntries = { ...state.remoteStoreEntries };
          delete nextRemoteStoreEntries[id];

          return {
            customStoreSources: nextSources,
            selectedStoreSourceId: nextSelectedStoreSourceId,
            remoteStoreEntries: nextRemoteStoreEntries,
          };
        });
      },

      toggleCustomStoreSource: (id) => {
        set((state) => ({
          customStoreSources: state.customStoreSources.map((source) =>
            source.id === id ? { ...source, enabled: !source.enabled } : source,
          ),
        }));
      },

      setRemoteStoreEntry: (sourceId, entry) => {
        set((state) => ({
          remoteStoreEntries: {
            ...state.remoteStoreEntries,
            [sourceId]: entry,
          },
        }));
      },

      getInstalledSlugs: () => {
        return get()
          .skills.filter((s) => s.registry_slug)
          .map((s) => s.registry_slug!);
      },

      getRecommendedSkills: () => {
        const installedSlugs = get().getInstalledSlugs();
        return get().registrySkills.filter((s) => !installedSlugs.includes(s.slug));
      },

      getFilteredRegistrySkills: () => {
        const { registrySkills, skills, storeSearchQuery } = get();
        const installedSlugs = skills.filter((s) => s.registry_slug).map((s) => s.registry_slug!);

        let filtered = registrySkills;

        if (storeSearchQuery.trim()) {
          const q = storeSearchQuery.toLowerCase();
          filtered = filtered.filter(
            (s) =>
              s.name.toLowerCase().includes(q) ||
              s.description.toLowerCase().includes(q) ||
              s.tags.some((tag) => tag.toLowerCase().includes(q)),
          );
        }

        const sortByName = (list: IRegistrySkill[]) =>
          [...list].sort((left, right) =>
            left.name.localeCompare(right.name, 'en', { sensitivity: 'base' }),
          );

        const installed = sortByName(filtered.filter((s) => installedSlugs.includes(s.slug)));
        const recommended = sortByName(filtered.filter((s) => !installedSlugs.includes(s.slug)));

        return { installed, recommended };
      },

      // ─── Translation / 翻译 ───
      translationCache: {} as Record<string, ITranslationCacheEntry>,

      translateContent: async (content, cacheKey, targetLang, options) => {
        const sourceFingerprint =
          options?.sourceFingerprint ?? computeSkillContentFingerprint(content);

        if (!options?.forceRefresh) {
          const cached = getTranslationStateFromCache(
            get().translationCache,
            cacheKey,
            sourceFingerprint,
          );
          if (cached.value) {
            return cached.value;
          }
        }

        // Get AI config from settings store
        const settingsState = useSettingsStore.getState();
        const config = resolveScenarioAIConfig({
          aiModels: settingsState.aiModels,
          scenarioModelDefaults: settingsState.scenarioModelDefaults,
          scenario: 'translation',
          type: 'chat',
          aiProvider: settingsState.aiProvider,
          aiApiProtocol: settingsState.aiApiProtocol,
          aiApiKey: settingsState.aiApiKey,
          aiApiUrl: settingsState.aiApiUrl,
          aiModel: settingsState.aiModel,
        });

        if (!config?.apiKey || !config.apiUrl || !config.model) {
          throw new Error('AI_NOT_CONFIGURED');
        }

        try {
          const translationMode = settingsState.translationMode || 'immersive';

          const systemPrompt =
            translationMode === 'immersive'
              ? `You are a professional translator working on complete SKILL.md documents.

Return a valid SKILL.md document in ${targetLang}.

Rules:
1. The input may begin with YAML frontmatter between --- delimiters. Preserve the delimiters, key order, and valid YAML syntax.
2. In frontmatter, do NOT insert <t>...</t> lines. Keep YAML keys unchanged. Translate only human-readable text values such as description when appropriate. Leave identifiers, slug-like names, versions, URLs, file paths, and code-like values unchanged.
3. After the frontmatter, translate the markdown body in immersive mode: for each heading, paragraph, or list block, output the original block first, then output the translated block wrapped in <t>...</t>.
4. Do NOT translate fenced code blocks, inline code, command names, file paths, URLs, or YAML keys.
5. Preserve markdown structure. Output only the final SKILL.md document with no commentary.

Example input:
---
name: write
description: Help users write better.
---

## Overview
This skill helps you write tests.

Example output:
---
name: write
description: 帮助用户更好地写作。
---

## Overview
<t>## 概述</t>
This skill helps you write tests.
<t>此技能帮助你编写测试。</t>`
              : `You are a professional translator working on complete SKILL.md documents.

Return a valid translated SKILL.md document in ${targetLang}.

Rules:
1. Preserve YAML frontmatter delimiters, key order, and valid YAML syntax.
2. Keep YAML keys unchanged. Translate human-readable text values such as description when appropriate, but leave identifiers, slug-like names, versions, URLs, file paths, and code-like values unchanged.
3. Translate the markdown body fully while preserving markdown structure.
4. Do NOT translate fenced code blocks, inline code, command names, file paths, URLs, or YAML keys.
5. Output only the translated SKILL.md document with no commentary.`;

          const result = await chatCompletion(
            config,
            [
              { role: 'system', content: systemPrompt },
              { role: 'user', content },
            ],
            { temperature: 0.3, maxTokens: 8192 },
          );

          const translated = result.content;
          if (translated) {
            set((state) => {
              const updated = {
                ...state.translationCache,
                [cacheKey]: {
                  value: translated,
                  timestamp: Date.now(),
                  sourceFingerprint,
                },
              };
              return { translationCache: pruneTranslationCache(updated) };
            });
            return translated;
          }
          return null;
        } catch (error) {
          console.error('Translation failed:', error);
          throw error;
        }
      },

      getTranslationState: (cacheKey, sourceFingerprint) => {
        return getTranslationStateFromCache(get().translationCache, cacheKey, sourceFingerprint);
      },

      getTranslation: (cacheKey) => {
        return getTranslationStateFromCache(get().translationCache, cacheKey).value;
      },

      clearTranslation: (cacheKey) => {
        set((state) => {
          if (!state.translationCache[cacheKey]) {
            return state;
          }
          const nextCache = { ...state.translationCache };
          delete nextCache[cacheKey];
          return { translationCache: nextCache };
        });
      },
    }),
    {
      name: 'skill-store',
      migrate: (persisted) => {
        if (!persisted || typeof persisted !== 'object') {
          return persisted;
        }
        const state = persisted as { filterType?: string };
        if (state.filterType === 'favorites') {
          return { ...state, filterType: 'all' satisfies ESkillFilterType };
        }
        return state;
      },
      partialize: (state) => ({
        viewMode: state.viewMode,
        filterType: state.filterType,
        storeView: state.storeView,
        selectedProjectId: state.selectedProjectId,
        customStoreSources: state.customStoreSources,
        selectedStoreSourceId: state.selectedStoreSourceId,
        translationCache: pruneTranslationCache(state.translationCache),
      }),
    },
  ),
);
