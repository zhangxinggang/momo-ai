import { createContext, useContext, type ReactNode } from 'react';

interface IChatMentionCallbacks {
  onMentionClick?: (cursorPos: number) => void;
}

const ChatMentionCallbacksContext = createContext<IChatMentionCallbacks>({});

interface IProps {
  value: IChatMentionCallbacks;
  children: ReactNode;
}

export function ChatMentionCallbacksProvider(props: IProps) {
  const { value, children } = props;
  return (
    <ChatMentionCallbacksContext.Provider value={value}>
      {children}
    </ChatMentionCallbacksContext.Provider>
  );
}

export function useChatMentionCallbacks(): IChatMentionCallbacks {
  return useContext(ChatMentionCallbacksContext);
}
