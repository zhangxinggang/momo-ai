import { createContext, useContext, type ReactNode } from 'react';
import type { IAiChatServices } from '../adapters/types';

const AiChatConfigContext = createContext<IAiChatServices | null>(null);

export function AiChatConfigProvider({
  children,
  services,
}: {
  children: ReactNode;
  services: IAiChatServices;
}) {
  return <AiChatConfigContext.Provider value={services}>{children}</AiChatConfigContext.Provider>;
}

export function useAiChatConfig(): IAiChatServices {
  const ctx = useContext(AiChatConfigContext);
  if (!ctx) {
    throw new Error('useAiChatConfig must be used within an AiChatConfigProvider');
  }
  return ctx;
}
