import fs from 'fs/promises';
import os from 'os';
import path from 'path';

import type { IScannedSkill } from '@/types/modules';
import { downloadTemplate } from 'giget';

import { getSkillsSourceDir } from '../../../runtime-paths';
import { sanitizeImportedSkillDraft } from '../safety/import-sanitize';
import { parseSkillMd } from '../safety/validator';

/** 扫描时跳过的目录 */
const SKIP_SCAN_DIR_NAMES = new Set([
  '.git',
  'node_modules',
  '__pycache__',
  '.github',
  '.vscode',
  '.idea',
  'dist',
  'build',
  'coverage',
  '.next',
  '.nuxt',
  'vendor',
]);

/** 允许扫描的点目录（如 OpenAI .curated） */
const ALLOWED_DOT_DIRS = new Set(['.curated']);

const MAX_SCAN_DEPTH = 6;
const DEFAULT_GIT_REF = 'main';

export interface ISyncGitStoreOptions {
  repoUrl: string;
  forceRefresh?: boolean;
  gitRef?: string;
}

export interface ISyncGitStoreResult {
  cacheDir: string;
  repoRoot: string;
  skills: IScannedSkill[];
}

/** 将仓库 URL 转为本地缓存目录名 */
export function sanitizeRepoUrlForCacheDir(repoUrl: string): string {
  return repoUrl.trim().replace(/[:\\/]/g, '');
}

function parseGithubRepo(repoUrl: string): string | null {
  const trimmed = repoUrl.trim();
  const withoutGitSuffix = trimmed.replace(/\.git$/i, '');
  const githubHttps = withoutGitSuffix.replace(/^git@github\.com:/i, 'https://github.com/');
  const githubMatch = githubHttps.match(/^https?:\/\/github\.com\/([^/]+\/[^/]+)/i);
  return githubMatch?.[1] ?? null;
}

/** 规范化 giget 可用的 GitHub 源标识 */
export function normalizeGitStoreSource(repoUrl: string, gitRef = DEFAULT_GIT_REF): string {
  const githubRepo = parseGithubRepo(repoUrl);
  if (githubRepo) {
    return `github:${githubRepo}#${gitRef}`;
  }
  return repoUrl.trim();
}

function getStoreCacheDir(repoUrl: string): string {
  return path.join(getSkillsSourceDir(), sanitizeRepoUrlForCacheDir(repoUrl));
}

function getGigetTarCachePath(repoUrl: string, gitRef: string): string | null {
  const githubRepo = parseGithubRepo(repoUrl);
  if (!githubRepo) {
    return null;
  }
  const cacheName = githubRepo.replace('/', '-');
  return path.join(os.tmpdir(), 'giget', 'github', cacheName, `${gitRef}.tar.gz`);
}

async function clearGigetTarCache(repoUrl: string, gitRef: string): Promise<void> {
  const tarPath = getGigetTarCachePath(repoUrl, gitRef);
  if (!tarPath) {
    return;
  }
  await fs.rm(tarPath, { force: true });
  await fs.rm(`${tarPath}.json`, { force: true });
}

function isRecoverableDownloadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  const code = (error as NodeJS.ErrnoException)?.code;
  return (
    code === 'Z_DATA_ERROR' ||
    message.includes('ZlibError') ||
    message.includes('incorrect data check') ||
    message.includes('Tarball not found') ||
    message.includes('404 Not Found')
  );
}

async function downloadGitStoreRepo(
  cacheDir: string,
  repoUrl: string,
  gitRef: string,
): Promise<void> {
  const source = normalizeGitStoreSource(repoUrl, gitRef);
  await downloadTemplate(source, {
    dir: cacheDir,
    force: true,
  });
}

