import fs from 'fs';
import path from 'path';

import { mergeDeep } from '@momo/utils';
import type { IAppConfig } from '../types/config';
import { CONFIG_FILE } from './constant';
import { getAPPRootPath, getPackagePath } from './path';

export { getDbConfig } from './database-config';

export const getAppConfig = (): IAppConfig => {
  const rootPath = getAPPRootPath();
  const promisePath = path.join(rootPath, CONFIG_FILE);
  const selfBuildPath = path.join(getPackagePath(), CONFIG_FILE);
  const hasSelfConfig = fs.existsSync(selfBuildPath);
  const hasRootConfig = fs.existsSync(promisePath);

  if (!hasSelfConfig && !hasRootConfig) {
    throw new Error(`Missing Electron app config: ${promisePath}`);
  }

  let config = hasSelfConfig ? require(selfBuildPath) : {};
  if (hasRootConfig && promisePath !== selfBuildPath) {
    mergeDeep(config, require(promisePath));
  } else if (hasRootConfig) {
    config = require(promisePath);
  }
  return config;
};

/** 从 appConf.server 读取 HTTP 等服务配置 */
export function getServerConfig() {
  const { server = {} } = getAppConfig();
  const { httpPort = 8081, httpsPort, upload = {}, autoRunDirs = [], proxyRoutes = {} } = server;
  return { httpPort, httpsPort, upload, autoRunDirs, proxyRoutes };
}
