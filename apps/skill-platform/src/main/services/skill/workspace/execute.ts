import * as fs from 'fs/promises';
import * as path from 'path';

import { getSkillRuntimeDir, getSkillTempOutputDir } from '../../../runtime-paths';
import { runSkillCommandLines } from './command-runner';
import { ensureSkillWorkspaceDependencies } from './deps';
import { sanitizeSkillCommandLines } from './sanitize-commands';

export interface ISkillWorkspaceExecuteInput {
  repoPath: string;
  userInput: string;
  skillId?: string;
  /** AI 回复中解析出的可执行命令（优先于自动探测） */
  commands?: string[];
  /** 自定义产出目录（工作流节点目录等）；默认使用 temp/<skillId> */
  outputDir?: string;
}

export interface ISkillWorkspaceExecuteResult {
  attempted: boolean;
  command?: string;
  commands?: string[];
  stdout: string;
  stderr: string;
  exitCode: number | null;
  /** 技能仓库内相对路径 */
  outputFiles: string[];
  /** 复制到项目 temp 目录后的绝对路径 */
  tempOutputFiles: string[];
  outputDir?: string;
  error?: string;
  hint?: string;
  /** 依赖安装日志 */
  dependencySetup?: string;
  /** 全局 ISkill Node 运行时目录 */
  skillRuntimeDir?: string;
}

interface IRunnableCommand {
  commandLine: string;
}

const OUTPUT_DIR_NAMES = ['output', 'outputs', 'dist', 'out', 'generated', 'build'];
const DELIVERABLE_EXTENSIONS = new Set([
  '.pptx',
  '.ppt',
  '.docx',
  '.doc',
  '.xlsx',
  '.xls',
  '.pdf',
  '.zip',
  '.tar',
  '.gz',
  '.7z',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.mp4',
  '.html',
  '.htm',
  '.svg',
]);

const SKIP_SCRIPT_PATTERN =
  /^(inventory|test_|_test|conftest|__init__|setup|lint|format|check|verify)/i;
const PREFERRED_SCRIPT_KEYWORDS = ['generate', 'run', 'main', 'build', 'create', 'make', 'render'];

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

