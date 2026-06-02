import { spawn } from 'child_process';

import { buildCliPathEnv, resolveCliSpawnTarget } from '../../main/services/aichat/cli-path';
import { resolveSkillShell } from '../../main/services/skill/runtime/shell';

export interface ISpawnClaudeResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  spawnError?: string;
}

/** 执行 claude 子进程（与 CLI Agent 共用 PATH 解析） */
export function spawnClaudeProcess(
  args: string[],
  cwd: string,
  timeoutMs: number,
): Promise<ISpawnClaudeResult> {
  const pathEnv = buildCliPathEnv();
  const target = resolveCliSpawnTarget('claude', 'claude');
  const shellOption = target.useShell ? resolveSkillShell() : false;

  return new Promise((resolve) => {
    const child = spawn(target.command, args, {
      cwd,
      shell: shellOption,
      windowsHide: true,
      env: {
        ...process.env,
        PATH: pathEnv,
        PYTHONIOENCODING: 'utf-8',
        PYTHONUTF8: '1',
      },
    });

    let stdout = '';
    let stderr = '';
    let settled = false;

    const finish = (result: ISpawnClaudeResult) => {
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
        stderr: `${stderr}\nClaude 执行超时`.trim(),
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
      finish({ stdout, stderr, exitCode: null, spawnError: error.message });
    });
    child.on('close', (code) => {
      finish({ stdout, stderr, exitCode: code });
    });
  });
}