function shouldSkipDirName(name: string): boolean {
  if (SKIP_SCAN_DIR_NAMES.has(name)) {
    return true;
  }
  if (name.startsWith('.')) {
    return !ALLOWED_DOT_DIRS.has(name);
  }
  return false;
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readManifest(
  skillFolderPath: string,
): Promise<{ name?: string; description?: string; version?: string; author?: string }> {
  const manifestPath = path.join(skillFolderPath, 'manifest.json');
  if (!(await pathExists(manifestPath))) {
    return {};
  }
  try {
    const raw = await fs.readFile(manifestPath, 'utf-8');
    return JSON.parse(raw) as {
      name?: string;
      description?: string;
      version?: string;
      author?: string;
    };
  } catch {
    return {};
  }
}

/** 递归查找仓库内实际内容根（giget 可能多一层目录） */
async function resolveRepoContentRoot(cacheDir: string): Promise<string> {
  if (!(await pathExists(cacheDir))) {
    return cacheDir;
  }

  if (await pathExists(path.join(cacheDir, 'SKILL.md'))) {
    return cacheDir;
  }

  const entries = await fs.readdir(cacheDir, { withFileTypes: true });
  const subDirs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  if (subDirs.length === 1) {
    const nested = path.join(cacheDir, subDirs[0]);
    const nestedEntries = await fs.readdir(nested, { withFileTypes: true });
    const hasSkillMdAtRoot = nestedEntries.some(
      (entry) => entry.isFile() && entry.name.toLowerCase() === 'skill.md',
    );
    const hasChildDirs = nestedEntries.some((entry) => entry.isDirectory());
    if (hasChildDirs || hasSkillMdAtRoot) {
      return nested;
    }
  }

  return cacheDir;
}

async function collectStoreSkillDirs(scanPath: string, depth = 0): Promise<string[]> {
  if (depth > MAX_SCAN_DEPTH || !(await pathExists(scanPath))) {
    return [];
  }

  if (await pathExists(path.join(scanPath, 'SKILL.md'))) {
    return [scanPath];
  }

  const result: string[] = [];
  let entries;
  try {
    entries = await fs.readdir(scanPath, { withFileTypes: true });
  } catch {
    return result;
  }

  for (const entry of entries) {
    if (!entry.isDirectory() || shouldSkipDirName(entry.name)) {
      continue;
    }
    const childPath = path.join(scanPath, entry.name);
    const nested = await collectStoreSkillDirs(childPath, depth + 1);
    result.push(...nested);
  }

  return result;
}

async function scanSkillFolder(skillFolderPath: string): Promise<IScannedSkill | null> {
  const skillMdPath = path.join(skillFolderPath, 'SKILL.md');
  if (!(await pathExists(skillMdPath))) {
    return null;
  }

  try {
    const instructions = await fs.readFile(skillMdPath, 'utf-8');
    const manifest = await readManifest(skillFolderPath);
    const parsedSkill = parseSkillMd(instructions);
    const sanitized = sanitizeImportedSkillDraft(
      {
        name: parsedSkill?.frontmatter.name,
        fallbackName: manifest.name || path.basename(skillFolderPath),
        description: parsedSkill?.frontmatter.description,
        fallbackDescription: manifest.description || undefined,
        version: parsedSkill?.frontmatter.version,
        fallbackVersion: manifest.version,
        author: parsedSkill?.frontmatter.author,
        fallbackAuthor: manifest.author || undefined,
        tags: parsedSkill?.frontmatter.tags,
        fallbackTags: [],
        instructions,
        local_repo_path: skillFolderPath,
        protocol_type: 'skill',
      },
      { defaultTags: [] },
    );

    return {
      name: sanitized.name!,
      description: sanitized.description || manifest.description,
      version: sanitized.version,
      author: sanitized.author || manifest.author,
      tags: sanitized.tags,
      instructions: sanitized.instructions || instructions,
      filePath: skillMdPath,
      localPath: skillFolderPath,
      platforms: ['claude', 'cursor'],
    };
  } catch (error) {
    console.warn(`Failed to parse store skill at ${skillMdPath}:`, error);
    return null;
  }
}

/** 下载 Git 仓库到 data/skills/source 并扫描 skills */
export async function syncGitStoreSource(
  options: ISyncGitStoreOptions,
): Promise<ISyncGitStoreResult> {
  const repoUrl = options.repoUrl.trim();
  if (!repoUrl) {
    throw new Error('Git 仓库地址不能为空');
  }

  const gitRef = options.gitRef?.trim() || DEFAULT_GIT_REF;
  const cacheDir = getStoreCacheDir(repoUrl);
  const hasCache = await pathExists(cacheDir);

  if (options.forceRefresh && hasCache) {
    await fs.rm(cacheDir, { recursive: true, force: true });
    await clearGigetTarCache(repoUrl, gitRef);
  }

  const shouldDownload = options.forceRefresh || !(await pathExists(cacheDir));
  if (shouldDownload) {
    await fs.mkdir(path.dirname(cacheDir), { recursive: true });

    try {
      await downloadGitStoreRepo(cacheDir, repoUrl, gitRef);
    } catch (error) {
      if (!isRecoverableDownloadError(error)) {
        throw error;
      }

      await clearGigetTarCache(repoUrl, gitRef);
      await fs.rm(cacheDir, { recursive: true, force: true });
      await fs.mkdir(path.dirname(cacheDir), { recursive: true });
      await downloadGitStoreRepo(cacheDir, repoUrl, gitRef);
    }
  }

  const repoRoot = await resolveRepoContentRoot(cacheDir);
  const skillDirs = await collectStoreSkillDirs(repoRoot);
  const scanned = await Promise.all(skillDirs.map((dir) => scanSkillFolder(dir)));
  const skills = scanned.filter((skill): skill is IScannedSkill => skill !== null);

  skills.sort((left, right) => left.name.localeCompare(right.name, 'en', { sensitivity: 'base' }));

  return { cacheDir, repoRoot, skills };
}
