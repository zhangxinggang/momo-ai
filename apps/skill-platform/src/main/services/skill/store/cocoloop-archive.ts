import fs from 'fs/promises';
import path from 'path';

import { unzipSync } from 'fflate';

import { getSkillsSourceDir } from '../../../runtime-paths';
import { SkillInstaller } from '../installer';

const COCOLOOP_DOWNLOAD_BASE_URL = 'https://dl.cocoloop.cn/bss/skills';
const COCOLOOP_DETAIL_BASE_URL = 'https://api.cocoloop.cn/api/v1/store/skills';

export interface IExtractCocoloopSkillResult {
  cacheDir: string;
  content: string;
}

interface ICocoloopDetailPayload {
  asset_name?: string;
  download_url?: string;
}

interface ICocoloopDetailResponse {
  code?: number;
  data?: ICocoloopDetailPayload;
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

function getCocoloopCacheDir(slug: string): string {
  return path.join(getSkillsSourceDir(), 'cocoloop', slug);
}

function buildDownloadUrlFromAssetName(assetName: string): string {
  const trimmed = assetName.trim().replace(/^\/+/, '');
  return `${COCOLOOP_DOWNLOAD_BASE_URL}/${encodeURIComponent(trimmed)}`;
}

function resolveDownloadUrlFromDetail(detail: ICocoloopDetailPayload): string | null {
  const direct = detail.download_url?.trim();
  if (direct) {
    return direct;
  }
  const assetName = detail.asset_name?.trim();
  if (assetName) {
    return buildDownloadUrlFromAssetName(assetName);
  }
  return null;
}

async function resolveCocoloopDownloadUrl(slug: string, downloadUrl?: string): Promise<string> {
  const direct = downloadUrl?.trim();
  if (direct) {
    return direct;
  }

  const detailUrl = `${COCOLOOP_DETAIL_BASE_URL}/${encodeURIComponent(slug)}`;
  const response = await fetch(detailUrl);
  if (!response.ok) {
    throw new Error(`CocoLoop 详情拉取失败 (${response.status})`);
  }

  const payload = (await response.json()) as ICocoloopDetailResponse;
  const resolved = payload.data ? resolveDownloadUrlFromDetail(payload.data) : null;
  if (!resolved) {
    throw new Error(`无法解析 CocoLoop Skill "${slug}" 的下载地址`);
  }
  return resolved;
}

/** 下载 CocoLoop 压缩包并解压到 data/skills/source/cocoloop/{slug} */
export async function extractCocoloopSkillToCache(
  slug: string,
  downloadUrl?: string,
): Promise<IExtractCocoloopSkillResult> {
  const trimmedSlug = slug.trim();
  if (!trimmedSlug) {
    throw new Error('CocoLoop skill id 不能为空');
  }

  const cacheDir = getCocoloopCacheDir(trimmedSlug);
  const resolvedDownloadUrl = await resolveCocoloopDownloadUrl(trimmedSlug, downloadUrl);
  const base64 = await SkillInstaller.fetchRemoteBinary(resolvedDownloadUrl);
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
    throw new Error(`CocoLoop 压缩包 "${trimmedSlug}" 为空`);
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
    throw new Error(`CocoLoop 压缩包 "${trimmedSlug}" 中未找到 SKILL.md`);
  }

  const content = await fs.readFile(skillMdPath, 'utf-8');
  return { cacheDir, content };
}
