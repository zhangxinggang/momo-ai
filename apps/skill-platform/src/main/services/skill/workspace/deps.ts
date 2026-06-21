import * as fs from 'fs/promises';
import * as path from 'path';

import { getSkillRuntimeDir } from '../../../runtime-paths';
import { buildSkillModuleSearchPaths, ensureSkillRuntimePackages } from '../runtime/node-runtime';
import { runSkillCommandLine } from './command-runner';

export interface IEnsureSkillWorkspaceDepsInput {
  repoPath: string;
  outputDir: string;
  userInput: string;
  commandLines: string[];
  skillId?: string;
}

export interface IEnsureSkillWorkspaceDepsResult {
  attempted: boolean;
  logs: string[];
  error?: string;
  moduleSearchPaths: string[];
}

const BUILTIN_NODE_MODULES = new Set([
  'assert',
  'buffer',
  'child_process',
  'cluster',
  'crypto',
  'dgram',
  'dns',
  'events',
  'fs',
  'http',
  'http2',
  'https',
  'module',
  'net',
  'os',
  'path',
  'perf_hooks',
  'process',
  'querystring',
  'readline',
  'stream',
  'string_decoder',
  'timers',
  'tls',
  'tty',
  'url',
  'util',
  'v8',
  'vm',
  'worker_threads',
  'zlib',
]);

const REQUIRE_RE = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
const IMPORT_RE = /(?:import\s+[^'"]+\s+from|import)\s+['"]([^'"]+)['"]/g;
const PY_IMPORT_RE = /^\s*import\s+([a-zA-Z_][\w.]*)/gm;
const PY_FROM_IMPORT_RE = /^\s*from\s+([a-zA-Z_][\w.]*)\s+import/gm;

const PYTHON_IMPORT_TO_PIP: Record<string, string> = {
  PIL: 'Pillow',
  cv2: 'opencv-python',
  sklearn: 'scikit-learn',
  yaml: 'PyYAML',
  bs4: 'beautifulsoup4',
  dotenv: 'python-dotenv',
  dateutil: 'python-dateutil',
  OpenSSL: 'pyOpenSSL',
  Crypto: 'pycryptodome',
  jwt: 'PyJWT',
  serial: 'pyserial',
  docx: 'python-docx',
  pptx: 'python-pptx',
  ruamel: 'ruamel.yaml',
  googleapiclient: 'google-api-python-client',
};

/** Python 标准库，无需 pip 安装 */
const PYTHON_STDLIB_MODULES = new Set([
  'os',
  'sys',
  'socket',
  'subprocess',
  'tempfile',
  'pathlib',
  'json',
  're',
  'io',
  'shutil',
  'glob',
  'argparse',
  'typing',
  'datetime',
  'collections',
  'itertools',
  'functools',
  'contextlib',
  'importlib',
  'zipfile',
  'xml',
  'html',
  'urllib',
  'http',
  'email',
  'logging',
  'traceback',
  'unittest',
  'office',
]);

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function parsePackageName(specifier: string): string | null {
  const trimmed = specifier.trim();
  if (!trimmed || trimmed.startsWith('.') || trimmed.startsWith('/')) {
    return null;
  }
  if (trimmed.startsWith('node:')) {
    return null;
  }
  if (trimmed.startsWith('@')) {
    const parts = trimmed.split('/');
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : trimmed;
  }
  return trimmed.split('/')[0] || null;
}

function collectModuleNamesFromSource(source: string): Set<string> {
  const deps = new Set<string>();
  for (const re of [REQUIRE_RE, IMPORT_RE]) {
    re.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(source)) !== null) {
      const name = parsePackageName(match[1] ?? '');
      if (name && !BUILTIN_NODE_MODULES.has(name)) {
        deps.add(name);
      }
    }
  }
  return deps;
}

async function collectDepsFromFile(filePath: string): Promise<Set<string>> {
  try {
    const source = await fs.readFile(filePath, 'utf8');
    return collectModuleNamesFromSource(source);
  } catch {
    return new Set();
  }
}

function extractNodeScriptPathsFromCommands(repoPath: string, commandLines: string[]): string[] {
  const scriptPaths: string[] = [];
  for (const commandLine of commandLines) {
    const nodeMatch = commandLine.match(
      /\bnode\s+(?:--[^\s]+\s+)*["']?([^\s"']+\.(?:js|mjs|cjs))["']?/i,
    );
    if (nodeMatch?.[1]) {
      scriptPaths.push(path.resolve(repoPath, nodeMatch[1]));
    }
  }
  return scriptPaths;
}