const PY_NEEDS_ARGS_RE =
  /(?:sys\.argv|argparse\.|ArgumentParser|click\.command|typer\.|len\s*\(\s*sys\.argv|if\s+__name__\s*==\s*['"]__main__['"][\s\S]*?(?:argv|args?\.))/m;

async function pythonScriptNeedsArgs(fullPath: string): Promise<boolean> {
  try {
    const source = await fs.readFile(fullPath, 'utf8');
    return PY_NEEDS_ARGS_RE.test(source);
  } catch {
    return false;
  }
}

const PYTHON_CMD_RE = /\b(?:python|py)\s+(?:-[^\s]+\s+)*["']?([^\s"']+\.py)["']?(.*)$/i;

async function ensurePythonCommandHasArgs(
  commandLine: string,
  repoPath: string,
  outputDir: string,
): Promise<string> {
  const match = commandLine.match(PYTHON_CMD_RE);
  if (!match) {
    return commandLine;
  }

  const scriptRelPath = match[1];
  const scriptPath = path.resolve(repoPath, scriptRelPath);
  const existingArgs = (match[2] ?? '').trim();

  if (!(await pythonScriptNeedsArgs(scriptPath))) {
    return commandLine;
  }

  // 如果已有参数，检查第一个参数（通常是 JSON 文件）是否存在
  if (existingArgs) {
    const firstArg = existingArgs.split(/\s+/)[0].replace(/^["']|["']$/g, '');
    const firstArgPath = path.resolve(repoPath, firstArg);
    if (await pathExists(firstArgPath)) {
      return commandLine;
    }
    // 第一个参数文件不存在，尝试修复
    const validJsonPath = await findBestJsonInput(repoPath);
    if (validJsonPath) {
      const remainingArgs = existingArgs.split(/\s+/).slice(1).join(' ');
      const newArgs = `"${validJsonPath}"${remainingArgs ? ' ' + remainingArgs : ''}`;
      const pythonPrefix = match[0].split(scriptRelPath)[0] + scriptRelPath;
      return `${pythonPrefix} ${newArgs}`;
    }
  }

  // 无参数或参数无效，补充默认参数
  const inputJsonPath = await prepareDefaultInputJson(repoPath);
  const outputSubDir = path.join(repoPath, 'output');
  await fs.mkdir(outputSubDir, { recursive: true });
  return `${commandLine} "${inputJsonPath}" output`;
}

async function findBestJsonInput(repoPath: string): Promise<string | null> {
  const searchDirs = ['data', 'input', 'inputs', '.'];
  const searchPatterns = ['input.json', 'data.json', 'pages.json', '*.json'];

  for (const dir of searchDirs) {
    const dirPath = path.join(repoPath, dir);
    if (!(await pathExists(dirPath))) {
      continue;
    }

    try {
      const entries = await fs.readdir(dirPath);
      for (const pattern of searchPatterns) {
        if (pattern === '*.json') {
          for (const entry of entries) {
            if (entry.endsWith('.json') && !entry.startsWith('.')) {
              return path.join(dir, entry);
            }
          }
        } else {
          if (entries.includes(pattern)) {
            return path.join(dir, pattern);
          }
        }
      }
    } catch {
      // 忽略读取错误
    }
  }

  return null;
}

async function prepareDefaultInputJson(repoPath: string): Promise<string> {
  const bestJson = await findBestJsonInput(repoPath);
  if (bestJson) {
    return bestJson;
  }

  const dataDir = path.join(repoPath, 'data');
  await fs.mkdir(dataDir, { recursive: true });
  const defaultPath = path.join(dataDir, 'input.json');
  await fs.writeFile(defaultPath, JSON.stringify({ pages: [] }, null, 2), 'utf8');
  return defaultPath;
}

function scoreScriptName(fileName: string): number {
  const lower = fileName.toLowerCase();
  if (SKIP_SCRIPT_PATTERN.test(lower)) {
    return -100;
  }
  let score = 0;
  for (let i = 0; i < PREFERRED_SCRIPT_KEYWORDS.length; i += 1) {
    if (lower.includes(PREFERRED_SCRIPT_KEYWORDS[i])) {
      score += 50 - i;
    }
  }
  if (lower.endsWith('.js') || lower.endsWith('.mjs')) {
    score += 20;
  }
  if (lower.endsWith('.py')) {
    score += 10;
  }
  return score;
}

async function findScriptInDir(
  dirPath: string,
  relativeBase: string,
): Promise<IRunnableCommand | null> {
  let entries;
  try {
    entries = await fs.readdir(dirPath, { withFileTypes: true });
  } catch {
    return null;
  }

  const candidates = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => /\.(py|js|mjs|ts|ps1|sh|bat|cmd)$/i.test(name))
    .sort((a, b) => scoreScriptName(b) - scoreScriptName(a));

  for (const fileName of candidates) {
    if (scoreScriptName(fileName) < 0) {
      continue;
    }
    const relative = relativeBase ? `${relativeBase}/${fileName}` : fileName;
    if (fileName.endsWith('.py')) {
      const fullScriptPath = path.join(dirPath, fileName);
      const needsArgs = await pythonScriptNeedsArgs(fullScriptPath);
      if (needsArgs) {
        continue;
      }
      return { commandLine: `python "${relative}"` };
    }
    if (fileName.endsWith('.js') || fileName.endsWith('.mjs')) {
      return { commandLine: `node "${relative}"` };
    }
    if (fileName.endsWith('.ps1')) {
      return {
        commandLine: `powershell -ExecutionPolicy Bypass -File "${relative}"`,
      };
    }
    if (fileName.endsWith('.sh') && process.platform !== 'win32') {
      return { commandLine: `bash "${relative}"` };
    }
    if (fileName.endsWith('.bat') || fileName.endsWith('.cmd')) {
      return { commandLine: `"${relative}"` };
    }
  }

  return null;
}

async function detectRunnable(repoPath: string): Promise<IRunnableCommand | null> {
  const packageJsonPath = path.join(repoPath, 'package.json');
  if (await pathExists(packageJsonPath)) {
    try {
      const raw = await fs.readFile(packageJsonPath, 'utf8');
      const pkg = JSON.parse(raw) as { scripts?: Record<string, string> };
      const scriptName = ['generate', 'execute', 'run', 'start', 'build'].find(
        (key) => pkg.scripts?.[key],
      );
      if (scriptName) {
        return { commandLine: `npm run ${scriptName}` };
      }
    } catch {
      // 忽略 package.json 解析错误
    }
  }

  const fixedCandidates = [
    'scripts/generate.py',
    'scripts/run.py',
    'scripts/main.py',
    'scripts/build.py',
    'scripts/generate.js',
    'scripts/run.js',
    'main.py',
    'run.py',
    'generate.py',
    'scripts/run.ps1',
    'scripts/run.sh',
    'run.ps1',
    'run.sh',
  ];

  for (const relative of fixedCandidates) {
    const fullPath = path.join(repoPath, relative);
    if (!(await pathExists(fullPath))) {
      continue;
    }
    if (relative.endsWith('.py')) {
      const needsArgs = await pythonScriptNeedsArgs(fullPath);
      if (needsArgs) {
        return null;
      }
      return { commandLine: `python "${relative}"` };
    }
    if (relative.endsWith('.js')) {
      return { commandLine: `node "${relative}"` };
    }
    if (relative.endsWith('.ps1')) {
      return {
        commandLine: `powershell -ExecutionPolicy Bypass -File "${relative}"`,
      };
    }
    if (relative.endsWith('.sh') && process.platform !== 'win32') {
      return { commandLine: `bash "${relative}"` };
    }
  }

  const scriptsDir = path.join(repoPath, 'scripts');
  if (await pathExists(scriptsDir)) {
    const fromScripts = await findScriptInDir(scriptsDir, 'scripts');
    if (fromScripts) {
      return fromScripts;
    }
  }

  const rootScript = await findScriptInDir(repoPath, '');
  if (rootScript) {
    return rootScript;
  }

  return null;
}

function isDeliverableFile(relativePath: string): boolean {
  const ext = path.extname(relativePath).toLowerCase();
  if (DELIVERABLE_EXTENSIONS.has(ext)) {
    return true;
  }
  return (
    !relativePath.endsWith('.md') &&
    !relativePath.endsWith('.json') &&
    !relativePath.endsWith('.txt')
  );
}

async function collectModifiedFiles(
  rootDir: string,
  relativeBase: string,
  sinceMs: number,
  results: string[],
): Promise<void> {
  let entries;
  try {
    entries = await fs.readdir(rootDir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') {
      continue;
    }
    const fullPath = path.join(rootDir, entry.name);
    const relativePath = relativeBase ? `${relativeBase}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      await collectModifiedFiles(fullPath, relativePath, sinceMs, results);
      continue;
    }
    try {
      const stat = await fs.stat(fullPath);
      if (stat.mtimeMs >= sinceMs && isDeliverableFile(relativePath)) {
        results.push(relativePath.replace(/\\/g, '/'));
      }
    } catch {
      // 忽略单文件错误
    }
  }
}

async function collectRepoOutputFiles(repoPath: string, sinceMs: number): Promise<string[]> {
  const results: string[] = [];

  for (const dirName of OUTPUT_DIR_NAMES) {
    const dirPath = path.join(repoPath, dirName);
    if (await pathExists(dirPath)) {
      await collectModifiedFiles(dirPath, dirName, sinceMs, results);
    }
  }

  if (results.length === 0) {
    await collectModifiedFiles(repoPath, '', sinceMs, results);
  }

  return [...new Set(results)].slice(0, 30);
}

async function collectTempOutputFiles(outputDir: string, sinceMs: number): Promise<string[]> {
  const results: string[] = [];
  if (!(await pathExists(outputDir))) {
    return results;
  }
  await collectModifiedFiles(outputDir, '', sinceMs, results);
  return results.map((name) => path.join(outputDir, name).replace(/\\/g, '/'));
}

async function copyRepoFilesToTempDir(
  repoPath: string,
  outputDir: string,
  relativeFiles: string[],
): Promise<string[]> {
  await fs.mkdir(outputDir, { recursive: true });
  const copied: string[] = [];

  for (const relativePath of relativeFiles) {
    const srcPath = path.join(repoPath, relativePath);
    if (!(await pathExists(srcPath))) {
      continue;
    }

    const baseName = path.basename(relativePath);
    let destPath = path.join(outputDir, baseName);
    if (await pathExists(destPath)) {
      const stamp = Date.now();
      const ext = path.extname(baseName);
      const stem = path.basename(baseName, ext);
      destPath = path.join(outputDir, `${stem}-${stamp}${ext}`);
    }

    await fs.copyFile(srcPath, destPath);
    copied.push(path.resolve(destPath));
  }

  return copied;
}

function mergeRunOutput(results: Awaited<ReturnType<typeof runSkillCommandLines>>): {
  stdout: string;
  stderr: string;
  exitCode: number | null;
  commands: string[];
} {
  const commands = results.map((item) => item.commandLine);
  const stdout = results
    .map((item) => item.stdout)
    .filter(Boolean)
    .join('\n\n');
  const stderr = results
    .map((item) => item.stderr)
    .filter(Boolean)
    .join('\n\n');
  const lastExit = results.length > 0 ? results[results.length - 1].exitCode : null;
  const hasFailure = results.some((item) => item.exitCode !== 0 && item.exitCode !== null);
  return {
    stdout,
    stderr,
    exitCode: hasFailure ? lastExit : lastExit,
    commands,
  };
}

/** 在技能本地仓库中执行命令，并将产出复制到项目 temp 目录 */
export async function executeSkillWorkspace(
  input: ISkillWorkspaceExecuteInput,
): Promise<ISkillWorkspaceExecuteResult> {
  const repoPath = path.normalize(input.repoPath?.trim() || '');
  const skillId = input.skillId?.trim() || 'skill';
  const outputDir = input.outputDir?.trim()
    ? path.normalize(input.outputDir.trim())
    : getSkillTempOutputDir(skillId);

  if (!repoPath) {
    return {
      attempted: false,
      stdout: '',
      stderr: '',
      exitCode: null,
      outputFiles: [],
      tempOutputFiles: [],
      error: '技能未关联本地仓库',
    };
  }

  if (!(await pathExists(repoPath))) {
    return {
      attempted: false,
      stdout: '',
      stderr: '',
      exitCode: null,
      outputFiles: [],
      tempOutputFiles: [],
      error: `本地仓库路径不存在：${repoPath}`,
    };
  }

  await fs.mkdir(outputDir, { recursive: true });

  const explicitCommands = sanitizeSkillCommandLines(input.commands ?? []);

  let plannedCommands = [...explicitCommands];
  if (plannedCommands.length === 0) {
    const runnable = await detectRunnable(repoPath);
    if (!runnable) {
      return {
        attempted: false,
        stdout: '',
        stderr: '',
        exitCode: null,
        outputFiles: [],
        tempOutputFiles: [],
        outputDir,
        hint: '仓库中未找到可执行脚本。请在回复中使用 ```skill-run 代码块写出要执行的命令（如 node scripts/generate.js），或使用 artifact 块写入交付文件。',
      };
    }
    plannedCommands = [runnable.commandLine];
  }

  const supplementedCommands: string[] = [];
  for (const cmd of plannedCommands) {
    supplementedCommands.push(await ensurePythonCommandHasArgs(cmd, repoPath, outputDir));
  }
  plannedCommands = supplementedCommands;

  const depSetup = await ensureSkillWorkspaceDependencies({
    repoPath,
    outputDir,
    userInput: input.userInput,
    commandLines: plannedCommands,
    skillId,
  });

  if (depSetup.error) {
    return {
      attempted: true,
      stdout: depSetup.logs.join('\n'),
      stderr: depSetup.error,
      exitCode: 1,
      outputFiles: [],
      tempOutputFiles: [],
      outputDir,
      dependencySetup: depSetup.logs.join('\n'),
      error: depSetup.error,
    };
  }

  const startedAt = Date.now();
  const runResults = await runSkillCommandLines(
    repoPath,
    outputDir,
    input.userInput,
    plannedCommands,
    depSetup.moduleSearchPaths,
  );

  const merged = mergeRunOutput(runResults);
  const setupPrefix = depSetup.logs.length > 0 ? `${depSetup.logs.join('\n')}\n\n` : '';
  const outputFiles = await collectRepoOutputFiles(repoPath, startedAt - 2000);
  const copiedToTemp = await copyRepoFilesToTempDir(repoPath, outputDir, outputFiles);
  const directTempFiles = await collectTempOutputFiles(outputDir, startedAt - 2000);
  const tempOutputFiles = [
    ...new Set([...copiedToTemp, ...directTempFiles.map((p) => path.resolve(p))]),
  ];

  return {
    attempted: true,
    command: merged.commands.join(' && '),
    commands: merged.commands,
    stdout: `${setupPrefix}${merged.stdout}`.trim(),
    stderr: merged.stderr,
    exitCode: merged.exitCode,
    outputFiles,
    tempOutputFiles,
    outputDir,
    dependencySetup: depSetup.logs.length > 0 ? depSetup.logs.join('\n') : undefined,
    skillRuntimeDir: getSkillRuntimeDir(),
  };
}
