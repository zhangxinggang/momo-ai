import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect } from 'react';
import type { IAiChatServices } from '../adapters/types';
import { useChatSessions } from '../hooks/useChatSessions';
import type { IChatContext } from '../types/chat';
import { AiChatConfigProvider } from './AiChatConfigContext';

const ChatContext = createContext<IChatContext | undefined>(undefined);

export interface IProps {
  children: ReactNode;
  /** 宿主必须显式注入模型、上传、存储等能力。 */
  services: IAiChatServices;
  /** 弹窗/子模块打开时固定选中的会话 id（不恢复侧栏 CURRENT_SESSION_ID） */
  bootstrapSessionId?: string | null;
  /** bootstrap 会话标题；空会话不落库，首条消息时使用 */
  bootstrapSessionTitle?: string | null;
  /** 任一会话开始或结束生成时通知宿主，用于离开页面保护等宿主级交互。 */
  onGenerationStateChange?: (isGenerating: boolean) => void;
}

export const ChatProvider: React.FC<IProps> = ({
  children,
  services,
  bootstrapSessionId,
  bootstrapSessionTitle,
  onGenerationStateChange,
}) => {
  return (
    <AiChatConfigProvider services={services}>
      <ChatProviderInner
        bootstrapSessionId={bootstrapSessionId}
        bootstrapSessionTitle={bootstrapSessionTitle}
        onGenerationStateChange={onGenerationStateChange}>
        {children}
      </ChatProviderInner>
    </AiChatConfigProvider>
  );
};

const ChatProviderInner: React.FC<{
  children: ReactNode;
  bootstrapSessionId?: string | null;
  bootstrapSessionTitle?: string | null;
  onGenerationStateChange?: (isGenerating: boolean) => void;
}> = ({ children, bootstrapSessionId, bootstrapSessionTitle, onGenerationStateChange }) => {
  const chatState = useChatSessions({ bootstrapSessionId, bootstrapSessionTitle });
  const isGenerating = chatState.sessions.some(
    (session) => session.isLoading || session.messages.some((message) => message.isLoading),
  );

  useEffect(() => {
    onGenerationStateChange?.(isGenerating);
    return () => onGenerationStateChange?.(false);
  }, [isGenerating, onGenerationStateChange]);

  return <ChatContext.Provider value={chatState}>{children}</ChatContext.Provider>;
};

export const useChatContext = (): IChatContext => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export default ChatContext;
