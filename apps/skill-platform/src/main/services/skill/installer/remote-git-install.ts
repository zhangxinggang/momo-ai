import * as fs from 'fs/promises';
import * as path from 'path';

import { parseSkillMd } from '../safety/validator';
import { fileExists } from './internal';
import { saveToLocalRepo } from './repo';
import { gitClone } from './utils';

interface IParsedGitRepo {
  owner: string;
  repo: string;
  cloneUrl: string;
}

function parseGitRepoUrl(repoUrl: string): IParsedGitRepo | null {
  const trimmed = repoUrl.trim().replace(/\.git$/i, '');
  const httpsMatch = trimmed.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)/i);
  if (httpsMatch) {
    const owner = httpsMatch[1];
    const repo = httpsMatch[2];
    return {
      owner,
      repo,
      cloneUrl: `https://github.com/${owner}/${repo}.git`,
    };
  }

  const sshMatch = trimmed.match(/^git@github\.com:([^/]+)\/([^/]+)/i);
  if (sshMatch) {
    const owner = sshMatch[1];
    const repo = sshMatch[2];
    return {
      owner,
      repo,
      cloneUrl: `https://github.com/${owner}/${repo}.git`,
    };
  }

  return null;
}

function isPathWithin(baseDir: string, targetPath: string): boolean {
  const relative = path.relative(baseDir, targetPath);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function normalizeLookupValue(value?: string | null): string {
  return (value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function collectSkillDirs(scanPath: string, depth = 0): Promise<string[]> {
  if (depth > 6 || !(await fileExists(scanPath))) {
    return [];
  }

  if (await fileExists(path.join(scanPath, 'SKILL.md'))) {
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
    if (!entry.isDirectory() || entry.name.startsWith('.') || entry.name === 'node_modules') {
      continue;
    }
    const nested = await collectSkillDirs(path.join(scanPath, entry.name), depth + 1);
    result.push(...nested);
  }

  return result;
}

async function resolveSingleSkillDirFromRepo(repoDir: string): Promise<string> {
  if (await fileExists(path.join(repoDir, 'SKILL.md'))) {
    return repoDir;
  }

  const skillDirs = await collectSkillDirs(repoDir);
  if (skillDirs.length === 1) {
    return skillDirs[0];
  }
  if (skillDirs.length === 0) {
    throw new Error('仓库中未找到 SKILL.md');
  }
  throw new Error('仓库包含多个 skill，请指定子目录');
}

async function resolveSkillDirFromRepo(
  repoDir: string,
  skillName: string,
  installName?: string,
): Promise<string> {
  const skillDirs = await collectSkillDirs(repoDir);

  if (skillDirs.length <= 1) {
    return resolveSingleSkillDirFromRepo(repoDir);
  }

  const targetNames = new Set([skillName, installName].map(normalizeLookupValue).filter(Boolean));
  const matches: string[] = [];

  for (const skillDir of skillDirs) {
    const skillMdPath = path.join(skillDir, 'SKILL.md');
    const content = await fs.readFile(skillMdPath, 'utf-8').catch(() => '');
    const parsedName = parseSkillMd(content)?.frontmatter.name;
    const candidateNames = [
      parsedName,
      path.basename(skillDir),
      path.basename(path.dirname(skillDir)),
    ].map(normalizeLookupValue);

    if (candidateNames.some((name) => targetNames.has(name))) {
      matches.push(skillDir);
    }
  }

  if (matches.length === 1) {
    return matches[0];
  }
  if (matches.length > 1) {
    throw new Error(`仓库中存在多个与 "${skillName}" 匹配的 skill，请指定子目录`);
  }
  throw new Error(`仓库中存在多个 skill，但没有与 "${skillName}" 匹配的目录`);
}

export interface ISaveRemoteGitSkillOptions {
  repoUrl: string;
  branch?: string;
  directory?: string;
  skillName: string;
  installName?: string;
  skillsDir: string;
}

/** 从远程 Git 仓库克隆 skill 包并保存到本地仓库目录 */
export async function saveRemoteGitSkillToLocalRepo(
  options: ISaveRemoteGitSkillOptions,
): Promise<string> {
  const parsedRepo = parseGitRepoUrl(options.repoUrl);
  if (!parsedRepo) {
    throw new Error('无效的 Git 仓库地址，须为 https://github.com/{owner}/{repo}');
  }

  const tempRoot = await fs.mkdtemp(path.join(options.skillsDir, '.remote-import-'));
  const repoDir = path.join(tempRoot, `${parsedRepo.owner}-${parsedRepo.repo}`);

  try {
    await gitClone(parsedRepo.cloneUrl, repoDir);

    const requestedDirectory = options.directory?.trim().replace(/^\/+|\/+$/g, '');
    let skillDir: string;

    if (requestedDirectory) {
      const candidateDir = path.resolve(repoDir, requestedDirectory);
      if (!isPathWithin(repoDir, candidateDir)) {
        throw new Error('路径越界：skill 目录位于仓库之外');
      }
      if (!(await fileExists(path.join(candidateDir, 'SKILL.md')))) {
        throw new Error(`目录中未找到 SKILL.md: ${requestedDirectory}`);
      }
      skillDir = candidateDir;
    } else {
      skillDir = await resolveSkillDirFromRepo(repoDir, options.skillName, options.installName);
    }

    return await saveToLocalRepo(options.skillName, skillDir);
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true }).catch(() => undefined);
  }
}
