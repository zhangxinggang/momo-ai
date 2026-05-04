import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import { resolveSkillShellEnv } from '../skill/runtime/toolchain';
import type { TCliAgentType } from './cli-templates';

function fileExists(targetPath: string): boolean {
  try {
    return fs.existsSync(targetPath);
  } catch {
    return false;
  }
}

function uniquePaths(paths: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of paths) {
    const normalized = path.normalize(item);
    if (!normalized || seen.has(normalized.toLowerCase())) {
      continue;
    }
    seen.add(normalized.toLowerCase());
    result.push(normalized);
  }
  return result;
}

/** 展开 Windows 注册表 Path 中的 %VAR% */
function expandWindowsEnv(value: string): string {
  return value.replace(/%([^%]+)%/g, (_, name: string) => process.env[name] ?? `%${name}%`);
}

/** 从注册表读取系统/用户 Path（GUI 启动的 Electron 常缺失用户 Path） */
function readWindowsRegistryPath(scope: 'user' | 'machine'): string {
  if (process.platform !== 'win32') {
    return '';
  }
  const regPath =
    scope === 'user'
      ? 'HKCU\\Environment'
      : 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment';
  try {
    const output = execSync(`reg query "${regPath}" /v Path`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    });
    const match = output.match(/Path\s+REG(?:_EXPAND_)?_SZ\s+(.+)/);
    return match?.[1]?.trim() ? expandWindowsEnv(match[1].trim()) : '';
  } catch {
    return '';
  }
}

function guessNodeInstallDir(): string | null {
  const candidates = [
    process.env.NVM_SYMLINK,
    process.env.NODE_HOME,
    process.platform === 'win32' ? path.join(process.env.ProgramFiles ?? '', 'nodejs') : undefined,
    process.platform === 'win32'
      ? path.join(process.env['ProgramFiles(x86)'] ?? '', 'nodejs')
      : undefined,
  ].filter(Boolean) as string[];

  for (const dir of candidates) {
    const nodePath = path.join(dir, process.platform === 'win32' ? 'node.exe' : 'node');
    if (fileExists(nodePath)) {
      return dir;
    }
  }
  return null;
}

/** 构建 CLI 子进程 PATH：合并注册表 Path、npm 全局目录、Node 等 */
export function buildCliPathEnv(): string {
  const parts: string[] = [];

  if (process.platform === 'win32') {
    parts.push(readWindowsRegistryPath('user'));
    parts.push(readWindowsRegistryPath('machine'));
    const appData = process.env.APPDATA;
    if (appData) {
      parts.push(path.join(appData, 'npm'));
    }
    const nvmHome = process.env.NVM_HOME;
    const nvmSymlink = process.env.NVM_SYMLINK;
    if (nvmHome) {
      parts.push(nvmHome);
    }
    if (nvmSymlink) {
      parts.push(nvmSymlink);
    }
    const programFiles = process.env.ProgramFiles;
    if (programFiles) {
      parts.push(path.join(programFiles, 'nodejs'));
    }
  }

  parts.push(resolveSkillShellEnv().pathEnv);

  return uniquePaths(parts.join(path.delimiter).split(path.delimiter)).join(path.delimiter);
}

/** 优先解析 Claude Code 原生 exe，绕过 .cmd / .ps1 包装 */
function resolveClaudeCodeExe(): string | null {
  const nodeDir = guessNodeInstallDir();
  if (!nodeDir) {
    return null;
  }
  const exePath = path.join(
    nodeDir,
    'node_modules',
    '@anthropic-ai',
    'claude-code',
    'bin',
    'claude.exe',
  );
  return fileExists(exePath) ? exePath : null;
}

export interface ICliSpawnTarget {
  command: string;
  /** Windows 需走 cmd 解析 .cmd；找到原生 exe 时可 false */
  useShell: boolean;
}

/** 解析 CLI 可执行路径（Windows 下避免 shell:false 找不到 .cmd） */
export function resolveCliSpawnTarget(agent: TCliAgentType, command: string): ICliSpawnTarget {
  if (process.platform === 'win32') {
    if (agent === 'claude') {
      const claudeExe = resolveClaudeCodeExe();
      if (claudeExe) {
        return { command: claudeExe, useShell: false };
      }
    }
    return { command, useShell: true };
  }
  return { command, useShell: false };
}
