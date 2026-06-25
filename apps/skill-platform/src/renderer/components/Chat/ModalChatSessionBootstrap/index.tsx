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
  const { switchToSession, sessions, currentSessionId } = useChatContext();
  const reservedIdRef = useRef<string | null>(null);

  useEffect(() => {
    reservedIdRef.current = reserveMainChatCurrentSessionId();

    return () => {
      restoreMainChatCurrentSessionId(reservedIdRef.current);
      window.dispatchEvent(new Event(AI_CHAT_SESSIONS_UPDATED_EVENT));
    };
  }, [sessionId]);

  // 仅在尚未选中 bootstrap 会话时切换，避免发送消息后 sessions 更新被切回空会话
  useEffect(() => {
    if (currentSessionId === sessionId) {
      return;
    }
    const exists = sessions.some((session) => session.id === sessionId);
    if (exists) {
      switchToSession(sessionId);
    }
  }, [sessionId, sessions, switchToSession, currentSessionId]);

  return null;
}
