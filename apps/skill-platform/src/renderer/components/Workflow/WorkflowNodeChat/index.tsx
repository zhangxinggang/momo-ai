import type { ISkill } from '@/types/modules';
import { AiChatView, useChatContext, type IAiChatServices, type IChatMessage } from '@momo/aichat';
import '@momo/markdown-styles';
import { useCallback, useEffect, useMemo } from 'react';

import { SkillContextCard } from '@renderer/components/Skill/SkillContextCard';
import { WorkflowAiChatShell } from '@renderer/components/Workflow/WorkflowAiChatShell';
import { useToast } from '@renderer/components/ui/Toast';
import { useChatWorkspaceBinding } from '@renderer/hooks/useChatWorkspaceBinding';
import { useRankedChatModelGroups } from '@renderer/hooks/useRankedChatModelGroups';
import { useStableModelResolver } from '@renderer/hooks/useStableModelResolver';
import { useStableRef } from '@renderer/hooks/useStableRef';
import {
  buildSharedAiChatServices,
  createPromptTestStream,
  createSkillLangGraphStream,
} from '@renderer/services/aichat';
import { buildActiveSkillLine, buildSkillsSummary } from '@renderer/services/skill/chat-context';
import { persistWorkflowArtifactsFromReply } from '@renderer/services/workflow/artifact-writer';
import { buildWorkflowWorkspaceContext } from '@renderer/services/workflow/workspace-context';
import type { IAIModelConfig } from '@renderer/types/settings';
import styles from './index.module.less';

export interface IProps {
  sessionKey: string;
  bootstrapSessionId: string;
  storagePrefix: string;
  workflowName: string;
  nodeName: string;
  nodeOutputDir: string | null;
  resourceKind: 'prompt' | 'skill';
  systemPrompt: string;
  userPrompt: string;
  skills: ISkill[];
  activeSkillId: string | null;
  aiModels: IAIModelConfig[];
  workspaceNodeName: string | null;
  previousNodeRunResult: { nodeName: string; content: string } | null;
  prefillUserPrompt: boolean;
  onAdopt: (content: string) => void;
  onArtifactsPersisted?: () => void;
}

function WorkflowChatBridge({
  systemPrompt,
  userPrompt,
  resourceKind,
  skills,
  activeSkillId,
  previousNodeRunResult,
  prefillUserPrompt,
  onAdopt,
}: Pick<
  IProps,
  | 'systemPrompt'
  | 'userPrompt'
  | 'resourceKind'
  | 'skills'
  | 'activeSkillId'
  | 'previousNodeRunResult'
  | 'prefillUserPrompt'
  | 'onAdopt'
>) {
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

  const activeSkill = useMemo(
    () => (activeSkillId ? skills.find((s) => s.id === activeSkillId) : undefined),
    [activeSkillId, skills],
  );

  const hasChatHistory = useMemo(
    () =>
      (currentSession?.messages ?? []).some(
        (messageItem) => messageItem.role === 'user' || messageItem.role === 'assistant',
      ),
    [currentSession?.messages],
  );

  const shouldPrefillUserPrompt = prefillUserPrompt && !hasChatHistory;

  return (
    <div className={styles['workflow-node-chat']}>
      {previousNodeRunResult ? (
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
      {resourceKind === 'skill' && activeSkill ? (
        <div className={styles['workflow-node-chat-context']}>
          <SkillContextCard skill={activeSkill} />
        </div>
      ) : null}
      <div className={styles['workflow-node-chat-main']}>
        <AiChatView
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

export function WorkflowNodeChat({
  sessionKey,
  bootstrapSessionId,
  storagePrefix,
  workflowName,
  nodeName,
  nodeOutputDir,
  resourceKind,
  systemPrompt,
  userPrompt,
  skills,
  activeSkillId,
  aiModels,
  workspaceNodeName,
  previousNodeRunResult,
  prefillUserPrompt,
  onAdopt,
  onArtifactsPersisted,
}: IProps) {
  const { showToast } = useToast();
  const modelResolverRef = useStableModelResolver(aiModels);
  const chatModelOptionGroups = useRankedChatModelGroups(aiModels);
  const workspace = useChatWorkspaceBinding();
  const workspaceNodeNameRef = useStableRef(workspaceNodeName);
  const nodeOutputDirRef = useStableRef(nodeOutputDir);
  const workflowNameRef = useStableRef(workflowName);
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
  const onArtifactsPersistedRef = useStableRef(onArtifactsPersisted);

  const handleNeedModel = useCallback(() => {
    showToast('请先在设置中配置并选择可用的对话模型', 'error');
  }, [showToast]);

  const handleReplyComplete = useCallback(
    async (reply: string) => {
      const wf = workflowNameRef.current;
      const node = nodeNameRef.current;
      const written = await persistWorkflowArtifactsFromReply(wf, node, reply);
      if (written.length > 0) {
        onArtifactsPersistedRef.current?.();
      }
    },
    [nodeNameRef, onArtifactsPersistedRef, workflowNameRef],
  );

  const chatServices = useMemo((): IAiChatServices => {
    const buildPromptStream = (wsContext: string) =>
      createPromptTestStream({
        getModelConfig: (key) => modelResolverRef.current.getModelConfig(key),
        getDefaultConfig: () => modelResolverRef.current.getModelConfig(),
        getBaseMessages: () => {
          const msgs: { role: 'system' | 'user'; content: string }[] = [];
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
        workspaceNodeNameRef.current,
      );

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
        user_system_prompt: wsContext.trim()
          ? `${wsContext}\n\n${streamOptions?.user_system_prompt || ''}`.trim()
          : streamOptions?.user_system_prompt,
      });
    };

    return buildSharedAiChatServices({
      aiModels,
      chatModelOptionGroups,
      workspace,
      storageKeyPrefix: storagePrefix,
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
    handleNeedModel,
    handleReplyComplete,
    modelResolverRef,
    nodeNameRef,
    nodeOutputDirRef,
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
      <WorkflowChatBridge
        activeSkillId={activeSkillId}
        onAdopt={onAdopt}
        previousNodeRunResult={previousNodeRunResult}
        prefillUserPrompt={prefillUserPrompt}
        resourceKind={resourceKind}
        skills={skills}
        systemPrompt={systemPrompt}
        userPrompt={userPrompt}
      />
    </WorkflowAiChatShell>
  );
}
