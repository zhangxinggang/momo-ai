import fs from 'fs/promises';
import path from 'path';

import { unzipSync } from 'fflate';

function normalizeZipEntryPath(entryPath: string): string | null {
  const normalized = entryPath.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!normalized || normalized.startsWith('__MACOSX/')) {
    return null;
  }
  return normalized;
}

/** 若 zip 内所有文件共享单一根目录，返回该前缀（含尾部 /） */
export function stripCommonZipRootPrefix(entryPaths: string[]): string {
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

/** 在根目录或一层子目录中查找 SKILL.md */
export async function findSkillMdFile(rootDir: string): Promise<string | null> {
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

/** 解压 zip 到目标目录（去掉公共根前缀，忽略 __MACOSX） */
export async function extractZipToDir(archiveData: Uint8Array, targetDir: string): Promise<void> {
  const archiveEntries = unzipSync(archiveData);

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
    throw new Error('压缩包为空');
  }

  const rootPrefix = stripCommonZipRootPrefix(
    normalizedEntries.map((entry) => entry.normalizedPath),
  );

  await fs.rm(targetDir, { recursive: true, force: true });
  await fs.mkdir(targetDir, { recursive: true });

  for (const entry of normalizedEntries) {
    const relativePath =
      rootPrefix && entry.normalizedPath.startsWith(rootPrefix)
        ? entry.normalizedPath.slice(rootPrefix.length)
        : entry.normalizedPath;
    if (!relativePath) {
      continue;
    }

    const targetPath = path.join(targetDir, relativePath);
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, entry.data);
  }
}
