/** 浏览器 Web Storage 最小接口 */
export interface IWebStorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

/** 键值存储适配器（应用层统一抽象，便于测试与注入） */
export interface IKeyValueStorageAdapter {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

export function createWebStorageAdapter(storage: IWebStorageLike): IKeyValueStorageAdapter {
  return {
    getItem: (key) => storage.getItem(key),
    setItem: (key, value) => storage.setItem(key, value),
    removeItem: (key) => storage.removeItem(key),
  };
}

export function createLocalStorageAdapter(): IKeyValueStorageAdapter {
  return createWebStorageAdapter(window.localStorage);
}

export function createSessionStorageAdapter(): IKeyValueStorageAdapter {
  return createWebStorageAdapter(window.sessionStorage);
}

/** 内存键值存储（测试或未持久化场景） */
export function createMemoryStorageAdapter(): IKeyValueStorageAdapter {
  const store = new Map<string, string>();
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
    removeItem: (key) => {
      store.delete(key);
    },
  };
}
