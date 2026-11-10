import type { IChatSession } from '@momo/aichat';
import {
  CHAT_HISTORY_ORDER_SCOPE,
  CHAT_HISTORY_PIN_SCOPE,
  planChatHistoryDrop,
} from '@renderer/services/aichat/history-order';
import { ROOT_ORDER_KEY } from '@renderer/services/sidebar-order';
import { useSidebarOrderStore } from '@renderer/store/sidebar-order';
import { App } from 'antd';
import { useRef, useState, type DragEvent } from 'react';

const EMPTY_ORDERS: Record<string, string[]> = {};
const EMPTY_IDS: string[] = [];

export function useChatHistoryOrder(sessions: IChatSession[]) {
  const { message } = App.useApp();
  const orders =
    useSidebarOrderStore((state) => state.orders[CHAT_HISTORY_ORDER_SCOPE]) ?? EMPTY_ORDERS;
  const pinnedIds =
    useSidebarOrderStore((state) => state.orders[CHAT_HISTORY_PIN_SCOPE]?.[ROOT_ORDER_KEY]) ??
    EMPTY_IDS;
  const sourceRef = useRef<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; after: boolean } | null>(null);
  const reset = () => {
    sourceRef.current = null;
    setDropTarget(null);
  };
  const save = (scope: string, parentId: string | null, ids: string[]) => {
    try {
      useSidebarOrderStore.getState().setOrder(scope, parentId, ids);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '对话顺序保存失败');
    }
  };
  const togglePin = (id: string) => {
    const current =
      useSidebarOrderStore.getState().orders[CHAT_HISTORY_PIN_SCOPE]?.[ROOT_ORDER_KEY] ?? [];
    save(
      CHAT_HISTORY_PIN_SCOPE,
      null,
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };
  const plan = (id: string, after: boolean) =>
    planChatHistoryDrop(sessions, orders, pinnedIds, sourceRef.current ?? '', id, after);
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
      const rect = event.currentTarget.getBoundingClientRect();
      const after = event.clientY > rect.top + rect.height / 2;
      if (!plan(id, after)) {
        setDropTarget(null);
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = 'move';
      setDropTarget({ id, after });
    },
    onDragLeave: () => setDropTarget(null),
    onDragEnd: reset,
    onDrop: (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const rect = event.currentTarget.getBoundingClientRect();
      const next = plan(id, event.clientY > rect.top + rect.height / 2);
      reset();
      if (next) save(CHAT_HISTORY_ORDER_SCOPE, next.projectId, next.ids);
    },
  });
  return { orders, pinnedIds, togglePin, dragProps };
}
