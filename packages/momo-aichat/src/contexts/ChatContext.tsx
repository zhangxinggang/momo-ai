import type { ReactNode } from 'react';
import React, { createContext, useContext } from 'react';
import type { IAiChatServices } from '../adapters/types';
import { useChatSessions } from '../hooks/useChatSessions';
import type { IChatContext } from '../types/chat';
import { AiChatConfigProvider } from './AiChatConfigContext';

const ChatContext = createContext<IChatContext | undefined>(undefined);

export interface IProps {
  children: ReactNode;
  /** 可选：注入 API 与同步能力 */
  services?: Partial<IAiChatServices>;
}

export const ChatProvider: React.FC<IProps> = ({ children, services }) => {
  return (
    <AiChatConfigProvider services={services}>
      <ChatProviderInner>{children}</ChatProviderInner>
    </AiChatConfigProvider>
  );
};

const ChatProviderInner: React.FC<{ children: ReactNode }> = ({ children }) => {
  const chatState = useChatSessions();
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
