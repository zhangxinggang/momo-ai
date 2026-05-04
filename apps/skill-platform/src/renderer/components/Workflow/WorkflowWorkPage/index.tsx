import type { IWorkflow, IWorkflowResourceStep } from '@/types/modules';
import {
  buildWorkflowResourceSteps,
  parseWorkflowGraphJson,
  type IWorkflowResourceNodeData,
} from '@momo/workflow';
import type { Node } from '@xyflow/react';
import { App, Tooltip } from 'antd';
import { clsx } from 'clsx';
import { ChevronRightIcon, CommandIcon, CuboidIcon } from 'lucide-react';
import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { SkillIcon } from '@renderer/components/Skill/SkillIcon';
import { FullscreenModal } from '@renderer/components/ui/FullscreenModal';
import { WORKFLOW_RESOURCE_TAG_COLORS } from '@renderer/components/Workflow/constants';
import { WorkflowNodeChat } from '@renderer/components/Workflow/WorkflowNodeChat';
import { WorkflowRunPanel } from '@renderer/components/Workflow/WorkflowRunPanel';
import {
  ensureWorkflowAgentDir,
  listWorkflowAgentDir,
  readWorkflowNodeMainMd,
  writeWorkflowNodeMainMd,
} from '@renderer/services/workflow/agent-files';
import { getOrCreateWorkflowNodeSession } from '@renderer/services/workflow/chat-storage';
import { usePromptStore, useSettingsStore, useSkillStore } from '@renderer/store';
import styles from './index.module.less';

interface IProps {
  workflowId: string;
  onClose: () => void;
}

interface IStepViewModel extends IWorkflowResourceStep {
  node: Node<IWorkflowResourceNodeData>;
}

const SIDE_PANEL_MIN_WIDTH = 280;
const SIDE_PANEL_MAX_WIDTH = 720;

/** 节点产出是否满足进入下一步：运行结果非空且存在文件 */
function isStepOutputReady(
  step: IStepViewModel,
  runResults: Record<string, string>,
  nodeHasFiles: Record<string, boolean>,
): boolean {
  const hasRunResult = !!runResults[step.nodeId]?.trim();
  const hasFiles = nodeHasFiles[step.nodeId] ?? false;
  return hasRunResult && hasFiles;
}

function isStepAccessible(
  index: number,
  steps: IStepViewModel[],
  runResults: Record<string, string>,
  nodeHasFiles: Record<string, boolean>,
): boolean {
  if (index === 0) {
    return true;
  }
  const previousStep = steps[index - 1];
  if (!previousStep) {
    return false;
  }
  return isStepOutputReady(previousStep, runResults, nodeHasFiles);
}

