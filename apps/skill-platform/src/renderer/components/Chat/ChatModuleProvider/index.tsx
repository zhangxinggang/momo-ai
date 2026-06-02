import { ChatProvider } from '@momo/aichat';

import '@momo/markdown-styles';

import { useMemo, type ReactNode } from 'react';

import { useToast } from '@renderer/components/ui/Toast';
import { useChatWorkspaceBinding } from '@renderer/hooks/useChatWorkspaceBinding';
import { useRankedChatModelGroups } from '@renderer/hooks/useRankedChatModelGroups';
import { useStableModelResolver } from '@renderer/hooks/useStableModelResolver';
import { buildSharedAiChatServices, createGeneralChatStream } from '@renderer/services/aichat';
import { useSettingsStore } from '@renderer/store';
import { ChatErrorBoundary } from '../ChatErrorBoundary';
interface IProps {
  children: ReactNode;
}

/** AI 对话全局 Provider：始终挂载，避免切换模块时 Context 丢失导致白屏 */
export function ChatModuleProvider({ children }: IProps) {
  const { showToast } = useToast();
  const aiModels = useSettingsStore((s) => s.aiModels);
  const modelResolverRef = useStableModelResolver(aiModels);
  const chatModelOptionGroups = useRankedChatModelGroups(aiModels);
  const workspace = useChatWorkspaceBinding();

  const chatServices = useMemo(
    () =>
      buildSharedAiChatServices({
        aiModels,
        chatModelOptionGroups,
        workspace,
        storageKeyPrefix: 'skill-platform-ai-chat',
        callAIChatStream: createGeneralChatStream({
          getModelConfig: (modelKey) => modelResolverRef.current.getModelConfig(modelKey),
          getDefaultConfig: () => modelResolverRef.current.getModelConfig(),
          onNeedModel: () => showToast('请先在设置中配置 AI 对话模型', 'error'),
        }),
      }),
    [aiModels, chatModelOptionGroups, modelResolverRef, showToast, workspace],
  );

  return (
    <ChatErrorBoundary>
      <ChatProvider services={chatServices}>{children}</ChatProvider>
    </ChatErrorBoundary>
  );
}
