import { getAppConfig } from '@momo/electron';
import { app } from 'electron';

import type { DOnlineConf, DOnlineConfFetchResult } from '@/types/modules/online-conf';

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

/** 拉取远程在线配置 */
export async function fetchOnlineConf(): Promise<DOnlineConfFetchResult> {
  const onlineConfUrl = getOnlineConfUrl();
  const localVersion = getLocalAppVersion();

  if (!onlineConfUrl) {
    return {
      config: null,
      localVersion,
      onlineConfUrl,
      error: '未配置 onlineConfUrl',
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(onlineConfUrl, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      return {
        config: null,
        localVersion,
        onlineConfUrl,
        error: `拉取在线配置失败 (${response.status})`,
      };
    }

    const config = (await response.json()) as DOnlineConf;
    return {
      config,
      localVersion,
      onlineConfUrl,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : '拉取在线配置失败';
    return {
      config: null,
      localVersion,
      onlineConfUrl,
      error: message,
    };
  } finally {
    clearTimeout(timer);
  }
}
