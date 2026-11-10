import type { IChatSession } from '@momo/aichat';
import { orderItems, reorderIds } from '../sidebar-order';

export const CHAT_HISTORY_ORDER_SCOPE = 'chat-sessions';
export const CHAT_HISTORY_PIN_SCOPE = 'chat-pinned-sessions';

export function orderChatHistory(
  sessions: IChatSession[],
  ids: string[] = [],
  pinnedIds: string[] = [],
): IChatSession[] {
  const pinned = new Set(pinnedIds);
  const ordered = orderItems(
    [...sessions].sort((a, b) => b.updatedAt - a.updatedAt),
    ids,
    (session) => session.id,
  );
  return ordered.sort((a, b) => Number(pinned.has(b.id)) - Number(pinned.has(a.id)));
}

export function planChatHistoryDrop(
  sessions: IChatSession[],
  orders: Record<string, string[]> = {},
  pinnedIds: string[] = [],
  sourceId: string,
  targetId: string,
  after: boolean,
): { projectId: string; ids: string[] } | null {
  const source = sessions.find((session) => session.id === sourceId);
  const target = sessions.find((session) => session.id === targetId);
  if (!source?.projectId || source.projectId !== target?.projectId) return null;
  // Pinned rows stay above ordinary rows; dragging never changes pin state or project.
  if (pinnedIds.includes(sourceId) !== pinnedIds.includes(targetId)) return null;
  const siblings = orderChatHistory(
    sessions.filter((session) => session.projectId === source.projectId),
    orders[source.projectId],
    pinnedIds,
  );
  const ids = reorderIds(
    siblings.map((session) => session.id),
    sourceId,
    targetId,
    after,
  );
  return ids ? { projectId: source.projectId, ids } : null;
}
