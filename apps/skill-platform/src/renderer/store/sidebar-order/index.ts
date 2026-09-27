import {
  remapPathOrders,
  ROOT_ORDER_KEY,
  type SidebarOrders,
} from '@renderer/services/sidebar-order';
import { create } from 'zustand';

export const SIDEBAR_ORDER_STORAGE_KEY = 'momo-sidebar-orders-v1';
function readOrders(): SidebarOrders {
  try {
    const value = JSON.parse(localStorage.getItem(SIDEBAR_ORDER_STORAGE_KEY) || '{}');
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    return Object.fromEntries(
      Object.entries(value).map(([scope, groups]) => [
        scope,
        groups && typeof groups === 'object' && !Array.isArray(groups)
          ? Object.fromEntries(
              Object.entries(groups).filter(
                ([, ids]) => Array.isArray(ids) && ids.every((id) => typeof id === 'string'),
              ),
            )
          : {},
      ]),
    );
  } catch {
    return {};
  }
}

interface State {
  orders: SidebarOrders;
  setOrder: (scope: string, parentId: string | null, ids: string[]) => void;
  remapPath: (scope: string, oldPath: string, newPath: string) => void;
}

export const useSidebarOrderStore = create<State>((set, get) => {
  const save = (orders: SidebarOrders) => {
    localStorage.setItem(SIDEBAR_ORDER_STORAGE_KEY, JSON.stringify(orders));
    set({ orders });
  };
  return {
    orders: readOrders(),
    setOrder: (scope, parentId, ids) =>
      save({
        ...get().orders,
        [scope]: { ...get().orders[scope], [parentId ?? ROOT_ORDER_KEY]: [...new Set(ids)] },
      }),
    remapPath: (scope, oldPath, newPath) => {
      const current = get().orders[scope];
      if (current) save({ ...get().orders, [scope]: remapPathOrders(current, oldPath, newPath) });
    },
  };
});
