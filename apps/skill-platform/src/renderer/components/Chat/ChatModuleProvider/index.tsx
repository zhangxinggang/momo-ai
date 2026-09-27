import { ChatProvider } from '@momo/aichat';
import {
  createHarnessChatOverrides,
  uploadHarnessAttachments,
} from '@renderer/services/agent-runtime/client';
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
import { getRuntimeViewPrompt, projectRuntimeView } from '@renderer/services/aichat/runtime-view';
import { createChatViewGenerator } from '@renderer/services/aichat/view-generation';
import { openChatBrowser, openChatWorkspaceFile } from '@renderer/services/chat/workspace-panel';
import { useSettingsStore } from '@renderer/store';
import { useChatProjectStore } from '@renderer/store/chat';
import { ChatActiveProjectBridge } from '../ChatActiveProjectBridge';
import { ChatErrorBoundary } from '../ChatErrorBoundary';
import { ChatGeneratedView } from '../ChatGeneratedView';

interface IProps {
  children: ReactNode;
}

/** AI 对话 Provider：Agent Skills/Commands 统一从斜杠菜单显式调用。 */
export function ChatModuleProvider({ children }: IProps) {
  const { showToast } = useToast();
  const reportGeneration = useAiChatGenerationReporter('chat');
  const agentIdRef = useRef('momo-default');
  const aiModels = useSettingsStore((state) => state.aiModels);
  const activeAgentAppIds = useChatProjectStore((state) => state.activeAgentAppIds);
  const activeFolderPaths = useChatProjectStore((state) => state.activeFolderPaths);
  const workspace = useChatWorkspaceBinding();
  const openWorkspacePath = useCallback(
    (path: string) => openChatWorkspaceFile(activeFolderPaths, path),
    [activeFolderPaths],
  );
  const localPath = useLocalPathBinding(openWorkspacePath);
  const activeAgentAppIdsRef = useStableRef(activeAgentAppIds);
  const activeFolderPathsRef = useStableRef(activeFolderPaths);
  const handleAgentChange = useCallback((id: string) => {
    agentIdRef.current = id;
  }, []);

  const activeAgentPlatforms = useMemo(
    () => activeAgentAppIds.map(getPlatformById).filter((platform) => platform !== undefined),
    [activeAgentAppIds],
  );

  const chatServices = useMemo(() => {
    const agentAdapters = createAgentAppChatAdapters({
      getAgentAppIds: () => activeAgentAppIdsRef.current,
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
      onOpenExternalUrl: openChatBrowser,
      storageKeyPrefix: 'skill-platform-ai-chat',
      callAIChatStream: harnessOverrides.callAIChatStream!,
      overrides: {
        ...harnessOverrides,
        viewGeneration: {
          runtimePrompt: getRuntimeViewPrompt(),
          projectRuntimeView,
          generate: createChatViewGenerator(aiModels),
          render: (message, actions) => (
            <ChatGeneratedView
              message={message}
              onSelectFiles={actions?.attachFiles}
              onSubmit={actions?.submit}
              busy={actions?.busy}
            />
          ),
          uploadFiles: uploadHarnessAttachments,
        },
        agentAppBanner: activeAgentPlatforms.length
          ? {
              id: activeAgentAppIds.join(','),
              name: activeAgentPlatforms.map((platform) => platform.name).join('、'),
            }
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
    activeAgentPlatforms,
    activeAgentAppIds,
    activeAgentAppIdsRef,
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
