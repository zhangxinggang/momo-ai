import type { ISkill } from '@/types/modules';
import {
  AiChatView,
  buildChatWorkspaceConfig,
  isAbsoluteLocalPath,
  joinLocalPath,
  useChatContext,
  type IAiChatServices,
  type IChatMessage,
} from '@momo/aichat';
import '@momo/markdown-styles';
import { useCallback, useEffect, useMemo } from 'react';

import { WorkflowAiChatShell } from '@renderer/components/Workflow/WorkflowAiChatShell';
import { useToast } from '@renderer/components/ui/Toast';
import { useAiChatViewTheme } from '@renderer/hooks/useAiChatViewTheme';
import { useChatWorkspaceBinding } from '@renderer/hooks/useChatWorkspaceBinding';
import { useLocalPathBinding } from '@renderer/hooks/useLocalPathBinding';
import { useRankedChatModelGroups } from '@renderer/hooks/useRankedChatModelGroups';
import { useStableModelResolver } from '@renderer/hooks/useStableModelResolver';
import { useStableRef } from '@renderer/hooks/useStableRef';
import {
  buildSharedAiChatServices,
  createPromptTestStream,
  createSkillLangGraphStream,
} from '@renderer/services/aichat';
import { checkPathExists, openFolderPath } from '@renderer/services/desktop';
import { buildActiveSkillLine, buildSkillsSummary } from '@renderer/services/skill/chat-context';
import { persistWorkflowArtifactsFromReply } from '@renderer/services/workflow/artifact-writer';
import type { IParallelPreviousResultItem } from '@renderer/services/workflow/parallel-context';
import { buildMergedParallelContext } from '@renderer/services/workflow/parallel-context';
import { buildWorkflowWorkspaceContext } from '@renderer/services/workflow/workspace-context';
import type { IAIModelConfig } from '@renderer/types/settings';
import { Tabs } from 'antd';
import styles from './index.module.less';

export interface IProps {
  sessionKey: string;
  bootstrapSessionId: string;
  storagePrefix: string;
  workflowName: string;
  businessId: string;
  nodeName: string;
  nodeOutputDir: string | null;
  resourceKind: 'prompt' | 'skill';
  systemPrompt: string;
  userPrompt: string;
  skills: ISkill[];
  activeSkillId: string | null;
  aiModels: IAIModelConfig[];
  workspaceNodeName: string | null;
  executionModel?: string;
  kbCollectionId?: number;
  nodeWorkspacePaths?: string[];
  previousNodeRunResult: { nodeName: string; content: string } | null;
  previousParallelResults?: IParallelPreviousResultItem[] | null;
  prefillUserPrompt: boolean;
  onAdopt: (content: string) => void;
  onArtifactsPersisted?: () => void;
}

function WorkflowChatBridge({
  systemPrompt,
  userPrompt,
  resourceKind,
  previousNodeRunResult,
  previousParallelResults,
  prefillUserPrompt,
  onAdopt,
}: Pick<
  IProps,
  | 'systemPrompt'
  | 'userPrompt'
  | 'resourceKind'
  | 'previousNodeRunResult'
  | 'previousParallelResults'
  | 'prefillUserPrompt'
  | 'onAdopt'
>) {
  const chatTheme = useAiChatViewTheme();
  const { currentSession, currentSessionId, addMessage, updateMessage } = useChatContext();

  useEffect(() => {
    if (!currentSessionId || resourceKind !== 'prompt') {
      return;
    }
    const text = systemPrompt.trim();
    const existingSystem = currentSession?.messages.find((m) => m.role === 'system');
    if (!text) {
      return;
    }
    if (existingSystem) {
      if (existingSystem.content !== text) {
        updateMessage(currentSessionId, existingSystem.id, { content: text });
      }
      return;
    }
    addMessage(currentSessionId, { role: 'system', content: text });
  }, [addMessage, currentSession, currentSessionId, resourceKind, systemPrompt, updateMessage]);

  const renderAssistantActions = useCallback(
    (message: IChatMessage) => (
      <button
        className={styles['workflow-node-chat-adopt']}
        onClick={() => onAdopt(message.content || '')}
        type='button'>
        {'采纳'}
      </button>
    ),
    [onAdopt],
  );

  const hasChatHistory = useMemo(
    () =>
      (currentSession?.messages ?? []).some(
        (messageItem) => messageItem.role === 'user' || messageItem.role === 'assistant',
      ),
    [currentSession?.messages],
  );

  const shouldPrefillUserPrompt = prefillUserPrompt && !hasChatHistory;
  const showParallelTabs = previousParallelResults && previousParallelResults.length > 1;

  return (
    <div className={styles['workflow-node-chat']}>
      {showParallelTabs ? (
        <div className={styles['workflow-node-chat-prev-result']}>
          <div className={styles['workflow-node-chat-prev-result-header']}>
            {'上一节点运行结果'}
          </div>
          <Tabs
            items={previousParallelResults.map((item) => ({
              key: item.nodeId,
              label: item.nodeName,
              children: (
                <div className={styles['workflow-node-chat-prev-result-body']}>
                  {item.content.trim() || '暂无运行结果'}
                </div>
              ),
            }))}
          />
        </div>
      ) : previousNodeRunResult ? (
        <div className={styles['workflow-node-chat-prev-result']}>
          <div className={styles['workflow-node-chat-prev-result-header']}>
            {'上一节点运行结果'}
            <span className={styles['workflow-node-chat-prev-result-node']}>
              {previousNodeRunResult.nodeName}
            </span>
          </div>
          <div className={styles['workflow-node-chat-prev-result-body']}>
            {previousNodeRunResult.content}
          </div>
        </div>
      ) : null}
      <div className={styles['workflow-node-chat-main']}>
        <AiChatView
          {...chatTheme}
          hideWelcome
          inputValue={
            resourceKind === 'prompt' ? (shouldPrefillUserPrompt ? userPrompt : '') : undefined
          }
          placeholder={
            resourceKind === 'prompt' ? '输入用户提示词或继续对话…' : '描述要完成的任务…'
          }
          renderAssistantMessageActions={renderAssistantActions}
        />
      </div>
    </div>
  );
}

