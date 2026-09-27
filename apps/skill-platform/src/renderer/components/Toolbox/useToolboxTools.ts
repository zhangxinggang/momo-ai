import { orderItems, ROOT_ORDER_KEY } from '@renderer/services/sidebar-order';
import { normalizeTools, useOnlineConfStore } from '@renderer/store/online-conf';
import { useSidebarOrderStore } from '@renderer/store/sidebar-order';
import { useMemo } from 'react';
import { mapToolsWithKeys } from './utils';

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

/** 手动顺序在侧栏、卡片和默认选中入口之间共用。 */
export function useToolboxNodes() {
  const tools = useToolboxTools();
  const orders = useSidebarOrderStore((state) => state.orders.toolbox);
  return useMemo(
    () =>
      orderItems(mapToolsWithKeys(tools), orders?.[ROOT_ORDER_KEY], (tool) => tool.key).map(
        (tool) => ({
          ...tool,
          branches: orderItems(tool.branches, orders?.[tool.key], (branch) => branch.key),
        }),
      ),
    [tools, orders],
  );
}
