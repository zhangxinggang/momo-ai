import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { IChatStreamMessage } from '../adapters/types';
import { useAiChatConfig } from '../contexts/AiChatConfigContext';
import {
  AI_CHAT_SESSIONS_UPDATED_EVENT,
  type IChatAttachmentMeta,
  type IChatMessage,
  type IChatSession,
  type INoteSnapshot,
  buildStorageKeys,
  generateId,
  generateMessageId,
  generateSessionTitle,
} from '../types/chat';
import {
  ensureNoteSnapshots,
  expandNoteMentionsWithSnapshots,
  findNoteMentions,
  normalizeNotePath,
} from '../utils/note-mention';
import { isCliModelId, parseCliAgent } from '../utils/model-id';
import { useChatSync } from './useChatSync';

export interface IUseChatSessionsOptions {
  /** 弹窗/子模块挂载时固定选中该会话，不恢复侧栏持久化的 CURRENT_SESSION_ID */
  bootstrapSessionId?: string | null;
}

function toApiUserContent(
  displayContent: string,
  snapshots: Record<string, INoteSnapshot>,
): string {
  return expandNoteMentionsWithSnapshots(displayContent, snapshots);
}

async function collectAndEnsureSnapshots(
  userMessages: Array<{ content: string }>,
  currentContent: string,
  existingSnapshots: Record<string, INoteSnapshot>,
  readContent: (path: string) => Promise<string>,
): Promise<Record<string, INoteSnapshot>> {
  const allPaths: string[] = [];
  for (const msg of userMessages) {
    for (const m of findNoteMentions(msg.content)) {
      allPaths.push(normalizeNotePath(m.path));
    }
  }
  for (const m of findNoteMentions(currentContent)) {
    allPaths.push(normalizeNotePath(m.path));
  }
  if (allPaths.length === 0) {
    return existingSnapshots;
  }
  return ensureNoteSnapshots(allPaths, existingSnapshots, readContent);
}

/**
 * 会话状态管理Hook
 * 提供会话的创建、切换、删除等功能
 */
