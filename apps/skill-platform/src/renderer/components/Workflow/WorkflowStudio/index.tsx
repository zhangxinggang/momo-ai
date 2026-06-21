import type { IWorkflow } from '@/types/modules';
import {
  attachResourceNodeToParallel,
  createParallelNode,
  createResourceNode,
  parseWorkflowGraphJson,
  stringifyWorkflowGraph,
  validateWorkflowGraph,
  WORKFLOW_DRAG_MIME,
  WorkflowEditor,
  type IWorkflowEditorNodeEvent,
  type IWorkflowPaletteDragPayload,
  type IWorkflowResourceNodeData,
} from '@momo/workflow';
import type { Edge, Node } from '@xyflow/react';
import { useEdgesState, useNodesState } from '@xyflow/react';
import { App, Button, Input, Typography } from 'antd';
import { SaveIcon, XIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { WorkflowNodeEditPanel } from '@renderer/components/Workflow/WorkflowNodeEditPanel';
import { useUnsavedLeaveGuard } from '@renderer/hooks/useUnsavedLeaveGuard';
import {
  deleteWorkflowNodeForAllBusinesses,
  ensureWorkflowAgentDir,
  renameWorkflowAgentDir,
  renameWorkflowNodeForAllBusinesses,
} from '@renderer/services/workflow/agent-files';
import {
  createWorkflow as createWorkflowRecord,
  getWorkflow,
  isWorkflowAvailable,
  updateWorkflow as updateWorkflowRecord,
} from '@renderer/services/workflow/api';
import { fetchBusinessList, workflowHasBusinesses } from '@renderer/services/workflow/business';
import { deleteWorkflowNodeChatForAllBusinesses } from '@renderer/services/workflow/chat-storage';
import { isResourceNode } from '@renderer/services/workflow/graph-utils';
import { readWorkflowNodeDefaultValues } from '@renderer/services/workflow/node-defaults';
import {
  usePromptStore,
  useSettingsStore,
  useSkillStore,
  useUIStore,
  useWorkflowStore,
} from '@renderer/store';
import { getSystemFileNameError } from '@renderer/utils/validation/system-name';
import styles from './index.module.less';

interface IProps {
  workflowId: string | null;
  onClose: () => void;
}

function setPaletteDragData(event: React.DragEvent, payload: IWorkflowPaletteDragPayload) {
  event.dataTransfer.setData(WORKFLOW_DRAG_MIME, JSON.stringify(payload));
  event.dataTransfer.effectAllowed = 'move';
}

/**
 * 工作流全屏编辑器：侧栏拖放 + 编排画布 + 节点属性浮层
 */
export function WorkflowStudio({ workflowId, onClose }: IProps) {
  const { message, modal } = App.useApp();
  const isWorkflowReady = isWorkflowAvailable();

  const prompts = usePromptStore((s) => s.prompts);
  const skills = useSkillStore((s) => s.skills);
  const aiModels = useSettingsStore((s) => s.aiModels);
  const fetchPrompts = usePromptStore((s) => s.fetchPrompts);
  const loadSkills = useSkillStore((s) => s.loadSkills);

  const [workflow, setWorkflow] = useState<IWorkflow | null>(null);
  const [workflowName, setWorkflowName] = useState('');
  const [savedName, setSavedName] = useState('');
  const [savedGraphJson, setSavedGraphJson] = useState('');
  const [nodes, setNodes] = useNodesState<Node>([]);
  const [edges, setEdges] = useEdgesState<Edge>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [promptQuery, setPromptQuery] = useState('');
  const [skillQuery, setSkillQuery] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const currentWorkflowIdRef = useRef<string | null>(workflowId);

  useEffect(() => {
    currentWorkflowIdRef.current = workflowId;
  }, [workflowId]);

  useEffect(() => {
    void fetchPrompts();
    void loadSkills();
  }, [fetchPrompts, loadSkills]);

  const loadWorkflow = useCallback(async () => {
    if (!workflowId || !isWorkflowReady) {
      setWorkflow(null);
      setWorkflowName('');
      setSavedName('');
      setSavedGraphJson(stringifyWorkflowGraph([], []));
      setNodes([]);
      setEdges([]);
      return;
    }
    try {
      const found = await getWorkflow(workflowId);
      if (!found) {
        message.error('加载工作流失败');
        onClose();
        return;
      }
      setWorkflow(found);
      setWorkflowName(found.name);
      setSavedName(found.name);
      setSavedGraphJson(found.graphJson);
      const { nodes: n, edges: e } = parseWorkflowGraphJson(found.graphJson);
      setNodes(n);
      setEdges(e);
    } catch (e) {
      console.error(e);
      message.error('加载工作流失败');
    }
  }, [message, onClose, setEdges, setNodes, isWorkflowReady, workflowId]);

  useEffect(() => {
    if (workflowId) {
      void loadWorkflow();
    } else {
      setWorkflow(null);
      setWorkflowName('');
      setSavedName('');
      const empty = stringifyWorkflowGraph([], []);
      setSavedGraphJson(empty);
      setNodes([]);
      setEdges([]);
    }
    setSelectedNodeId(null);
    setNameError(null);
  }, [workflowId, loadWorkflow, setEdges, setNodes]);

  const currentGraphJson = useMemo(() => stringifyWorkflowGraph(nodes, edges), [nodes, edges]);

  const isDirty = useCallback(() => {
    if (workflowName.trim() !== savedName.trim()) {
      return true;
    }
    return currentGraphJson !== savedGraphJson;
  }, [currentGraphJson, savedGraphJson, savedName, workflowName]);

  const filteredPrompts = useMemo(() => {
    const q = promptQuery.trim().toLowerCase();
    if (!q) {
      return prompts;
    }
    return prompts.filter(
      (p) => p.title.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q),
    );
  }, [promptQuery, prompts]);

  const filteredSkills = useMemo(() => {
    const q = skillQuery.trim().toLowerCase();
    if (!q) {
      return skills;
    }
    return skills.filter(
      (s) => s.name.toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q),
    );
  }, [skillQuery, skills]);

  const selectedNode = useMemo(
    () => (selectedNodeId ? (nodes.find((n) => n.id === selectedNodeId) ?? null) : null),
    [nodes, selectedNodeId],
  );

  const handleCanvasDrop = useCallback(
    ({
      flowPosition,
      dragData,
      targetParallelId,
    }: {
      flowPosition: { x: number; y: number };
      dragData: IWorkflowPaletteDragPayload;
      targetParallelId?: string;
    }) => {
      if (dragData.kind === 'prompt' && dragData.resourceId) {
        const prompt = prompts.find((p) => p.id === dragData.resourceId);
        const defaults = readWorkflowNodeDefaultValues();
        const newNode = createResourceNode({
          resourceKind: 'prompt',
          resourceId: dragData.resourceId,
          label: dragData.label,
          nodeName: dragData.label,
          systemPrompt: prompt?.systemPrompt,
          userPrompt: prompt?.userPrompt,
          executionModel: defaults.executionModel || undefined,
          kbCollectionId: defaults.kbCollectionId,
          workspacePaths: defaults.workspacePaths.length > 0 ? defaults.workspacePaths : undefined,
          position: flowPosition,
        });
        setNodes((nds) =>
          targetParallelId
            ? attachResourceNodeToParallel([...nds, newNode], targetParallelId, newNode.id)
            : [...nds, newNode],
        );
        return;
      }
      if (dragData.kind === 'skill' && dragData.resourceId) {
        const defaults = readWorkflowNodeDefaultValues();
        const newNode = createResourceNode({
          resourceKind: 'skill',
          resourceId: dragData.resourceId,
          label: dragData.label,
          nodeName: dragData.label,
          executionModel: defaults.executionModel || undefined,
          kbCollectionId: defaults.kbCollectionId,
          workspacePaths: defaults.workspacePaths.length > 0 ? defaults.workspacePaths : undefined,
          position: flowPosition,
        });
        setNodes((nds) =>
          targetParallelId
            ? attachResourceNodeToParallel([...nds, newNode], targetParallelId, newNode.id)
            : [...nds, newNode],
        );
        return;
      }
      if (dragData.kind === 'parallel') {
        setNodes((nds) => [
          ...nds,
          createParallelNode({ position: flowPosition, label: dragData.label ?? '并行节点' }),
        ]);
      }
    },
    [prompts, setNodes],
  );

  const handleNodeClick = useCallback(({ node }: IWorkflowEditorNodeEvent) => {
    if (isResourceNode(node)) {
      setSelectedNodeId(node.id);
    }
  }, []);

  const handleNodeEdit = useCallback(({ node }: IWorkflowEditorNodeEvent) => {
    if (isResourceNode(node)) {
      setSelectedNodeId(node.id);
    }
  }, []);

  const handleNodeDelete = useCallback(
    async ({ node }: IWorkflowEditorNodeEvent) => {
      if (!isResourceNode(node)) {
        return;
      }
      const data = node.data;
      const wfId = currentWorkflowIdRef.current;

      const finishRemove = () => {
        if (selectedNodeId === node.id) {
          setSelectedNodeId(null);
        }
        message.info(`已移除节点：${data.label || data.resourceId}`);
        return true;
      };

      if (!wfId) {
        return finishRemove();
      }

      const hasBusiness = await workflowHasBusinesses(wfId);
      if (!hasBusiness) {
        return finishRemove();
      }

      return new Promise<boolean>((resolve) => {
        modal.confirm({
          title: '删除节点',
          content: '删除当前节点后，保存时会删除当前节点所有的历史业务记录，是否继续？',
          okText: '继续',
          cancelText: '取消',
          onOk: () => resolve(finishRemove()),
          onCancel: () => resolve(false),
        });
      });
    },
    [message, modal, selectedNodeId],
  );

  const handleNodeUpdate = useCallback(
    (nodeId: string, patch: Partial<IWorkflowResourceNodeData>) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== nodeId) {
            return n;
          }
          return { ...n, data: { ...n.data, ...patch } };
        }),
      );
    },
    [setNodes],
  );

  const performSave = useCallback(async (): Promise<boolean> => {
    const trimmedName = workflowName.trim();
    const err = getSystemFileNameError(trimmedName);
    if (err) {
      setNameError(err);
      message.error(err);
      return false;
    }
    if (!isWorkflowReady) {
      message.warning('当前环境不支持工作流持久化（需桌面端 SQLite）');
      return false;
    }

    const chainValidation = validateWorkflowGraph(nodes, edges);
    if (!chainValidation.ok) {
      message.warning(chainValidation.message ?? '请将节点进行串联');
      return false;
    }

    for (const n of nodes) {
      if (!isResourceNode(n)) {
        continue;
      }
      const nodeName = n.data.nodeName?.trim() || n.data.label?.trim() || n.data.resourceId || '';
      const nodeErr = getSystemFileNameError(nodeName);
      if (nodeErr) {
        message.error(`节点「${n.data.label || nodeName}」：${nodeErr}`);
        return false;
      }
    }

    setIsSaving(true);
    try {
      const graphJson = currentGraphJson;
      let id = currentWorkflowIdRef.current;
      const prevName = savedName.trim();

      if (!id) {
        const created = await createWorkflowRecord({ name: trimmedName, graphJson });
        id = created.id;
        currentWorkflowIdRef.current = id;
        setWorkflow(created);
        useUIStore.setState({ activeWorkflowId: id });
        useWorkflowStore.getState().selectWorkflow(id);
        void useWorkflowStore.getState().fetchWorkflows();
      } else {
        await updateWorkflowRecord(id, { name: trimmedName, graphJson });
      }

      if (prevName && prevName !== trimmedName) {
        await renameWorkflowAgentDir(prevName, trimmedName);
      }
      await ensureWorkflowAgentDir(trimmedName);

      const oldGraph = parseWorkflowGraphJson(savedGraphJson);
      const oldNodeNames = new Map<string, string>();
      for (const n of oldGraph.nodes) {
        if (!isResourceNode(n)) {
          continue;
        }
        const name = n.data.nodeName?.trim() || n.data.label?.trim() || n.data.resourceId || '';
        oldNodeNames.set(n.id, name);
      }

      const newResourceNodeIds = new Set(
        nodes.filter(isResourceNode).map((resourceNode) => resourceNode.id),
      );
      const businesses = id ? await fetchBusinessList(id) : [];
      const businessIds = businesses.map((item) => item.id);

      for (const oldNode of oldGraph.nodes) {
        if (!isResourceNode(oldNode)) {
          continue;
        }
        if (newResourceNodeIds.has(oldNode.id)) {
          continue;
        }
        const removedNodeName =
          oldNode.data.nodeName?.trim() ||
          oldNode.data.label?.trim() ||
          oldNode.data.resourceId ||
          '';
        if (removedNodeName) {
          await deleteWorkflowNodeForAllBusinesses(trimmedName, removedNodeName);
          deleteWorkflowNodeChatForAllBusinesses(id!, businessIds, oldNode.id);
        }
      }

      for (const n of nodes) {
        if (!isResourceNode(n)) {
          continue;
        }
        const nodeName = n.data.nodeName?.trim() || n.data.label?.trim() || n.data.resourceId || '';
        const prevNodeName = oldNodeNames.get(n.id);
        if (prevNodeName && nodeName && prevNodeName !== nodeName) {
          await renameWorkflowNodeForAllBusinesses(trimmedName, prevNodeName, nodeName);
        }
      }

      setSavedName(trimmedName);
      setSavedGraphJson(graphJson);
      setWorkflowName(trimmedName);
      setNameError(null);
      message.success('已保存');
      return true;
    } catch (e) {
      console.error(e);
      message.error('保存失败');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [
    currentGraphJson,
    edges,
    isWorkflowReady,
    message,
    nodes,
    savedGraphJson,
    savedName,
    workflowName,
  ]);

  const discardChanges = useCallback(() => {
    setWorkflowName(savedName);
    const { nodes: n, edges: e } = parseWorkflowGraphJson(savedGraphJson);
    setNodes(n);
    setEdges(e);
    setSelectedNodeId(null);
    setNameError(null);
  }, [savedGraphJson, savedName, setEdges, setNodes]);

  const { confirmLeave, UnsavedLeaveDialog } = useUnsavedLeaveGuard({
    isDirty,
    onSave: performSave,
    onDiscard: discardChanges,
  });

  const setWorkflowEditorDirty = useUIStore((s) => s.setWorkflowEditorDirty);
  const registerWorkflowLeaveConfirm = useUIStore((s) => s.registerWorkflowLeaveConfirm);

  useEffect(() => {
    setWorkflowEditorDirty(isDirty());
  }, [isDirty, currentGraphJson, savedGraphJson, savedName, setWorkflowEditorDirty, workflowName]);

  useEffect(() => {
    registerWorkflowLeaveConfirm(confirmLeave);
    return () => {
      registerWorkflowLeaveConfirm(null);
      setWorkflowEditorDirty(false);
    };
  }, [confirmLeave, registerWorkflowLeaveConfirm, setWorkflowEditorDirty]);

  const handleRequestClose = useCallback(async () => {
    const canLeave = await confirmLeave();
    if (canLeave) {
      onClose();
    }
  }, [confirmLeave, onClose]);

  return (
    <>
      <div className={styles['workflow-studio']}>
        <div
          className={styles['workflow-studio-header']}
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
          <div className={styles['workflow-studio-name-wrap']}>
            <Input
              className={styles['workflow-studio-name']}
              status={nameError ? 'error' : undefined}
              onChange={(e) => {
                setWorkflowName(e.target.value);
                setNameError(null);
              }}
              placeholder={'工作流名称'}
              value={workflowName}
              styles={
                {
                  input: { WebkitAppRegion: 'no-drag' } as React.CSSProperties,
                  affixWrapper: { WebkitAppRegion: 'no-drag' } as React.CSSProperties,
                } as React.ComponentProps<typeof Input>['styles']
              }
            />
          </div>
          <div className={styles['workflow-studio-header-actions']}>
            <Button
              disabled={isSaving}
              icon={<SaveIcon className='h-4 w-4' />}
              loading={isSaving}
              onClick={() => void performSave()}
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
              type='primary'>
              {'保存'}
            </Button>
            <Button
              icon={<XIcon className='h-4 w-4' />}
              onClick={() => void handleRequestClose()}
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
              type='text'>
              {'关闭'}
            </Button>
          </div>
        </div>

        <div className={styles['workflow-studio-body']}>
          <aside className={styles['workflow-studio-palette']}>
            <Typography.Paragraph
              className={styles['workflow-studio-palette-hint']}
              type='secondary'>
              {'拖拽组件、提示词或技能到右侧画布编排'}
            </Typography.Paragraph>
            <Typography.Text className={styles['workflow-studio-palette-title']}>
              {'组件'}
            </Typography.Text>
            <ul className={styles['workflow-studio-palette-list']}>
              <li>
                <div
                  className={`${styles['workflow-studio-palette-item']} ${styles['workflow-studio-palette-item--draggable']}`}
                  draggable
                  onDragStart={(e) =>
                    setPaletteDragData(e, { kind: 'parallel', label: '并行节点' })
                  }>
                  {'并行节点'}
                </div>
              </li>
            </ul>
            <Typography.Text className={styles['workflow-studio-palette-title']}>
              {'提示词'}
            </Typography.Text>
            <Input
              allowClear
              className={styles['workflow-studio-palette-search']}
              onChange={(e) => setPromptQuery(e.target.value)}
              placeholder={'搜索提示词…'}
              value={promptQuery}
            />
            <ul className={styles['workflow-studio-palette-list']}>
              {filteredPrompts.slice(0, 80).map((p) => (
                <li key={p.id}>
                  <div
                    className={`${styles['workflow-studio-palette-item']} ${styles['workflow-studio-palette-item--draggable']}`}
                    draggable
                    onDragStart={(e) =>
                      setPaletteDragData(e, {
                        kind: 'prompt',
                        resourceId: p.id,
                        label: p.title,
                      })
                    }>
                    {p.title}
                  </div>
                </li>
              ))}
            </ul>

            <Typography.Text className={styles['workflow-studio-palette-title']}>
              {'技能'}
            </Typography.Text>
            <Input
              allowClear
              className={styles['workflow-studio-palette-search']}
              onChange={(e) => setSkillQuery(e.target.value)}
              placeholder={'搜索技能…'}
              value={skillQuery}
            />
            <ul className={styles['workflow-studio-palette-list']}>
              {filteredSkills.slice(0, 80).map((s) => (
                <li key={s.id}>
                  <div
                    className={`${styles['workflow-studio-palette-item']} ${styles['workflow-studio-palette-item--draggable']}`}
                    draggable
                    onDragStart={(e) =>
                      setPaletteDragData(e, {
                        kind: 'skill',
                        resourceId: s.id,
                        label: s.name,
                      })
                    }>
                    {s.name}
                  </div>
                </li>
              ))}
            </ul>
          </aside>

          <div className={styles['workflow-studio-canvas-wrap']}>
            <WorkflowEditor
              edges={edges}
              fitViewOnMount
              nodes={nodes}
              onCanvasDrop={handleCanvasDrop}
              onEdgesChange={setEdges}
              onNodeClick={handleNodeClick}
              onNodeDelete={handleNodeDelete}
              onNodeEdit={handleNodeEdit}
              onNodesChange={setNodes}
              panelHint={'点击节点编辑属性；并行节点可拖入未连线节点'}
            />
            {selectedNode && isResourceNode(selectedNode) ? (
              <WorkflowNodeEditPanel
                key={selectedNode.id}
                aiModels={aiModels}
                node={selectedNode}
                prompts={prompts}
                skills={skills}
                onClose={() => setSelectedNodeId(null)}
                onUpdate={handleNodeUpdate}
              />
            ) : null}
          </div>
        </div>
      </div>
      <UnsavedLeaveDialog />
    </>
  );
}
