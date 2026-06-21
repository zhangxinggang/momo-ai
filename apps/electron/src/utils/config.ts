import fs from 'fs';
import path from 'path';
import packageJson from '../../package.json';

import { mergeDeep } from '@momo/utils';
import { CONFIG_FILE } from './constant';
import { getAPPRootPath, getPackagePath } from './path';
import type { IAppConfig } from '../types/config';

export const getAppConfig = (): IAppConfig => {
  const rootPath = getAPPRootPath();
  const promisePath = path.join(rootPath, CONFIG_FILE);
  const selfBuildPath = path.join(getPackagePath(), CONFIG_FILE);
  let config = require(selfBuildPath);
  if (fs.existsSync(promisePath)) {
    mergeDeep(config, require(promisePath));
  }
  return config;
};

/** 从 appConf.server 读取 HTTP 等服务配置 */
export function getServerConfig() {
  const { server = {} } = getAppConfig();
  const { httpPort = 8081, httpsPort, upload = {}, autoRunDirs = [], proxyRoutes = {} } = server;
  return { httpPort, httpsPort, upload, autoRunDirs, proxyRoutes };
}

export const getDbConfig = () => {
  const nativeFolder = path.join(getPackagePath(), 'src/main/database/native');
  const betterVersion =
    packageJson.dependencies['better-sqlite3'] || packageJson.devDependencies['better-sqlite3'];
  // https://juejin.cn/post/7424425429699198991
  const sqlFileName = `better-sqlite3-v${betterVersion}-electron-v${process.versions.modules}-win32-x64.node`;
  const selfBuildPath = path.join(nativeFolder, sqlFileName);
  if (fs.existsSync(selfBuildPath)) {
    return {
      nativeBinding: selfBuildPath,
    };
  }
  return {};
};
