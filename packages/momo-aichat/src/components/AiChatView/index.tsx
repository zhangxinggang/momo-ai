import { LoadingOutlined } from '@ant-design/icons';
import { App } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useAiChatConfig } from '../../contexts/AiChatConfigContext';
import { useChatContext } from '../../contexts/ChatContext';
import {
  DEFAULT_WELCOME_MESSAGE,
  type IChatAttachment,
  type IChatAttachmentMeta,
  type IChatMessage,
} from '../../types/chat';
import type { ISlashInvocation } from '../../types/slash-command';
import { ChatAttachmentIcon } from '../../utils/attachment-icon';
import { ChatContextBanner } from '../ChatContextBanner';
import type { IChatInputPanelRef } from '../ChatInputPanel';
import ChatInputPanel from '../ChatInputPanel';
import CitationCard from '../CitationCard';
import CollapsibleThinking from '../CollapsibleThinking';
import DropOverlay from '../DropOverlay';
import MarkdownRenderer from '../MarkdownRenderer';
import { MessageCopyAction } from '../MessageCopyAction';
import { MessageUserActions } from '../MessageUserActions';
import { NoteReferenceText } from '../NoteReferenceText';

export interface IProps {
  /** 外部同步的输入值（如 Prompt 测试预填用户提示词） */
  inputValue?: string;
  onInputChange?: (value: string) => void;
  /** 不显示默认欢迎语 */
  hideWelcome?: boolean;
  /** 用户发送消息成功后回调 */
  onAfterSend?: () => void;
  placeholder?: string;
  /** MdPreview 明暗主题 */
  theme?: 'light' | 'dark';
  previewTheme?: string;
  codeTheme?: string;
  /** 助手消息「复制」按钮右侧扩展插槽 */
  renderAssistantMessageActions?: (message: IChatMessage) => React.ReactNode;
}

