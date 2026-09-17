import { ChatProvider } from '@momo/aichat';
import { createHarnessChatOverrides } from '@renderer/services/agent-runtime/client';
import { Button, message } from 'antd';
import { useCallback, useRef } from 'react';
import { HarnessModelSelect, HarnessSessionBinding } from '../HarnessControls';

import '@momo/markdown-styles';

import { useMemo, type ReactNode } from 'react';

import { getPlatformById } from '@/types/constants/platforms';
import { useToast } from '@renderer/components/ui/Toast';
import { useAiChatGenerationReporter } from '@renderer/hooks/useAiChatGenerationActivity';
import { useChatWorkspaceBinding } from '@renderer/hooks/useChatWorkspaceBinding';
import { useLocalPathBinding } from '@renderer/hooks/useLocalPathBinding';
import { useStableRef } from '@renderer/hooks/useStableRef';
import { createAgentAppChatAdapters } from '@renderer/services/agent-app/chat-adapters';
import { buildSharedAiChatServices } from '@renderer/services/aichat';
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
  const reportGeneration = useAiChatGenerationReporter('chat');
  const agentIdRef = useRef('momo-default');
  const aiModels = useSettingsStore((state) => state.aiModels);
  const activeAgentAppId = useChatProjectStore((state) => state.activeAgentAppId);
  const activeFolderPaths = useChatProjectStore((state) => state.activeFolderPaths);
  const workspace = useChatWorkspaceBinding();
  const localPath = useLocalPathBinding();
  const activeAgentAppIdRef = useStableRef(activeAgentAppId);
  const activeFolderPathsRef = useStableRef(activeFolderPaths);
  const handleAgentChange = useCallback((id: string) => {
    agentIdRef.current = id;
  }, []);

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

    const harnessOverrides = createHarnessChatOverrides({
      getAgentId: () => agentIdRef.current,
    });

    return buildSharedAiChatServices({
      aiModels: aiModels.filter((m) => m.type === 'chat'),
      chatModelOptionGroups: undefined,
      workspace,
      localPath,
      storageKeyPrefix: 'skill-platform-ai-chat',
      callAIChatStream: harnessOverrides.callAIChatStream!,
      overrides: {
        ...harnessOverrides,
        agentAppBanner: activeAgentPlatform
          ? { id: activeAgentPlatform.id, name: activeAgentPlatform.name }
          : null,
        slashCommands: agentAdapters.slashCommands,
        beforeSubmitPrompt: undefined,
        renderRuntimeArtifact: (artifact) => (
          <Button
            size='small'
            onClick={() => {
              void window.api.agentRuntime
                .saveArtifact(artifact.id)
                .catch((e) => message.error(e.message));
            }}>
            保存产物 · {artifact.name}
          </Button>
        ),
        isImageModel: () => false,
        renderModelSelect: (input) => <HarnessModelSelect models={aiModels} input={input} />,
        chatModelOptionGroups: undefined,
      },
    });
  }, [
    activeAgentPlatform,
    activeAgentAppIdRef,
    activeFolderPathsRef,
    aiModels,
    localPath,
    showToast,
    workspace,
  ]);

  return (
    <ChatErrorBoundary>
      <ChatProvider services={chatServices} onGenerationStateChange={reportGeneration}>
        <ChatActiveProjectBridge />
        <HarnessSessionBinding onAgentChange={handleAgentChange} />
        {children}
      </ChatProvider>
    </ChatErrorBoundary>
  );
}
