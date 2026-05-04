/** 对话持久化键名集合（由 storageKeyPrefix 生成） */
export interface IChatStorageKeys {
  readonly CHAT_SESSIONS: string;
  readonly CURRENT_SESSION_ID: string;
  readonly CURRENT_MODEL: string;
  readonly ADVANCED_SETTINGS: string;
}

/** 宿主注入的键值存储适配器（包内不直接使用 localStorage / sessionStorage） */
export interface IChatStorageAdapter {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

/** 高级设置持久化结构 */
export interface IChatAdvancedSettingsSnapshot {
  temperature?: number;
  topP?: number;
  systemPrompt?: string;
  kbEnabled?: boolean;
  kbCollectionId?: number;
}

/** 根据前缀生成隔离的持久化键名 */
export function buildChatStorageKeys(prefix: string): IChatStorageKeys {
  return {
    CHAT_SESSIONS: `${prefix}-sessions`,
    CURRENT_SESSION_ID: `${prefix}-current-session-id`,
    CURRENT_MODEL: `${prefix}-current-model`,
    ADVANCED_SETTINGS: `${prefix}-advanced-settings`,
  };
}

/** 内存存储（默认实现，适用于测试或未注入持久化的场景） */
export function createMemoryChatStorage(): IChatStorageAdapter {
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
