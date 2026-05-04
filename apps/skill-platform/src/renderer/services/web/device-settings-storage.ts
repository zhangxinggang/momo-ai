import type { IDeviceManagementSettings } from '@/types/modules';

import {
  createLocalStorageAdapter,
  type IKeyValueStorageAdapter,
} from '../storage/key-value-storage';

const STORAGE_KEY = 'prompthub-web-device-settings';

export const DEFAULT_WEB_DEVICE_SETTINGS: IDeviceManagementSettings = {
  syncCadence: 'manual',
  storeAutoSync: true,
  storeSyncCadence: '1d',
};

/** 自部署网页端的设备/商店同步策略持久化（默认 localStorage，可注入 storage） */
export function readWebDeviceSettings(
  storage: IKeyValueStorageAdapter = createLocalStorageAdapter(),
): IDeviceManagementSettings {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_WEB_DEVICE_SETTINGS };
  }
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_WEB_DEVICE_SETTINGS };
    }
    const parsed = JSON.parse(raw) as Partial<IDeviceManagementSettings>;
    return { ...DEFAULT_WEB_DEVICE_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_WEB_DEVICE_SETTINGS };
  }
}

export function writeWebDeviceSettings(
  next: IDeviceManagementSettings,
  storage: IKeyValueStorageAdapter = createLocalStorageAdapter(),
): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // 存储失败时忽略，界面状态仍以内存为准
  }
}
