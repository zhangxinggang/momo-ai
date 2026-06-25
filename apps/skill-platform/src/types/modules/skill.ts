import type { EAIProtocol } from './ai';

export type ESkillVisibility = 'private' | 'shared';

export interface ISkill {
  id: string;
  ownerUserId?: string | null;
  visibility?: ESkillVisibility;
  name: string;
  description?: string;
  instructions?: string; // System Prompt / SKILL.md content (alias for content)
  content?: string; // System Prompt / SKILL.md content
  mcp_config?: string; // JSON string (legacy, no longer used)
  protocol_type: 'skill' | 'mcp' | 'claude-code'; // 'skill' is the default for SKILL.md
  version?: string;
  author?: string;
  source_url?: string; // GitHub URL or registry source
  local_repo_path?: string; // Absolute path to the cloned/saved local repo directory
  tags?: string[]; // stored as JSON string in DB, parsed array in runtime
  original_tags?: string[]; // tags at import time; user-added tags = tags - original_tags
  is_favorite: boolean;
  currentVersion?: number;
  versionTrackingEnabled?: boolean;
  created_at: number;
  updated_at: number;

  // Skill Store fields
  // 技能商店字段
  icon_url?: string; // Skill icon URL (PNG/SVG/WebP)
  icon_emoji?: string; // Emoji icon fallback
  icon_background?: string; // Icon background color (hex/rgb/css color)
  category?: ESkillCategory; // Skill category
  is_builtin?: boolean; // Whether this is a built-in skill from registry
  registry_slug?: string; // Unique slug in the registry
  content_url?: string; // Remote SKILL.md URL
  installed_content_hash?: string; // Hash of the last store-installed/updated content
  installed_version?: string; // Store version at the last install/update
  installed_at?: number; // Timestamp of initial store install
  updated_from_store_at?: number; // Timestamp of the latest store update
  prerequisites?: string[]; // Prerequisites for using this skill
  compatibility?: string[]; // Compatible platforms

  // Safety fields (persisted to DB)
  safetyReport?: ISkillSafetyReport; // Latest safety scan result
}

export type ESkillCategory =
  | 'general'
  | 'office'
  | 'dev'
  | 'ai'
  | 'data'
  | 'management'
  | 'deploy'
  | 'design'
  | 'security'
  | 'meta';

export type DCreateSkill = Omit<ISkill, 'id' | 'created_at' | 'updated_at'>;
export type DUpdateSkill = Partial<Omit<ISkill, 'id' | 'created_at' | 'updated_at'>>;

export interface IMcpServerConfig {
  command: string;
  args?: string[];
  env?: Record<string, string>;
}

export interface ISkillMcpConfig {
  servers: Record<string, IMcpServerConfig>;
}

export interface ISkillChatParams {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stream?: boolean;
  enableThinking?: boolean;
  customParams?: Record<string, string | number | boolean>;
}

export interface ISkillManifest {
  name?: string;
  description?: string;
  version?: string;
  author?: string;
  tags?: string[];
  instructions?: string;
}

export interface DGitHubRepoOwner {
  login?: string;
}

export interface DGitHubRepoMetadata {
  default_branch?: string;
  owner?: DGitHubRepoOwner;
}

export interface DGitHubTreeEntry {
  path?: string;
  type?: string;
}

export interface DGitHubTreeResponse {
  tree?: DGitHubTreeEntry[];
}

export interface DMarketplaceReferenceEntry {
  url?: string;
  index?: string;
  manifest?: string;
}

export interface DMarketplaceSkillEntry {
  slug?: string;
  id?: string;
  name?: string;
  title?: string;
  install_name?: string;
  installName?: string;
  description?: string;
  category?: ESkillCategory;
  icon_url?: string;
  icon_background?: string;
  iconUrl?: string;
  icon_emoji?: string;
  iconEmoji?: string;
  author?: string;
  source_url?: string;
  sourceUrl?: string;
  repo_url?: string;
  repoUrl?: string;
  repository?: string;
  repo?: string;
  content_url?: string;
  contentUrl?: string;
  skill_url?: string;
  skillUrl?: string;
  raw_url?: string;
  rawUrl?: string;
  content?: string;
  tags?: string[];
  version?: string | number;
  prerequisites?: string[];
  compatibility?: string[];
  store_url?: string;
  storeUrl?: string;
  weekly_installs?: string;
  weeklyInstalls?: string;
  github_stars?: string;
  githubStars?: string;
  installed_on?: string[];
  installedOn?: string[];
  security_audits?: string[];
  securityAudits?: string[];
}

export interface DMarketplaceRegistryDocument {
  skills?: DMarketplaceSkillEntry[];
  marketplaces?: Array<string | DMarketplaceReferenceEntry>;
  sources?: Array<string | DMarketplaceReferenceEntry>;
  registries?: Array<string | DMarketplaceReferenceEntry>;
}

/**
 * Registry skill definition (from built-in or remote registry)
 * 注册表技能定义（来自内置或远程注册表）
 */
