import type { ISettings } from '@/types/modules';

import { getSettingsIpc } from '../ipc';

export function getSettingsApi() {
  return getSettingsIpc();
}

export function isSettingsApiAvailable(): boolean {
  return !!getSettingsIpc();
}

/** 将设置变更同步到主进程 */
export function syncSettingsToMain(settings: Partial<ISettings>): void {
  if (typeof window === 'undefined') {
    return;
  }

  void getSettingsIpc()
    ?.set(settings)
    .catch((error: unknown) => console.warn('Failed to sync settings to main process:', error));
}
