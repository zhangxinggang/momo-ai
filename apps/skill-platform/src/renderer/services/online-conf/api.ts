import type { DOnlineConfFetchResult } from '@/types/modules/online-conf';

import { getOnlineConfIpc } from '../ipc';

export function getOnlineConfApi() {
  return getOnlineConfIpc();
}

export function isOnlineConfApiAvailable(): boolean {
  return !!getOnlineConfIpc()?.fetch;
}

export async function fetchOnlineConfFromMain(): Promise<DOnlineConfFetchResult | null> {
  const api = getOnlineConfIpc();
  if (!api?.fetch) {
    return null;
  }
  return api.fetch();
}
