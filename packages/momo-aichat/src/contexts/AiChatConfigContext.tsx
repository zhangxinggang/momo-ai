import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { createDefaultAiChatServices } from '../adapters/create-services';
import type { IAiChatServices } from '../adapters/types';

const AiChatConfigContext = createContext<IAiChatServices | null>(null);

export function AiChatConfigProvider({
  children,
  services,
}: {
  children: ReactNode;
  services?: Partial<IAiChatServices>;
}) {
  const merged = useMemo(() => createDefaultAiChatServices(services), [services]);
  return <AiChatConfigContext.Provider value={merged}>{children}</AiChatConfigContext.Provider>;
}

export function useAiChatConfig(): IAiChatServices {
  const ctx = useContext(AiChatConfigContext);
  if (!ctx) {
    return createDefaultAiChatServices();
  }
  return ctx;
}
