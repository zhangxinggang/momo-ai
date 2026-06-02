import type { IChatStorageAdapter } from '@momo/aichat';

import {
  createLocalStorageAdapter,
  type IKeyValueStorageAdapter,
} from '@renderer/services/storage/key-value-storage';

/** 将应用层键值存储适配为 @momo/aichat 的 IChatStorageAdapter */
export function toChatStorageAdapter(storage: IKeyValueStorageAdapter): IChatStorageAdapter {
  return {
    getItem: (key) => storage.getItem(key),
    setItem: (key, value) => storage.setItem(key, value),
    removeItem: (key) => storage.removeItem(key),
  };
}

let localChatStorageSingleton: IChatStorageAdapter | null = null;

/** 基于 localStorage 的对话持久化（宿主层，单例避免 services 重建触发状态重载） */
export function createLocalChatStorage(): IChatStorageAdapter {
  if (!localChatStorageSingleton) {
    localChatStorageSingleton = toChatStorageAdapter(createLocalStorageAdapter());
  }
  return localChatStorageSingleton;
}

export type { IKeyValueStorageAdapter as IWebStorageLike } from '@renderer/services/storage/key-value-storage';
