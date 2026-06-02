import * as fs from 'fs/promises';
import * as path from 'path';

import {
  getSkillRuntimeDir,
  getSkillRuntimeNodeModulesDir,
  getSkillRuntimePackageName,
} from '../../../runtime-paths';
import { runRuntimePostInstallHooks } from './post-install';
import { runNpmInstallWithRetry, runSkillShellCommand } from './shell';
import { resolveSkillShellEnv } from './toolchain';

export interface IEnsureSkillRuntimePackagesResult {
  runtimeDir: string;
  nodeModulesDir: string;
  logs: string[];
  error?: string;
}

export { getSkillRuntimeDir, getSkillRuntimeNodeModulesDir } from '../../../runtime-paths';

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function packageDirName(packageName: string): string {
  if (packageName.startsWith('@')) {
    const [scope, name] = packageName.split('/');
    return path.join(scope, name);
  }
  return packageName;
}

async function isPackageInstalled(nodeModulesDir: string, packageName: string): Promise<boolean> {
  const pkgJsonPath = path.join(nodeModulesDir, packageDirName(packageName), 'package.json');
  return pathExists(pkgJsonPath);
}

async function readRuntimePackageJson(runtimeDir: string): Promise<{
  name: string;
  private: boolean;
  version: string;
  dependencies: Record<string, string>;
}> {
  const pkgPath = path.join(runtimeDir, 'package.json');
  if (await pathExists(pkgPath)) {
    try {
      const raw = await fs.readFile(pkgPath, 'utf8');
      const parsed = JSON.parse(raw) as {
        dependencies?: Record<string, string>;
      };
      return {
        name: getSkillRuntimePackageName(),
        private: true,
        version: '1.0.0',
        dependencies: parsed.dependencies ?? {},
      };
    } catch {
      // 损坏的 package.json 重新生成
    }
  }

  return {
    name: getSkillRuntimePackageName(),
    private: true,
    version: '1.0.0',
    dependencies: {},
  };
}

async function mergeRuntimePackageJson(
  runtimeDir: string,
  packages: Iterable<string>,
): Promise<{ changed: boolean; pkg: Awaited<ReturnType<typeof readRuntimePackageJson>> }> {
  const pkg = await readRuntimePackageJson(runtimeDir);
  const dependencies = { ...pkg.dependencies };
  let changed = false;

  for (const packageName of packages) {
    if (!dependencies[packageName]) {
      dependencies[packageName] = 'latest';
      changed = true;
    }
  }

  return {
    changed,
    pkg: {
      ...pkg,
      dependencies,
    },
  };
}

async function verifyPackagesResolvable(
  runtimeDir: string,
  nodeModulesDirs: string[],
  packages: string[],
  pathEnv: string,
): Promise<string | null> {
  const pathsArg = nodeModulesDirs.map((dir) => JSON.stringify(dir)).join(', ');
  const pkgsArg = packages.map((pkg) => JSON.stringify(pkg)).join(', ');
  const script = `const paths = [${pathsArg}];
const pkgs = [${pkgsArg}];
const missing = [];
for (const pkg of pkgs) {
  try {
    if (pkg === 'sharp') {
      require('sharp');
    } else {
      require.resolve(pkg, { paths });
    }
  } catch {
    missing.push(pkg);
  }
}
if (missing.length) {
  console.error('MISSING:' + missing.join(','));
  process.exit(2);
}
`;
  const verifyScriptPath = path.join(runtimeDir, '.verify-deps.cjs');
  await fs.writeFile(verifyScriptPath, script, 'utf8');

  const result = await runSkillShellCommand('node ".verify-deps.cjs"', runtimeDir, pathEnv, 30_000);

  if (
    result.exitCode === 2 ||
    result.stderr.includes('MISSING:') ||
    result.stdout.includes('MISSING:')
  ) {
    const combined = `${result.stdout}\n${result.stderr}`;
    const match = combined.match(/MISSING:([^\n]+)/);
    return match?.[1] ?? packages.join(', ');
  }
  if (result.exitCode !== 0) {
    return result.stderr || '依赖校验失败';
  }
  return null;
}