export interface IRegistrySkill {
  slug: string;
  name: string;
  install_name?: string;
  /** 商店来源标识，如 skills.sh */
  source_label?: string;
  /** Git 仓库内 skill 包目录 */
  source_directory?: string;
  /** skill 包内 SKILL.md 相对路径 */
  canonical_skill_path?: string;
  description: string;
  category: ESkillCategory;
  icon_url?: string;
  icon_background?: string;
  icon_emoji?: string;
  author: string;
  source_url: string;
  store_url?: string;
  tags: string[];
  version: string;
  content: string; // Embedded SKILL.md content
  content_url?: string; // Remote SKILL.md URL (for updates)
  /** 商店本地缓存目录（data/skills/source 下 skill 文件夹路径） */
  local_path?: string;
  prerequisites?: string[];
  compatibility?: string[];
  weekly_installs?: string;
  github_stars?: string;
  installed_on?: string[];
  security_audits?: string[];
}

export interface ISkillStoreSource {
  id: string;
  name: string;
  type: 'official' | 'community' | 'marketplace-json' | 'git-repo' | 'local-dir';
  url: string;
  enabled: boolean;
  order?: number;
  createdAt: number;
}

export interface ISkillRegistry {
  version: string;
  updated_at: string;
  skills: IRegistrySkill[];
}

/**
 * Skill version snapshot
 * Skill 版本快照
 */
export interface ISkillVersion {
  id: string;
  skillId: string;
  version: number;
  content?: string;
  filesSnapshot?: ISkillFileSnapshot[];
  note?: string;
  createdAt: string;
}

/**
 * Skill file snapshot (for multi-file skills)
 * Skill 文件快照（用于多文件 skill）
 */
export interface ISkillFileSnapshot {
  relativePath: string;
  content: string;
}

/**
 * Local repo file entry from the main process
 * 主进程返回的本地仓库文件条目
 */
export interface ISkillLocalFileEntry {
  path: string;
  content: string;
  isDirectory: boolean;
}

/**
 * Local repo file tree entry metadata.
 * 本地仓库文件树元数据。
 */
export interface ISkillLocalFileTreeEntry {
  path: string;
  isDirectory: boolean;
  size?: number;
}

/**
 * Scanned local skill (not yet imported)
 * 扫描到的本地技能（尚未导入）
 */
/**
 * Result of a `scanLocal()` batch import operation.
 * Includes count of imported skills and names of skills that were
 * skipped due to name collisions with already-installed skills.
 */
export interface IScanLocalResult {
  imported: number;
  skipped: string[];
}

export interface ISkillProject {
  id: string;
  name: string;
  rootPath: string;
  scanPaths: string[];
  createdAt: number;
  updatedAt: number;
  lastScannedAt?: number;
}

export type ESkillSafetySeverity = 'info' | 'warn' | 'high';

export type ESkillSafetyLevel = 'safe' | 'warn' | 'high-risk' | 'blocked';

export interface ISkillSafetyFinding {
  code: string;
  severity: ESkillSafetySeverity;
  title: string;
  detail: string;
  filePath?: string;
  evidence?: string;
}

export interface ISkillSafetyReport {
  level: ESkillSafetyLevel;
  summary: string;
  findings: ISkillSafetyFinding[];
  recommendedAction: 'allow' | 'review' | 'block';
  scannedAt: number;
  checkedFileCount: number;
  /** Which method produced this report: "ai" or "static" */
  scanMethod: 'ai' | 'static';
  /**
   * Numeric safety score 0-100 (higher = safer).
   * blocked=0-10, high-risk=20-40, warn=50-70, safe=80-100
   */
  score?: number;
}

/**
 * Minimal AI model config passed from renderer to main process
 * for AI-powered safety scanning.
 */
export interface ISafetyScanAiConfig {
  provider: string;
  apiProtocol: EAIProtocol;
  apiKey: string;
  apiUrl: string;
  model: string;
}

export interface ISkillSafetyScanInput {
  name?: string;
  content?: string;
  sourceUrl?: string;
  contentUrl?: string;
  localRepoPath?: string;
  securityAudits?: string[];
  /** AI model config for intelligent scanning; omit to use static-only scan */
  aiConfig?: ISafetyScanAiConfig;
}

export interface IScannedSkill {
  name: string;
  description: string;
  version?: string;
  author: string;
  tags: string[];
  instructions: string;
  /** Absolute path to the SKILL.md file; used for dedup and installed-check */
  filePath: string;
  /** Parent directory of the SKILL.md file (skill folder path) */
  localPath: string;
  platforms: string[];
  safetyReport?: ISkillSafetyReport;
  /**
   * True when another scanned skill at a different path shares the same
   * name (case-insensitive).  Batch import will fail for all but the first
   * of such duplicates, so the UI should warn the user.
   */
  nameConflict?: boolean;
}

/** 内置默认技能 zip 预览项 */
export interface IDefaultSkillPreview {
  zipFileName: string;
  name: string;
  description: string;
  version?: string;
  author: string;
  tags: string[];
  instructions: string;
  extractDir: string;
  isInstalled: boolean;
  existingSkillId?: string;
}

/** 批量导入默认技能结果 */
export interface IDefaultSkillImportResult {
  imported: number;
  overwritten: number;
  skipped: number;
  failed: Array<{ zipFileName: string; reason: string }>;
}
