import { useChatContext } from '@momo/aichat';
import { useEffect } from 'react';

interface IProps {
  sessionId: string;
}

/** 工作流节点对话：切换到独立存储的会话（不影响 AI 对话模块） */
export function WorkflowNodeChatBootstrap({ sessionId }: IProps) {
  const { switchToSession, sessions } = useChatContext();

  useEffect(() => {
    switchToSession(sessionId);
  }, [sessionId, switchToSession]);

  useEffect(() => {
    const exists = sessions.some((session) => session.id === sessionId);
    if (exists) {
      switchToSession(sessionId);
    }
  }, [sessionId, sessions, switchToSession]);

  return null;
}
