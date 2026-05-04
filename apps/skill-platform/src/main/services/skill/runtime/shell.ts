import { spawn } from 'child_process';

export interface IShellCommandResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
}

/** Windows 下使用 cmd.exe，避免 PowerShell 拦截 npm.ps1 */
export function resolveSkillShell(): boolean | string {
  if (process.platform === 'win32') {
    return process.env.ComSpec || 'cmd.exe';
  }
  return true;
}

/**
 * Windows 上将 npm/npx 映射为 npm.cmd/npx.cmd（命令名，非绝对路径），
 * 绕过 PowerShell ExecutionPolicy 对 npm.ps1 的限制。
 * node / python 保持原样。
 */
export function normalizeWindowsNpmCommands(commandLine: string): string {
  if (process.platform !== 'win32') {
    return commandLine;
  }

  return commandLine
    .replace(/(^|[&|]\s*)npm\b(?=\s|$)/gi, '$1npm.cmd')
    .replace(/(^|[&|]\s*)npx\b(?=\s|$)/gi, '$1npx.cmd');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 在指定目录执行 shell 命令（Windows 走 cmd.exe） */
export function runSkillShellCommand(
  commandLine: string,
  cwd: string,
  pathEnv: string,
  timeoutMs: number,
  extraEnv?: NodeJS.ProcessEnv,
): Promise<IShellCommandResult> {
  const normalized = normalizeWindowsNpmCommands(commandLine.trim());

  return new Promise((resolve) => {
    const child = spawn(normalized, {
      cwd,
      shell: resolveSkillShell(),
      windowsHide: true,
      env: {
        ...process.env,
        ...extraEnv,
        PATH: pathEnv,
        PYTHONIOENCODING: 'utf-8',
        PYTHONUTF8: '1',
      },
    });

    let stdout = '';
    let stderr = '';
    let settled = false;

    const finish = (result: IShellCommandResult) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      resolve(result);
    };

    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      finish({
        stdout,
        stderr: `${stderr}\n命令执行超时`.trim(),
        exitCode: null,
      });
    }, timeoutMs);

    child.stdout?.setEncoding('utf8');
    child.stderr?.setEncoding('utf8');
    child.stdout?.on('data', (chunk: string | Buffer) => {
      stdout += typeof chunk === 'string' ? chunk : chunk.toString('utf8');
    });
    child.stderr?.on('data', (chunk: string | Buffer) => {
      stderr += typeof chunk === 'string' ? chunk : chunk.toString('utf8');
    });
    child.on('error', (error) => {
      finish({ stdout, stderr: `${stderr}\n${error.message}`.trim(), exitCode: null });
    });
    child.on('close', (code) => {
      finish({ stdout, stderr, exitCode: code });
    });
  });
}

function isRetryableNpmNetworkError(output: string): boolean {
  const text = output.toLowerCase();
  return (
    text.includes('econnreset') ||
    text.includes('etimedout') ||
    text.includes('econnrefused') ||
    text.includes('network') ||
    text.includes('fetch failed') ||
    text.includes('socket hang up')
  );
}

const NPM_REGISTRY_CANDIDATES = ['https://registry.npmjs.org', 'https://registry.npmmirror.com'];

const NPM_INSTALL_FLAGS =
  '--no-audit --no-fund --legacy-peer-deps --include=optional --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000';

/** npm install：多 registry 回退 + 网络错误重试 */
export async function runNpmInstallWithRetry(
  cwd: string,
  pathEnv: string,
  logs: string[],
  timeoutMs = 10 * 60 * 1000,
  commandLine = `npm install ${NPM_INSTALL_FLAGS}`,
): Promise<IShellCommandResult> {
  const maxAttemptsPerRegistry = 3;
  let lastResult: IShellCommandResult = { stdout: '', stderr: '', exitCode: 1 };

  for (const registry of NPM_REGISTRY_CANDIDATES) {
    for (let attempt = 1; attempt <= maxAttemptsPerRegistry; attempt += 1) {
      logs.push(`npm install 第 ${attempt} 次（registry: ${registry}）…`);
      lastResult = await runSkillShellCommand(commandLine, cwd, pathEnv, timeoutMs, {
        npm_config_registry: registry,
        npm_config_optional: 'true',
      });

      if (lastResult.stdout) {
        logs.push(lastResult.stdout.slice(-800));
      }
      if (lastResult.stderr) {
        logs.push(lastResult.stderr.slice(-800));
      }

      if (lastResult.exitCode === 0) {
        logs.push(`npm install 成功（registry: ${registry}）`);
        return lastResult;
      }

      const combined = `${lastResult.stdout}\n${lastResult.stderr}`;
      if (!isRetryableNpmNetworkError(combined) || attempt >= maxAttemptsPerRegistry) {
        break;
      }

      const waitMs = attempt * 3000;
      logs.push(`网络异常，${waitMs / 1000}s 后重试…`);
      await sleep(waitMs);
    }
  }

  return lastResult;
}

/** npx 命令：带 registry 环境，失败时切换镜像重试一次 */
export async function runNpxWithRetry(
  args: string,
  cwd: string,
  pathEnv: string,
  logs: string[],
  timeoutMs = 15 * 60 * 1000,
): Promise<IShellCommandResult> {
  let lastResult: IShellCommandResult = { stdout: '', stderr: '', exitCode: 1 };

  for (const registry of NPM_REGISTRY_CANDIDATES) {
    logs.push(`npx ${args}（registry: ${registry}）…`);
    lastResult = await runSkillShellCommand(`npx ${args}`, cwd, pathEnv, timeoutMs, {
      npm_config_registry: registry,
    });

    if (lastResult.stdout) {
      logs.push(lastResult.stdout.slice(-600));
    }
    if (lastResult.stderr) {
      logs.push(lastResult.stderr.slice(-600));
    }

    if (lastResult.exitCode === 0) {
      return lastResult;
    }

    const combined = `${lastResult.stdout}\n${lastResult.stderr}`;
    if (!isRetryableNpmNetworkError(combined)) {
      break;
    }
  }

  return lastResult;
}

export { sleep };
