import { ChatProvider } from '@momo/aichat';

import '@momo/markdown-styles';

import { useMemo, type ReactNode } from 'react';

import { getPlatformById } from '@/types/constants/platforms';
import { useToast } from '@renderer/components/ui/Toast';
import { useChatWorkspaceBinding } from '@renderer/hooks/useChatWorkspaceBinding';
import { useLocalPathBinding } from '@renderer/hooks/useLocalPathBinding';
import { useRankedChatModelGroups } from '@renderer/hooks/useRankedChatModelGroups';
import { useStableModelResolver } from '@renderer/hooks/useStableModelResolver';
import { useStableRef } from '@renderer/hooks/useStableRef';
import { resolveAgentAppContext } from '@renderer/services/agent-app/api';
import { createAgentAppChatAdapters } from '@renderer/services/agent-app/chat-adapters';
import { buildSharedAiChatServices, createGeneralChatStream } from '@renderer/services/aichat';
import { useSettingsStore } from '@renderer/store';
import { useChatProjectStore } from '@renderer/store/chat';
import { ChatActiveProjectBridge } from '../ChatActiveProjectBridge';
import { ChatErrorBoundary } from '../ChatErrorBoundary';

interface IProps {
  children: ReactNode;
}

/** AI 对话 Provider：Agent Skills/Commands 统一从斜杠菜单显式调用。 */
export function ChatModuleProvider({ children }: IProps) {
  const { showToast } = useToast();
  const aiModels = useSettingsStore((state) => state.aiModels);
  const activeAgentAppId = useChatProjectStore((state) => state.activeAgentAppId);
  const activeFolderPaths = useChatProjectStore((state) => state.activeFolderPaths);
  const modelResolverRef = useStableModelResolver(aiModels);
  const chatModelOptionGroups = useRankedChatModelGroups(aiModels);
  const workspace = useChatWorkspaceBinding();
  const localPath = useLocalPathBinding();
  const activeAgentAppIdRef = useStableRef(activeAgentAppId);
  const activeFolderPathsRef = useStableRef(activeFolderPaths);

  const activeAgentPlatform = useMemo(
    () => (activeAgentAppId ? getPlatformById(activeAgentAppId) : undefined),
    [activeAgentAppId],
  );

  const chatServices = useMemo(() => {
    const agentAdapters = createAgentAppChatAdapters({
      getAgentAppId: () => activeAgentAppIdRef.current,
      getFolderPaths: () => activeFolderPathsRef.current,
      onDenied: (reason) => showToast(reason, 'warning'),
    });
    const generalStream = createGeneralChatStream({
      getModelConfig: (modelKey) => modelResolverRef.current.getModelConfig(modelKey),
      getDefaultConfig: () => modelResolverRef.current.getModelConfig(),
      onNeedModel: () => showToast('请先在设置中配置 AI 对话模型', 'error'),
      resolveAgentContext: async () => {
        const agentAppId = activeAgentAppIdRef.current;
        if (!agentAppId) {
          return '';
        }
        const context = await resolveAgentAppContext({
          agentAppId,
          folderPaths: activeFolderPathsRef.current,
        });
        return context?.systemPrompt?.trim() || '';
      },
    });

    return buildSharedAiChatServices({
      aiModels,
      chatModelOptionGroups,
      workspace,
      localPath,
      storageKeyPrefix: 'skill-platform-ai-chat-v4',
      callAIChatStream: generalStream,
      overrides: {
        agentAppBanner: activeAgentPlatform
          ? { id: activeAgentPlatform.id, name: activeAgentPlatform.name }
          : null,
        slashCommands: agentAdapters.slashCommands,
        beforeSubmitPrompt: agentAdapters.beforeSubmitPrompt,
      },
    });
  }, [
    activeAgentPlatform,
    activeAgentAppIdRef,
    activeFolderPathsRef,
    aiModels,
    chatModelOptionGroups,
    localPath,
    modelResolverRef,
    showToast,
    workspace,
  ]);

  return (
    <ChatErrorBoundary>
      <ChatProvider services={chatServices}>
        <ChatActiveProjectBridge />
        {children}
      </ChatProvider>
    </ChatErrorBoundary>
  );
}
