import * as path from 'path';

import { buildSkillModuleSearchPaths } from '../runtime/node-runtime';
import { normalizeWindowsNpmCommands, runSkillShellCommand } from '../runtime/shell';
import { normalizeSkillCommand, resolveSkillShellEnv } from '../runtime/toolchain';
import { ensureSkillModulePreloadScript, injectNodeModulePreload } from './module-preload';
import { normalizeRepoPathsInCommand } from './repo-path-normalize';

export interface IRunSkillCommandInput {
  repoPath: string;
  outputDir: string;
  commandLine: string;
  userInput: string;
  timeoutMs?: number;
  /** NODE_PATH 模块搜索目录（全局 skill-runtime + 仓库 node_modules） */
  moduleSearchPaths?: string[];
}

export interface IRunSkillCommandResult {
  commandLine: string;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  error?: string;
}

const DEFAULT_TIMEOUT_MS = 10 * 60 * 1000;

function buildRunnerEnv(
  repoPath: string,
  outputDir: string,
  userInput: string,
  moduleSearchPaths: string[],
  pathEnv: string,
): NodeJS.ProcessEnv {
  const nodePathParts = [
    ...moduleSearchPaths,
    ...(process.env.NODE_PATH?.split(path.delimiter) ?? []),
  ].filter(Boolean);

  return {
    ...process.env,
    PATH: pathEnv,
    NODE_PATH: [...new Set(nodePathParts)].join(path.delimiter),
    SKILL_REPO_PATH: repoPath,
    SKILL_OUTPUT_DIR: outputDir,
    MOMO_SKILL_OUTPUT_DIR: outputDir,
    SKILL_USER_PROMPT: userInput,
    SKILL_USER_INPUT: userInput,
    USER_PROMPT: userInput,
  };
}

/** 在技能仓库目录执行一条 shell 命令（node / python 保持命令名；Windows npm 用 npm.cmd） */
export async function runSkillCommandLine(
  input: IRunSkillCommandInput,
): Promise<IRunSkillCommandResult> {
  const shellEnv = resolveSkillShellEnv();
  const moduleSearchPaths = input.moduleSearchPaths ?? buildSkillModuleSearchPaths(input.repoPath);
  const preloadPath = await ensureSkillModulePreloadScript();
  let commandLine = injectNodeModulePreload(
    normalizeRepoPathsInCommand(normalizeSkillCommand(input.commandLine), input.repoPath),
    preloadPath,
  );
  commandLine = normalizeWindowsNpmCommands(commandLine);
  const timeoutMs = input.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const result = await runSkillShellCommand(
    commandLine,
    input.repoPath,
    shellEnv.pathEnv,
    timeoutMs,
    {
      ...buildRunnerEnv(
        input.repoPath,
        input.outputDir,
        input.userInput,
        moduleSearchPaths,
        shellEnv.pathEnv,
      ),
      SKILL_MODULE_PATHS: moduleSearchPaths.join(path.delimiter),
    },
  );

  return {
    commandLine,
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim(),
    exitCode: result.exitCode,
  };
}

/** 顺序执行多条命令 */
export async function runSkillCommandLines(
  repoPath: string,
  outputDir: string,
  userInput: string,
  commandLines: string[],
  moduleSearchPaths?: string[],
): Promise<IRunSkillCommandResult[]> {
  const searchPaths = moduleSearchPaths ?? buildSkillModuleSearchPaths(repoPath);
  const results: IRunSkillCommandResult[] = [];

  for (const line of commandLines) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }
    results.push(
      await runSkillCommandLine({
        repoPath,
        outputDir,
        commandLine: trimmed,
        userInput,
        moduleSearchPaths: searchPaths,
      }),
    );
  }

  return results;
}
