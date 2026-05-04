import { app } from 'electron';
import fs from 'fs';
import path from 'path';

import type { IConfigureElectronBasePathsOptions, TElectronPathName } from '../types/electron-path';
import { SERVER_FOLDER, STATIC_FOLDER_NAME } from './constant';

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

type IElectronPath = TElectronPathName;

export const getUserPath = (folder?: IElectronPath) => {
  const userFolder = folder || 'userData';
  return path.join(app.getPath(userFolder), 'userData');
};

export const getPlatformPath = (basePath: string, childPath: string): string => {
  const platform = process.platform;
  return platform === 'win32'
    ? path.win32.join(basePath, childPath)
    : path.join(basePath, childPath);
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
