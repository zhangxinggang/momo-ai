import { spawn } from 'child_process';

import type { ICliAgentCallInput, ICliAgentCallResult } from '@momo/aichat';

import { resolveSkillShell } from '../skill/runtime/shell';
import { buildCliPathEnv, resolveCliSpawnTarget } from './cli-path';
import {
  buildCliAgentSpawnSpec,
  getCliNotFoundMessage,
  parseCliJsonOutput,
  type TCliAgentType,
} from './cli-templates';

const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;

function isValidAgent(agent: string): agent is TCliAgentType {
  return agent === 'claude' || agent === 'codex';
}

interface ISpawnCliResult {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  spawnError?: string;
}

/** 使用 spawn 执行 CLI；Windows 默认走 cmd 以解析 .cmd/.ps1，或直调 claude.exe */
async function spawnCliAgent(
  spec: ReturnType<typeof buildCliAgentSpawnSpec>,
  agent: TCliAgentType,
  cwd: string,
  pathEnv: string,
  timeoutMs: number,
): Promise<ISpawnCliResult> {
  const target = resolveCliSpawnTarget(agent, spec.command);
  const shellOption = target.useShell ? resolveSkillShell() : false;

  return new Promise((resolve) => {
    const child = spawn(target.command, spec.args, {
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

    const finish = (result: ISpawnCliResult) => {
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
        stderr: `${stderr}\nCLI 执行超时`.trim(),
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
      finish({
        stdout,
        stderr,
        exitCode: null,
        spawnError: error.message,
      });
    });
    child.on('close', (code) => {
      finish({ stdout, stderr, exitCode: code });
    });
  });
}

/** 调用 CLI Agent 并返回结构化结果 */
export async function callCliAgent(input: ICliAgentCallInput): Promise<ICliAgentCallResult> {
  if (!isValidAgent(input.agent)) {
    throw new Error(`不支持的 CLI Agent: ${input.agent}`);
  }

  const pathEnv = buildCliPathEnv();
  const cwd = input.cwd?.trim() || process.cwd();
  const spec = buildCliAgentSpawnSpec(input.agent, input.prompt, input.sessionId);
  const start = Date.now();

  const result = await spawnCliAgent(spec, input.agent, cwd, pathEnv, DEFAULT_TIMEOUT_MS);

  if (result.spawnError) {
    const notFoundHint = result.spawnError.includes('ENOENT')
      ? getCliNotFoundMessage(input.agent)
      : result.spawnError;
    throw new Error(notFoundHint);
  }

  if (result.exitCode !== 0) {
    const message = (result.stderr || result.stdout || `CLI 退出码 ${result.exitCode}`).trim();
    throw new Error(message);
  }

  const parsed = parseCliJsonOutput(result.stdout, input.agent);
  const sessionId = parsed.sessionId || input.sessionId || '';

  return {
    content: parsed.content || result.stdout.trim(),
    sessionId,
    model: `cli:${input.agent}`,
    responseTimeSec: ((Date.now() - start) / 1000).toFixed(2),
  };
}

/** 检测 PATH 中 CLI 是否可用 */
export async function detectCliAgents(): Promise<Record<TCliAgentType, boolean>> {
  const pathEnv = buildCliPathEnv();
  const agents: TCliAgentType[] = ['claude', 'codex'];
  const status: Record<TCliAgentType, boolean> = {
    claude: false,
    codex: false,
  };

  await Promise.all(
    agents.map(async (agent) => {
      const probe = await spawnCliAgent(
        { command: agent, args: ['--version'] },
        agent,
        process.cwd(),
        pathEnv,
        10_000,
      );
      status[agent] = probe.exitCode === 0 || probe.stdout.trim().length > 0;
    }),
  );

  return status;
}
