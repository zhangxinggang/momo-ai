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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { WorkflowAiChatShell } from '@renderer/components/Workflow/WorkflowAiChatShell';
import { useToast } from '@renderer/components/ui/Toast';
import { useAiChatViewTheme } from '@renderer/hooks/useAiChatViewTheme';
import { useChatWorkspaceBinding } from '@renderer/hooks/useChatWorkspaceBinding';
import { useLocalPathBinding } from '@renderer/hooks/useLocalPathBinding';
import { useRankedChatModelGroups } from '@renderer/hooks/useRankedChatModelGroups';
import {
  createHarnessChatOverrides,
  ensureHarnessResourceContext,
} from '@renderer/services/agent-runtime/client';
import { buildSharedAiChatServices } from '@renderer/services/aichat';
import { checkPathExists, openFolderPath } from '@renderer/services/desktop';
import { buildActiveSkillLine, buildSkillsSummary } from '@renderer/services/skill/chat-context';
import { loadSkillInstructionsForChat } from '@renderer/services/skill/instructions-for-chat';
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
  kbCollectionId?: string;
  nodeWorkspacePaths?: string[];
  previousNodeRunResult: { nodeName: string; content: string } | null;
  previousParallelResults?: IParallelPreviousResultItem[] | null;
  prefillUserPrompt: boolean;
  onAdopt: (content: string) => void;
  onArtifactsPersisted?: () => void;
  autoStartToken?: number;
  autoStartPrompt?: string;
  onReplyCompleted?: (content: string) => void | Promise<void>;
  onAutoStartFailed?: () => void;
}

function WorkflowChatBridge({
  systemPrompt,
  userPrompt,
  resourceKind,
  previousNodeRunResult,
  previousParallelResults,
  prefillUserPrompt,
  onAdopt,
  runtimeSystemPrompt,
  runtimeContextReady,
  autoStartToken,
  autoStartPrompt,
  onAutoStartFailed,
  expectedKbCollectionId,
}: Pick<
  IProps,
  | 'systemPrompt'
  | 'userPrompt'
  | 'resourceKind'
  | 'previousNodeRunResult'
  | 'previousParallelResults'
  | 'prefillUserPrompt'
  | 'onAdopt'
  | 'autoStartToken'
  | 'autoStartPrompt'
  | 'onAutoStartFailed'
> & {
  runtimeSystemPrompt: string;
  runtimeContextReady: boolean;
  expectedKbCollectionId?: string;
}) {
  const chatTheme = useAiChatViewTheme();
  const {
    currentSession,
    currentSessionId,
    isAILoading,
    addMessage,
    updateMessage,
    setSystemPrompt,
    sendMessage,
    systemPrompt: activeSystemPrompt,
    kbEnabled,
    kbCollectionId,
  } = useChatContext();
  const autoStartedTokenRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    setSystemPrompt(runtimeSystemPrompt);
  }, [runtimeSystemPrompt, setSystemPrompt]);

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

  useEffect(() => {
    if (
      autoStartToken === undefined ||
      autoStartedTokenRef.current === autoStartToken ||
      !runtimeContextReady ||
      !currentSessionId ||
      !currentSession ||
      isAILoading ||
      activeSystemPrompt !== runtimeSystemPrompt ||
      (expectedKbCollectionId !== undefined &&
        (!kbEnabled || kbCollectionId !== expectedKbCollectionId))
    ) {
      return;
    }
    const timer = window.setTimeout(() => {
      if (autoStartedTokenRef.current === autoStartToken) {
        return;
      }
      autoStartedTokenRef.current = autoStartToken;
      void sendMessage(autoStartPrompt?.trim() || '请继续执行当前工作流节点。')
        .then((sent) => {
          if (!sent) {
            onAutoStartFailed?.();
          }
        })
        .catch(() => onAutoStartFailed?.());
    }, 0);
    return () => window.clearTimeout(timer);
  }, [
    activeSystemPrompt,
    autoStartPrompt,
    autoStartToken,
    currentSession,
    currentSessionId,
    expectedKbCollectionId,
    isAILoading,
    kbCollectionId,
    kbEnabled,
    onAutoStartFailed,
    runtimeContextReady,
    sendMessage,
  ]);

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

  const shouldPrefillUserPrompt =
    autoStartToken === undefined && prefillUserPrompt && !hasChatHistory;
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

function WorkflowArtifactBridge({
  workflowName,
  businessId,
  nodeName,
  onArtifactsPersisted,
  onReplyCompleted,
}: Pick<
  IProps,
  'workflowName' | 'businessId' | 'nodeName' | 'onArtifactsPersisted' | 'onReplyCompleted'
>) {
  const { currentSession, isAILoading } = useChatContext();
  const wasLoadingRef = useRef(false);
  const processedRef = useRef(new Set<string>());

  useEffect(() => {
    const completedTransition = wasLoadingRef.current && !isAILoading;
    wasLoadingRef.current = isAILoading;
    if (completedTransition) {
      const message = currentSession?.messages
        .slice()
        .reverse()
        .find(
          (item) =>
            item.role === 'assistant' &&
            item.runStatus === 'completed' &&
            !item.isError &&
            Boolean(item.content.trim()),
        );
      if (!message || processedRef.current.has(message.id)) return;
      processedRef.current.add(message.id);
      void (async () => {
        try {
          const written = await persistWorkflowArtifactsFromReply(
            workflowName,
            businessId,
            nodeName,
            message.content,
          );
          if (written.length > 0) onArtifactsPersisted?.();
        } catch (error) {
          console.error('[workflow] 持久化回复产物失败', error);
        } finally {
          await onReplyCompleted?.(message.content);
        }
      })();
    }
  }, [
    businessId,
    currentSession?.messages,
    isAILoading,
    nodeName,
    onArtifactsPersisted,
    onReplyCompleted,
    workflowName,
  ]);
  return null;
}