function extractPythonScriptPathsFromCommands(repoPath: string, commandLines: string[]): string[] {
  const scriptPaths: string[] = [];
  for (const commandLine of commandLines) {
    const pythonMatch = commandLine.match(
      /\b(?:python|py)\s+(?:-[^\s]+\s+)*["']?([^\s"']+\.py)["']?/i,
    );
    if (pythonMatch?.[1]) {
      scriptPaths.push(path.resolve(repoPath, pythonMatch[1]));
    }
  }
  return scriptPaths;
}

function parsePythonImportName(specifier: string): string | null {
  const trimmed = specifier.trim();
  if (!trimmed || trimmed.startsWith('.')) {
    return null;
  }
  const topLevel = trimmed.split('.')[0];
  if (!topLevel || topLevel === '__future__' || PYTHON_STDLIB_MODULES.has(topLevel)) {
    return null;
  }
  return topLevel;
}

function collectPythonImportsFromSource(source: string): Set<string> {
  const deps = new Set<string>();
  for (const re of [PY_IMPORT_RE, PY_FROM_IMPORT_RE]) {
    re.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(source)) !== null) {
      const name = parsePythonImportName(match[1] ?? '');
      if (name) {
        deps.add(name);
      }
    }
  }
  return deps;
}

async function collectPythonImportsFromFile(filePath: string): Promise<Set<string>> {
  try {
    const source = await fs.readFile(filePath, 'utf8');
    return collectPythonImportsFromSource(source);
  } catch {
    return new Set();
  }
}

function mapPythonImportToPipPackage(importName: string): string {
  return PYTHON_IMPORT_TO_PIP[importName] ?? importName;
}

async function findMissingPythonImports(
  importNames: string[],
  repoPath: string,
  outputDir: string,
  userInput: string,
  moduleSearchPaths: string[],
): Promise<string[]> {
  if (importNames.length === 0) {
    return [];
  }

  const runtimeDir = getSkillRuntimeDir();
  await fs.mkdir(runtimeDir, { recursive: true });
  const verifyScriptPath = path.join(runtimeDir, '.verify-py-deps.py');
  const verifyScript = `import importlib.util
import sys

mods = ${JSON.stringify(importNames)}
missing = [name for name in mods if importlib.util.find_spec(name) is None]
if missing:
    print("MISSING:" + ",".join(missing))
    sys.exit(2)
`;
  await fs.writeFile(verifyScriptPath, verifyScript, 'utf8');

  const verifyResult = await runSkillCommandLine({
    repoPath,
    outputDir,
    userInput,
    commandLine: `python "${verifyScriptPath.replace(/\\/g, '/')}"`,
    moduleSearchPaths,
    timeoutMs: 60_000,
  });

  const combined = `${verifyResult.stdout}\n${verifyResult.stderr}`;
  const match = combined.match(/MISSING:([^\n\r]+)/);
  if (match?.[1]) {
    return match[1].split(',').filter(Boolean);
  }
  if (verifyResult.exitCode === 0) {
    return [];
  }
  return [];
}

async function installPythonPackages(
  pipPackages: string[],
  repoPath: string,
  outputDir: string,
  userInput: string,
  moduleSearchPaths: string[],
  logs: string[],
  options?: { logLabel?: string },
): Promise<string | undefined> {
  if (pipPackages.length === 0) {
    return undefined;
  }

  const pipArgs = pipPackages.map((pkg) => JSON.stringify(pkg)).join(' ');
  logs.push(options?.logLabel ?? `正在安装 Python 依赖（pip install ${pipPackages.join(', ')}）…`);
  const pipResult = await runSkillCommandLine({
    repoPath,
    outputDir,
    userInput,
    commandLine: `python -m pip install ${pipArgs}`,
    moduleSearchPaths,
    timeoutMs: 10 * 60 * 1000,
  });
  if (pipResult.stdout) {
    logs.push(pipResult.stdout.slice(-800));
  }
  if (pipResult.stderr) {
    logs.push(pipResult.stderr.slice(-800));
  }
  if (pipResult.exitCode !== 0) {
    return `pip install 失败（退出码 ${pipResult.exitCode ?? 'unknown'}）`;
  }
  return undefined;
}

