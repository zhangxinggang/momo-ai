import * as fs from 'fs/promises';
import * as path from 'path';

import { getRepoFolderBaseName, stripRedundantSkillPathPrefix } from './repo-path-normalize';

const NODE_SCRIPT_RE = /\bnode\s+(?:--[^\s]+\s+)*["']?((?:[\w.-]+[/\\])+\.(?:js|mjs|cjs))["']?/i;
const PYTHON_SCRIPT_RE = /\b(?:python|py)\s+(?:-[^\s]+\s+)*["']?((?:[\w.-]+[/\\])+\.py)["']?/i;

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function copyFileToWorkspace(
  sourceRepoPath: string,
  workspaceDir: string,
  relativePath: string,
): Promise<boolean> {
  const srcPath = path.join(sourceRepoPath, relativePath);
  if (!(await pathExists(srcPath))) {
    return false;
  }
  const destPath = path.join(workspaceDir, relativePath);
  await fs.mkdir(path.dirname(destPath), { recursive: true });
  await fs.copyFile(srcPath, destPath);
  return true;
}

async function findByBasename(
  rootDir: string,
  fileName: string,
  maxDepth = 4,
): Promise<string | null> {
  async function walk(dir: string, depth: number, relativeBase: string): Promise<string | null> {
    if (depth > maxDepth) {
      return null;
    }
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return null;
    }
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        continue;
      }
      const relative = relativeBase ? `${relativeBase}/${entry.name}` : entry.name;
      if (entry.isFile() && entry.name.toLowerCase() === fileName.toLowerCase()) {
        return relative.replace(/\\/g, '/');
      }
      if (entry.isDirectory()) {
        const found = await walk(path.join(dir, entry.name), depth + 1, relative);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }
  return walk(rootDir, 0, '');
}

async function listScriptFiles(rootDir: string, limit = 20): Promise<string[]> {
  const results: string[] = [];
  async function walk(dir: string, relativeBase: string, depth: number): Promise<void> {
    if (results.length >= limit || depth > 5) {
      return;
    }
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        continue;
      }
      const relative = relativeBase ? `${relativeBase}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        await walk(path.join(dir, entry.name), relative, depth + 1);
      } else if (/\.(js|mjs|cjs|py)$/i.test(entry.name)) {
        results.push(relative.replace(/\\/g, '/'));
      }
    }
  }
  await walk(rootDir, '', 0);
  return results;
}

function extractScriptPath(commandLine: string): string | null {
  const nodeMatch = commandLine.match(NODE_SCRIPT_RE);
  if (nodeMatch?.[1]) {
    return nodeMatch[1].replace(/\\/g, '/');
  }
  const pyMatch = commandLine.match(PYTHON_SCRIPT_RE);
  if (pyMatch?.[1]) {
    return pyMatch[1].replace(/\\/g, '/');
  }
  return null;
}

function replaceScriptPath(commandLine: string, oldRel: string, newRel: string): string {
  const escaped = oldRel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return commandLine.replace(new RegExp(escaped, 'i'), newRel);
}

async function resolveRelativeScript(
  workspaceDir: string,
  sourceRepoPath: string,
  rawScriptPath: string,
): Promise<string | null> {
  const repoFolder = getRepoFolderBaseName(sourceRepoPath);
  const relativePath = stripRedundantSkillPathPrefix(rawScriptPath, repoFolder);
  const normalized = relativePath.replace(/\\/g, '/');

  const workspaceFile = path.join(workspaceDir, normalized);
  if (await pathExists(workspaceFile)) {
    return normalized;
  }

  if (await copyFileToWorkspace(sourceRepoPath, workspaceDir, normalized)) {
    return normalized;
  }

  const baseName = path.basename(normalized);
  for (const root of [workspaceDir, sourceRepoPath]) {
    const found = await findByBasename(root, baseName);
    if (found) {
      if (root === sourceRepoPath) {
        await copyFileToWorkspace(sourceRepoPath, workspaceDir, found);
      }
      return found;
    }
  }

  return null;
}

export interface IResolveCommandScriptsInput {
  workspaceDir: string;
  sourceRepoPath: string;
  commandLines: string[];
}

export interface IResolveCommandScriptsResult {
  commandLines: string[];
  resolvedScripts: Array<{ from: string; to: string }>;
  error?: string;
}

/** 解析并修正命令中的脚本路径：从源仓库补拷贝、别名回退 */
export async function resolveCommandScriptsInWorkspace(
  input: IResolveCommandScriptsInput,
): Promise<IResolveCommandScriptsResult> {
  const workspaceDir = path.normalize(input.workspaceDir);
  const sourceRepoPath = path.normalize(input.sourceRepoPath);
  const resolvedScripts: Array<{ from: string; to: string }> = [];
  const nextCommands: string[] = [];

  for (const rawLine of input.commandLines) {
    let commandLine = rawLine.trim();
    const scriptPath = extractScriptPath(commandLine);
    if (!scriptPath) {
      nextCommands.push(commandLine);
      continue;
    }

    const resolved = await resolveRelativeScript(workspaceDir, sourceRepoPath, scriptPath);
    if (!resolved) {
      const available = await listScriptFiles(workspaceDir);
      const sourceAvailable =
        available.length === 0 ? await listScriptFiles(sourceRepoPath) : available;
      const hint =
        sourceAvailable.length > 0
          ? `工作区可用脚本：${sourceAvailable.slice(0, 15).join(', ')}`
          : '工作区中未找到任何脚本文件';
      return {
        commandLines: input.commandLines,
        resolvedScripts,
        error: `脚本不存在：${scriptPath}。${hint}。请使用 skill-run 调用仓库内已有脚本，或先用 artifact 块写入该脚本。`,
      };
    }

    if (resolved.replace(/\\/g, '/') !== scriptPath.replace(/\\/g, '/')) {
      commandLine = replaceScriptPath(commandLine, scriptPath, resolved);
      resolvedScripts.push({ from: scriptPath, to: resolved });
    }
    nextCommands.push(commandLine);
  }

  return { commandLines: nextCommands, resolvedScripts };
}