function WorkflowChatKbBootstrap({ kbCollectionId }: { kbCollectionId?: string }) {
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
  autoStartToken,
  autoStartPrompt,
  onReplyCompleted,
  onAutoStartFailed,
}: IProps) {
  const { showToast } = useToast();
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
  const activeSkill = useMemo(
    () => (activeSkillId ? skills.find((s) => s.id === activeSkillId) : undefined),
    [activeSkillId, skills],
  );
  const [runtimeSystemPrompt, setRuntimeSystemPrompt] = useState('');
  const [runtimeContextReady, setRuntimeContextReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setRuntimeContextReady(false);
    void (async () => {
      const upstreamNodeNames = previousParallelResults?.length
        ? previousParallelResults.map((item) => item.nodeName)
        : [workspaceNodeName];
      const [workspaceContexts, activeSkillInstructions] = await Promise.all([
        Promise.all(
          Array.from(
            new Set(upstreamNodeNames.filter((name): name is string => Boolean(name))),
          ).map((upstreamNodeName) =>
            buildWorkflowWorkspaceContext(workflowName, businessId, upstreamNodeName),
          ),
        ),
        activeSkill ? loadSkillInstructionsForChat(activeSkill) : Promise.resolve(''),
      ]);
      const workspaceContext = workspaceContexts.filter(Boolean).join('\n\n');
      const parallelContext = previousParallelResults
        ? buildMergedParallelContext(previousParallelResults)
        : '';
      const previousResultContext = previousNodeRunResult?.content.trim()
        ? `上一节点运行结果（${previousNodeRunResult.nodeName}）：\n${previousNodeRunResult.content.trim()}`
        : '';
      const skillContext =
        resourceKind === 'skill'
          ? [
              `可用技能摘要：\n${buildSkillsSummary(skills)}`,
              `当前技能：\n${buildActiveSkillLine(activeSkill)}`,
              activeSkillInstructions && `当前技能完整指令：\n${activeSkillInstructions}`,
              nodeOutputDir && `工作流产物目录：${nodeOutputDir}`,
            ]
              .filter(Boolean)
              .join('\n\n')
          : '';
      if (!cancelled) {
        setRuntimeSystemPrompt(
          [
            previousResultContext,
            parallelContext,
            workspaceContext,
            systemPrompt.trim(),
            skillContext,
          ]
            .filter(Boolean)
            .join('\n\n'),
        );
        setRuntimeContextReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    activeSkill,
    businessId,
    nodeOutputDir,
    previousNodeRunResult,
    previousParallelResults,
    resourceKind,
    skills,
    systemPrompt,
    workflowName,
    workspaceNodeName,
  ]);

  const chatServices = useMemo((): IAiChatServices => {
    const harnessOverrides = createHarnessChatOverrides({
      getResourceContext: () =>
        ensureHarnessResourceContext(
          `工作流：${workflowName}/${businessId}/${nodeName}`,
          nodeWorkspacePaths && nodeWorkspacePaths.length > 0
            ? nodeWorkspacePaths
            : workspace.enabled
              ? workspace.paths
              : [],
        ),
    });

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
      callAIChatStream: harnessOverrides.callAIChatStream!,
      overrides: harnessOverrides,
    });
  }, [
    aiModels,
    chatModelOptionGroups,
    businessId,
    executionModel,
    localPath,
    nodeName,
    nodeWorkspacePaths,
    resourceKind,
    showToast,
    storagePrefix,
    workflowName,
    workspace,
  ]);

  return (
    <WorkflowAiChatShell
      bootstrapSessionId={bootstrapSessionId}
      className={styles['workflow-node-chat-shell']}
      services={chatServices}
      sessionKey={sessionKey}>
      <WorkflowChatKbBootstrap kbCollectionId={kbCollectionId} />
      <WorkflowArtifactBridge
        businessId={businessId}
        nodeName={nodeName}
        onArtifactsPersisted={onArtifactsPersisted}
        onReplyCompleted={onReplyCompleted}
        workflowName={workflowName}
      />
      <WorkflowChatBridge
        autoStartPrompt={autoStartPrompt}
        autoStartToken={autoStartToken}
        expectedKbCollectionId={kbCollectionId}
        onAdopt={onAdopt}
        onAutoStartFailed={onAutoStartFailed}
        previousNodeRunResult={previousNodeRunResult}
        previousParallelResults={previousParallelResults}
        prefillUserPrompt={prefillUserPrompt}
        resourceKind={resourceKind}
        runtimeContextReady={runtimeContextReady}
        runtimeSystemPrompt={runtimeSystemPrompt}
        systemPrompt={systemPrompt}
        userPrompt={userPrompt}
      />
    </WorkflowAiChatShell>
  );
}
