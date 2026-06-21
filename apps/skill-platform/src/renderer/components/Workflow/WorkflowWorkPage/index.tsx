import type { IWorkflow, IWorkflowBusiness } from '@/types/modules';
import {
  buildWorkflowSteps,
  isParallelGroupOutputReady,
  parseWorkflowGraphJson,
  type IWorkflowResourceNodeData,
} from '@momo/workflow';
import type { Node } from '@xyflow/react';
import { App } from 'antd';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { FullscreenModal } from '@renderer/components/ui/FullscreenModal';
import { WorkflowNodeChat } from '@renderer/components/Workflow/WorkflowNodeChat';
import { WorkflowRunPanel } from '@renderer/components/Workflow/WorkflowRunPanel';
import { WorkflowStepsBar } from '@renderer/components/Workflow/WorkflowStepsBar';
import {
  ensureWorkflowAgentDir,
  ensureWorkflowBusinessAgentDir,
  getWorkflowNodeDirPath,
  listWorkflowAgentDir,
  readWorkflowNodeMainMd,
  writeWorkflowNodeMainMd,
} from '@renderer/services/workflow/agent-files';
import { getWorkflow, isWorkflowAvailable } from '@renderer/services/workflow/api';
import { fetchBusinessList } from '@renderer/services/workflow/business';
import { getOrCreateWorkflowNodeSession } from '@renderer/services/workflow/chat-storage';
import {
  getMacroUpstreamNodeName,
  getPreviousContextForActiveStep,
} from '@renderer/services/workflow/parallel-context';
import {
  buildMacroStepViewModels,
  flattenResourceSteps,
  resolveActiveResourceStep,
  type IMacroStepViewModel,
  type IResourceStepViewModel,
} from '@renderer/services/workflow/step-model';
import { usePromptStore, useSettingsStore, useSkillStore } from '@renderer/store';
import styles from './index.module.less';

interface IProps {
  workflowId: string;
  businessId: string;
  onClose: () => void;
}

const SIDE_PANEL_MIN_WIDTH = 280;
const SIDE_PANEL_MAX_WIDTH = 720;

function isResourceOutputReady(
  nodeId: string,
  runResults: Record<string, string>,
  nodeHasFiles: Record<string, boolean>,
): boolean {
  const hasRunResult = !!runResults[nodeId]?.trim();
  const hasFiles = nodeHasFiles[nodeId] ?? false;
  return hasRunResult && hasFiles;
}

function isMacroStepOutputReady(
  step: IMacroStepViewModel,
  runResults: Record<string, string>,
  nodeHasFiles: Record<string, boolean>,
): boolean {
  if (step.kind === 'resource') {
    return isResourceOutputReady(step.nodeId, runResults, nodeHasFiles);
  }
  return isParallelGroupOutputReady(step.children, runResults, nodeHasFiles);
}

function isMacroStepAccessible(
  macroIndex: number,
  macroSteps: IMacroStepViewModel[],
  runResults: Record<string, string>,
  nodeHasFiles: Record<string, boolean>,
): boolean {
  if (macroIndex === 0) {
    return true;
  }
  const previousStep = macroSteps[macroIndex - 1];
  if (!previousStep) {
    return false;
  }
  return isMacroStepOutputReady(previousStep, runResults, nodeHasFiles);
}

/**
 * 工作流执行页：顶部步骤条 + 中间对话 + 右侧运行结果/文件
 */