export const AiChatView: React.FC<IProps> = ({
  inputValue: externalInputValue,
  onInputChange,
  hideWelcome = false,
  onAfterSend,
  placeholder = '输入您的消息...',
  theme = 'light',
  previewTheme = 'cyanosis',
  codeTheme = 'atom',
  renderAssistantMessageActions,
}) => {
  const { message, modal } = App.useApp();
  const { uploadFiles, validateLocalFiles, saveChatSources, isImageModel, getImageModelInputHint } =
    useAiChatConfig();
  // 用户输入内容
  const [inputValue, setInputValue] = useState(externalInputValue ?? '');
  const [slashInvocation, setSlashInvocation] = useState<ISlashInvocation>();

  useEffect(() => {
    if (externalInputValue !== undefined) {
      setInputValue(externalInputValue);
    }
  }, [externalInputValue]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    onInputChange?.(value);
  };
  // 消息容器引用，用于自动滚动
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // 消息容器的滚动容器引用
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  // 聊天输入框引用，用于自动聚焦
  const chatInputRef = useRef<IChatInputPanelRef>(null);
  // 用户是否手动滚动（ref 供异步回调读取最新值）
  const userHasScrolledRef = useRef(false);
  // 上次消息数量，用于检测新消息
  const lastMessageCountRef = useRef(0);
  // 上次内容签名，仅在真实内容变化时触发自动滚动
  const lastContentSigRef = useRef('');
  // 是否应该自动滚动（仅在用户发送消息时为true）
  const shouldAutoScrollRef = useRef(false);
  // 智能吸附状态：用户是否希望跟随最新消息
  const isStickToBottomRef = useRef(true);
  // 滚动锁：防抖延迟滚动的 timeout ID
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 流式输出状态：标记是否正在接收流式数据
  const isStreamingRef = useRef(false);
  // 保底滚动定时器：极端情况下的兜底机制
  const fallbackScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 消息列表内容区引用（用于 ResizeObserver 监听图表异步撑高）
  const messagesContentRef = useRef<HTMLDivElement>(null);
  // 程序滚动标记：区分 scrollToBottom 触发的滚动与用户主动滚动，
  // 避免程序滚动回弹覆盖用户向上滚动的意图
  const isProgrammaticScrollRef = useRef<boolean>(false);

  // 附件上传与拖拽状态
  const [attachments, setAttachments] = useState<IChatAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [isDragging, setIsDragging] = useState(false);
  // 拖拽进入/离开计数，避免子元素触发抖动
  const dragCounterRef = useRef<number>(0);
  // 全局兜底：防止覆盖层在极端情况下卡住或浏览器打开文件
  useEffect(() => {
    const onWindowDragOver = (e: DragEvent) => {
      if (e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files')) {
        e.preventDefault();
      }
    };
    const onWindowDrop = (e: DragEvent) => {
      if (e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files')) {
        e.preventDefault();
      }
      dragCounterRef.current = 0;
      setIsDragging(false);
    };
    window.addEventListener('dragover', onWindowDragOver);
    window.addEventListener('drop', onWindowDrop);
    window.addEventListener('dragend', onWindowDrop);
    return () => {
      window.removeEventListener('dragover', onWindowDragOver);
      window.removeEventListener('drop', onWindowDrop);
      window.removeEventListener('dragend', onWindowDrop);
    };
  }, []);

  // 附件大小格式化（用于消息内附件元信息展示）
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const renderMessageStats = (message: any) => {
    if (!message?.stats) {
      return null;
    }

    return (
      <div className='mt-2 space-y-1'>
        <div className='font-mono text-xs text-gray-400 dark:text-gray-500'>
          {message.stats.model} | {message.stats.responseTime} | {message.stats.totalTokens} tokens
        </div>
        {Array.isArray(message.stats?.citations) && message.stats.citations.length > 0 && (
          <div className='mt-1 flex flex-wrap gap-2'>
            {message.stats.citations.map((c: any, i: number) => (
              <CitationCard key={i} citation={c} index={i} />
            ))}
          </div>
        )}
      </div>
    );
  };

  // 从Context获取会话状态和方法
  const {
    currentSession,
    currentSessionId,
    currentModel,
    isAILoading,
    isSessionGenerating,
    sendMessage,
    stopGeneration,
    deleteUserMessage,
    retryAssistantReply,
  } = useChatContext();

  const isCurrentImageModel = isImageModel?.(currentModel) ?? false;
  const inputPlaceholder = getImageModelInputHint?.(currentModel) ?? placeholder;

  // 获取距离底部的像素距离
  const getDistanceFromBottom = () => {
    if (!messagesContainerRef.current) return 0;
    const container = messagesContainerRef.current;
    // 精确计算距离底部的距离（clientHeight已扣除padding，更准确）
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight; // clientHeight不包含滚动条，更精确
    return distanceFromBottom;
  };

  // 用户主动离开底部：立即取消吸附，避免后续内容更新/effect 把视图拉回底部
  const detachFromBottom = () => {
    clearFallbackScrollTimer();
    isStickToBottomRef.current = false;
    userHasScrolledRef.current = true;
  };

  // 滚回底部并恢复吸附
  const attachToBottom = () => {
    isStickToBottomRef.current = true;
    userHasScrolledRef.current = false;
  };

  // 滚动到底部：直接设置 scrollTop，避免 scrollIntoView 与用户滚动竞态
  const scrollToBottom = () => {
    if (!isStickToBottomRef.current && !shouldAutoScrollRef.current) return;

    const container = messagesContainerRef.current;
    if (!container) return;

    // 吸附态下允许连续贴底（图表异步撑高时需多次校正）
    isProgrammaticScrollRef.current = true;
    container.scrollTop = container.scrollHeight;

    // 下一帧再清标记，吞掉本次程序滚动触发的 scroll 事件
    requestAnimationFrame(() => {
      isProgrammaticScrollRef.current = false;
    });
  };

  // 启动保底滚动定时器 - 仅在吸附态下兜底
  const startFallbackScrollTimer = () => {
    if (fallbackScrollTimeoutRef.current) {
      clearTimeout(fallbackScrollTimeoutRef.current);
    }

    let checkCount = 0;
    const checkScroll = () => {
      if (isStickToBottomRef.current && !userHasScrolledRef.current) {
        scrollToBottom();
      }
      checkCount++;
      if (isStreamingRef.current && checkCount < 3) {
        fallbackScrollTimeoutRef.current = setTimeout(checkScroll, 100);
      } else {
        fallbackScrollTimeoutRef.current = null;
      }
    };

    fallbackScrollTimeoutRef.current = setTimeout(checkScroll, 100);
  };

  // 清除保底滚动定时器
  const clearFallbackScrollTimer = () => {
    if (fallbackScrollTimeoutRef.current) {
      clearTimeout(fallbackScrollTimeoutRef.current);
      fallbackScrollTimeoutRef.current = null;
    }
  };

  // 滚轮向上时立即取消吸附（不等 scroll 事件），解决「在底部上滚一点又弹回」
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY < 0) {
      detachFromBottom();
    }
  };

  // 处理用户滚动事件 - 智能吸附逻辑（带滞后，避免底部上滚一点又重新吸附）
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    // 忽略程序滚动，避免自动滚动重置用户向上滚动的意图
    if (isProgrammaticScrollRef.current) {
      return;
    }

    const distanceFromBottom = getDistanceFromBottom();
    clearFallbackScrollTimer();

    // 真正贴底才恢复吸附；离开超过阈值才取消。中间区间保持当前状态，
    // 避免「在底部上滚一点 → 仍 ≤30px → 又被重新吸附 → 弹回底部」
    if (distanceFromBottom <= 5) {
      attachToBottom();
    } else if (distanceFromBottom > 30) {
      detachFromBottom();
    }
  };

  // 内容区高度变化时（如 Mermaid 异步渲染完成）在吸附态下重新贴底，
  // 避免「先滚到底 → 图表撑高 → 滚动条往上跳一点」
  useEffect(() => {
    const contentEl = messagesContentRef.current;
    if (!contentEl || typeof ResizeObserver === 'undefined') {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      if (!isStickToBottomRef.current || userHasScrolledRef.current) {
        return;
      }
      scrollToBottom();
    });

    resizeObserver.observe(contentEl);
    return () => {
      resizeObserver.disconnect();
    };
  }, [currentSessionId]);

  // 仅在消息内容真实变化时决定是否滚底；吸附状态用 ref，不进入依赖，避免上滚触发 effect 再拉回底部
  useEffect(() => {
    const messages = currentSession?.messages || [];
    const currentMessageCount = messages.length;
    const contentSig = messages
      .map(
        (msg) =>
          `${msg.id}:${msg.content?.length ?? 0}:${msg.thinkingContent?.length ?? 0}:${msg.isLoading ? 1 : 0}:${msg.isError ? 1 : 0}`,
      )
      .join('|');

    const hasContentChanged = contentSig !== lastContentSigRef.current;
    const hasNewMessage = currentMessageCount > lastMessageCountRef.current;
    const hasContentUpdate = messages.some((msg) => msg.role === 'assistant' && msg.isLoading);

    const wasStreaming = isStreamingRef.current;
    isStreamingRef.current = !!hasContentUpdate;

    if (!wasStreaming && hasContentUpdate) {
      startFallbackScrollTimer();
    } else if (wasStreaming && !hasContentUpdate) {
      clearFallbackScrollTimer();
    }

    lastContentSigRef.current = contentSig;
    lastMessageCountRef.current = currentMessageCount;

    // 无内容变化且非发送触发时，不滚动（用户仅改变吸附状态时也不应滚）
    if (!hasContentChanged && !shouldAutoScrollRef.current) {
      return;
    }

    const shouldScroll =
      shouldAutoScrollRef.current ||
      (isStickToBottomRef.current &&
        !userHasScrolledRef.current &&
        (hasNewMessage || hasContentUpdate || hasContentChanged));

    if (shouldScroll) {
      scrollToBottom();
      if (shouldAutoScrollRef.current) {
        shouldAutoScrollRef.current = false;
      }
    }
  }, [currentSession?.messages, currentSessionId]);

  // 会话切换：恢复吸附并滚到底部；延迟再贴几次，覆盖图表首屏渲染
  useEffect(() => {
    attachToBottom();
    shouldAutoScrollRef.current = true;
    lastContentSigRef.current = '';
    lastMessageCountRef.current = 0;

    scrollToBottom();
    shouldAutoScrollRef.current = false;

    const retryTimers = [50, 150, 400, 800].map((delayMs) =>
      window.setTimeout(() => {
        if (isStickToBottomRef.current && !userHasScrolledRef.current) {
          scrollToBottom();
        }
      }, delayMs),
    );

    return () => {
      retryTimers.forEach((id) => window.clearTimeout(id));
    };
  }, [currentSessionId]);

  // 组件清理：清除滚动锁的 timeout 和保底定时器
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (fallbackScrollTimeoutRef.current) {
        clearTimeout(fallbackScrollTimeoutRef.current);
      }
    };
  }, []);

  // 监听会话切换，自动聚焦输入框
  useEffect(() => {
    // 当会话ID发生变化时，延迟聚焦输入框
    // 使用setTimeout确保新会话的DOM已完全渲染
    if (currentSessionId) {
      const focusTimer = setTimeout(() => {
        if (chatInputRef.current) {
          chatInputRef.current.focus();
        }
      }, 100); // 100ms延迟确保DOM渲染完成

      return () => clearTimeout(focusTimer);
    }
  }, [currentSessionId]);

  // 发送消息处理函数
  const handleSendMessage = async () => {
    const hasText = !!inputValue.trim();
    const hasImageAttachments = attachments.some(
      (file) => file.imageBase64 && file.mime.startsWith('image/'),
    );
    if (
      (!hasText && !(isCurrentImageModel && hasImageAttachments) && attachments.length === 0) ||
      isAILoading ||
      isUploading
    ) {
      return;
    }

    const userContent = inputValue.trim();
    const pendingAttachments = [...attachments];
    const pendingProgressMap = { ...progressMap };
    const pendingInvocation = slashInvocation;

    // 清空输入框
    handleInputChange('');
    setSlashInvocation(undefined);

    // 标记应该自动滚动（用户发送消息时）
    shouldAutoScrollRef.current = true;
    // 重置用户滚动状态，启用吸附模式
    attachToBottom();

    const finalUserContent =
      userContent ||
      (isCurrentImageModel && hasImageAttachments
        ? '请根据参考图生成或编辑图片'
        : '请基于已上传的附件给出总结或见解');

    const displayContent = userContent || (pendingAttachments.length > 0 ? '（已发送附件）' : '');

    try {
      const sourceRefs = await saveChatSources(
        pendingAttachments.map((attachment) => ({
          name: attachment.name,
          mimeType: attachment.mime || 'text/plain',
          encoding: attachment.imageBase64 ? ('base64' as const) : ('utf8' as const),
          content: attachment.imageBase64 || attachment.text || '',
        })),
      );
      const attachmentsMeta: IChatAttachmentMeta[] = pendingAttachments.map((a, index) => ({
        id: a.id,
        name: a.name,
        size: a.size,
        mime: a.mime,
        ext: a.ext,
        snippet: a.snippet,
        sourceRef: sourceRefs[index],
      }));
      // 用户点击发送后，立即清空输入面板中的待发送附件区
      setAttachments([]);
      setProgressMap({});

      const sent = await sendMessage(finalUserContent, attachmentsMeta, {
        displayContent,
        sourceRefs,
        invocation: pendingInvocation,
      });
      if (!sent) {
        handleInputChange(userContent);
        setAttachments(pendingAttachments);
        setProgressMap(pendingProgressMap);
        setSlashInvocation(pendingInvocation);
        return;
      }
      onAfterSend?.();
    } catch (error) {
      console.error('发送消息失败:', error);
      handleInputChange(userContent);
      setAttachments(pendingAttachments);
      setProgressMap(pendingProgressMap);
      setSlashInvocation(pendingInvocation);
      message.error('发送消息失败，请稍后重试');
    }
  };

  // 处理Enter键发送
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.nativeEvent.isComposing || e.nativeEvent.keyCode === 229) {
      return;
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 处理停止生成
  const handleStopGeneration = () => {
    if (currentSessionId) {
      stopGeneration(currentSessionId);
    }
  };

  const getAssistantReplyForUser = (userMessageId: string): IChatMessage | undefined => {
    const messages = currentSession?.messages ?? [];
    const userIdx = messages.findIndex((m) => m.id === userMessageId);
    if (userIdx < 0) {
      return undefined;
    }
    const nextMessage = messages[userIdx + 1];
    return nextMessage?.role === 'assistant' ? nextMessage : undefined;
  };

  const handleEditUserMessage = (msg: IChatMessage) => {
    handleInputChange(msg.content);
    setSlashInvocation(msg.invocation);
    chatInputRef.current?.focus();
  };

  const handleDeleteUserMessage = (msg: IChatMessage) => {
    const assistantReply = getAssistantReplyForUser(msg.id);
    const performDelete = () => {
      deleteUserMessage(msg.id);
    };

    if (assistantReply) {
      modal.confirm({
        title: '删除消息',
        content: '将删除当前问答及对应的回复，是否继续？',
        okText: '删除',
        cancelText: '取消',
        okButtonProps: { danger: true },
        onOk: performDelete,
      });
      return;
    }

    performDelete();
  };

  const handleRetryUserMessage = (msg: IChatMessage) => {
    void retryAssistantReply(msg.id);
  };

  // 处理文件选择/上传
  const handleAttachFiles = async (files: File[]) => {
    if (!files || files.length === 0) return;

    if (attachments.length + files.length > 10) {
      message.error('单次最多 10 个附件');
      return;
    }

    const v = validateLocalFiles(files);
    if (!v.ok) {
      message.error(v.message || '文件不合法');
      return;
    }

    // 先添加临时项以显示解析中
    const tempItems: IChatAttachment[] = files.map((f) => {
      const ext = (f.name.split('.').pop() || '').toLowerCase();
      return {
        id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: f.name,
        size: f.size,
        mime: f.type || '',
        ext,
        text: '',
        snippet: '',
      } as IChatAttachment;
    });

    setAttachments((prev) => [...prev, ...tempItems]);
    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const tempId = tempItems[i].id;
      try {
        const [res] = await uploadFiles([file], (_i, p) => {
          setProgressMap((pm) => ({ ...pm, [tempId]: p }));
        });
        setAttachments((prev) => prev.map((a) => (a.id === tempId ? res : a)));
      } catch (e: any) {
        message.error(e?.message || `${file.name} 上传失败`);
        setAttachments((prev) => prev.filter((a) => a.id !== tempId));
      }
    }

    setIsUploading(false);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
    setProgressMap((pm) => {
      const n = { ...pm } as any;
      delete n[id];
      return n;
    });
  };

  // 获取当前会话的消息列表，如果没有消息则显示欢迎语
  const displayMessages = currentSession?.messages || [];
  const showWelcome = !hideWelcome;

  // 判断当前会话是否正在生成
  const isCurrentSessionGenerating = currentSessionId
    ? isSessionGenerating(currentSessionId)
    : false;

  return (
    <div className='bg-panel flex h-full flex-col transition-colors'>
      <ChatContextBanner />
      {/* 消息滚动容器：全宽，允许在左右 10% 空白区域滚动 */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        onWheel={handleWheel}
        onDragEnter={(e) => {
          e.preventDefault();
          // 仅处理文件拖拽
          if (!e.dataTransfer || !Array.from(e.dataTransfer.types || []).includes('Files')) return;
          dragCounterRef.current += 1;
          setIsDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!e.dataTransfer || !Array.from(e.dataTransfer.types || []).includes('Files')) return;
          // 明确设置 dropEffect，提升一致性
          e.dataTransfer.dropEffect = 'copy';
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          if (!e.dataTransfer || !Array.from(e.dataTransfer.types || []).includes('Files')) return;
          // 只有当所有 dragenter 都离开后才隐藏覆盖层
          dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
          if (dragCounterRef.current === 0) {
            setIsDragging(false);
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          const files = e.dataTransfer?.files ? Array.from(e.dataTransfer.files) : [];
          dragCounterRef.current = 0;
          setIsDragging(false);
          if (files.length) handleAttachFiles(files as File[]);
        }}
        className='relative flex-1 overflow-y-auto p-4'
        style={{ overflowAnchor: 'none' }}>
        {/* 拖拽覆盖层（作用于聊天滚动容器区域） */}
        <DropOverlay visible={isDragging} />
        {/* 视觉内容区：80% 宽度、居中 */}
        <div ref={messagesContentRef} className='mx-auto w-[80%] space-y-4'>
          {/* 欢迎消息 - 用户发送消息后仍保持显示 */}
          {showWelcome && (
            <div className='w-full'>
              <div className='text-foreground whitespace-pre-wrap break-words text-left'>
                {DEFAULT_WELCOME_MESSAGE}
              </div>
            </div>
          )}

          {/* 会话消息列表 */}
          {displayMessages.map((message) => (
            <div key={message.id} className='w-full'>
              {message.role === 'system' ? (
                <div className='text-foreground w-full text-left'>
                  <div className='mb-1 text-xs font-medium text-gray-500 dark:text-gray-400'>
                    系统提示词
                  </div>
                  <div className='border-surface whitespace-pre-wrap break-words rounded-xl border bg-[var(--surface)] px-4 py-3 text-sm'>
                    {message.content}
                  </div>
                </div>
              ) : message.role === 'assistant' ? (
                // AI消息 - 使用MarkdownRenderer渲染，支持流式渲染
                <div className='text-foreground break-words text-left'>
                  {message.thinkingContent?.trim() ? (
                    <CollapsibleThinking
                      content={message.thinkingContent}
                      isLoading={!!message.isLoading && !message.content?.trim()}
                      defaultExpanded={!!message.isLoading}
                      className='mb-2'
                    />
                  ) : null}
                  {message.isLoading ? (
                    message.content?.trim() ? (
                      <div>
                        <MarkdownRenderer
                          instanceKey={message.id}
                          content={message.content}
                          isStreaming={true}
                          theme={theme}
                          previewTheme={previewTheme}
                          codeTheme={codeTheme}
                        />
                        <span className='ml-1 inline-block h-5 w-2 animate-pulse bg-blue-500' />
                        {renderMessageStats(message)}
                      </div>
                    ) : (
                      <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                        <LoadingOutlined spin />
                        <span>{'正在生成回复...'}</span>
                      </div>
                    )
                  ) : (
                    <div>
                      <MarkdownRenderer
                        instanceKey={message.id}
                        content={message.content}
                        isStreaming={false}
                        theme={theme}
                        previewTheme={previewTheme}
                        codeTheme={codeTheme}
                      />
                      {renderMessageStats(message)}
                      <MessageCopyAction
                        content={message.content}
                        trailingSlot={renderAssistantMessageActions?.(message)}
                      />
                    </div>
                  )}
                </div>
              ) : (
                // 用户消息 - 气泡样式，右对齐
                <div className='group flex justify-end'>
                  <div className='max-w-[70%]'>
                    <div className='whitespace-pre-wrap break-words rounded-l-2xl rounded-br-sm rounded-tr-2xl bg-[var(--user-bubble-bg)] px-4 py-2 text-[var(--user-bubble-text)] transition-colors'>
                      {message.invocation ? (
                        <div className='mb-1 text-xs opacity-70'>
                          {message.invocation.kind === 'skill' ? 'Skill' : 'Command'} ·{' '}
                          {message.invocation.command}
                        </div>
                      ) : null}
                      <NoteReferenceText content={message.content} />
                    </div>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className='mt-2 space-y-2'>
                        {message.attachments.map((att) => {
                          const extLower = (att.ext || '').toLowerCase();
                          return (
                            <div
                              key={att.id}
                              className='border-surface bg-panel text-foreground flex items-center gap-2 rounded border p-2'>
                              <ChatAttachmentIcon
                                ext={extLower}
                                className='shrink-0 text-blue-500'
                                size={16}
                              />
                              <div className='text-xs text-gray-500'>
                                {att.name} · {att.ext.toUpperCase()} · {formatSize(att.size)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <MessageUserActions
                      content={message.content}
                      disabled={isAILoading}
                      showRetry={getAssistantReplyForUser(message.id)?.isError === true}
                      onEdit={() => handleEditUserMessage(message)}
                      onRetry={() => handleRetryUserMessage(message)}
                      onDelete={() => handleDeleteUserMessage(message)}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* 用于自动滚动的空div */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入区域：与消息区同宽，padding 1rem */}
      <div className='p-4'>
        <div className='mx-auto w-[80%]'>
          <ChatInputPanel
            ref={chatInputRef}
            value={inputValue}
            onChange={handleInputChange}
            onSend={handleSendMessage}
            onStop={handleStopGeneration}
            onKeyDown={handleKeyPress}
            placeholder={inputPlaceholder}
            loading={isAILoading}
            isGenerating={isCurrentSessionGenerating}
            attachments={attachments.map((a) => ({
              id: a.id,
              name: a.name,
              size: a.size,
              mime: a.mime,
              ext: a.ext,
              snippet: a.snippet,
              charCount: typeof a.text === 'string' ? a.text.length : undefined,
            }))}
            isUploading={isUploading}
            progressMap={progressMap}
            onAttachFiles={handleAttachFiles}
            onRemoveAttachment={handleRemoveAttachment}
            onSlashInvocationChange={setSlashInvocation}
          />
        </div>
      </div>
    </div>
  );
};

export default AiChatView;
