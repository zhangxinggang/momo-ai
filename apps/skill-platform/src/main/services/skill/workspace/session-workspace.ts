import * as fs from 'fs/promises';
import * as path from 'path';

import { getSkillSessionWorkspaceDir } from '../../../runtime-paths';
import { writeLocalRepoFileByPath } from '../installer/repo';

const SESSION_SEED_MARKER = '.session-seeded';
const SEED_EXCLUDE_DIRS = new Set(['.git', 'node_modules']);

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function hasWorkspaceContent(workspaceDir: string): Promise<boolean> {
  let entries: string[];
  try {
    entries = await fs.readdir(workspaceDir);
  } catch {
    return false;
  }
  return entries.some((name) => name !== SESSION_SEED_MARKER);
}

async function copyRepoSeed(srcDir: string, destDir: string): Promise<void> {
  await fs.mkdir(destDir, { recursive: true });
  let entries;
  try {
    entries = await fs.readdir(srcDir, { withFileTypes: true });
  } catch {
    throw new Error(`无法读取技能仓库：${srcDir}`);
  }

  for (const entry of entries) {
    if (SEED_EXCLUDE_DIRS.has(entry.name)) {
      continue;
    }
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      await copyRepoSeed(srcPath, destPath);
    } else if (entry.isFile()) {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

const CRITICAL_SEED_DIRS = ['scripts', 'ooxml', 'data'];

/** 工作区缺少关键目录时，从源仓库补拷贝（不覆盖已有文件） */
async function ensureCriticalDirsSeeded(sourceRepo: string, workspaceDir: string): Promise<void> {
  for (const dirName of CRITICAL_SEED_DIRS) {
    const srcDir = path.join(sourceRepo, dirName);
    const destDir = path.join(workspaceDir, dirName);
    if (!(await pathExists(srcDir))) {
      continue;
    }
    if (await pathExists(destDir)) {
      continue;
    }
    await copyRepoSeed(srcDir, destDir);
  }
}

async function readMarkerRepoPath(markerPath: string): Promise<string | null> {
  try {
    const raw = await fs.readFile(markerPath, 'utf8');
    const parsed = JSON.parse(raw) as { repoPath?: string };
    return typeof parsed.repoPath === 'string' && parsed.repoPath.trim()
      ? path.normalize(parsed.repoPath.trim())
      : null;
  } catch {
    return null;
  }
}

/** 确保会话工作区存在；首次调用时从技能仓库种子拷贝（排除 .git、node_modules） */
export async function ensureSkillSessionWorkspace(
  repoPath: string,
  sessionId: string,
): Promise<string> {
  const normalizedRepo = path.normalize(repoPath.trim());
  if (!normalizedRepo) {
    throw new Error('技能未关联本地仓库');
  }
  if (!(await pathExists(normalizedRepo))) {
    throw new Error(`本地仓库路径不存在：${normalizedRepo}`);
  }

  const workspaceDir = getSkillSessionWorkspaceDir(sessionId);
  await fs.mkdir(workspaceDir, { recursive: true });

  const markerPath = path.join(workspaceDir, SESSION_SEED_MARKER);
  if (await pathExists(markerPath)) {
    const markedRepo = await readMarkerRepoPath(markerPath);
    if (markedRepo && markedRepo !== normalizedRepo) {
      await copyRepoSeed(normalizedRepo, workspaceDir);
      await fs.writeFile(
        markerPath,
        JSON.stringify({ repoPath: normalizedRepo, seededAt: Date.now() }, null, 2),
        'utf8',
      );
    } else {
      await ensureCriticalDirsSeeded(normalizedRepo, workspaceDir);
    }
    return workspaceDir;
  }

  if (!(await hasWorkspaceContent(workspaceDir))) {
    await copyRepoSeed(normalizedRepo, workspaceDir);
  }

  await fs.writeFile(
    markerPath,
    JSON.stringify({ repoPath: normalizedRepo, seededAt: Date.now() }, null, 2),
    'utf8',
  );
  return workspaceDir;
}

/** 写入会话工作区内的相对路径文件 */
export async function writeSessionWorkspaceFile(
  sessionId: string,
  relativePath: string,
  content: string,
): Promise<void> {
  const workspaceDir = getSkillSessionWorkspaceDir(sessionId);
  await fs.mkdir(workspaceDir, { recursive: true });
  await writeLocalRepoFileByPath(workspaceDir, relativePath, content);
}
