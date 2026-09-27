import type { IMomoTreeNode } from '@momo/tree';
import {
  orderItems,
  orderTree,
  reorderIds,
  ROOT_ORDER_KEY,
} from '@renderer/services/sidebar-order';
import { useSidebarOrderStore } from '@renderer/store/sidebar-order';
import { App } from 'antd';
import { useCallback, useMemo, useRef, useState, type DragEvent } from 'react';

const EMPTY_ORDERS: Record<string, string[]> = {};
export function useSidebarTreeOrder(scope: string, tree: IMomoTreeNode[], fullTree = tree) {
  const orders = useSidebarOrderStore((state) => state.orders[scope]) ?? EMPTY_ORDERS;
  const onReorder = useCallback(
    (parentId: string | null, ids: string[]) =>
      useSidebarOrderStore.getState().setOrder(scope, parentId, ids),
    [scope],
  );
  return {
    treeData: useMemo(() => orderTree(tree, orders), [tree, orders]),
    moveTreeData: useMemo(() => orderTree(fullTree, orders), [fullTree, orders]),
    onReorder,
  };
}

export function useSortableSidebarList<T>(
  scope: string,
  items: T[],
  key: (item: T) => string,
  parentId: string | null = null,
) {
  const { message } = App.useApp();
  const ids = useSidebarOrderStore((state) => state.orders[scope]?.[parentId ?? ROOT_ORDER_KEY]);
  const sorted = orderItems(items, ids, key);
  const sourceRef = useRef<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; after: boolean } | null>(null);
  const reset = () => {
    sourceRef.current = null;
    setDropTarget(null);
  };
  const dragProps = (id: string) => ({
    draggable: true,
    'data-drop-position':
      dropTarget?.id === id ? (dropTarget.after ? 'after' : 'before') : undefined,
    onDragStart: (event: DragEvent<HTMLElement>) => {
      sourceRef.current = id;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', id);
      event.stopPropagation();
    },
    onDragOver: (event: DragEvent<HTMLElement>) => {
      if (!sourceRef.current || sourceRef.current === id) return;
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = 'move';
      const rect = event.currentTarget.getBoundingClientRect();
      setDropTarget({ id, after: event.clientY > rect.top + rect.height / 2 });
    },
    onDragLeave: () => setDropTarget(null),
    onDragEnd: reset,
    onDrop: (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const rect = event.currentTarget.getBoundingClientRect();
      const next = reorderIds(
        sorted.map(key),
        sourceRef.current ?? '',
        id,
        event.clientY > rect.top + rect.height / 2,
      );
      reset();
      if (!next) return;
      try {
        useSidebarOrderStore.getState().setOrder(scope, parentId, next);
      } catch (error) {
        message.error(error instanceof Error ? error.message : '排序保存失败');
      }
    },
  });
  return { items: sorted, dragProps };
}
