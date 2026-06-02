import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import { getAppConfig } from './config';
import { isWin } from './env';
import {
  dirnamePlatformPath,
  getPlatformPath,
  isDefaultPerUserInstallDir,
  isPathWritable,
  isProtectedInstallDir,
  resolvePlatformPath,
} from './path';

const isPackaged = app.isPackaged;
const exePath = process.execPath;
const { appName } = getAppConfig();

function inspectDataPath(targetPath: string): boolean {
  if (!targetPath) {
    return false;
  }
  const resolvedTargetPath = path.resolve(targetPath);
  if (!fs.existsSync(resolvedTargetPath)) {
    return false;
  }
  return true;
}

function getInstallScopedDataPath(): string | null {
  if (!isPackaged || !isWin) {
    return null;
  }
  const installDir = dirnamePlatformPath(resolvePlatformPath(exePath));
  if (isProtectedInstallDir(installDir)) {
    return null;
  }
  if (isDefaultPerUserInstallDir(installDir)) {
    return null;
  }
  return getPlatformPath(installDir, 'data');
}

function resolveInitialUserDataPath(): string {
  const appDataPath = app.getPath('appData');
  const defaultUserDataPath = getPlatformPath(appDataPath, appName);
  if (inspectDataPath(defaultUserDataPath)) {
    return defaultUserDataPath;
  }
  const installScopedPath = getInstallScopedDataPath();
  if (installScopedPath && isPathWritable(dirnamePlatformPath(installScopedPath))) {
    if (inspectDataPath(installScopedPath)) {
      return installScopedPath;
    }
  }
  return defaultUserDataPath;
}

/**
 * 解析初始 userData 目录并写入 Electron app（须在 app ready 之前调用）。
 * @returns 解析后的 userData 绝对路径
 */
function configureAppUserDataPath(userPath?: string): string {
  const resolvedUserDataPath = userPath ?? resolveInitialUserDataPath();
  app.setPath('userData', resolvedUserDataPath);
  return resolvedUserDataPath;
}

export { configureAppUserDataPath };
