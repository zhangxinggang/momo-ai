import type { IAppConfig } from '@momo/electron';

import { getSystemApi } from './api';

let cachedAppConfig: IAppConfig | null = null;
let fetchAppConfigPromise: Promise<IAppConfig> | null = null;

/** 从主进程 appConf 读取完整配置，业务侧按需取字段 */
export async function fetchAppConfig(): Promise<IAppConfig> {
  if (cachedAppConfig) {
    return cachedAppConfig;
  }

  const system = getSystemApi();
  if (!system) {
    return {};
  }

  fetchAppConfigPromise ??= system.getAppConfig().then((config) => {
    cachedAppConfig = config;
    return config;
  });
  return fetchAppConfigPromise;
}

/** 从 appConf 读取应用名称 */
export async function fetchAppName(): Promise<string> {
  const { appName } = await fetchAppConfig();
  return appName ?? '';
}

/** 从 appConf 读取 filePreviewBaseUrl */
export async function fetchFilePreviewBaseUrl(): Promise<string> {
  const config = await fetchAppConfig();
  return config.server?.filePreviewBaseUrl ?? '';
}

export async function getSystemLogo(): Promise<string> {
  const system = getSystemApi();
  if (!system) {
    return '';
  }
  return system.getSystemLogo();
}

export async function getUploadUrl(): Promise<string> {
  const system = getSystemApi();
  if (!system) {
    throw new Error('当前环境不支持图片上传');
  }
  return system.getUploadUrl();
}
