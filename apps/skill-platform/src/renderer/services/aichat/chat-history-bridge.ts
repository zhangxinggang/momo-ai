import { buildStorageKeys, type IChatSession } from '@momo/aichat';

import { createLocalChatStorage } from './core/web-chat-storage';

/** 与侧栏「AI 对话」共用同一套持久化键 */
export const MAIN_AI_CHAT_STORAGE_PREFIX = 'skill-platform-ai-chat';

function generateSessionId(): string {
  return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadSessions(storage = createLocalChatStorage()): IChatSession[] {
  const keys = buildStorageKeys(MAIN_AI_CHAT_STORAGE_PREFIX);
  const raw = storage.getItem(keys.CHAT_SESSIONS);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as IChatSession[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSessions(
  sessions: IChatSession[],
  currentSessionId: string | null,
  storage = createLocalChatStorage(),
): void {
  const keys = buildStorageKeys(MAIN_AI_CHAT_STORAGE_PREFIX);
  storage.setItem(keys.CHAT_SESSIONS, JSON.stringify(sessions));
  if (currentSessionId) {
    storage.setItem(keys.CURRENT_SESSION_ID, currentSessionId);
  }
}

/** 在 AI 对话历史中新建一条会话（不切换侧栏当前选中项） */
export function createMainChatSession(title: string): string {
  const storage = createLocalChatStorage();
  const keys = buildStorageKeys(MAIN_AI_CHAT_STORAGE_PREFIX);
  const sessions = loadSessions(storage);
  const sessionId = generateSessionId();
  const newSession: IChatSession = {
    id: sessionId,
    title: title.trim() || '新对话',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  saveSessions([newSession, ...sessions], storage.getItem(keys.CURRENT_SESSION_ID), storage);
  return sessionId;
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
