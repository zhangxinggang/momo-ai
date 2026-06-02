import { normalizeTools, useOnlineConfStore } from '@renderer/store/online-conf';
import { useMemo } from 'react';

/** 订阅在线配置中的工具列表（避免 getTools() 每次返回新数组导致无限渲染） */
export function useToolboxTools() {
  const config = useOnlineConfStore((state) => state.config);
  return useMemo(() => normalizeTools(config), [config]);
}

/** 是否存在可用工具箱模块 */
export function useHasToolboxModule() {
  return useOnlineConfStore((state) => {
    const tools = state.config?.tools;
    if (!Array.isArray(tools)) {
      return false;
    }
    return tools.some((tool) => tool && typeof tool.title === 'string' && tool.title.trim());
  });
}
