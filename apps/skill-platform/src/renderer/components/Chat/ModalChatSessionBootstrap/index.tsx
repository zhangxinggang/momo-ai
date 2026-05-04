import { useChatContext } from '@momo/aichat';
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
  const { switchToSession, sessions } = useChatContext();
  const reservedIdRef = useRef<string | null>(null);

  useEffect(() => {
    reservedIdRef.current = reserveMainChatCurrentSessionId();
    switchToSession(sessionId);

    return () => {
      restoreMainChatCurrentSessionId(reservedIdRef.current);
    };
  }, [sessionId, switchToSession]);

  useEffect(() => {
    const exists = sessions.some((session) => session.id === sessionId);
    if (exists) {
      switchToSession(sessionId);
    }
  }, [sessionId, sessions, switchToSession]);

  return null;
}
