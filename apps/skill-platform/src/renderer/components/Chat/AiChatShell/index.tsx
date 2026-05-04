import { ChatProvider, type IAiChatServices } from '@momo/aichat';
import type { ReactNode } from 'react';

import { ModalChatSessionBootstrap } from '../ModalChatSessionBootstrap';

export interface IProps {
  /** 用于在弹窗/Drawer 打开时重置 ChatProvider */
  sessionKey: string;
  /** 写入 AI 对话历史中的会话 id */
  bootstrapSessionId?: string;
  services: IAiChatServices;
  className?: string;
  children: ReactNode;
}

/** 带 sessionKey 的 ChatProvider 壳层，供 ISkill/IPrompt 等场景复用 */
export function AiChatShell({
  sessionKey,
  bootstrapSessionId,
  services,
  className,
  children,
}: IProps) {
  return (
    <ChatProvider key={sessionKey} services={services}>
      {bootstrapSessionId ? <ModalChatSessionBootstrap sessionId={bootstrapSessionId} /> : null}
      <div className={className}>{children}</div>
    </ChatProvider>
  );
}