export function WorkflowWorkPage({ workflowId, businessId, onClose }: IProps) {
  const { message } = App.useApp();
  const isWorkflowReady = isWorkflowAvailable();
  const prompts = usePromptStore((s) => s.prompts);
  const skills = useSkillStore((s) => s.skills);
  const aiModels = useSettingsStore((s) => s.aiModels);

  const [workflow, setWorkflow] = useState<IWorkflow | null>(null);
  const [business, setBusiness] = useState<IWorkflowBusiness | null>(null);
  const [macroSteps, setMacroSteps] = useState<IMacroStepViewModel[]>([]);
  const [activeMacroIndex, setActiveMacroIndex] = useState(0);
  const [activeParallelChildIndex, setActiveParallelChildIndex] = useState(0);
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

  const refreshNodeFilesState = useCallback(
    async (wfName: string, bizId: string, resourceSteps: IResourceStepViewModel[]) => {
      const fileState: Record<string, boolean> = {};
      for (const step of resourceSteps) {
        const entries = await listWorkflowAgentDir(wfName, bizId, step.nodeName);
        fileState[step.nodeId] = entries.some((entry) => entry.type === 'file');
      }
      setNodeHasFiles(fileState);
    },
    [],
  );

  const loadWorkflow = useCallback(async () => {
    if (!isWorkflowReady) {
      return;
    }
    try {
      const found = await getWorkflow(workflowId);
      if (!found) {
        message.error('加载工作流失败');
        onClose();
        return;
      }
      const businesses = await fetchBusinessList(workflowId);
      const foundBusiness = businesses.find((item) => item.id === businessId) ?? null;
      if (!foundBusiness) {
        message.error('加载业务失败');
        onClose();
        return;
      }

      setWorkflow(found);
      setBusiness(foundBusiness);
      await ensureWorkflowAgentDir(found.name);
      await ensureWorkflowBusinessAgentDir(found.name, businessId);

      const { nodes, edges } = parseWorkflowGraphJson(found.graphJson);
      const built = buildWorkflowSteps(nodes, edges);
      if (!built.ok) {
        message.error('工作流图存在环，无法执行');
        setMacroSteps([]);
        return;
      }

      const nodeMap = new Map(
        nodes
          .filter((n) => {
            const d = n.data;
            return d?.resourceKind === 'prompt' || d?.resourceKind === 'skill';
          })
          .map((n) => [n.id, n as Node<IWorkflowResourceNodeData>]),
      );

      const viewMacroSteps = buildMacroStepViewModels(built.steps, nodeMap);
      const resourceSteps = flattenResourceSteps(viewMacroSteps);

      setMacroSteps(viewMacroSteps);
      setActiveMacroIndex(0);
      setActiveParallelChildIndex(0);

      const prevNodeNames: Record<string, string | null> = {};
      const outputDirs: Record<string, string | null> = {};
      const results: Record<string, string> = {};

      for (let i = 0; i < resourceSteps.length; i++) {
        const step = resourceSteps[i];
        outputDirs[step.nodeId] = await getWorkflowNodeDirPath(
          found.name,
          businessId,
          step.nodeName,
        );

        const macroIndex = viewMacroSteps.findIndex((macro) => {
          if (macro.kind === 'resource') {
            return macro.nodeId === step.nodeId;
          }
          return macro.children.some((child) => child.nodeId === step.nodeId);
        });
        prevNodeNames[step.nodeId] = getMacroUpstreamNodeName(viewMacroSteps, macroIndex);

        const mainMd = await readWorkflowNodeMainMd(found.name, businessId, step.nodeName);
        if (mainMd) {
          results[step.nodeId] = mainMd;
        }
      }
      setWorkspaceNodeNames(prevNodeNames);
      setNodeOutputDirs(outputDirs);
      setRunResults(results);
      await refreshNodeFilesState(found.name, businessId, resourceSteps);
    } catch (e) {
      console.error(e);
      message.error('加载工作流失败');
    }
  }, [businessId, isWorkflowReady, message, onClose, refreshNodeFilesState, workflowId]);

  useEffect(() => {
    void loadWorkflow();
  }, [loadWorkflow]);

  const activeStep = resolveActiveResourceStep(
    macroSteps,
    activeMacroIndex,
    activeParallelChildIndex,
  );

  const { previousNodeRunResult, previousParallelResults } = useMemo(
    () =>
      getPreviousContextForActiveStep({
        macroSteps,
        macroIndex: activeMacroIndex,
        runResults,
      }),
    [activeMacroIndex, macroSteps, runResults],
  );

  useLayoutEffect(() => {
    hasInitializedPanelWidthRef.current = false;
    setSidePanelWidth(null);
  }, [workflowId, businessId]);

  useLayoutEffect(() => {
    if (hasInitializedPanelWidthRef.current || macroSteps.length === 0) {
      return;
    }
    const panelsEl = panelsRef.current;
    if (!panelsEl || panelsEl.clientWidth < 200) {
      return;
    }
    const halfWidth = Math.round((panelsEl.clientWidth - 6) / 2);
    setSidePanelWidth(Math.max(SIDE_PANEL_MIN_WIDTH, halfWidth));
    hasInitializedPanelWidthRef.current = true;
  }, [workflowId, businessId, macroSteps.length, activeStep?.nodeId]);

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

  const chatBootstrap = useMemo(() => {
    if (!activeStep) {
      return null;
    }
    return getOrCreateWorkflowNodeSession(
      workflowId,
      businessId,
      activeStep.nodeId,
      activeStep.nodeName,
    );
  }, [activeStep, businessId, workflowId]);

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
    const entries = await listWorkflowAgentDir(workflow.name, businessId, activeStep.nodeName);
    setNodeHasFiles((prev) => ({
      ...prev,
      [activeStep.nodeId]: entries.some((entry) => entry.type === 'file'),
    }));
  }, [activeStep, businessId, workflow]);

  useEffect(() => {
    if (!workflow || macroSteps.length === 0) {
      return;
    }
    const resourceSteps = flattenResourceSteps(macroSteps);
    const nodeIds = new Set(resourceSteps.map((step) => step.nodeId));
    const changedNodeIds = Object.keys(filesRefreshTokens).filter((nodeId) => nodeIds.has(nodeId));
    if (changedNodeIds.length === 0) {
      return;
    }
    void refreshNodeFilesState(workflow.name, businessId, resourceSteps);
  }, [businessId, filesRefreshTokens, macroSteps, refreshNodeFilesState, workflow]);

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
      await writeWorkflowNodeMainMd(workflow.name, businessId, activeStep.nodeName, next);
      message.success('已采纳到运行结果');
      bumpFilesRefresh(activeStep.nodeId);
      await refreshActiveNodeFilesState();
    },
    [
      activeStep,
      bumpFilesRefresh,
      businessId,
      message,
      refreshActiveNodeFilesState,
      runResults,
      workflow,
    ],
  );

  const handleRunResultChange = useCallback(
    async (nodeId: string, nodeName: string, value: string) => {
      if (!workflow) {
        return;
      }
      setRunResults((prev) => ({ ...prev, [nodeId]: value }));
      await writeWorkflowNodeMainMd(workflow.name, businessId, nodeName, value);
      const entries = await listWorkflowAgentDir(workflow.name, businessId, nodeName);
      setNodeHasFiles((prev) => ({
        ...prev,
        [nodeId]: entries.some((entry) => entry.type === 'file'),
      }));
    },
    [businessId, workflow],
  );

  const handleMacroStepClick = useCallback(
    (macroIndex: number) => {
      if (!isMacroStepAccessible(macroIndex, macroSteps, runResults, nodeHasFiles)) {
        message.warning('请先完成上一节点的运行结果与文件产出');
        return;
      }
      setActiveMacroIndex(macroIndex);
      const macro = macroSteps[macroIndex];
      if (macro?.kind === 'parallel') {
        const firstIncomplete = macro.children.findIndex(
          (child) => !isResourceOutputReady(child.nodeId, runResults, nodeHasFiles),
        );
        setActiveParallelChildIndex(firstIncomplete >= 0 ? firstIncomplete : 0);
      } else {
        setActiveParallelChildIndex(0);
      }
    },
    [macroSteps, message, nodeHasFiles, runResults],
  );

  const handleParallelChildClick = useCallback(
    (macroIndex: number, childIndex: number) => {
      if (!isMacroStepAccessible(macroIndex, macroSteps, runResults, nodeHasFiles)) {
        message.warning('请先完成上一节点的运行结果与文件产出');
        return;
      }
      setActiveMacroIndex(macroIndex);
      setActiveParallelChildIndex(childIndex);
    },
    [macroSteps, message, nodeHasFiles, runResults],
  );

  const modalTitle = business?.name
    ? `${workflow?.name ?? '工作流'} · ${business.name}`
    : (workflow?.name ?? '工作流');

  return (
    <FullscreenModal
      destroyOnHidden
      footer={null}
      onClose={onClose}
      open
      showDefaultFooter={false}
      title={modalTitle}>
      <div className={styles['workflow-work']}>
        <div className={styles['workflow-work-body']}>
          <div className={styles['workflow-work-main']}>
            {macroSteps.length > 0 ? (
              <div
                className={styles['workflow-work-steps-bar']}
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
                <WorkflowStepsBar
                  activeMacroIndex={activeMacroIndex}
                  activeParallelChildIndex={activeParallelChildIndex}
                  mode='interactive'
                  nodeHasFiles={nodeHasFiles}
                  onParallelChildClick={handleParallelChildClick}
                  onStepClick={handleMacroStepClick}
                  runResults={runResults}
                  steps={macroSteps}
                />
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
                    businessId={businessId}
                    executionModel={activeNodeData?.executionModel}
                    kbCollectionId={activeNodeData?.kbCollectionId}
                    nodeWorkspacePaths={activeNodeData?.workspacePaths}
                    key={chatBootstrap.sessionKey}
                    nodeName={activeStep.nodeName}
                    nodeOutputDir={nodeOutputDirs[activeStep.nodeId] ?? null}
                    onAdopt={(c) => void handleAdopt(c)}
                    onArtifactsPersisted={handleArtifactsPersisted}
                    prefillUserPrompt={prefillUserPrompt}
                    previousNodeRunResult={previousNodeRunResult}
                    previousParallelResults={previousParallelResults}
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
                    aria-label='调节面板宽度'
                    aria-orientation='vertical'
                    className={styles['workflow-work-resizer']}
                    onMouseDown={handleSideResizeStart}
                    role='separator'
                  />
                  <aside
                    className={styles['workflow-work-side']}
                    style={{ width: resolvedSidePanelWidth }}>
                    <WorkflowRunPanel
                      businessId={businessId}
                      filesRefreshToken={filesRefreshTokens[activeStep.nodeId] ?? 0}
                      key={activeStep.nodeId}
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
