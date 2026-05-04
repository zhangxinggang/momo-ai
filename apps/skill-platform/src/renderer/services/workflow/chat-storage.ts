import { buildStorageKeys, type IChatSession } from '@momo/aichat';

import { parseWorkflowGraphJson } from '@momo/workflow';

import { createLocalChatStorage } from '@renderer/services/aichat/core/web-chat-storage';
import { isResourceNode } from '@renderer/services/workflow/graph-utils';

/** 工作流节点对话独立存储前缀（不进入 AI 对话模块） */
export function buildWorkflowNodeChatPrefix(workflowId: string, nodeId: string): string {
  return `workflow-node-chat-${workflowId}-${nodeId}`;
}

function generateSessionId(): string {
  return `wf-chat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadSessions(prefix: string, storage = createLocalChatStorage()): IChatSession[] {
  const keys = buildStorageKeys(prefix);
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
  prefix: string,
  sessions: IChatSession[],
  currentSessionId: string | null,
  storage = createLocalChatStorage(),
): void {
  const keys = buildStorageKeys(prefix);
  storage.setItem(keys.CHAT_SESSIONS, JSON.stringify(sessions));
  if (currentSessionId) {
    storage.setItem(keys.CURRENT_SESSION_ID, currentSessionId);
  }
}

/** 获取或创建工作流节点对话会话 */
export function getOrCreateWorkflowNodeSession(
  workflowId: string,
  nodeId: string,
  title: string,
): { sessionId: string; sessionKey: string; storagePrefix: string } {
  const storagePrefix = buildWorkflowNodeChatPrefix(workflowId, nodeId);
  const storage = createLocalChatStorage();
  const keys = buildStorageKeys(storagePrefix);
  const existingId = storage.getItem(keys.CURRENT_SESSION_ID);
  const sessions = loadSessions(storagePrefix, storage);

  if (existingId && sessions.some((s) => s.id === existingId)) {
    return {
      sessionId: existingId,
      sessionKey: `wf-node-${workflowId}-${nodeId}-${existingId}`,
      storagePrefix,
    };
  }

  const sessionId = generateSessionId();
  const newSession: IChatSession = {
    id: sessionId,
    title: title.trim() || '节点对话',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  saveSessions(storagePrefix, [newSession], sessionId, storage);
  return {
    sessionId,
    sessionKey: `wf-node-${workflowId}-${nodeId}-${sessionId}`,
    storagePrefix,
  };
}

/** 删除工作流节点对话记录 */
export function deleteWorkflowNodeChat(workflowId: string, nodeId: string): void {
  const storage = createLocalChatStorage();
  const prefix = buildWorkflowNodeChatPrefix(workflowId, nodeId);
  const keys = buildStorageKeys(prefix);
  storage.removeItem(keys.CHAT_SESSIONS);
  storage.removeItem(keys.CURRENT_SESSION_ID);
}

/** 删除整个工作流的所有节点对话 */
export function deleteAllWorkflowNodeChats(workflowId: string, graphJson?: string): void {
  if (!graphJson) {
    return;
  }
  const { nodes } = parseWorkflowGraphJson(graphJson);
  for (const node of nodes) {
    if (isResourceNode(node)) {
      deleteWorkflowNodeChat(workflowId, node.id);
    }
  }
}
