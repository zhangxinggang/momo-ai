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
import type { IChatInputPanelRef } from '../ChatInputPanel';
import ChatInputPanel from '../ChatInputPanel';
import CitationCard from '../CitationCard';
import CollapsibleThinking from '../CollapsibleThinking';
import DropOverlay from '../DropOverlay';
import MarkdownRenderer from '../MarkdownRenderer';
import { MessageCopyAction } from '../MessageCopyAction';
import { ChatAttachmentIcon } from '../../utils/attachment-icon';

export interface IProps {
  /** 外部同步的输入值（如 Prompt 测试预填用户提示词） */
  inputValue?: string;
  onInputChange?: (value: string) => void;
  /** 不显示默认欢迎语 */
  hideWelcome?: boolean;
  /** 用户发送消息成功后回调 */
  onAfterSend?: () => void;
  placeholder?: string;
  /** 助手消息「复制」按钮右侧扩展插槽 */
  renderAssistantMessageActions?: (message: IChatMessage) => React.ReactNode;
}

export const AiChatView: React.FC<IProps> = ({
  inputValue: externalInputValue,
  onInputChange,
  hideWelcome = false,
  onAfterSend,
  placeholder = '输入您的消息...',
  renderAssistantMessageActions,
}) => {
  const { message } = App.useApp();
  const { uploadFiles, validateLocalFiles } = useAiChatConfig();
  // 用户输入内容
  const [inputValue, setInputValue] = useState(externalInputValue ?? '');

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
  // 用户是否手动滚动的状态
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  // 上次消息数量，用于检测新消息
  const [lastMessageCount, setLastMessageCount] = useState(0);
  // 是否应该自动滚动（仅在用户发送消息时为true）
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
  // 智能吸附状态：用户是否希望跟随最新消息
  const [isStickToBottom, setIsStickToBottom] = useState(true);
  // 滚动锁：防抖延迟滚动的 timeout ID
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 流式输出状态：标记是否正在接收流式数据
  const [isStreaming, setIsStreaming] = useState(false);
  // 保底滚动定时器：极端情况下的兜底机制
  const fallbackScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 滚动状态标记：避免同一帧内多次触发滚动
  const isScrollingRef = useRef<boolean>(false);

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
            {message.stats.citations
              .filter((c: any) => typeof c.score === 'number' && c.score > 0.8)
              .map((c: any, i: number) => (
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
    isAILoading,
    isSessionGenerating,
    sendMessage,
    stopGeneration,
  } = useChatContext();

  // 获取距离底部的像素距离
  const getDistanceFromBottom = () => {
    if (!messagesContainerRef.current) return 0;
    const container = messagesContainerRef.current;
    // 精确计算距离底部的距离（clientHeight已扣除padding，更准确）
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight; // clientHeight不包含滚动条，更精确
    return distanceFromBottom;
  };

  // 检查是否接近底部（≤80px为吸附区域，缩小缓冲区间提高灵敏度）
  const isNearBottom = () => {
    return getDistanceFromBottom() <= 80;
  };

  // 滚动到底部的函数 - 使用帧率节流 + scrollIntoView 确保准确滚动
  const scrollToBottom = () => {
    // 避免同一帧内多次触发滚动
    if (isScrollingRef.current) return;
    isScrollingRef.current = true;

    // 使用微任务确保 React 状态已提交，在当前宏任务结束后、浏览器渲染前执行
    queueMicrotask(() => {
      // 单次 rAF：确保 DOM 更新和布局计算完成
      requestAnimationFrame(() => {
        if (messagesContainerRef.current && messagesEndRef.current) {
          const container = messagesContainerRef.current;
          // 强制触发浏览器重排，确保获取最新布局（关键！）
          void container.offsetHeight; // 强制更新布局计算

          // 改用消息末尾的空div定位，比scrollHeight更可靠
          messagesEndRef.current.scrollIntoView({
            block: 'end', // 精确对齐底部
            behavior: 'auto', // 所有情况下都直接跳转，无动画
          });
        }
        isScrollingRef.current = false;
      });
    });
  };

  // 移除原有的防抖滚动函数，直接使用scrollToBottom
  // const debouncedScrollToBottom = () => { ... } // 已删除

  // 启动保底滚动定时器 - 极端情况兜底机制
  // 保底滚动机制 - 确保在极端情况下也能滚动到底部
  const startFallbackScrollTimer = () => {
    // 清除旧定时器
    if (fallbackScrollTimeoutRef.current) {
      clearTimeout(fallbackScrollTimeoutRef.current);
    }

    // 流式输出时缩短保底时间（300ms→100ms），并连续检查3次
    let checkCount = 0;
    const checkScroll = () => {
      scrollToBottom(); // 强制滚动
      checkCount++;
      if (isStreaming && checkCount < 3) {
        // 连续检查3次
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

  // 处理用户滚动事件 - 智能吸附逻辑
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    const distanceFromBottom = getDistanceFromBottom();

    // 用户主动滚动时，清除保底定时器（用户已经看到内容）
    clearFallbackScrollTimer();

    // 智能吸附逻辑 - 缩小缓冲区间（80-120px），减少状态频繁切换的同时提高灵敏度
    if (distanceFromBottom <= 80) {
      // 用户滚动到接近底部（≤80px），启用吸附模式
      setIsStickToBottom(true);
      setUserHasScrolled(false);
    } else if (distanceFromBottom > 120) {
      // 用户向上滚动超过120px，取消吸附模式
      setIsStickToBottom(false);
      setUserHasScrolled(true);
    }
    // 在80px-120px之间保持当前状态，避免频繁切换
  };

  // 智能滚动逻辑 - 支持吸附模式、流式输出跟随，使用滚动锁防抖机制 + 保底兜底
  useEffect(() => {
    const currentMessageCount = currentSession?.messages?.length || 0;

    // 最新一条消息（用于检测错误消息）
    const latestMessage = currentSession?.messages?.[currentMessageCount - 1];

    // 检测是否有新消息（消息数量增加）
    const hasNewMessage = currentMessageCount > lastMessageCount;

    // 检测是否有消息内容更新（AI流式输出）
    const hasContentUpdate = currentSession?.messages?.some(
      (msg) => msg.role === 'assistant' && msg.isLoading,
    );

    // 更新流式输出状态
    const wasStreaming = isStreaming;
    setIsStreaming(!!hasContentUpdate);

    // 流式输出状态变化处理
    if (!wasStreaming && hasContentUpdate) {
      // 开始流式输出：启动保底定时器
      startFallbackScrollTimer();
    } else if (wasStreaming && !hasContentUpdate) {
      // 流式输出结束：清除保底定时器
      clearFallbackScrollTimer();
    }

    // 当最新消息是错误消息时，强制滚动到底部
    const hasErrorUpdate =
      !!latestMessage && latestMessage.role === 'assistant' && latestMessage.isError === true;

    if (hasNewMessage || hasContentUpdate || hasErrorUpdate) {
      // 决定是否自动滚动的条件：
      // 1. 用户刚发送消息 (shouldAutoScroll)
      // 2. 用户处于吸附模式 (isStickToBottom)
      // 3. 用户未手动滚动且接近底部 (!userHasScrolled && isNearBottom())
      // 4. 最新消息为错误消息 (hasErrorUpdate) → 强制滚动
      const shouldScroll =
        hasErrorUpdate ||
        shouldAutoScroll ||
        isStickToBottom ||
        (!userHasScrolled && isNearBottom());

      if (shouldScroll) {
        // 对于流式输出，直接使用scrollToBottom（已优化为帧率节流）
        if (hasContentUpdate && !hasNewMessage) {
          // 流式输出中：使用优化后的滚动
          scrollToBottom();
        } else {
          // 新消息或错误消息：立即滚动
          scrollToBottom();
        }

        // 仅在用户发送消息后重置标志
        if (shouldAutoScroll) {
          setShouldAutoScroll(false);
        }
      }
    }

    // 更新消息数量记录
    setLastMessageCount(currentMessageCount);
  }, [
    currentSession?.messages?.length,
    currentSession?.messages, // 监听消息内容变化（流式输出/错误消息）
    shouldAutoScroll,
    userHasScrolled,
    isStickToBottom,
    lastMessageCount,
    isStreaming, // 添加 isStreaming 依赖以监听流式状态变化
  ]);

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
    if ((!hasText && attachments.length === 0) || isAILoading || isUploading) return;

    const userContent = inputValue.trim();

    // 清空输入框
    setInputValue('');

    // 标记应该自动滚动（用户发送消息时）
    setShouldAutoScroll(true);
    // 重置用户滚动状态，启用吸附模式
    setUserHasScrolled(false);
    setIsStickToBottom(true);

    // 构造附件上下文提示
    const buildAttachmentsPrompt = (files: IChatAttachment[]): string => {
      if (!files || files.length === 0) return '';
      const MAX_TOTAL = 50000; // 50k 字符
      const per = Math.max(1, Math.floor(MAX_TOTAL / files.length));
      const blocks = files.map((f) => {
        const text = f.text || '';
        const content = text.length > per ? text.slice(0, per) : text;
        return [
          `--- 文件: ${f.name} (type=${f.ext}, chars=${content.length}) START ---`,
          content,
          `--- 文件: ${f.name} END ---`,
        ].join('\n');
      });
      return ['以下为用户上传的文件内容（可能已截断），回答可引用并标注文件名：', ...blocks].join(
        '\n\n',
      );
    };

    const attachmentsPrompt = buildAttachmentsPrompt(attachments);
    const finalUserContent =
      attachments.length > 0
        ? `${attachmentsPrompt}\n\n我的问题：\n${userContent || '(基于以上文件，请给出总结/见解)'}`
        : userContent;
    const displayContent = userContent || (attachments.length > 0 ? '（已发送附件）' : '');

    try {
      const attachmentsMeta: IChatAttachmentMeta[] = attachments.map((a) => ({
        id: a.id,
        name: a.name,
        size: a.size,
        mime: a.mime,
        ext: a.ext,
        snippet: a.snippet,
      }));
      // 用户点击发送后，立即清空输入面板中的待发送附件区
      setAttachments([]);
      setProgressMap({});

      await sendMessage(finalUserContent, attachmentsMeta, { displayContent });
      onAfterSend?.();
    } catch (error) {
      console.error('发送消息失败:', error);
      message.error('发送消息失败，请稍后重试');
    }
  };

  // 处理Enter键发送
  const handleKeyPress = (e: React.KeyboardEvent) => {
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
  const showWelcome = !hideWelcome && displayMessages.length === 0;

  // 判断当前会话是否正在生成
  const isCurrentSessionGenerating = currentSessionId
    ? isSessionGenerating(currentSessionId)
    : false;

  return (
    <div className='bg-panel flex h-full flex-col transition-colors'>
      {/* 消息滚动容器：全宽，允许在左右 10% 空白区域滚动 */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
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
        className='relative flex-1 overflow-y-auto p-4'>
        {/* 拖拽覆盖层（作用于聊天滚动容器区域） */}
        <DropOverlay visible={isDragging} />
        {/* 视觉内容区：80% 宽度、居中 */}
        <div className='mx-auto w-[80%] space-y-4'>
          {/* 欢迎消息 - 仅在没有消息时显示 */}
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
                <div className='flex justify-end'>
                  <div className='max-w-[70%]'>
                    <div className='whitespace-pre-wrap break-words rounded-l-2xl rounded-br-sm rounded-tr-2xl bg-[var(--user-bubble-bg)] px-4 py-2 text-[var(--user-bubble-text)] transition-colors'>
                      {message.content}
                    </div>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className='mt-2 space-y-2'>
                        {message.attachments.map((att) => {
                          const extLower = (att.ext || '').toLowerCase();
                          return (
                            <div
                              key={att.id}
                              className='border-surface bg-panel text-foreground flex items-center gap-2 rounded border p-2'>
                              <ChatAttachmentIcon ext={extLower} className='shrink-0 text-blue-500' size={16} />
                              <div className='text-xs text-gray-500'>
                                {att.name} · {att.ext.toUpperCase()} · {formatSize(att.size)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
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
            placeholder={placeholder}
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
          />
        </div>
      </div>
    </div>
  );
};

export default AiChatView;
