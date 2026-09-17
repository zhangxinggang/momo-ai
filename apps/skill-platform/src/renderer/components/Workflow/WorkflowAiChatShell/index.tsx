import { ChatProvider, type IAiChatServices } from '@momo/aichat';
import { useAiChatGenerationReporter } from '@renderer/hooks/useAiChatGenerationActivity';
import type { ReactNode } from 'react';

import { WorkflowNodeChatBootstrap } from '../WorkflowNodeChatBootstrap';

export interface IProps {
  sessionKey: string;
  bootstrapSessionId: string;
  services: IAiChatServices;
  className?: string;
  children: ReactNode;
}

/** 工作流节点对话 ChatProvider 壳层（独立存储，不污染主 AI 对话） */
export function WorkflowAiChatShell({
  sessionKey,
  bootstrapSessionId,
  services,
  className,
  children,
}: IProps) {
  const reportGeneration = useAiChatGenerationReporter('workflow');

  return (
    <ChatProvider
      key={sessionKey}
      services={services}
      bootstrapSessionId={bootstrapSessionId}
      onGenerationStateChange={reportGeneration}>
      <WorkflowNodeChatBootstrap sessionId={bootstrapSessionId} />
      <div className={className}>{children}</div>
    </ChatProvider>
  );
}
