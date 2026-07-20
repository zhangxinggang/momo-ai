import { buildStorageKeys } from '@momo/aichat';

import { createLocalChatStorage } from './core/web-chat-storage';

/** 与侧栏「AI 对话」共用同一套持久化键 */
export const MAIN_AI_CHAT_STORAGE_PREFIX = 'skill-platform-ai-chat';

function generateSessionId(): string {
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** 仅分配会话 id，不写入历史（用于弹窗打开时延后持久化） */
export function allocateMainChatSessionId(): string {
  return generateSessionId();
}

/** 暂存侧栏当前会话 id，供弹窗关闭后恢复 */
export function reserveMainChatCurrentSessionId(): string | null {
  const storage = createLocalChatStorage();
  const keys = buildStorageKeys(MAIN_AI_CHAT_STORAGE_PREFIX);
  return storage.getItem(keys.CURRENT_SESSION_ID);
}

export function restoreMainChatCurrentSessionId(sessionId: string | null): void {
  if (!sessionId) {
    return;
  }
  const storage = createLocalChatStorage();
  const keys = buildStorageKeys(MAIN_AI_CHAT_STORAGE_PREFIX);
  storage.setItem(keys.CURRENT_SESSION_ID, sessionId);
}
