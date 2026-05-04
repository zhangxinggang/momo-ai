import fs from 'fs';
import path from 'path';

/** 子进程 shell 环境：仅补全 PATH，命令行保持 node / npm / python 等名称 */
export interface ISkillShellEnv {
  pathEnv: string;
}

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

function guessNodeInstallDir(): string | null {
  const candidates = [
    process.env.NODE_HOME,
    process.env.NVM_SYMLINK,
    process.env.FNM_DIR,
    process.platform === 'win32' ? path.join(process.env.ProgramFiles ?? '', 'nodejs') : undefined,
    process.platform === 'win32'
      ? path.join(process.env['ProgramFiles(x86)'] ?? '', 'nodejs')
      : undefined,
    process.platform === 'darwin' ? '/usr/local/bin' : undefined,
    process.platform === 'linux' ? '/usr/bin' : undefined,
  ].filter(Boolean) as string[];

  for (const dir of candidates) {
    const nodePath = path.join(dir, process.platform === 'win32' ? 'node.exe' : 'node');
    if (fileExists(nodePath)) {
      return dir;
    }
  }
  return null;
}

function guessPythonInstallDirs(): string[] {
  const dirs: string[] = [];

  if (process.platform === 'win32') {
    const localAppData = process.env.LOCALAPPDATA;
    if (localAppData) {
      const programsPython = path.join(localAppData, 'Programs', 'Python');
      if (fileExists(programsPython)) {
        try {
          for (const entry of fs.readdirSync(programsPython, { withFileTypes: true })) {
            if (entry.isDirectory()) {
              dirs.push(path.join(programsPython, entry.name));
              dirs.push(path.join(programsPython, entry.name, 'Scripts'));
            }
          }
        } catch {
          // 忽略目录读取错误
        }
      }
    }
    const programFiles = process.env.ProgramFiles;
    if (programFiles) {
      dirs.push(path.join(programFiles, 'Python312'));
      dirs.push(path.join(programFiles, 'Python312', 'Scripts'));
      dirs.push(path.join(programFiles, 'Python311'));
      dirs.push(path.join(programFiles, 'Python311', 'Scripts'));
    }
  }

  return dirs.filter((dir) => fileExists(dir));
}

/**
 * 为 Electron 子进程补全 PATH（GUI 启动时常缺少 Node/Python），
 * 不在命令行中写入 node.exe / python.exe 等绝对路径。
 */
export function resolveSkillShellEnv(): ISkillShellEnv {
  const pathParts = uniquePaths([
    guessNodeInstallDir() ?? '',
    ...guessPythonInstallDirs(),
    ...(process.env.PATH?.split(path.delimiter) ?? []),
  ]);

  return {
    pathEnv: pathParts.filter(Boolean).join(path.delimiter),
  };
}

/** 保持命令原样（node / npm / python），仅去除首尾空白 */
export function normalizeSkillCommand(commandLine: string): string {
  return commandLine.trim();
}
