import { AI_CHAT_SESSIONS_UPDATED_EVENT, useChatContext } from '@momo/aichat';
import { useEffect, useRef } from 'react';

import {
  reserveMainChatCurrentSessionId,
  restoreMainChatCurrentSessionId,
} from '@renderer/services/aichat/chat-history-bridge';

interface IProps {
  sessionId: string;
}

/** 弹窗内切换到指定会话，关闭后恢复侧栏 AI 对话的当前选中会话 */
export function ModalChatSessionBootstrap({ sessionId }: IProps) {
  const { switchToSession, currentSessionId } = useChatContext();
  const reservedIdRef = useRef<string | null>(null);

  useEffect(() => {
    reservedIdRef.current = reserveMainChatCurrentSessionId();

    return () => {
      restoreMainChatCurrentSessionId(reservedIdRef.current);
      window.dispatchEvent(new Event(AI_CHAT_SESSIONS_UPDATED_EVENT));
    };
  }, [sessionId]);

  // 始终尝试切到 bootstrap 会话（可能尚未落库，由 switchToSession 创建内存会话）
  useEffect(() => {
    if (currentSessionId === sessionId) {
      return;
    }
    switchToSession(sessionId);
  }, [sessionId, switchToSession, currentSessionId]);

  return null;
}
