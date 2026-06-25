import { buildStorageKeys } from '@momo/aichat';
import type { IMomoTreeNode } from '@momo/tree';

export function buildNoteAiStoragePrefix(noteId: string): string {
  return `note-ai-${noteId}`;
}

export function buildNoteAiWorkspaceStorageKey(noteId: string): string {
  return `note-ai-workspace-${noteId}`;
}

export function clearNoteAiWritingStorage(noteId: string): void {
  const keys = buildStorageKeys(buildNoteAiStoragePrefix(noteId));
  localStorage.removeItem(keys.CHAT_SESSIONS);
  localStorage.removeItem(keys.CURRENT_SESSION_ID);
  localStorage.removeItem(keys.CURRENT_MODEL);
  localStorage.removeItem(keys.ADVANCED_SETTINGS);
  localStorage.removeItem(buildNoteAiWorkspaceStorageKey(noteId));
}

function collectFileNoteIdsFromNode(node: IMomoTreeNode): string[] {
  const ids: string[] = [];
  const walk = (items: IMomoTreeNode[]) => {
    for (const item of items) {
      if (item.kind === 'file' && item.noteId) {
        ids.push(item.noteId);
      }
      if (item.children?.length) {
        walk(item.children);
      }
    }
  };
  if (node.kind === 'file' && node.noteId) {
    ids.push(node.noteId);
  }
  if (node.children?.length) {
    walk(node.children);
  }
  return ids;
}

/** 收集目录或文件节点下所有笔记文件的 noteId（用于删除时清理 AI 写作 storage） */
export function collectNoteIdsFromTree(nodes: IMomoTreeNode[], folderOrFileId: string): string[] {
  const findNode = (items: IMomoTreeNode[]): IMomoTreeNode | null => {
    for (const node of items) {
      if (node.id === folderOrFileId) {
        return node;
      }
      if (node.children?.length) {
        const found = findNode(node.children);
        if (found) {
          return found;
        }
      }
    }
    return null;
  };

  const target = findNode(nodes);
  if (!target) {
    return [];
  }
  return collectFileNoteIdsFromNode(target);
}
