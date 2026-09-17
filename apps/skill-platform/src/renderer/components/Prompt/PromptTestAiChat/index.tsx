import { AiChatView, useChatContext, type IAiChatServices, type IChatMessage } from '@momo/aichat';
import '@momo/markdown-styles';
import { useEffect, useRef } from 'react';

import { AiChatShell } from '@renderer/components/Chat/AiChatShell';
import { useAiChatViewTheme } from '@renderer/hooks/useAiChatViewTheme';

export interface IProps {
  /** 用于在 Drawer 打开时重置 ChatProvider */
  sessionKey: string;
  /** 绑定到 AI 对话历史的会话 id */
  bootstrapSessionId: string;
  /** 首条问答写入历史时使用的会话标题 */
  bootstrapSessionTitle?: string;
  services: IAiChatServices;
  systemPrompt: string;
  userPrompt: string;
  onLoadingChange?: (loading: boolean) => void;
  /** 用户从输入框发送消息后回调（如统计使用次数） */
  onAfterSend?: () => void;
  /** Harness 完成一轮回复后回调 */
  onResponseComplete?: (content: string) => void | Promise<void>;
  /** 助手消息操作区扩展 */
  renderAssistantMessageActions?: (message: IChatMessage) => React.ReactNode;
}

function PromptTestAiChatBridge({
  systemPrompt,
  userPrompt,
  onLoadingChange,
  onAfterSend,
  onResponseComplete,
  renderAssistantMessageActions,
}: Pick<
  IProps,
  | 'systemPrompt'
  | 'userPrompt'
  | 'onLoadingChange'
  | 'onAfterSend'
  | 'onResponseComplete'
  | 'renderAssistantMessageActions'
>) {
  const {
    isAILoading,
    currentSession,
    currentSessionId,
    addMessage,
    updateMessage,
    setSystemPrompt,
  } = useChatContext();
  const chatTheme = useAiChatViewTheme();
  const wasLoadingRef = useRef(false);

  useEffect(() => {
    onLoadingChange?.(isAILoading);
  }, [isAILoading, onLoadingChange]);

  useEffect(() => {
    if (wasLoadingRef.current && !isAILoading) {
      const reply = currentSession?.messages
        .slice()
        .reverse()
        .find(
          (message) =>
            message.role === 'assistant' &&
            message.runStatus === 'completed' &&
            !message.isError &&
            Boolean(message.content.trim()),
        );
      if (reply) void onResponseComplete?.(reply.content);
    }
    wasLoadingRef.current = isAILoading;
  }, [currentSession?.messages, isAILoading, onResponseComplete]);

  // 将系统提示词展示在对话历史中
  useEffect(() => {
    if (!currentSessionId) {
      return;
    }
    const text = systemPrompt.trim();
    const existingSystem = currentSession?.messages.find((m) => m.role === 'system');

    if (!text) {
      return;
    }

    if (existingSystem) {
      if (existingSystem.content !== text) {
        updateMessage(currentSessionId, existingSystem.id, { content: text });
      }
      return;
    }

    addMessage(currentSessionId, { role: 'system', content: text });
  }, [systemPrompt, currentSessionId, currentSession, addMessage, updateMessage]);

  // Harness 只读取结构化的 systemPrompt；历史中的 system 消息仅负责可见展示。
  useEffect(() => {
    setSystemPrompt(systemPrompt.trim());
  }, [setSystemPrompt, systemPrompt]);

  return (
    <AiChatView
      {...chatTheme}
      inputValue={userPrompt}
      hideWelcome
      onAfterSend={onAfterSend}
      renderAssistantMessageActions={renderAssistantMessageActions}
      placeholder='输入用户提示词或继续对话...'
    />
  );
}

export function PromptTestAiChat({
  sessionKey,
  bootstrapSessionId,
  bootstrapSessionTitle,
  services,
  systemPrompt,
  userPrompt,
  onLoadingChange,
  onAfterSend,
  onResponseComplete,
  renderAssistantMessageActions,
}: IProps) {
  return (
    <AiChatShell
      sessionKey={sessionKey}
      bootstrapSessionId={bootstrapSessionId}
      bootstrapSessionTitle={bootstrapSessionTitle}
      services={services}
      className='flex min-h-0 flex-1 flex-col'>
      <PromptTestAiChatBridge
        systemPrompt={systemPrompt}
        userPrompt={userPrompt}
        onLoadingChange={onLoadingChange}
        onAfterSend={onAfterSend}
        onResponseComplete={onResponseComplete}
        renderAssistantMessageActions={renderAssistantMessageActions}
      />
    </AiChatShell>
  );
}
