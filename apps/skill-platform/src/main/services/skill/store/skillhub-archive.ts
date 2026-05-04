import fs from 'fs/promises';
import path from 'path';

import { unzipSync } from 'fflate';

import { getProjectRoot } from '../../../runtime-paths';
import { SkillInstaller } from '../installer';

const SKILLHUB_CACHE_ROOT = 'temp/skills/skillhub';
const SKILLHUB_COS_BASE_URL = 'https://skillhub-1388575217.cos.accelerate.myqcloud.com/skills';

export interface IExtractSkillHubSkillResult {
  cacheDir: string;
  content: string;
}

function buildSkillHubDownloadUrl(slug: string, version?: string): string {
  const safeVersion = version?.trim() || '1.0.0';
  return `${SKILLHUB_COS_BASE_URL}/${encodeURIComponent(slug)}/${encodeURIComponent(safeVersion)}.zip`;
}

function decodeBase64ToUint8Array(base64: string): Uint8Array {
  const buffer = Buffer.from(base64, 'base64');
  return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
}

function normalizeZipEntryPath(entryPath: string): string | null {
  const normalized = entryPath.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!normalized || normalized.startsWith('__MACOSX/')) {
    return null;
  }
  return normalized;
}

function stripCommonZipRootPrefix(entryPaths: string[]): string {
  if (entryPaths.length === 0) {
    return '';
  }

  const segmentsList = entryPaths.map((entry) => entry.split('/').filter(Boolean));
  const firstSegments = segmentsList[0];
  if (!firstSegments || firstSegments.length === 0) {
    return '';
  }

  const hasSingleRoot = segmentsList.every(
    (segments) => segments.length > 1 && segments[0] === firstSegments[0],
  );
  return hasSingleRoot ? `${firstSegments[0]}/` : '';
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function findSkillMdFile(rootDir: string): Promise<string | null> {
  const directPath = path.join(rootDir, 'SKILL.md');
  if (await pathExists(directPath)) {
    return directPath;
  }

  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    const nestedPath = path.join(rootDir, entry.name, 'SKILL.md');
    if (await pathExists(nestedPath)) {
      return nestedPath;
    }
  }

  return null;
}

function getSkillHubCacheDir(slug: string): string {
  return path.join(getProjectRoot(), SKILLHUB_CACHE_ROOT, slug);
}

/** 下载 SkillHub 压缩包并解压到 temp/skills/skillhub/{slug} */
export async function extractSkillHubSkillToCache(
  slug: string,
  version?: string,
): Promise<IExtractSkillHubSkillResult> {
  const trimmedSlug = slug.trim();
  if (!trimmedSlug) {
    throw new Error('SkillHub slug 不能为空');
  }

  const cacheDir = getSkillHubCacheDir(trimmedSlug);
  const downloadUrl = buildSkillHubDownloadUrl(trimmedSlug, version);
  const base64 = await SkillInstaller.fetchRemoteBinary(downloadUrl);
  const archiveEntries = unzipSync(decodeBase64ToUint8Array(base64));

  const normalizedEntries = Object.entries(archiveEntries)
    .map(([entryPath, data]) => {
      const normalizedPath = normalizeZipEntryPath(entryPath);
      if (!normalizedPath || normalizedPath.endsWith('/')) {
        return null;
      }
      return { normalizedPath, data };
    })
    .filter((entry): entry is { normalizedPath: string; data: Uint8Array } => entry !== null);

  if (normalizedEntries.length === 0) {
    throw new Error(`SkillHub 压缩包 "${trimmedSlug}" 为空`);
  }

  const rootPrefix = stripCommonZipRootPrefix(
    normalizedEntries.map((entry) => entry.normalizedPath),
  );

  await fs.rm(cacheDir, { recursive: true, force: true });
  await fs.mkdir(cacheDir, { recursive: true });

  for (const entry of normalizedEntries) {
    const relativePath =
      rootPrefix && entry.normalizedPath.startsWith(rootPrefix)
        ? entry.normalizedPath.slice(rootPrefix.length)
        : entry.normalizedPath;
    if (!relativePath) {
      continue;
    }

    const targetPath = path.join(cacheDir, relativePath);
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, entry.data);
  }

  const skillMdPath = await findSkillMdFile(cacheDir);
  if (!skillMdPath) {
    throw new Error(`SkillHub 压缩包 "${trimmedSlug}" 中未找到 SKILL.md`);
  }

  const content = await fs.readFile(skillMdPath, 'utf-8');
  return { cacheDir, content };
}
