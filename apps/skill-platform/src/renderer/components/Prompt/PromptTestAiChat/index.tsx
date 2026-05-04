import { AiChatView, useChatContext, type IAiChatServices, type IChatMessage } from '@momo/aichat';
import '@momo/markdown-styles';
import { useEffect } from 'react';

import { AiChatShell } from '@renderer/components/Chat/AiChatShell';

export interface IProps {
  /** 用于在 Drawer 打开时重置 ChatProvider */
  sessionKey: string;
  /** 绑定到 AI 对话历史的会话 id */
  bootstrapSessionId: string;
  services: IAiChatServices;
  systemPrompt: string;
  userPrompt: string;
  onLoadingChange?: (loading: boolean) => void;
  /** 用户从输入框发送消息后回调（如统计使用次数） */
  onAfterSend?: () => void;
  /** 助手消息操作区扩展 */
  renderAssistantMessageActions?: (message: IChatMessage) => React.ReactNode;
}

function PromptTestAiChatBridge({
  systemPrompt,
  userPrompt,
  onLoadingChange,
  onAfterSend,
  renderAssistantMessageActions,
}: Pick<
  IProps,
  | 'systemPrompt'
  | 'userPrompt'
  | 'onLoadingChange'
  | 'onAfterSend'
  | 'renderAssistantMessageActions'
>) {
  const { isAILoading, currentSession, currentSessionId, addMessage, updateMessage } =
    useChatContext();

  useEffect(() => {
    onLoadingChange?.(isAILoading);
  }, [isAILoading, onLoadingChange]);

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

  return (
    <AiChatView
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
  services,
  systemPrompt,
  userPrompt,
  onLoadingChange,
  onAfterSend,
  renderAssistantMessageActions,
}: IProps) {
  return (
    <AiChatShell
      sessionKey={sessionKey}
      bootstrapSessionId={bootstrapSessionId}
      services={services}
      className='flex min-h-0 flex-1 flex-col'>
      <PromptTestAiChatBridge
        systemPrompt={systemPrompt}
        userPrompt={userPrompt}
        onLoadingChange={onLoadingChange}
        onAfterSend={onAfterSend}
        renderAssistantMessageActions={renderAssistantMessageActions}
      />
    </AiChatShell>
  );
}