export const useChatSessions = (options?: IUseChatSessionsOptions) => {
  const bootstrapSessionId = options?.bootstrapSessionId ?? null;
  const bootstrapSessionIdRef = useRef(bootstrapSessionId);
  bootstrapSessionIdRef.current = bootstrapSessionId;
  const {
    callAIChatStream,
    callCliAgent,
    superpowerPrompts,
    workspace,
    getIsAuthenticated,
    defaultModel,
    storageKeyPrefix = 'momo-aichat',
    chatStorage,
    isImageModel,
    noteReferences,
  } = useAiChatConfig();
  const storageKeys = useMemo(() => buildStorageKeys(storageKeyPrefix), [storageKeyPrefix]);
  const isAuthenticated = getIsAuthenticated?.() ?? false;
  const chatSync = useChatSync();
  const [sessions, setSessions] = useState<IChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState<string>(() => {
    const initial = defaultModel?.trim();
    return initial || 'Qwen/Qwen3-Next-80B-A3B-Instruct';
  });
  // 高级设置：温度、top_p、系统提示词（系统提示词默认不生效，仅作占位展示）
  const [temperature, setTemperature] = useState<number>(0.7);
  const [topP, setTopP] = useState<number>(0.9);
  const [systemPrompt, setSystemPrompt] = useState<string>('');

  const temperatureRef = useRef(temperature);
  const topPRef = useRef(topP);
  const systemPromptRef = useRef(systemPrompt);

  useEffect(() => {
    temperatureRef.current = temperature;
  }, [temperature]);
  useEffect(() => {
    topPRef.current = topP;
  }, [topP]);
  useEffect(() => {
    systemPromptRef.current = systemPrompt;
  }, [systemPrompt]);

  // RAG：知识库开关与当前集合
  const [kbEnabled, setKbEnabled] = useState<boolean>(false);
  const [kbCollectionId, setKbCollectionId] = useState<number | undefined>(undefined);
  const [agentMode, setAgentMode] = useState<'ask' | 'plan'>('ask');
  const kbEnabledRef = useRef(kbEnabled);
  const kbCollectionIdRef = useRef(kbCollectionId);
  const agentModeRef = useRef(agentMode);
  useEffect(() => {
    kbEnabledRef.current = kbEnabled;
  }, [kbEnabled]);
  useEffect(() => {
    kbCollectionIdRef.current = kbCollectionId;
  }, [kbCollectionId]);
  useEffect(() => {
    agentModeRef.current = agentMode;
  }, [agentMode]);
  // 存储每个会话的AbortController，用于中断流式响应
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  /** 流式 generation 令牌：用于忽略错误/停止后的延迟 chunk 更新 */
  const streamTokensRef = useRef<Map<string, symbol>>(new Map());
  // 标记是否已经进行过登录后的数据同步
  const [hasSyncedAfterLogin, setHasSyncedAfterLogin] = useState(false);

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const autoCreateTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hasLoadedFromStorageRef = useRef(false);
  const chatStorageRef = useRef(chatStorage);
  const storageKeysRef = useRef(storageKeys);
  chatStorageRef.current = chatStorage;
  storageKeysRef.current = storageKeys;

  // 获取当前活跃会话
  const currentSession = sessions.find((session) => session.id === currentSessionId) || null;

  const isCliModel = isCliModelId(currentModel);

  // 获取指定会话的生成状态
  const isSessionGenerating = useCallback(
    (sessionId: string) => {
      const session = sessions.find((s) => s.id === sessionId);
      if (!session) {
        return false;
      }
      if (session.isLoading) {
        return true;
      }
      return session.messages.some((m) => m.isLoading);
    },
    [sessions],
  );

  const isAILoading =
    currentSession?.isLoading ||
    false ||
    (currentSession?.messages.some((m) => m.isLoading) ?? false);

  // 清除会话生成态（停止按钮、错误/超时兜底、持久化恢复后均可调用）
  const clearSessionGeneratingState = useCallback(
    (sessionId: string, options?: { appendStoppedMark?: boolean }) => {
      streamTokensRef.current.delete(sessionId);
      abortControllersRef.current.delete(sessionId);

      setSessions((prevSessions) =>
        prevSessions.map((s) => {
          if (s.id !== sessionId) {
            return s;
          }

          const loadingMessage = s.messages.find((m) => m.isLoading);
          if (!loadingMessage) {
            return { ...s, isLoading: false, updatedAt: Date.now() };
          }

          const hasContent = Boolean(loadingMessage.content?.trim());
          const hasThinking = Boolean(loadingMessage.thinkingContent?.trim());

          if (!hasContent) {
            if (hasThinking) {
              return {
                ...s,
                messages: s.messages.map((msg) =>
                  msg.id === loadingMessage.id ? { ...msg, isLoading: false } : msg,
                ),
                isLoading: false,
                updatedAt: Date.now(),
              };
            }
            return {
              ...s,
              messages: s.messages.filter((m) => m.id !== loadingMessage.id),
              isLoading: false,
              updatedAt: Date.now(),
            };
          }

          const stoppedSuffix =
            options?.appendStoppedMark && !loadingMessage.content.includes('[生成已停止]')
              ? '\n\n[生成已停止]'
              : '';

          return {
            ...s,
            messages: s.messages.map((msg) =>
              msg.id === loadingMessage.id
                ? {
                    ...msg,
                    content: stoppedSuffix ? msg.content + stoppedSuffix : msg.content,
                    isLoading: false,
                  }
                : msg,
            ),
            isLoading: false,
            updatedAt: Date.now(),
          };
        }),
      );
    },
    [],
  );

  // 停止指定会话的生成
  const stopGeneration = useCallback(
    (sessionId: string) => {
      const abortController = abortControllersRef.current.get(sessionId);
      abortController?.abort();
      clearSessionGeneratingState(sessionId, { appendStoppedMark: true });
    },
    [clearSessionGeneratingState],
  );

  // 防抖保存到持久化存储（仅在游客模式下）
  const debouncedSave = useCallback(
    (sessionsToSave: IChatSession[], currentId: string | null, modelId?: string) => {
      // 如果用户已登录，不写入本地持久化
      if (isAuthenticated) {
        return;
      }

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        try {
          chatStorage.setItem(storageKeys.CHAT_SESSIONS, JSON.stringify(sessionsToSave));
          if (currentId) {
            chatStorage.setItem(storageKeys.CURRENT_SESSION_ID, currentId);
          }
          if (modelId) {
            chatStorage.setItem(storageKeys.CURRENT_MODEL, modelId);
          }
        } catch (error) {
          console.error('保存会话数据失败:', error);
        }
      }, 500);
    },
    [chatStorage, isAuthenticated, storageKeys],
  );

  // 更新会话元数据（CLI session 等）
  const updateSessionMeta = useCallback(
    (sessionId: string, updates: Partial<IChatSession>) => {
      setSessions((prev) => {
        const prevSessions = Array.isArray(prev) ? prev : [];
        const updated = prevSessions.map((session) =>
          session.id === sessionId ? { ...session, ...updates, updatedAt: Date.now() } : session,
        );
        debouncedSave(updated, currentSessionId);
        return updated;
      });
    },
    [currentSessionId, debouncedSave],
  );

  // 设置当前模型并持久化
  const handleSetCurrentModel = useCallback(
    (modelId: string) => {
      const prevIsCli = isCliModelId(currentModel);
      const nextIsCli = isCliModelId(modelId);
      setCurrentModel(modelId);

      if (
        currentSessionId &&
        (prevIsCli !== nextIsCli || (nextIsCli && currentModel !== modelId))
      ) {
        updateSessionMeta(currentSessionId, {
          cliAgentSessionId: undefined,
          cliAgentType: undefined,
        });
      }

      if (!isAuthenticated) {
        debouncedSave(sessions, currentSessionId, modelId);
      }
    },
    [currentModel, currentSessionId, isAuthenticated, sessions, debouncedSave, updateSessionMeta],
  );

  // 设置指定会话的加载状态
  const setSessionLoading = useCallback(
    (sessionId: string, loading: boolean) => {
      setSessions((prev) => {
        const prevSessions = Array.isArray(prev) ? prev : [];
        const updated = prevSessions.map((session) =>
          session.id === sessionId
            ? { ...session, isLoading: loading, updatedAt: Date.now() }
            : session,
        );
        debouncedSave(updated, currentSessionId);
        return updated;
      });
    },
    [currentSessionId, debouncedSave],
  );

  // 从持久化存储加载数据（仅在游客模式下）
  const loadFromStorage = useCallback(() => {
    // 如果用户已登录，不从本地持久化加载
    if (isAuthenticated) {
      return;
    }

    const activeChatStorage = chatStorageRef.current;
    const activeStorageKeys = storageKeysRef.current;

    try {
      const savedSessions = activeChatStorage.getItem(activeStorageKeys.CHAT_SESSIONS);
      const savedCurrentId = activeChatStorage.getItem(activeStorageKeys.CURRENT_SESSION_ID);
      const savedModel = activeChatStorage.getItem(activeStorageKeys.CURRENT_MODEL);
      const savedAdvanced = activeChatStorage.getItem(activeStorageKeys.ADVANCED_SETTINGS);

      // 恢复模型选择
      if (savedModel) {
        setCurrentModel((prev) => (prev === savedModel ? prev : savedModel));
      }

      // 恢复高级设置（含 RAG）
      if (savedAdvanced) {
        try {
          const parsed = JSON.parse(savedAdvanced) as {
            temperature?: number;
            topP?: number;
            systemPrompt?: string;
            kbEnabled?: boolean;
            kbCollectionId?: number;
            agentMode?: 'ask' | 'plan';
          };
          const clamp = (v: number) => Math.min(1.0, Math.max(0.1, v));
          const round1 = (v: number) => Math.round(v * 10) / 10;
          if (typeof parsed.temperature === 'number') {
            const nextTemperature = round1(clamp(parsed.temperature));
            setTemperature((prev) => (prev === nextTemperature ? prev : nextTemperature));
          }
          if (typeof parsed.topP === 'number') {
            const nextTopP = round1(clamp(parsed.topP));
            setTopP((prev) => (prev === nextTopP ? prev : nextTopP));
          }
          if (typeof parsed.systemPrompt === 'string') {
            const nextSystemPrompt =
              parsed.systemPrompt.trim() === '' ? '' : parsed.systemPrompt;
            setSystemPrompt((prev) => (prev === nextSystemPrompt ? prev : nextSystemPrompt));
          }
          if (typeof parsed.kbEnabled === 'boolean') {
            setKbEnabled((prev) => (prev === parsed.kbEnabled ? prev : parsed.kbEnabled!));
          }
          if (typeof parsed.kbCollectionId === 'number') {
            setKbCollectionId((prev) =>
              prev === parsed.kbCollectionId ? prev : parsed.kbCollectionId,
            );
          }
          if (parsed.agentMode === 'ask' || parsed.agentMode === 'plan') {
            setAgentMode((prev) => (prev === parsed.agentMode ? prev : parsed.agentMode!));
          }
        } catch {}
      }

      if (savedSessions) {
        const parsedSessions: IChatSession[] = JSON.parse(savedSessions).map(
          (session: IChatSession) => ({
            ...session,
            isLoading: false,
            messages: (session.messages ?? [])
              .filter((m) => !(m.isLoading && !m.content?.trim() && !m.thinkingContent?.trim()))
              .map((m) => (m.isLoading ? { ...m, isLoading: false } : m)),
          }),
        );
        const parsedSessionsJson = JSON.stringify(parsedSessions);
        setSessions((prev) => {
          if (JSON.stringify(prev) === parsedSessionsJson) {
            return prev;
          }
          return parsedSessions;
        });

        // 恢复当前会话：弹窗 bootstrap 优先于侧栏持久化的 CURRENT_SESSION_ID
        const pinnedSessionId = bootstrapSessionIdRef.current;
        let nextCurrentSessionId: string | null = null;
        if (pinnedSessionId && parsedSessions.some((s) => s.id === pinnedSessionId)) {
          nextCurrentSessionId = pinnedSessionId;
        } else if (savedCurrentId && parsedSessions.find((s) => s.id === savedCurrentId)) {
          nextCurrentSessionId = savedCurrentId;
        } else if (parsedSessions.length > 0) {
          const latestSession = parsedSessions.sort((a, b) => b.updatedAt - a.updatedAt)[0];
          nextCurrentSessionId = latestSession.id;
        }
        if (nextCurrentSessionId) {
          setCurrentSessionId((prev) =>
            prev === nextCurrentSessionId ? prev : nextCurrentSessionId,
          );
        }
      }
    } catch (error) {
      console.error('加载会话数据失败:', error);
    }
  }, [isAuthenticated]);

  // 持久化高级设置（含 RAG 设置，仅游客模式；须等初次 loadFromStorage 完成后再写入）
  useEffect(() => {
    if (isAuthenticated || !hasLoadedFromStorageRef.current) {
      return;
    }
    const payload = JSON.stringify({
      temperature,
      topP,
      systemPrompt,
      kbEnabled,
      kbCollectionId,
      agentMode,
    });
    try {
      chatStorage.setItem(storageKeys.ADVANCED_SETTINGS, payload);
    } catch {}
  }, [
    chatStorage,
    isAuthenticated,
    storageKeys,
    temperature,
    topP,
    systemPrompt,
    kbEnabled,
    kbCollectionId,
    agentMode,
  ]);

  // 创建新会话
  const createNewSession = useCallback((): IChatSession => {
    const newSession: IChatSession = {
      id: generateId(),
      title: '新对话',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    console.log('🎯 创建新会话', {
      sessionId: newSession.id,
      title: newSession.title,
      timestamp: new Date(newSession.createdAt).toLocaleString(),
    });

    setSessions((prev) => {
      // 确保 prev 是一个数组，防止 "prev is not iterable" 错误
      const prevSessions = Array.isArray(prev) ? prev : [];
      const updated = [newSession, ...prevSessions];
      debouncedSave(updated, newSession.id);
      return updated;
    });

    setCurrentSessionId(newSession.id);
    return newSession;
  }, [debouncedSave]);

  // 切换到指定会话
  const switchToSession = useCallback(
    (sessionId: string) => {
      const targetSession = sessions.find((s) => s.id === sessionId);
      if (targetSession) {
        setCurrentSessionId(sessionId);
        debouncedSave(sessions, sessionId);
        return;
      }

      // 会话可能由弹窗（如 SKILL 对话）直接写入持久化，内存中尚未加载
      if (isAuthenticated) {
        return;
      }
      try {
        const savedSessions = chatStorage.getItem(storageKeys.CHAT_SESSIONS);
        if (!savedSessions) {
          return;
        }
        const parsedSessions: IChatSession[] = JSON.parse(savedSessions).map(
          (session: IChatSession) => ({
            ...session,
            isLoading: false,
            messages: (session.messages ?? [])
              .filter((m) => !(m.isLoading && !m.content?.trim() && !m.thinkingContent?.trim()))
              .map((m) => (m.isLoading ? { ...m, isLoading: false } : m)),
          }),
        );
        if (!parsedSessions.some((session) => session.id === sessionId)) {
          return;
        }
        setSessions(parsedSessions);
        setCurrentSessionId(sessionId);
        debouncedSave(parsedSessions, sessionId);
      } catch (error) {
        console.error('切换外部会话失败:', error);
      }
    },
    [chatStorage, debouncedSave, isAuthenticated, sessions, storageKeys],
  );

  // 删除会话
  const deleteSession = useCallback(
    (sessionId: string) => {
      setSessions((prev) => {
        // 确保 prev 是一个数组，防止 "prev is not iterable" 错误
        const prevSessions = Array.isArray(prev) ? prev : [];
        const updated = prevSessions.filter((s) => s.id !== sessionId);

        // 如果删除的是当前会话，需要切换到其他会话
        if (sessionId === currentSessionId) {
          const newCurrentId = updated.length > 0 ? updated[0].id : null;
          setCurrentSessionId(newCurrentId);
          debouncedSave(updated, newCurrentId);
        } else {
          debouncedSave(updated, currentSessionId);
        }

        return updated;
      });

      // 如果用户已登录，同时删除云端数据
      if (isAuthenticated) {
        void chatSync.deleteSession(sessionId);
      }
    },
    [currentSessionId, debouncedSave, isAuthenticated, chatSync],
  );

  // 更新会话标题
  const updateSessionTitle = useCallback(
    (sessionId: string, title: string) => {
      setSessions((prev) => {
        // 确保 prev 是一个数组，防止 "prev is not iterable" 错误
        const prevSessions = Array.isArray(prev) ? prev : [];
        const updated = prevSessions.map((session) =>
          session.id === sessionId ? { ...session, title, updatedAt: Date.now() } : session,
        );
        debouncedSave(updated, currentSessionId);
        return updated;
      });
    },
    [currentSessionId, debouncedSave],
  );

  // 添加消息
  const addMessage = useCallback(
    (sessionId: string, messageData: Omit<IChatMessage, 'id' | 'timestamp'>) => {
      const newMessage: IChatMessage = {
        ...messageData,
        id: generateMessageId(),
        timestamp: Date.now(),
      };

      setSessions((prev) => {
        // 确保 prev 是一个数组，防止 "prev is not iterable" 错误
        const prevSessions = Array.isArray(prev) ? prev : [];
        const updated = prevSessions.map((session) => {
          if (session.id === sessionId) {
            const updatedMessages = [...session.messages, newMessage];
            return {
              ...session,
              messages: updatedMessages,
              updatedAt: Date.now(),
            };
          }
          return session;
        });
        debouncedSave(updated, currentSessionId);
        return updated;
      });

      // 如果用户已登录，同时保存到云端
      if (isAuthenticated && !messageData.isLoading) {
        // 不在这里保存消息，避免重复保存
        // 用户消息在sendMessage中保存，AI消息在流式完成后保存
      }

      return newMessage;
    },
    [currentSessionId, debouncedSave, isAuthenticated, chatSync],
  );

  // 更新消息
  const updateMessage = useCallback(
    (sessionId: string, messageId: string, updates: Partial<IChatMessage>) => {
      setSessions((prev) => {
        // 确保 prev 是一个数组，防止 "prev is not iterable" 错误
        const prevSessions = Array.isArray(prev) ? prev : [];
        const updated = prevSessions.map((session) => {
          if (session.id === sessionId) {
            const updatedMessages = session.messages.map((msg) =>
              msg.id === messageId ? { ...msg, ...updates } : msg,
            );
            return {
              ...session,
              messages: updatedMessages,
              updatedAt: Date.now(),
            };
          }
          return session;
        });
        debouncedSave(updated, currentSessionId);
        return updated;
      });
    },
    [currentSessionId, debouncedSave],
  );

  // 发送消息并获取AI回复（流式）
  const sendMessage = useCallback(
    async (
      content: string,
      attachmentsMeta?: IChatAttachmentMeta[],
      options?: {
        displayContent?: string;
        referenceImages?: Array<{
          name?: string;
          mimeType: string;
          base64: string;
        }>;
        retry?: {
          userMessageId: string;
          assistantMessageId: string;
        };
      },
    ) => {
      const isRetry = Boolean(options?.retry);
      const hasReferenceImages = (options?.referenceImages?.length ?? 0) > 0;
      if ((!content.trim() && !hasReferenceImages) || isAILoading) return;

      let activeSessionId = currentSessionId;
      if (!activeSessionId) {
        const draftSession: IChatSession = {
          id: generateId(),
          title: '新对话',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        setSessions((prev) => {
          const prevSessions = Array.isArray(prev) ? prev : [];
          const updated = [draftSession, ...prevSessions];
          debouncedSave(updated, draftSession.id);
          return updated;
        });
        setCurrentSessionId(draftSession.id);
        activeSessionId = draftSession.id;
      }

      const displayContent = (options?.displayContent ?? content).trim();

      let sessionForSnapshots = sessions.find((s) => s.id === activeSessionId);
      let activeSnapshots: Record<string, INoteSnapshot> =
        sessionForSnapshots?.noteSnapshots ?? {};

      if (noteReferences?.readContent) {
        const historyUserMessages = (sessionForSnapshots?.messages ?? []).filter(
          (m) => m.role === 'user' && m.content.trim(),
        );
        activeSnapshots = await collectAndEnsureSnapshots(
          historyUserMessages,
          displayContent,
          activeSnapshots,
          noteReferences.readContent,
        );
        if (Object.keys(activeSnapshots).length > 0 || sessionForSnapshots?.noteSnapshots) {
          updateSessionMeta(activeSessionId, { noteSnapshots: activeSnapshots });
        }
      }

      if (!isRetry) {
        addMessage(activeSessionId, {
          role: 'user',
          content: displayContent,
          attachments: attachmentsMeta,
        });
      }

      // 如果是会话的第一条用户消息，更新会话标题
      const session = sessions.find((s) => s.id === activeSessionId);
      const isFirstUserMessage =
        !isRetry && session && session.messages.filter((m) => m.role === 'user').length === 0;

      // 构造云端保存内容：对用户消息用包装格式保留附件元信息（不保存大段文本）
      const buildCloudContent = (
        role: 'user' | 'assistant',
        display: string,
        atts?: IChatAttachmentMeta[],
      ): string => {
        if (role !== 'user') return display;
        try {
          return JSON.stringify({
            __type: 'chatstudio.msg',
            v: 1,
            role,
            display,
            attachments: Array.isArray(atts) ? atts : [],
          });
        } catch {
          return display;
        }
      };

      if (isFirstUserMessage) {
        const newTitle = generateSessionTitle(displayContent);
        updateSessionTitle(activeSessionId, newTitle);

        // 如果用户已登录，同时保存标题到云端
        if (isAuthenticated) {
          try {
            await chatSync.saveMessage(
              activeSessionId,
              'user',
              buildCloudContent('user', displayContent, attachmentsMeta),
              newTitle,
            );
            console.log('用户消息和标题已保存到云端');
          } catch (error) {
            console.error('保存用户消息到云端失败:', error);
            // 不影响用户体验，消息已在本地保存
          }
        }
      } else if (!isRetry) {
        // 不是第一条消息，正常保存
        if (isAuthenticated) {
          try {
            await chatSync.saveMessage(
              activeSessionId,
              'user',
              buildCloudContent('user', displayContent, attachmentsMeta),
            );
            console.log('用户消息已保存到云端');
          } catch (error) {
            console.error('保存用户消息到云端失败:', error);
            // 不影响用户体验，消息已在本地保存
          }
        }
      }

      let loadingMessage: IChatMessage;
      if (isRetry && options?.retry) {
        updateMessage(activeSessionId, options.retry.assistantMessageId, {
          content: '',
          thinkingContent: undefined,
          stats: undefined,
          isLoading: true,
          isError: false,
        });
        loadingMessage = {
          id: options.retry.assistantMessageId,
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
          isLoading: true,
        };
      } else {
        // 添加AI加载消息
        loadingMessage = addMessage(activeSessionId, {
          role: 'assistant',
          content: '',
          isLoading: true,
        });
      }

      // 设置当前会话的加载状态
      setSessionLoading(activeSessionId, true);

      // 创建AbortController用于中断请求
      const abortController = new AbortController();
      abortControllersRef.current.set(activeSessionId, abortController);
      const streamToken = Symbol('stream');
      streamTokensRef.current.set(activeSessionId, streamToken);
      const isStreamActive = () => streamTokensRef.current.get(activeSessionId) === streamToken;

      try {
        // CLI Agent 路径：直接 spawn 系统命令，不复用 Superpowers 阶段
        if (isCliModelId(currentModel)) {
          if (!callCliAgent) {
            updateMessage(activeSessionId, loadingMessage.id, {
              content: '当前环境不支持 CLI Agent，请在桌面端使用。',
              isLoading: false,
              isError: true,
            });
            setSessionLoading(activeSessionId, false);
            streamTokensRef.current.delete(activeSessionId);
            abortControllersRef.current.delete(activeSessionId);
            return;
          }

          const agent = parseCliAgent(currentModel);
          if (!agent) {
            updateMessage(activeSessionId, loadingMessage.id, {
              content: '未知的 CLI Agent 模型。',
              isLoading: false,
              isError: true,
            });
            setSessionLoading(activeSessionId, false);
            streamTokensRef.current.delete(activeSessionId);
            abortControllersRef.current.delete(activeSessionId);
            return;
          }

          const activeSession = sessions.find((s) => s.id === activeSessionId);
          const cwd =
            workspace?.enabled && workspace.paths[0]?.trim()
              ? workspace.paths[0].trim()
              : undefined;

          try {
            const result = await callCliAgent({
              agent,
              prompt: toApiUserContent(content.trim(), activeSnapshots),
              sessionId: activeSession?.cliAgentSessionId,
              cwd,
            });

            updateMessage(activeSessionId, loadingMessage.id, {
              content: result.content,
              isLoading: false,
              stats: {
                model: result.model,
                responseTime: `${result.responseTimeSec}s`,
                totalTokens: 0,
                promptTokens: 0,
                completionTokens: 0,
              },
            });

            updateSessionMeta(activeSessionId, {
              cliAgentSessionId: result.sessionId,
              cliAgentType: agent,
            });

            if (isAuthenticated && result.content.trim()) {
              try {
                await chatSync.saveMessage(activeSessionId, 'assistant', result.content);
              } catch (error) {
                console.error('保存 CLI 回复到云端失败:', error);
              }
            }
          } catch (cliError) {
            const msg =
              cliError instanceof Error ? cliError.message : 'CLI Agent 调用失败，请稍后重试。';
            updateMessage(activeSessionId, loadingMessage.id, {
              content: msg,
              isLoading: false,
              isError: true,
            });
          } finally {
            setSessionLoading(activeSessionId, false);
            streamTokensRef.current.delete(activeSessionId);
            abortControllersRef.current.delete(activeSessionId);
          }
          return;
        }

        // 准备发送给AI的消息历史
        let chatMessages: IChatStreamMessage[] = [];
        if (isRetry && options?.retry && session) {
          const userIdx = session.messages.findIndex((m) => m.id === options.retry!.userMessageId);
          if (userIdx >= 0) {
            chatMessages = session.messages
              .slice(0, userIdx + 1)
              .filter((m) => !m.isLoading && m.content && m.content.trim() && m.role !== 'system')
              .map((m) => ({
                role: m.role,
                content:
                  m.role === 'user' ? toApiUserContent(m.content, activeSnapshots) : m.content,
              }));
          }
        } else {
          chatMessages =
            session?.messages
              .filter((m) => !m.isLoading && m.content && m.content.trim() && m.role !== 'system')
              .map((m) => ({
                role: m.role,
                content:
                  m.role === 'user' ? toApiUserContent(m.content, activeSnapshots) : m.content,
              })) || [];

          // 添加当前用户消息
          chatMessages.push({
            role: 'user',
            content: toApiUserContent(content.trim(), activeSnapshots),
          });
        }

        // 用于累积流式响应内容
        let accumulatedContent = '';
        let accumulatedThinking = '';
        // 标记是否发生错误，避免在错误后用空内容覆盖错误提示
        let errorOccurred = false;
        // 高频chunk合并相关变量
        let chunkBuffer = '';
        let chunkTimer: ReturnType<typeof setTimeout> | null = null;
        let thinkingChunkBuffer = '';
        let thinkingTimer: ReturnType<typeof setTimeout> | null = null;

        // 合并chunk更新的函数
        const flushChunkBuffer = () => {
          if (!isStreamActive()) {
            chunkBuffer = '';
            chunkTimer = null;
            return;
          }
          if (chunkBuffer) {
            accumulatedContent += chunkBuffer;
            updateMessage(activeSessionId, loadingMessage.id, {
              content: accumulatedContent,
              isLoading: true,
            });
            chunkBuffer = '';
          }
          chunkTimer = null;
        };

        const flushThinkingBuffer = () => {
          if (!isStreamActive()) {
            thinkingChunkBuffer = '';
            thinkingTimer = null;
            return;
          }
          if (thinkingChunkBuffer) {
            accumulatedThinking += thinkingChunkBuffer;
            updateMessage(activeSessionId, loadingMessage.id, {
              thinkingContent: accumulatedThinking,
              isLoading: true,
            });
            thinkingChunkBuffer = '';
          }
          thinkingTimer = null;
        };

        // Superpowers 工作流提示（plan 模式下注入）
        const superpowerParts: string[] = [];
        if (agentModeRef.current === 'plan' && superpowerPrompts?.workflow?.trim()) {
          superpowerParts.push(superpowerPrompts.workflow.trim());
        }
        if (systemPromptRef.current.trim()) {
          superpowerParts.push(systemPromptRef.current.trim());
        }
        const superpowerSystemPrompt = superpowerParts.join('\n\n');

        // 调用流式AI接口
        await callAIChatStream(
          chatMessages,
          // onChunk: 接收到数据块时的回调
          (chunk: string) => {
            chunkBuffer += chunk;
            // 每15ms合并一次更新（兼顾实时性和性能）
            if (!chunkTimer) {
              chunkTimer = setTimeout(flushChunkBuffer, 15); // 15ms约为60fps的单帧时间，减少DOM更新频率
            }
          },
          // onError: 错误处理回调
          (error: string) => {
            streamTokensRef.current.delete(activeSessionId);
            // 清除pending的chunk更新
            if (chunkTimer) {
              clearTimeout(chunkTimer);
              chunkTimer = null;
            }
            if (thinkingTimer) {
              clearTimeout(thinkingTimer);
              thinkingTimer = null;
            }
            // 确保最后一批chunk被更新
            if (chunkBuffer) {
              accumulatedContent += chunkBuffer;
              chunkBuffer = '';
            }
            if (thinkingChunkBuffer) {
              accumulatedThinking += thinkingChunkBuffer;
              thinkingChunkBuffer = '';
            }

            console.error('AI流式回复失败:', error);
            // 以一条 AI 消息的形式展示友好错误提示，保留在对话历史
            updateMessage(activeSessionId, loadingMessage.id, {
              content: error,
              isLoading: false,
              // 标记为错误消息，用于 UI 层识别（样式保持与普通 AI 消息一致）
              isError: true,
            });
            errorOccurred = true;
            setSessionLoading(activeSessionId, false);
            abortControllersRef.current.delete(activeSessionId);
          },
          // onStats: 接收到统计信息时的回调
          (stats) => {
            if (chunkTimer) {
              clearTimeout(chunkTimer);
              chunkTimer = null;
            }
            if (thinkingTimer) {
              clearTimeout(thinkingTimer);
              thinkingTimer = null;
            }
            if (chunkBuffer) {
              accumulatedContent += chunkBuffer;
              chunkBuffer = '';
            }
            if (thinkingChunkBuffer) {
              accumulatedThinking += thinkingChunkBuffer;
              thinkingChunkBuffer = '';
            }
            updateMessage(activeSessionId, loadingMessage.id, {
              content: accumulatedContent,
              thinkingContent: accumulatedThinking || undefined,
              stats: stats,
            });
          },
          currentModel, // 使用当前选中的模型
          {
            temperature: temperatureRef.current,
            top_p: topPRef.current,
            abortController,
            user_system_prompt: superpowerSystemPrompt,
            kb_enabled: isImageModel?.(currentModel) ? false : kbEnabledRef.current,
            kb_collection_id: kbCollectionIdRef.current,
            kb_top_k: 6,
            referenceImages: options?.referenceImages,
            onThinking: (chunk: string) => {
              thinkingChunkBuffer += chunk;
              if (!thinkingTimer) {
                thinkingTimer = setTimeout(flushThinkingBuffer, 15);
              }
            },
          },
        );

        // 流式传输完成，清除加载状态（仅在未发生错误时更新最终内容）
        if (!errorOccurred) {
          // 清除pending的chunk更新并确保最后一批chunk被更新
          if (chunkTimer) {
            clearTimeout(chunkTimer);
            chunkTimer = null;
          }
          if (thinkingTimer) {
            clearTimeout(thinkingTimer);
            thinkingTimer = null;
          }
          if (chunkBuffer) {
            accumulatedContent += chunkBuffer;
            chunkBuffer = '';
          }
          if (thinkingChunkBuffer) {
            accumulatedThinking += thinkingChunkBuffer;
            thinkingChunkBuffer = '';
          }

          updateMessage(activeSessionId, loadingMessage.id, {
            content: accumulatedContent,
            thinkingContent: accumulatedThinking || undefined,
            isLoading: false,
          });

          // AI回复完成后，保存到云端
          if (isAuthenticated && accumulatedContent.trim()) {
            try {
              await chatSync.saveMessage(activeSessionId, 'assistant', accumulatedContent);
              console.log('AI消息已保存到云端');
            } catch (error) {
              console.error('保存AI消息到云端失败:', error);
              // 不影响用户体验，消息已在本地保存
            }
          }
        }
      } catch (error) {
        console.error('AI回复失败:', error);
        streamTokensRef.current.delete(activeSessionId);

        // 更新错误消息（统一为友好提示）
        updateMessage(activeSessionId, loadingMessage.id, {
          content: '🤖 AI 服务暂时不可用，请稍后重试。',
          isLoading: false,
          isError: true,
        });
      } finally {
        // 清除当前会话的加载状态和AbortController
        streamTokensRef.current.delete(activeSessionId);
        setSessionLoading(activeSessionId, false);
        abortControllersRef.current.delete(activeSessionId);
      }
    },
    [
      currentSessionId,
      isAILoading,
      sessions,
      addMessage,
      updateSessionTitle,
      updateMessage,
      updateSessionMeta,
      setSessionLoading,
      currentModel,
      isAuthenticated,
      chatSync,
      callCliAgent,
      superpowerPrompts,
      workspace,
      noteReferences,
    ],
  );

  // 删除用户消息（若其后紧跟助手回复则一并删除）
  const deleteUserMessage = useCallback(
    (userMessageId: string) => {
      if (!currentSessionId) {
        return;
      }

      setSessions((prev) => {
        const prevSessions = Array.isArray(prev) ? prev : [];
        const updated = prevSessions.map((session) => {
          if (session.id !== currentSessionId) {
            return session;
          }

          const userIdx = session.messages.findIndex((m) => m.id === userMessageId);
          if (userIdx < 0) {
            return session;
          }

          const idsToRemove = new Set<string>([userMessageId]);
          const nextMessage = session.messages[userIdx + 1];
          if (nextMessage?.role === 'assistant') {
            idsToRemove.add(nextMessage.id);
          }

          return {
            ...session,
            messages: session.messages.filter((m) => !idsToRemove.has(m.id)),
            updatedAt: Date.now(),
          };
        });

        debouncedSave(updated, currentSessionId);
        return updated;
      });
    },
    [currentSessionId, debouncedSave],
  );

  // 在原有问答记录上重试（不新增用户消息）
  const retryAssistantReply = useCallback(
    async (userMessageId: string) => {
      if (isAILoading || !currentSessionId) {
        return;
      }

      const session = sessions.find((s) => s.id === currentSessionId);
      if (!session) {
        return;
      }

      const userIdx = session.messages.findIndex((m) => m.id === userMessageId);
      if (userIdx < 0) {
        return;
      }

      const userMessage = session.messages[userIdx];
      if (userMessage.role !== 'user' || !userMessage.content.trim()) {
        return;
      }

      const assistantMessage = session.messages[userIdx + 1];
      if (!assistantMessage || assistantMessage.role !== 'assistant' || !assistantMessage.isError) {
        return;
      }

      await sendMessage(userMessage.content, userMessage.attachments, {
        displayContent: userMessage.content,
        referenceImages: (userMessage.attachments ?? [])
          .filter((attachment) => attachment.imageBase64 && attachment.mime?.startsWith('image/'))
          .map((attachment) => ({
            name: attachment.name,
            mimeType: attachment.mime || 'image/png',
            base64: attachment.imageBase64!,
          })),
        retry: {
          userMessageId,
          assistantMessageId: assistantMessage.id,
        },
      });
    },
    [currentSessionId, isAILoading, sendMessage, sessions],
  );

  // 新建对话：仅进入草稿态，待用户首次发送后再落库
  const handleNewChat = useCallback(() => {
    window.dispatchEvent(new CustomEvent('kb:close-manager'));
    setCurrentSessionId(null);
    if (!isAuthenticated) {
      debouncedSave(sessions, null);
    }
  }, [sessions, debouncedSave, isAuthenticated]);

  // 处理用户登录后的数据同步
  useEffect(() => {
    const handleLoginSync = async () => {
      if (isAuthenticated && !hasSyncedAfterLogin && !chatSync.isSyncing) {
        console.log('用户登录成功，数据同步将自动进行');

        // 添加延迟确保cookie完全设置
        await new Promise((resolve) => setTimeout(resolve, 500));

        try {
          // 获取本地游客数据
          const guestSessions = chatStorage.getItem(storageKeys.CHAT_SESSIONS);
          const parsedGuestSessions: IChatSession[] = guestSessions
            ? JSON.parse(guestSessions)
            : [];

          // 加载云端数据（带重试机制）
          const cloudSessions = await loadCloudDataWithRetry();

          if (parsedGuestSessions.length > 0) {
            console.log(`发现 ${parsedGuestSessions.length} 个游客会话，开始同步到云端`);
            // 有游客数据，需要同步到云端
            const syncSuccess = await syncGuestDataWithRetry(parsedGuestSessions);

            if (syncSuccess) {
              console.log('游客数据同步成功，重新加载云端数据');
              // 同步成功后，重新加载云端数据（包含刚同步的数据）
              const updatedCloudSessions = await loadCloudDataWithRetry();
              setSessions(updatedCloudSessions);
              console.log(`同步后加载到 ${updatedCloudSessions.length} 个云端会话`);

              // 设置当前会话为最新的会话
              if (updatedCloudSessions.length > 0) {
                const latestSession = updatedCloudSessions.sort(
                  (a, b) => b.updatedAt - a.updatedAt,
                )[0];
                setCurrentSessionId(latestSession.id);
                console.log(`设置当前会话为: ${latestSession.title}`);
              }

              // 清空本地游客数据
              chatStorage.removeItem(storageKeys.CHAT_SESSIONS);
              chatStorage.removeItem(storageKeys.CURRENT_SESSION_ID);
              console.log('游客数据同步成功，本地数据已清空');
            } else {
              console.log('游客数据同步失败，使用现有云端数据');
              // 同步失败，但不清空游客数据，保留在本地
              // 合并游客数据和云端数据显示给用户
              const mergedSessions = [...parsedGuestSessions, ...cloudSessions];
              setSessions(mergedSessions);

              if (mergedSessions.length > 0) {
                const latestSession = mergedSessions.sort((a, b) => b.updatedAt - a.updatedAt)[0];
                setCurrentSessionId(latestSession.id);
              }
              console.log(`合并显示 ${mergedSessions.length} 个会话（游客+云端）`);
            }
          } else {
            console.log('没有游客数据，直接使用云端数据');
            // 没有游客数据，直接使用云端数据
            setSessions(cloudSessions);
            if (cloudSessions.length > 0) {
              const latestSession = cloudSessions.sort((a, b) => b.updatedAt - a.updatedAt)[0];
              setCurrentSessionId(latestSession.id);
            }
            console.log(`加载 ${cloudSessions.length} 个云端会话`);
          }

          setHasSyncedAfterLogin(true);
        } catch (error) {
          console.error('登录后数据同步失败:', error);
          // 同步失败时，标记为已同步，避免无限重试
          setHasSyncedAfterLogin(true);
        }
      }
    };

    // 带重试机制的云端数据加载 - 限制最大重试次数
    const loadCloudDataWithRetry = async (maxRetries = 2): Promise<IChatSession[]> => {
      for (let i = 0; i < maxRetries; i++) {
        try {
          return await chatSync.loadCloudData();
        } catch (error: any) {
          console.warn(`加载云端数据失败 (尝试 ${i + 1}/${maxRetries}):`, error.message);
          if (i === maxRetries - 1) {
            // 最后一次失败，返回空数组而不是抛出错误
            console.error('加载云端数据最终失败，使用空数据');
            return [];
          }
          // 等待后重试，使用固定延迟避免指数增长
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
      return [];
    };

    // 带重试机制的游客数据同步 - 限制最大重试次数
    const syncGuestDataWithRetry = async (
      guestSessions: IChatSession[],
      maxRetries = 2,
    ): Promise<boolean> => {
      for (let i = 0; i < maxRetries; i++) {
        try {
          return await chatSync.syncGuestData(guestSessions);
        } catch (error: any) {
          console.warn(`同步游客数据失败 (尝试 ${i + 1}/${maxRetries}):`, error.message);
          if (i === maxRetries - 1) {
            // 最后一次失败，返回false
            console.error('同步游客数据最终失败');
            return false;
          }
          // 等待后重试，使用固定延迟避免指数增长
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
      return false;
    };

    // 只在认证状态变化且未同步时执行
    if (isAuthenticated && !hasSyncedAfterLogin) {
      handleLoginSync();
    }
  }, [isAuthenticated, hasSyncedAfterLogin]); // 移除chatSync依赖，避免循环

  // 处理用户登出后的状态重置
  useEffect(() => {
    if (!isAuthenticated && hasSyncedAfterLogin) {
      console.log('👋 用户登出，重置状态...');
      setHasSyncedAfterLogin(false);
      setSessions([]);
      setCurrentSessionId(null);
      console.log('🔄 情况3：登出后重新加载游客数据，将触发初始会话创建');
      // 重新加载游客数据
      loadFromStorage();
    }
  }, [isAuthenticated, hasSyncedAfterLogin, loadFromStorage]);

  // 组件挂载时加载游客数据（仅在游客模式下，仅执行一次）
  useEffect(() => {
    if (isAuthenticated || hasLoadedFromStorageRef.current) {
      return;
    }
    loadFromStorage();
    hasLoadedFromStorageRef.current = true;
  }, [isAuthenticated, loadFromStorage]);

  // 弹窗等外部写入持久化后刷新会话列表
  useEffect(() => {
    const handleExternalSessionsUpdate = () => {
      loadFromStorage();
    };
    window.addEventListener(AI_CHAT_SESSIONS_UPDATED_EVENT, handleExternalSessionsUpdate);
    return () => {
      window.removeEventListener(AI_CHAT_SESSIONS_UPDATED_EVENT, handleExternalSessionsUpdate);
    };
  }, [loadFromStorage]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (autoCreateTimeoutRef.current) {
        clearTimeout(autoCreateTimeoutRef.current);
      }
    };
  }, []);

  return {
    sessions,
    currentSessionId,
    currentSession,
    isAILoading,
    currentModel,
    isSessionGenerating,
    createNewSession,
    switchToSession,
    deleteSession,
    updateSessionTitle,
    addMessage,
    updateMessage,
    deleteUserMessage,
    retryAssistantReply,
    sendMessage,
    stopGeneration,
    setCurrentModel: handleSetCurrentModel,
    handleNewChat,
    // 高级设置导出
    temperature,
    topP,
    systemPrompt,
    setTemperature,
    setTopP,
    setSystemPrompt,
    // RAG 设置导出
    kbEnabled,
    setKbEnabled,
    kbCollectionId,
    setKbCollectionId,
    agentMode,
    setAgentMode,
    isCliModel,
    refreshSessionsFromStorage: loadFromStorage,
  };
};
