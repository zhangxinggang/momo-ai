import * as fs from 'fs/promises';
import * as path from 'path';

import { runNpmInstallWithRetry, runSkillShellCommand } from './shell';

/** 当前平台对应的 sharp 原生 optional 包名 */
export function resolveSharpPlatformPackageKeys(): string[] {
  const { platform, arch } = process;

  if (platform === 'win32') {
    if (arch === 'arm64') {
      return ['@img/sharp-win32-arm64', '@img/sharp-libvips-win32-arm64'];
    }
    if (arch === 'ia32') {
      return ['@img/sharp-win32-ia32', '@img/sharp-libvips-win32-ia32'];
    }
    return ['@img/sharp-win32-x64', '@img/sharp-libvips-win32-x64'];
  }

  if (platform === 'darwin') {
    if (arch === 'arm64') {
      return ['@img/sharp-darwin-arm64', '@img/sharp-libvips-darwin-arm64'];
    }
    return ['@img/sharp-darwin-x64', '@img/sharp-libvips-darwin-x64'];
  }

  if (platform === 'linux') {
    if (arch === 'arm64') {
      return ['@img/sharp-linux-arm64', '@img/sharp-libvips-linux-arm64'];
    }
    if (arch === 'arm') {
      return ['@img/sharp-linux-arm', '@img/sharp-libvips-linux-arm'];
    }
    return ['@img/sharp-linux-x64', '@img/sharp-libvips-linux-x64'];
  }

  return [];
}

async function readSharpOptionalVersions(nodeModulesDir: string): Promise<Map<string, string>> {
  const sharpPkgPath = path.join(nodeModulesDir, 'sharp', 'package.json');
  const raw = await fs.readFile(sharpPkgPath, 'utf8');
  const pkg = JSON.parse(raw) as { optionalDependencies?: Record<string, string> };
  const optional = pkg.optionalDependencies ?? {};
  const versions = new Map<string, string>();

  for (const key of resolveSharpPlatformPackageKeys()) {
    const version = optional[key];
    if (version) {
      versions.set(key, version);
    }
  }

  return versions;
}

function formatInstallSpecs(versions: Map<string, string>): string[] {
  return [...versions.entries()].map(([name, version]) => `${name}@${version}`);
}

/** 校验 sharp 能否真正加载（require.resolve 不足以发现原生二进制缺失） */
export async function verifySharpLoadable(
  runtimeDir: string,
  pathEnv: string,
): Promise<string | null> {
  const verifyScriptPath = path.join(runtimeDir, '.verify-sharp.cjs');
  await fs.writeFile(
    verifyScriptPath,
    `try { require('sharp'); } catch (e) { console.error('SHARP_FAIL:' + e.message); process.exit(3); }`,
    'utf8',
  );

  const verifyResult = await runSkillShellCommand(
    'node ".verify-sharp.cjs"',
    runtimeDir,
    pathEnv,
    30_000,
  );
  if (verifyResult.exitCode === 0) {
    return null;
  }

  const combined = `${verifyResult.stdout}\n${verifyResult.stderr}`;
  const match = combined.match(/SHARP_FAIL:([^\n]+)/);
  return match?.[1] ?? 'sharp 模块加载校验失败';
}

/** 安装与 sharp 版本匹配的平台原生包（@img/sharp-win32-x64 等） */
export async function ensureSharpNativeBinary(
  runtimeDir: string,
  nodeModulesDir: string,
  pathEnv: string,
  logs: string[],
): Promise<string | null> {
  const loadError = await verifySharpLoadable(runtimeDir, pathEnv);
  if (!loadError) {
    logs.push('sharp 原生模块已就绪');
    return null;
  }

  logs.push(`sharp 加载失败，准备安装平台原生依赖：${loadError}`);

  let platformVersions: Map<string, string>;
  try {
    platformVersions = await readSharpOptionalVersions(nodeModulesDir);
  } catch {
    return '未找到 sharp 包，无法确定平台原生依赖版本';
  }

  if (platformVersions.size === 0) {
    return `当前平台（${process.platform}-${process.arch}）无匹配的 sharp 原生依赖`;
  }

  const installSpecs = formatInstallSpecs(platformVersions);
  logs.push(`正在安装：${installSpecs.join(', ')}`);

  const installCommand = `npm install --include=optional --no-audit --no-fund ${installSpecs.join(' ')}`;
  const installResult = await runNpmInstallWithRetry(
    runtimeDir,
    pathEnv,
    logs,
    10 * 60 * 1000,
    installCommand,
  );

  if (installResult.stdout) {
    logs.push(installResult.stdout.slice(-800));
  }
  if (installResult.stderr) {
    logs.push(installResult.stderr.slice(-800));
  }
  if (installResult.exitCode !== 0) {
    return `sharp 原生依赖安装失败（退出码 ${installResult.exitCode ?? 'unknown'}）`;
  }

  const retryLoadError = await verifySharpLoadable(runtimeDir, pathEnv);
  if (retryLoadError) {
    return retryLoadError;
  }

  logs.push('sharp 原生模块安装完成');
  return null;
}