async function collectPythonDependencies(
  repoPath: string,
  commandLines: string[],
): Promise<Set<string>> {
  const deps = new Set<string>();
  const scriptPaths = extractPythonScriptPathsFromCommands(repoPath, commandLines);

  for (const scriptPath of scriptPaths) {
    for (const dep of await collectPythonImportsFromFile(scriptPath)) {
      deps.add(dep);
    }
  }

  if (scriptPaths.length === 0) {
    const scriptsDir = path.join(repoPath, 'scripts');
    if (await pathExists(scriptsDir)) {
      const entries = await fs.readdir(scriptsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isFile() || !/\.py$/i.test(entry.name)) {
          continue;
        }
        if (entry.name === 'soffice.py') {
          continue;
        }
        for (const dep of await collectPythonImportsFromFile(path.join(scriptsDir, entry.name))) {
          deps.add(dep);
        }
      }
    }
  }

  return deps;
}

async function collectNodeDependencies(
  repoPath: string,
  commandLines: string[],
  skillId?: string,
): Promise<Set<string>> {
  const deps = new Set<string>();
  const scriptPaths = extractNodeScriptPathsFromCommands(repoPath, commandLines);

  for (const scriptPath of scriptPaths) {
    for (const dep of await collectDepsFromFile(scriptPath)) {
      deps.add(dep);
    }
  }

  if (scriptPaths.length === 0) {
    const scriptsDir = path.join(repoPath, 'scripts');
    if (await pathExists(scriptsDir)) {
      const entries = await fs.readdir(scriptsDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isFile() || !/\.(js|mjs|cjs)$/i.test(entry.name)) {
          continue;
        }
        for (const dep of await collectDepsFromFile(path.join(scriptsDir, entry.name))) {
          deps.add(dep);
        }
      }
    }
  }

  void skillId;
  return deps;
}

/** 执行前安装 ISkill 运行时与 Python 依赖 */
export async function ensureSkillWorkspaceDependencies(
  input: IEnsureSkillWorkspaceDepsInput,
): Promise<IEnsureSkillWorkspaceDepsResult> {
  const logs: string[] = [];
  const { repoPath, outputDir, userInput, commandLines, skillId } = input;
  const moduleSearchPaths = buildSkillModuleSearchPaths(repoPath);

  const nodeDeps = await collectNodeDependencies(repoPath, commandLines, skillId);
  if (nodeDeps.size > 0) {
    const runtimeResult = await ensureSkillRuntimePackages(nodeDeps);
    logs.push(...runtimeResult.logs);
    if (runtimeResult.error) {
      return {
        attempted: true,
        logs,
        error: runtimeResult.error,
        moduleSearchPaths,
      };
    }
  }

  const requirementsPath = path.join(repoPath, 'requirements.txt');
  if (await pathExists(requirementsPath)) {
    const requirementsError = await installPythonPackages(
      ['-r', 'requirements.txt'],
      repoPath,
      outputDir,
      userInput,
      moduleSearchPaths,
      logs,
      { logLabel: '正在安装 Python 依赖（pip install -r requirements.txt）…' },
    );
    if (requirementsError) {
      return {
        attempted: true,
        logs,
        error: requirementsError,
        moduleSearchPaths,
      };
    }
  }

  const pythonImports = await collectPythonDependencies(repoPath, commandLines);
  if (pythonImports.size > 0) {
    const importList = [...pythonImports];
    const missingImports = await findMissingPythonImports(
      importList,
      repoPath,
      outputDir,
      userInput,
      moduleSearchPaths,
    );
    if (missingImports.length > 0) {
      const pipPackages = [
        ...new Set(missingImports.map((importName) => mapPythonImportToPipPackage(importName))),
      ];
      const scanInstallError = await installPythonPackages(
        pipPackages,
        repoPath,
        outputDir,
        userInput,
        moduleSearchPaths,
        logs,
      );
      if (scanInstallError) {
        return {
          attempted: true,
          logs,
          error: scanInstallError,
          moduleSearchPaths,
        };
      }
    } else if (importList.length > 0) {
      logs.push(`Python 依赖已就绪：${importList.join(', ')}`);
    }
  }

  if (logs.length === 0) {
    return { attempted: false, logs: [], moduleSearchPaths };
  }

  return { attempted: true, logs, moduleSearchPaths };
}