function buildStepHoverContent(
  d: IWorkflowResourceNodeData,
  isPrompt: boolean,
  prompt: { title?: string; systemPrompt?: string; userPrompt?: string } | undefined,
  skill: { name?: string; description?: string } | undefined,
): React.ReactNode {
  if (isPrompt) {
    const systemText = d.systemPrompt?.trim() || prompt?.systemPrompt?.trim() || '';
    const userText = d.userPrompt?.trim() || prompt?.userPrompt?.trim() || '';
    return (
      <div className={styles['workflow-work-step-tooltip']}>
        <div className={styles['workflow-work-step-tooltip-title']}>
          {'提示词'}
          {prompt?.title ? ` · ${prompt.title}` : ''}
        </div>
        {systemText ? (
          <div className={styles['workflow-work-step-tooltip-block']}>
            <div className={styles['workflow-work-step-tooltip-label']}>{'系统提示词'}</div>
            <div className={styles['workflow-work-step-tooltip-text']}>{systemText}</div>
          </div>
        ) : null}
        {userText ? (
          <div className={styles['workflow-work-step-tooltip-block']}>
            <div className={styles['workflow-work-step-tooltip-label']}>{'用户提示词'}</div>
            <div className={styles['workflow-work-step-tooltip-text']}>{userText}</div>
          </div>
        ) : null}
        {!systemText && !userText ? (
          <div className={styles['workflow-work-step-tooltip-text']}>{'暂无提示词内容'}</div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={styles['workflow-work-step-tooltip']}>
      <div className={styles['workflow-work-step-tooltip-title']}>
        {'技能'}
        {skill?.name ? ` · ${skill.name}` : ''}
      </div>
      {skill?.description?.trim() ? (
        <div className={styles['workflow-work-step-tooltip-text']}>{skill.description.trim()}</div>
      ) : (
        <div className={styles['workflow-work-step-tooltip-text']}>{'暂无技能描述'}</div>
      )}
    </div>
  );
}

/**
 * 工作流执行页：顶部步骤条 + 中间对话 + 右侧运行结果/文件
 */
export function WorkflowWorkPage({ workflowId, onClose }: IProps) {
  const { message } = App.useApp();
  const wfApi = window.api?.workflow;
  const prompts = usePromptStore((s) => s.prompts);
  const skills = useSkillStore((s) => s.skills);
  const aiModels = useSettingsStore((s) => s.aiModels);

  const [workflow, setWorkflow] = useState<IWorkflow | null>(null);
  const [steps, setSteps] = useState<IStepViewModel[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [runResults, setRunResults] = useState<Record<string, string>>({});
  const [nodeHasFiles, setNodeHasFiles] = useState<Record<string, boolean>>({});
  const [workspaceNodeNames, setWorkspaceNodeNames] = useState<Record<string, string | null>>({});
  const [nodeOutputDirs, setNodeOutputDirs] = useState<Record<string, string | null>>({});
  const [filesRefreshTokens, setFilesRefreshTokens] = useState<Record<string, number>>({});
  const [sidePanelWidth, setSidePanelWidth] = useState<number | null>(null);
  const panelsRef = useRef<HTMLDivElement>(null);
  const hasInitializedPanelWidthRef = useRef(false);
  const visitedPromptNodeIdsRef = useRef<Set<string>>(new Set());
  const isResizingSideRef = useRef(false);

  const refreshNodeFilesState = useCallback(async (wfName: string, stepList: IStepViewModel[]) => {
    const fileState: Record<string, boolean> = {};
    for (const step of stepList) {
      const entries = await listWorkflowAgentDir(wfName, step.nodeName);
      fileState[step.nodeId] = entries.some((entry) => entry.type === 'file');
    }
    setNodeHasFiles(fileState);
  }, []);

  const loadWorkflow = useCallback(async () => {
    if (!wfApi?.get) {
      return;
    }
    try {
      const found = await wfApi.get(workflowId);
      if (!found) {
        message.error('加载工作流失败');
        onClose();
        return;
      }
      setWorkflow(found);
      await ensureWorkflowAgentDir(found.name);

      const { nodes, edges } = parseWorkflowGraphJson(found.graphJson);
      const built = buildWorkflowResourceSteps(nodes, edges);
      if (!built.ok) {
        message.error('工作流图存在环，无法执行');
        setSteps([]);
        return;
      }

      const nodeMap = new Map(
        nodes
          .filter((n) => {
            const d = n.data as IWorkflowResourceNodeData;
            return d?.resourceKind === 'prompt' || d?.resourceKind === 'skill';
          })
          .map((n) => [n.id, n as Node<IWorkflowResourceNodeData>]),
      );

      const viewSteps: IStepViewModel[] = built.steps
        .map((step) => {
          const node = nodeMap.get(step.nodeId);
          if (!node) {
            return null;
          }
          return { ...step, node };
        })
        .filter((s): s is IStepViewModel => s !== null);

      setSteps(viewSteps);
      setActiveStepIndex(0);

      const prevNodeNames: Record<string, string | null> = {};
      const outputDirs: Record<string, string | null> = {};
      const results: Record<string, string> = {};

      for (let i = 0; i < viewSteps.length; i++) {
        const step = viewSteps[i];
        const nodeRes = await window.api?.workflowAgent?.listDir(found.name, step.nodeName);
        outputDirs[step.nodeId] = nodeRes?.dirPath ?? null;
        prevNodeNames[step.nodeId] = i === 0 ? null : viewSteps[i - 1].nodeName;

        const mainMd = await readWorkflowNodeMainMd(found.name, step.nodeName);
        if (mainMd) {
          results[step.nodeId] = mainMd;
        }
      }
      setWorkspaceNodeNames(prevNodeNames);
      setNodeOutputDirs(outputDirs);
      setRunResults(results);
      await refreshNodeFilesState(found.name, viewSteps);
    } catch (e) {
      console.error(e);
      message.error('加载工作流失败');
    }
  }, [message, onClose, refreshNodeFilesState, wfApi, workflowId]);

  useEffect(() => {
    void loadWorkflow();
  }, [loadWorkflow]);

  const activeStep = steps[activeStepIndex] ?? null;
  const previousStep = activeStepIndex > 0 ? steps[activeStepIndex - 1] : null;

  useLayoutEffect(() => {
    hasInitializedPanelWidthRef.current = false;
    setSidePanelWidth(null);
  }, [workflowId]);

  useLayoutEffect(() => {
    if (hasInitializedPanelWidthRef.current || steps.length === 0) {
      return;
    }
    const panelsEl = panelsRef.current;
    if (!panelsEl || panelsEl.clientWidth < 200) {
      return;
    }
    const halfWidth = Math.round((panelsEl.clientWidth - 6) / 2);
    setSidePanelWidth(Math.max(SIDE_PANEL_MIN_WIDTH, halfWidth));
    hasInitializedPanelWidthRef.current = true;
  }, [workflowId, steps.length, activeStep?.nodeId]);

  const resolvedSidePanelWidth =
    sidePanelWidth ??
    Math.max(SIDE_PANEL_MIN_WIDTH, Math.round(((panelsRef.current?.clientWidth ?? 960) - 6) / 2));
  const chatPanelWidth = `calc(100% - 6px - ${resolvedSidePanelWidth}px)`;

  const handleSideResizeStart = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      isResizingSideRef.current = true;
      const startX = event.clientX;
      const startWidth = resolvedSidePanelWidth;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isResizingSideRef.current) {
          return;
        }
        const delta = startX - moveEvent.clientX;
        const nextWidth = Math.min(
          SIDE_PANEL_MAX_WIDTH,
          Math.max(SIDE_PANEL_MIN_WIDTH, startWidth + delta),
        );
        setSidePanelWidth(nextWidth);
      };

      const handleMouseUp = () => {
        isResizingSideRef.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [resolvedSidePanelWidth],
  );

  const previousNodeRunResult = useMemo(() => {
    if (!previousStep) {
      return null;
    }
    const content = runResults[previousStep.nodeId]?.trim();
    if (!content) {
      return null;
    }
    return {
      nodeName: previousStep.nodeName,
      content,
    };
  }, [previousStep, runResults]);

  const chatBootstrap = useMemo(() => {
    if (!activeStep) {
      return null;
    }
    return getOrCreateWorkflowNodeSession(workflowId, activeStep.nodeId, activeStep.nodeName);
  }, [activeStep, workflowId]);

  const activeNodeData = activeStep?.node.data;
  const linkedPrompt =
    activeNodeData?.resourceKind === 'prompt'
      ? prompts.find((p) => p.id === activeNodeData.resourceId)
      : undefined;
  const linkedSkill =
    activeNodeData?.resourceKind === 'skill'
      ? skills.find((s) => s.id === activeNodeData.resourceId)
      : undefined;

  const systemPrompt = activeNodeData?.systemPrompt?.trim() || linkedPrompt?.systemPrompt || '';
  const userPrompt = activeNodeData?.userPrompt?.trim() || linkedPrompt?.userPrompt || '';

  const prefillUserPrompt =
    !!activeStep &&
    activeNodeData?.resourceKind === 'prompt' &&
    !visitedPromptNodeIdsRef.current.has(activeStep.nodeId);

  useEffect(() => {
    if (activeStep && activeNodeData?.resourceKind === 'prompt') {
      visitedPromptNodeIdsRef.current.add(activeStep.nodeId);
    }
  }, [activeStep, activeNodeData?.resourceKind]);

  const bumpFilesRefresh = useCallback((nodeId: string) => {
    setFilesRefreshTokens((prev) => ({
      ...prev,
      [nodeId]: (prev[nodeId] ?? 0) + 1,
    }));
  }, []);

  const refreshActiveNodeFilesState = useCallback(async () => {
    if (!workflow || !activeStep) {
      return;
    }
    const entries = await listWorkflowAgentDir(workflow.name, activeStep.nodeName);
    setNodeHasFiles((prev) => ({
      ...prev,
      [activeStep.nodeId]: entries.some((entry) => entry.type === 'file'),
    }));
  }, [activeStep, workflow]);

  useEffect(() => {
    if (!workflow || steps.length === 0) {
      return;
    }
    const nodeIds = new Set(steps.map((step) => step.nodeId));
    const changedNodeIds = Object.keys(filesRefreshTokens).filter((nodeId) => nodeIds.has(nodeId));
    if (changedNodeIds.length === 0) {
      return;
    }
    void refreshNodeFilesState(workflow.name, steps);
  }, [filesRefreshTokens, refreshNodeFilesState, steps, workflow]);

  const handleArtifactsPersisted = useCallback(() => {
    if (activeStep) {
      bumpFilesRefresh(activeStep.nodeId);
    }
  }, [activeStep, bumpFilesRefresh]);

  const handleAdopt = useCallback(
    async (content: string) => {
      if (!activeStep || !workflow) {
        return;
      }
      const trimmed = content.trim();
      if (!trimmed) {
        return;
      }
      const existing = runResults[activeStep.nodeId] || '';
      const next = existing ? `${existing}\n\n${trimmed}` : trimmed;
      setRunResults((prev) => ({ ...prev, [activeStep.nodeId]: next }));
      await writeWorkflowNodeMainMd(workflow.name, activeStep.nodeName, next);
      message.success('已采纳到运行结果');
      bumpFilesRefresh(activeStep.nodeId);
      await refreshActiveNodeFilesState();
    },
    [activeStep, bumpFilesRefresh, message, refreshActiveNodeFilesState, runResults, workflow],
  );

  const handleRunResultChange = useCallback(
    async (nodeId: string, nodeName: string, value: string) => {
      if (!workflow) {
        return;
      }
      setRunResults((prev) => ({ ...prev, [nodeId]: value }));
      await writeWorkflowNodeMainMd(workflow.name, nodeName, value);
      const entries = await listWorkflowAgentDir(workflow.name, nodeName);
      setNodeHasFiles((prev) => ({
        ...prev,
        [nodeId]: entries.some((entry) => entry.type === 'file'),
      }));
    },
    [workflow],
  );

  const handleStepClick = useCallback(
    (index: number) => {
      if (!isStepAccessible(index, steps, runResults, nodeHasFiles)) {
        message.warning('请先完成上一节点的运行结果与文件产出');
        return;
      }
      setActiveStepIndex(index);
    },
    [message, nodeHasFiles, runResults, steps],
  );

  const renderStepCard = (step: IStepViewModel, index: number) => {
    const d = step.node.data;
    const isPrompt = d.resourceKind === 'prompt';
    const skill = !isPrompt ? skills.find((s) => s.id === d.resourceId) : undefined;
    const prompt = isPrompt ? prompts.find((p) => p.id === d.resourceId) : undefined;
    const tagColor = WORKFLOW_RESOURCE_TAG_COLORS[isPrompt ? 'prompt' : 'skill'];
    const displayTitle = isPrompt ? prompt?.title || d.label : skill?.name || d.label;
    const hoverContent = buildStepHoverContent(d, isPrompt, prompt, skill);
    const isAccessible = isStepAccessible(index, steps, runResults, nodeHasFiles);
    const isLocked = !isAccessible;

    const card = (
      <button
        aria-disabled={isLocked}
        className={clsx(styles['workflow-work-step'], {
          [styles['workflow-work-step--active']]: index === activeStepIndex,
          [styles['workflow-work-step--disabled']]: isLocked,
        })}
        disabled={isLocked}
        onClick={() => handleStepClick(index)}
        style={{ background: tagColor }}
        title={isLocked ? '请先完成上一节点的运行结果与文件产出' : undefined}
        type='button'>
        <span aria-hidden className={styles['workflow-work-step-index']}>
          {index + 1}
        </span>
        <span className={styles['workflow-work-step-icon']}>
          {isPrompt ? (
            <CommandIcon className='h-3.5 w-3.5' />
          ) : skill ? (
            <SkillIcon name={skill.name} size='sm' />
          ) : (
            <CuboidIcon className='h-3.5 w-3.5' />
          )}
        </span>
        <span className={styles['workflow-work-step-body']}>
          <span className={styles['workflow-work-step-title']}>{displayTitle}</span>
          <span className={styles['workflow-work-step-name']}>{step.nodeName}</span>
        </span>
      </button>
    );

    return (
      <Tooltip
        key={step.nodeId}
        mouseEnterDelay={0.35}
        overlayClassName={styles['workflow-work-step-tooltip-overlay']}
        placement='bottom'
        title={hoverContent}>
        {card}
      </Tooltip>
    );
  };

  return (
    <FullscreenModal
      open
      title={workflow?.name ?? '工作流'}
      onClose={onClose}
      footer={null}
      showDefaultFooter={false}
      destroyOnClose>
      <div className={styles['workflow-work']}>
        <div className={styles['workflow-work-body']}>
          <div className={styles['workflow-work-main']}>
            {steps.length > 0 ? (
              <div
                className={styles['workflow-work-steps-bar']}
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
                <div className={styles['workflow-work-steps-track']}>
                  {steps.map((step, index) => (
                    <Fragment key={step.nodeId}>
                      {index > 0 ? (
                        <span
                          aria-hidden
                          className={clsx(styles['workflow-work-step-arrow'], {
                            [styles['workflow-work-step-arrow--disabled']]: !isStepAccessible(
                              index,
                              steps,
                              runResults,
                              nodeHasFiles,
                            ),
                          })}>
                          <ChevronRightIcon className='h-4 w-4' />
                        </span>
                      ) : null}
                      {renderStepCard(step, index)}
                    </Fragment>
                  ))}
                </div>
              </div>
            ) : null}

            <div ref={panelsRef} className={styles['workflow-work-panels']}>
              <main
                className={styles['workflow-work-chat']}
                style={{ flex: 'none', width: chatPanelWidth }}>
                {activeStep && chatBootstrap ? (
                  <WorkflowNodeChat
                    activeSkillId={
                      activeNodeData?.resourceKind === 'skill' ? activeNodeData.resourceId : null
                    }
                    aiModels={aiModels}
                    bootstrapSessionId={chatBootstrap.sessionId}
                    key={chatBootstrap.sessionKey}
                    nodeName={activeStep.nodeName}
                    nodeOutputDir={nodeOutputDirs[activeStep.nodeId] ?? null}
                    onAdopt={(c) => void handleAdopt(c)}
                    onArtifactsPersisted={handleArtifactsPersisted}
                    prefillUserPrompt={prefillUserPrompt}
                    previousNodeRunResult={previousNodeRunResult}
                    resourceKind={activeNodeData?.resourceKind ?? 'prompt'}
                    sessionKey={chatBootstrap.sessionKey}
                    skills={skills}
                    storagePrefix={chatBootstrap.storagePrefix}
                    systemPrompt={systemPrompt}
                    userPrompt={userPrompt}
                    workflowName={workflow?.name ?? ''}
                    workspaceNodeName={workspaceNodeNames[activeStep.nodeId] ?? null}
                  />
                ) : (
                  <div className={styles['workflow-work-empty']}>{'请选择节点'}</div>
                )}
              </main>

              {activeStep && workflow ? (
                <>
                  <div
                    aria-orientation='vertical'
                    aria-label='调节面板宽度'
                    className={styles['workflow-work-resizer']}
                    onMouseDown={handleSideResizeStart}
                    role='separator'
                  />
                  <aside
                    className={styles['workflow-work-side']}
                    style={{ width: resolvedSidePanelWidth }}>
                    <WorkflowRunPanel
                      key={activeStep.nodeId}
                      filesRefreshToken={filesRefreshTokens[activeStep.nodeId] ?? 0}
                      nodeId={activeStep.nodeId}
                      nodeName={activeStep.nodeName}
                      onFilesChange={handleArtifactsPersisted}
                      onRunResultChange={(v) =>
                        void handleRunResultChange(activeStep.nodeId, activeStep.nodeName, v)
                      }
                      runResult={runResults[activeStep.nodeId] ?? ''}
                      workflowName={workflow.name}
                    />
                  </aside>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </FullscreenModal>
  );
}
