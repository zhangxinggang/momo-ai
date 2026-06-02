import { app } from 'electron';
import fs from 'fs';
import path from 'path';

import type { IConfigureElectronBasePathsOptions, TElectronPathName } from '../types/electron-path';
import { SERVER_FOLDER, STATIC_FOLDER_NAME, UPLOAD_FOLDER } from './constant';
import { isMac, isWin } from './env';

export type { IConfigureElectronBasePathsOptions, TElectronPathName };

/** 开发环境下应用根目录（含 static、server、appConf.js） */
let customDevRoot: string | undefined;

/**
 * 由业务应用在入口最早处调用，声明开发环境下的应用根目录。
 * 打包后根目录以 process.cwd() 为准（与 README 约定一致）。
 */
export function configureElectronBasePaths(options: IConfigureElectronBasePathsOptions): void {
  customDevRoot = path.resolve(options.appRootPath);
}

export const getPackagePath = () => {
  return path.join(require.resolve('@momo/electron'), '../../');
};

export const getAPPRootPath = () => {
  if (customDevRoot) {
    return customDevRoot;
  }
  return process.cwd();
};

const getPromisePath = (name: string) => {
  const rootPath = getAPPRootPath();
  const promisePath = path.join(rootPath, name);
  if (!fs.existsSync(promisePath)) {
    const selfBuildPath = path.join(getPackagePath(), name);
    return selfBuildPath;
  }
  return promisePath;
};

export const getStaticPath = () => {
  return getPromisePath(STATIC_FOLDER_NAME);
};

export const getServerPath = () => {
  return getPromisePath(SERVER_FOLDER);
};

export function getUserDataPath(): string {
  return path.resolve(app.getPath('userData'));
}

export const getPlatformPath = (basePath: string, childPath: string): string => {
  return isWin ? path.win32.join(basePath, childPath) : path.join(basePath, childPath);
};

export const isPathWritable = (targetPath: string): boolean => {
  try {
    if (!fs.existsSync(targetPath)) {
      return false;
    }
    fs.accessSync(targetPath, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
};

export const resolvePlatformPath = (targetPath: string): string => {
  if (isWin) {
    return targetPath.replace(/\//g, '\\');
  }
  return path.resolve(targetPath);
};

export const dirnamePlatformPath = (targetPath: string): string => {
  return isWin ? path.win32.dirname(targetPath) : path.dirname(targetPath);
};

export const isProtectedInstallDir = (targetPath: string): boolean => {
  const normalized = resolvePlatformPath(targetPath).toLowerCase();
  if (isWin) {
    return ['\\windows\\', '\\program files\\', '\\program files (x86)\\'].some((segment) =>
      normalized.includes(segment),
    );
  }
  if (isMac) {
    return (
      normalized.startsWith('/applications') ||
      normalized.startsWith('/system') ||
      normalized.startsWith('/library')
    );
  }
  return normalized.startsWith('/usr') || normalized.startsWith('/opt');
};

export const isDefaultPerUserInstallDir = (targetPath: string): boolean => {
  if (!isWin) {
    return false;
  }
  const normalized = resolvePlatformPath(targetPath).toLowerCase();
  return normalized.includes('\\appdata\\local\\programs\\');
};

export const getUploadDir = () => {
  return path.join(getUserDataPath(), 'data', UPLOAD_FOLDER);
};