/** 将依赖安装到全局 skill-runtime（主路径，不依赖技能仓库内 npm） */
export async function ensureSkillRuntimePackages(
  packages: Iterable<string>,
): Promise<IEnsureSkillRuntimePackagesResult> {
  const packageList = [...new Set([...packages].filter(Boolean))];
  const runtimeDir = getSkillRuntimeDir();
  const nodeModulesDir = getSkillRuntimeNodeModulesDir();
  const logs: string[] = [];

  await fs.mkdir(runtimeDir, { recursive: true });

  if (packageList.length === 0) {
    return { runtimeDir, nodeModulesDir, logs };
  }

  const missing: string[] = [];
  for (const packageName of packageList) {
    if (!(await isPackageInstalled(nodeModulesDir, packageName))) {
      missing.push(packageName);
    }
  }

  const { changed, pkg } = await mergeRuntimePackageJson(runtimeDir, packageList);
  if (changed || missing.length > 0) {
    await fs.writeFile(
      path.join(runtimeDir, 'package.json'),
      `${JSON.stringify(pkg, null, 2)}\n`,
      'utf8',
    );
  }

  if (missing.length === 0 && !changed) {
    logs.push(`ISkill 运行时依赖已就绪：${packageList.join(', ')}`);
    const shellEnv = resolveSkillShellEnv();
    const postInstallError = await runRuntimePostInstallHooks(packageList, {
      runtimeDir,
      nodeModulesDir,
      pathEnv: shellEnv.pathEnv,
      logs,
    });
    if (postInstallError) {
      return { runtimeDir, nodeModulesDir, logs, error: postInstallError };
    }
    return { runtimeDir, nodeModulesDir, logs };
  }

  const shellEnv = resolveSkillShellEnv();
  logs.push(`正在安装 ISkill 运行时依赖：${packageList.join(', ')}`);
  logs.push(`运行时目录：${runtimeDir}`);

  const installResult = await runNpmInstallWithRetry(
    runtimeDir,
    shellEnv.pathEnv,
    logs,
    10 * 60 * 1000,
  );

  if (installResult.exitCode !== 0) {
    return {
      runtimeDir,
      nodeModulesDir,
      logs,
      error:
        `ISkill 运行时 npm install 失败（退出码 ${installResult.exitCode ?? 'unknown'}）。` +
        '已尝试官方源与 npmmirror 并重试。请检查网络/代理，或在终端执行：npm config set registry https://registry.npmjs.org',
    };
  }

  const verifyError = await verifyPackagesResolvable(
    runtimeDir,
    [nodeModulesDir],
    packageList,
    shellEnv.pathEnv,
  );
  if (verifyError) {
    return {
      runtimeDir,
      nodeModulesDir,
      logs,
      error: `依赖安装后仍无法加载：${verifyError}`,
    };
  }

  const postInstallError = await runRuntimePostInstallHooks(packageList, {
    runtimeDir,
    nodeModulesDir,
    pathEnv: shellEnv.pathEnv,
    logs,
  });
  if (postInstallError) {
    return {
      runtimeDir,
      nodeModulesDir,
      logs,
      error: postInstallError,
    };
  }

  logs.push('ISkill 运行时依赖安装完成');
  return { runtimeDir, nodeModulesDir, logs };
}

/** 构建 NODE_PATH：全局运行时 + 技能仓库本地 node_modules */
export function buildSkillModuleSearchPaths(repoPath: string): string[] {
  const paths = [getSkillRuntimeNodeModulesDir(), path.join(repoPath, 'node_modules')];
  return paths.filter((item, index, arr) => item && arr.indexOf(item) === index);
}
