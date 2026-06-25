import { getAppConfig } from '@momo/electron';
import { app } from 'electron';

import type { DOnlineConf, DOnlineConfFetchResult } from '@/types/modules/online-conf';

import defaultConf from './defaultConf.json';

const FETCH_TIMEOUT_MS = 15_000;

interface IAppConfWithOnlineUrl {
  onlineConfUrl?: string;
}

function getOnlineConfUrl(): string {
  const conf = getAppConfig() as IAppConfWithOnlineUrl;
  return typeof conf.onlineConfUrl === 'string' ? conf.onlineConfUrl.trim() : '';
}

function getLocalAppVersion(): string {
  return app.getVersion();
}

/** 读取本地默认在线配置 */
function getDefaultOnlineConf(): DOnlineConf {
  return defaultConf as DOnlineConf;
}

/** 拉取失败时回退到本地默认配置 */
function buildFallbackResult(
  localVersion: string,
  onlineConfUrl: string,
): DOnlineConfFetchResult {
  return {
    config: getDefaultOnlineConf(),
    localVersion,
    onlineConfUrl,
  };
}

/** 拉取远程在线配置 */
export async function fetchOnlineConf(): Promise<DOnlineConfFetchResult> {
  const onlineConfUrl = getOnlineConfUrl();
  const localVersion = getLocalAppVersion();

  if (!onlineConfUrl) {
    return buildFallbackResult(localVersion, onlineConfUrl);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(onlineConfUrl, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      return buildFallbackResult(localVersion, onlineConfUrl);
    }

    const config = (await response.json()) as DOnlineConf;
    return {
      config,
      localVersion,
      onlineConfUrl,
    };
  } catch {
    return buildFallbackResult(localVersion, onlineConfUrl);
  } finally {
    clearTimeout(timer);
  }
}
