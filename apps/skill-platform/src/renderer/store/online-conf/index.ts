import type {
  DOnlineConf,
  DOnlineConfFetchResult,
  DOnlineConfTool,
} from '@/types/modules/online-conf';
import { compareVersions } from '@/utils/version';
import { create } from 'zustand';

interface IOnlineConfState {
  config: DOnlineConf | null;
  localVersion: string;
  onlineConfUrl: string;
  error?: string;
  isLoading: boolean;
  hasFetched: boolean;
  fetchOnlineConf: () => Promise<void>;
  getTools: () => DOnlineConfTool[];
  hasNewVersion: () => boolean;
}

function normalizeTools(config: DOnlineConf | null): DOnlineConfTool[] {
  const tools = config?.tools;
  if (!Array.isArray(tools)) {
    return [];
  }
  return tools.filter((tool) => tool && typeof tool.title === 'string' && tool.title.trim());
}

export { normalizeTools };

function applyFetchResult(
  set: (partial: Partial<IOnlineConfState>) => void,
  result: DOnlineConfFetchResult,
) {
  set({
    config: result.config,
    localVersion: result.localVersion,
    onlineConfUrl: result.onlineConfUrl,
    error: result.error,
    isLoading: false,
    hasFetched: true,
  });
}

export const useOnlineConfStore = create<IOnlineConfState>((set, get) => ({
  config: null,
  localVersion: '0.0.0',
  onlineConfUrl: '',
  error: undefined,
  isLoading: false,
  hasFetched: false,

  fetchOnlineConf: async () => {
    if (typeof window.api?.onlineConf?.fetch !== 'function') {
      set({ hasFetched: true, isLoading: false });
      return;
    }
    set({ isLoading: true });
    try {
      const result = await window.api.onlineConf.fetch();
      applyFetchResult(set, result);
    } catch (error) {
      const message = error instanceof Error ? error.message : '拉取在线配置失败';
      set({
        isLoading: false,
        hasFetched: true,
        error: message,
      });
    }
  },

  getTools: () => normalizeTools(get().config),

  hasNewVersion: () => {
    const { config, localVersion } = get();
    const remoteVersion = config?.update?.version?.trim();
    if (!remoteVersion) {
      return false;
    }
    return compareVersions(remoteVersion, localVersion) > 0;
  },
}));

/** 生成工具箱菜单稳定 key */
export function buildToolboxToolKey(title: string, index: number): string {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/gi, '-')
    .replace(/^-+|-+$/g, '');
  return slug || `tool-${index}`;
}

/** 生成工具箱子项稳定 key */
export function buildToolboxItemKey(parentKey: string, title: string, index: number): string {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/gi, '-')
    .replace(/^-+|-+$/g, '');
  return `${parentKey}-${slug || `item-${index}`}`;
}
