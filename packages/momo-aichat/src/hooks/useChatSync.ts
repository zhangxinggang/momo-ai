/**
 * 对话同步 Hook：依赖 AiChatConfig 中的 chatSync 适配器
 */

import { message } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import { useAiChatConfig } from '../contexts/AiChatConfigContext';
import type { IChatSession } from '../types/chat';
import { buildStorageKeys } from '../types/chat';

export interface IChatSyncState {
  isSyncing: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface IChatSyncActions {
  syncGuestData: (guestSessions: IChatSession[]) => Promise<boolean>;
  loadCloudData: () => Promise<IChatSession[]>;
  saveMessage: (
    sessionId: string,
    role: 'user' | 'assistant',
    content: string,
    title?: string,
  ) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  clearError: () => void;
}

export function useChatSync(): IChatSyncState & IChatSyncActions {
  const {
    getIsAuthenticated,
    chatSync,
    chatStorage,
    storageKeyPrefix = 'momo-aichat',
  } = useAiChatConfig();
  const storageKeys = useMemo(() => buildStorageKeys(storageKeyPrefix), [storageKeyPrefix]);
  const isAuthenticated = getIsAuthenticated?.() ?? false;
  const [syncState, setSyncState] = useState<IChatSyncState>({
    isSyncing: false,
    isLoading: false,
    error: null,
  });

  const clearError = useCallback(() => {
    setSyncState((prev) => ({ ...prev, error: null }));
  }, []);

  const syncGuestData = useCallback(
    async (guestSessions: IChatSession[]): Promise<boolean> => {
      if (!isAuthenticated || !chatSync) {
        return false;
      }
      if (guestSessions.length === 0) {
        return true;
      }
      if (syncState.isSyncing) {
        return false;
      }

      setSyncState((prev) => ({ ...prev, isSyncing: true, error: null }));
      try {
        const ok = await chatSync.syncGuestData(guestSessions);
        if (ok) {
          message.success(`成功同步 ${guestSessions.length} 个对话到云端`);
          chatStorage.removeItem(storageKeys.CHAT_SESSIONS);
          chatStorage.removeItem(storageKeys.CURRENT_SESSION_ID);
        }
        return ok;
      } catch (error: unknown) {
        const err = error as { message?: string; response?: { status?: number } };
        if (err.response?.status === 401) {
          throw new Error('需要登录');
        }
        const errorMessage = err.message || '同步数据失败';
        setSyncState((prev) => ({ ...prev, error: errorMessage }));
        throw new Error(errorMessage);
      } finally {
        setSyncState((prev) => ({ ...prev, isSyncing: false }));
      }
    },
    [chatStorage, chatSync, isAuthenticated, storageKeys, syncState.isSyncing],
  );

  const loadCloudData = useCallback(async (): Promise<IChatSession[]> => {
    if (!isAuthenticated || !chatSync) {
      return [];
    }
    setSyncState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      return await chatSync.loadCloudData();
    } catch (error: unknown) {
      const err = error as { message?: string; response?: { status?: number } };
      if (err.response?.status === 401) {
        throw new Error('需要登录');
      }
      const errorMessage = err.message || '加载云端数据失败';
      setSyncState((prev) => ({ ...prev, error: errorMessage }));
      throw new Error('加载云端数据失败');
    } finally {
      setSyncState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [chatSync, isAuthenticated]);

  const saveMessage = useCallback(
    async (
      sessionId: string,
      role: 'user' | 'assistant',
      content: string,
      title?: string,
    ): Promise<void> => {
      if (!isAuthenticated || !chatSync) return;
      try {
        await chatSync.saveMessage(sessionId, role, content, title);
      } catch (error) {
        console.error('保存消息到云端失败:', error);
      }
    },
    [chatSync, isAuthenticated],
  );

  const deleteSession = useCallback(
    async (sessionId: string): Promise<void> => {
      if (!isAuthenticated || !chatSync) return;
      try {
        await chatSync.deleteSession(sessionId);
      } catch (error) {
        console.error('删除云端会话失败:', error);
      }
    },
    [chatSync, isAuthenticated],
  );

  return {
    isSyncing: syncState.isSyncing,
    isLoading: syncState.isLoading,
    error: syncState.error,
    syncGuestData,
    loadCloudData,
    saveMessage,
    deleteSession,
    clearError,
  };
}
