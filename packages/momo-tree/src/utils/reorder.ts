import type { IMomoTreeNode } from '../types';

/** 在完整树中计算同级排序；不允许拖入目录、跨目录或形成循环。 */
export function planSiblingReorder(
  nodes: IMomoTreeNode[],
  sourceId: string,
  targetId: string,
  after: boolean,
): { parentId: string | null; ids: string[] } | null {
  if (sourceId === targetId) return null;
  const walk = (
    siblings: IMomoTreeNode[],
    parentId: string | null,
  ): ReturnType<typeof planSiblingReorder> => {
    if (
      siblings.some((node) => node.id === sourceId) &&
      siblings.some((node) => node.id === targetId)
    ) {
      const ids = siblings.map((node) => node.id).filter((id) => id !== sourceId);
      ids.splice(ids.indexOf(targetId) + (after ? 1 : 0), 0, sourceId);
      return { parentId, ids };
    }
    for (const node of siblings) {
      const result = node.children?.length ? walk(node.children, node.id) : null;
      if (result) return result;
    }
    return null;
  };
  return walk(nodes, null);
}