function WorkflowChatKbBootstrap({ kbCollectionId }: { kbCollectionId?: number }) {
  const { setKbEnabled, setKbCollectionId } = useChatContext();

  useEffect(() => {
    if (kbCollectionId === undefined) {
      return;
    }
    setKbEnabled(true);
    setKbCollectionId(kbCollectionId);
  }, [kbCollectionId, setKbCollectionId, setKbEnabled]);

  return null;
}

export function WorkflowNodeChat({
  sessionKey,
  bootstrapSessionId,
  storagePrefix,
  workflowName,
  businessId,
  nodeName,
  nodeOutputDir,
  resourceKind,
  systemPrompt,
  userPrompt,
  skills,
  activeSkillId,
  aiModels,
  workspaceNodeName,
  executionModel,
  kbCollectionId,
  nodeWorkspacePaths,
  previousNodeRunResult,
  previousParallelResults,
  prefillUserPrompt,
  onAdopt,
  onArtifactsPersisted,
}: IProps) {
  const { showToast } = useToast();
  const modelResolverRef = useStableModelResolver(aiModels);
  const chatModelOptionGroups = useRankedChatModelGroups(aiModels);
  const globalWorkspace = useChatWorkspaceBinding();
  const globalLocalPath = useLocalPathBinding();
  const localPath = useMemo(() => {
    if (nodeWorkspacePaths && nodeWorkspacePaths.length > 0) {
      return {
        ...globalLocalPath,
        resolveLocalPath: (rawPath: string) => {
          const trimmed = rawPath.trim();
          if (isAbsoluteLocalPath(trimmed)) {
            return trimmed;
          }
          return joinLocalPath(nodeWorkspacePaths[0], trimmed);
        },
      };
    }
    return globalLocalPath;
  }, [globalLocalPath, nodeWorkspacePaths]);
  const workspace = useMemo(() => {
    if (nodeWorkspacePaths && nodeWorkspacePaths.length > 0) {
      return buildChatWorkspaceConfig({
        enabled: true,
        paths: nodeWorkspacePaths,
        onEnabledChange: () => undefined,
        onAddFolder: () => undefined,
        onRemoveFolder: () => undefined,
        onOpenFolderPath: (folderPath) => {
          void openFolderPath(folderPath);
        },
        checkPathExists,
      });
    }
    return globalWorkspace;
  }, [globalWorkspace, nodeWorkspacePaths]);
  const workspaceNodeNameRef = useStableRef(workspaceNodeName);
  const nodeOutputDirRef = useStableRef(nodeOutputDir);
  const workflowNameRef = useStableRef(workflowName);
  const businessIdRef = useStableRef(businessId);
  const nodeNameRef = useStableRef(nodeName);
  const skillsSummaryRef = useStableRef(buildSkillsSummary(skills));
  const activeSkill = useMemo(
    () => (activeSkillId ? skills.find((s) => s.id === activeSkillId) : undefined),
    [activeSkillId, skills],
  );
  const activeSkillRef = useStableRef(activeSkill);
  const activeSkillLineRef = useStableRef(buildActiveSkillLine(activeSkill));
  const systemPromptRef = useStableRef(systemPrompt);
  const userPromptRef = useStableRef(userPrompt);
  const previousParallelResultsRef = useStableRef(previousParallelResults);
  const onArtifactsPersistedRef = useStableRef(onArtifactsPersisted);

  const handleNeedModel = useCallback(() => {
    showToast('请先在设置中配置并选择可用的对话模型', 'error');
  }, [showToast]);

  const handleReplyComplete = useCallback(
    async (reply: string) => {
      const wf = workflowNameRef.current;
      const bizId = businessIdRef.current;
      const node = nodeNameRef.current;
      const written = await persistWorkflowArtifactsFromReply(wf, bizId, node, reply);
      if (written.length > 0) {
        onArtifactsPersistedRef.current?.();
      }
    },
    [businessIdRef, nodeNameRef, onArtifactsPersistedRef, workflowNameRef],
  );

  const chatServices = useMemo((): IAiChatServices => {
    const buildPromptStream = (wsContext: string) =>
      createPromptTestStream({
        getModelConfig: (key) => modelResolverRef.current.getModelConfig(key),
        getDefaultConfig: () => modelResolverRef.current.getModelConfig(),
        getBaseMessages: () => {
          const msgs: { role: 'system' | 'user'; content: string }[] = [];
          const parallelBlock = previousParallelResultsRef.current
            ? buildMergedParallelContext(previousParallelResultsRef.current)
            : '';
          if (parallelBlock.trim()) {
            msgs.push({ role: 'system', content: parallelBlock });
          }
          if (wsContext.trim()) {
            msgs.push({ role: 'system', content: wsContext });
          }
          if (systemPromptRef.current.trim()) {
            msgs.push({ role: 'system', content: systemPromptRef.current.trim() });
          }
          if (userPromptRef.current.trim()) {
            msgs.push({ role: 'user', content: userPromptRef.current.trim() });
          }
          return msgs;
        },
        getResponseFormat: () => undefined,
        onNeedModel: handleNeedModel,
        onComplete: (text) => {
          void handleReplyComplete(text);
        },
      });

    const skillStream = createSkillLangGraphStream({
      getModelConfig: (key) => modelResolverRef.current.getModelConfig(key),
      getDefaultConfig: () => modelResolverRef.current.getModelConfig(),
      getSkillsSummary: () => skillsSummaryRef.current,
      getActiveSkillLine: () => activeSkillLineRef.current,
      getActiveSkill: () => activeSkillRef.current,
      onNeedModel: handleNeedModel,
      getWorkflowOutput: () => {
        const outputDir = nodeOutputDirRef.current;
        if (!outputDir) {
          return null;
        }
        return {
          workflowName: workflowNameRef.current,
          businessId: businessIdRef.current,
          nodeName: nodeNameRef.current,
          outputDir,
        };
      },
    });

    const wrappedStream: IAiChatServices['callAIChatStream'] = async (
      messages,
      onChunk,
      onError,
      onStats,
      modelKey,
      streamOptions,
    ) => {
      const wsContext = await buildWorkflowWorkspaceContext(
        workflowNameRef.current,
        businessIdRef.current,
        workspaceNodeNameRef.current,
      );
      const parallelBlock = previousParallelResultsRef.current
        ? buildMergedParallelContext(previousParallelResultsRef.current)
        : '';

      if (resourceKind === 'prompt') {
        return buildPromptStream(wsContext)(
          messages,
          onChunk,
          onError,
          onStats,
          modelKey,
          streamOptions,
        );
      }

      return skillStream(messages, onChunk, onError, onStats, modelKey, {
        ...streamOptions,
        user_system_prompt:
          [parallelBlock, wsContext.trim(), streamOptions?.user_system_prompt || '']
            .filter(Boolean)
            .join('\n\n')
            .trim() || streamOptions?.user_system_prompt,
      });
    };

    return buildSharedAiChatServices({
      aiModels,
      chatModelOptionGroups,
      workspace,
      localPath,
      storageKeyPrefix: storagePrefix,
      defaultModel: executionModel?.trim() || undefined,
      enableSuperpower: resourceKind !== 'prompt',
      noAttachmentsMessage: '工作流对话暂不支持附件',
      onNoAttachments: (msg) => showToast(msg, 'warning'),
      callAIChatStream: wrappedStream,
    });
  }, [
    activeSkillLineRef,
    activeSkillRef,
    aiModels,
    chatModelOptionGroups,
    executionModel,
    handleNeedModel,
    handleReplyComplete,
    localPath,
    modelResolverRef,
    businessIdRef,
    nodeNameRef,
    nodeOutputDirRef,
    previousParallelResultsRef,
    resourceKind,
    showToast,
    skillsSummaryRef,
    storagePrefix,
    systemPromptRef,
    userPromptRef,
    workflowNameRef,
    workspace,
    workspaceNodeNameRef,
  ]);

  return (
    <WorkflowAiChatShell
      bootstrapSessionId={bootstrapSessionId}
      className={styles['workflow-node-chat-shell']}
      services={chatServices}
      sessionKey={sessionKey}>
      <WorkflowChatKbBootstrap kbCollectionId={kbCollectionId} />
      <WorkflowChatBridge
        onAdopt={onAdopt}
        previousNodeRunResult={previousNodeRunResult}
        previousParallelResults={previousParallelResults}
        prefillUserPrompt={prefillUserPrompt}
        resourceKind={resourceKind}
        systemPrompt={systemPrompt}
        userPrompt={userPrompt}
      />
    </WorkflowAiChatShell>
  );
}
