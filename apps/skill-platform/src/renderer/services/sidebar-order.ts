import type { IMomoTreeNode } from '@momo/tree';

export type SidebarOrders = Record<string, Record<string, string[]>>;
export const ROOT_ORDER_KEY = '__root__';

export function orderItems<T>(items: T[], ids: string[] = [], key: (item: T) => string): T[] {
  const rank = new Map(ids.map((id, index) => [id, index]));
  return [...items].sort(
    (left, right) => (rank.get(key(left)) ?? ids.length) - (rank.get(key(right)) ?? ids.length),
  );
}

export function orderTree(
  nodes: IMomoTreeNode[],
  orders: Record<string, string[]> = {},
  parentId: string | null = null,
): IMomoTreeNode[] {
  return orderItems(nodes, orders[parentId ?? ROOT_ORDER_KEY], (node) => node.id).map((node) => ({
    ...node,
    children: node.children ? orderTree(node.children, orders, node.id) : undefined,
  }));
}

export function reorderIds(
  ids: string[],
  sourceId: string,
  targetId: string,
  after: boolean,
): string[] | null {
  if (sourceId === targetId || !ids.includes(sourceId) || !ids.includes(targetId)) return null;
  const result = ids.filter((id) => id !== sourceId);
  result.splice(result.indexOf(targetId) + (after ? 1 : 0), 0, sourceId);
  return result;
}

export function remapPathOrders(
  orders: Record<string, string[]>,
  oldPath: string,
  newPath: string,
): Record<string, string[]> {
  const remap = (id: string) =>
    id === oldPath || id.startsWith(`${oldPath}/`) ? `${newPath}${id.slice(oldPath.length)}` : id;
  return Object.fromEntries(
    Object.entries(orders).map(([parent, ids]) => [remap(parent), ids.map(remap)]),
  );
}
