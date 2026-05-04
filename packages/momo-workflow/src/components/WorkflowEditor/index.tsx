import '@xyflow/react/dist/style.css';

import type {
  Connection,
  Edge,
  Node,
  NodeMouseHandler,
  OnNodesDelete,
  ReactFlowInstance,
} from '@xyflow/react';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  MiniMap,
  Panel,
  ReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type MouseEvent,
} from 'react';

import { WorkflowEditorContext } from '../../context';
import {
  WORKFLOW_DRAG_MIME,
  WORKFLOW_NODE_TYPE_END,
  WORKFLOW_NODE_TYPE_PROMPT,
  WORKFLOW_NODE_TYPE_SKILL,
  WORKFLOW_NODE_TYPE_START,
  type IProps,
  type IWorkflowPaletteDragPayload,
} from '../../types';
import { PromptResourceNode, SkillResourceNode } from '../ResourceNode';
import { EndTerminalNode, StartTerminalNode } from '../TerminalNode';
import styles from './index.module.less';

const defaultEdgeOptions = {
  markerEnd: { type: MarkerType.ArrowClosed },
  style: { strokeWidth: 2 },
};

const builtInNodeTypes = {
  [WORKFLOW_NODE_TYPE_PROMPT]: memo(PromptResourceNode),
  [WORKFLOW_NODE_TYPE_SKILL]: memo(SkillResourceNode),
  [WORKFLOW_NODE_TYPE_START]: memo(StartTerminalNode),
  [WORKFLOW_NODE_TYPE_END]: memo(EndTerminalNode),
};

function parseDragPayload(event: DragEvent): IWorkflowPaletteDragPayload | null {
  const raw = event.dataTransfer.getData(WORKFLOW_DRAG_MIME);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as IWorkflowPaletteDragPayload;
  } catch {
    return null;
  }
}

function WorkflowEditorInner({
  className,
  nodes: controlledNodes,
  edges: controlledEdges,
  onNodesChange,
  onEdgesChange,
  onGraphChange,
  onNodeClick,
  onNodeDelete,
  onNodeEdit,
  readOnly = false,
  panelHint,
  showMiniMap = true,
  nodeTypes: extraNodeTypes,
  onCanvasDrop,
  fitViewOnMount = false,
}: IProps) {
  const reactFlowRef = useRef<ReactFlowInstance | null>(null);
  const hasFittedViewRef = useRef(false);
  const [internalNodes, setInternalNodes] = useState<Node[]>([]);
  const [internalEdges, setInternalEdges] = useState<Edge[]>([]);

  const isControlled = controlledNodes !== undefined && controlledEdges !== undefined;
  const nodes = isControlled ? controlledNodes : internalNodes;
  const edges = isControlled ? controlledEdges : internalEdges;

  const setNodes = useCallback(
    (updater: Node[] | ((prev: Node[]) => Node[])) => {
      const next = typeof updater === 'function' ? updater(nodes) : updater;
      if (!isControlled) {
        setInternalNodes(next);
      }
      onNodesChange?.(next);
      onGraphChange?.({ nodes: next, edges });
    },
    [edges, isControlled, nodes, onGraphChange, onNodesChange],
  );

  const setEdges = useCallback(
    (updater: Edge[] | ((prev: Edge[]) => Edge[])) => {
      const next = typeof updater === 'function' ? updater(edges) : updater;
      if (!isControlled) {
        setInternalEdges(next);
      }
      onEdgesChange?.(next);
      onGraphChange?.({ nodes, edges: next });
    },
    [edges, isControlled, nodes, onGraphChange, onEdgesChange],
  );

  const removeNodeById = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    },
    [setEdges, setNodes],
  );

  const contextValue = useMemo(
    () => ({
      onNodeEdit,
      onNodeDelete,
      removeNodeById,
      readOnly,
    }),
    [onNodeDelete, onNodeEdit, readOnly, removeNodeById],
  );

  const mergedNodeTypes = useMemo(
    () => ({
      ...builtInNodeTypes,
      ...extraNodeTypes,
    }),
    [extraNodeTypes],
  );

  const handleNodesChange = useCallback(
    (changes: Parameters<typeof applyNodeChanges>[0]) => {
      if (readOnly) return;
      const next = applyNodeChanges(changes, nodes);
      setNodes(next);
    },
    [nodes, readOnly, setNodes],
  );

  const handleEdgesChange = useCallback(
    (changes: Parameters<typeof applyEdgeChanges>[0]) => {
      if (readOnly) return;
      const next = applyEdgeChanges(changes, edges);
      setEdges(next);
    },
    [edges, readOnly, setEdges],
  );

  const handleConnect = useCallback(
    (params: Connection) => {
      if (readOnly) return;
      // 每个节点最多一条入边、一条出边
      const hasIncoming = edges.some((e) => e.target === params.target);
      const hasOutgoing = edges.some((e) => e.source === params.source);
      if (hasIncoming || hasOutgoing) {
        return;
      }
      setEdges((eds) => addEdge({ ...params, animated: true }, eds));
    },
    [edges, readOnly, setEdges],
  );

  const handleNodeClick: NodeMouseHandler = useCallback(
    (event, node) => {
      onNodeClick?.({ event: event as unknown as MouseEvent, node });
    },
    [onNodeClick],
  );

  const handleDragOver = useCallback(
    (event: DragEvent) => {
      if (readOnly || !onCanvasDrop) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    },
    [onCanvasDrop, readOnly],
  );

  const handleDrop = useCallback(
    (event: DragEvent) => {
      if (readOnly || !onCanvasDrop) return;
      event.preventDefault();
      const dragData = parseDragPayload(event);
      if (!dragData) return;
      const instance = reactFlowRef.current;
      if (!instance) return;
      const flowPosition = instance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      onCanvasDrop({ flowPosition, dragData });
    },
    [onCanvasDrop, readOnly],
  );

  const handleNodesDelete: OnNodesDelete = useCallback(
    (deleted) => {
      for (const node of deleted) {
        onNodeDelete?.({
          event: { stopPropagation: () => {} } as MouseEvent,
          node,
        });
      }
    },
    [onNodeDelete],
  );

  const rootClassName = className
    ? `${styles['workflow-editor']} ${className}`
    : styles['workflow-editor'];

  useEffect(() => {
    if (!fitViewOnMount || hasFittedViewRef.current || nodes.length === 0) {
      return;
    }
    const instance = reactFlowRef.current;
    if (!instance) {
      return;
    }
    hasFittedViewRef.current = true;
    requestAnimationFrame(() => {
      void instance.fitView({
        padding: 0.28,
        maxZoom: 0.92,
        minZoom: 0.35,
        duration: 180,
      });
    });
  }, [fitViewOnMount, nodes]);

  return (
    <WorkflowEditorContext.Provider value={contextValue}>
      <div className={rootClassName}>
        <ReactFlow
          defaultEdgeOptions={defaultEdgeOptions}
          defaultViewport={{ x: 0, y: 0, zoom: 0.9 }}
          edges={edges}
          minZoom={0.25}
          maxZoom={1.5}
          nodeTypes={mergedNodeTypes}
          nodes={nodes}
          onInit={(instance) => {
            reactFlowRef.current = instance;
            if (fitViewOnMount && !hasFittedViewRef.current && nodes.length > 0) {
              hasFittedViewRef.current = true;
              requestAnimationFrame(() => {
                void instance.fitView({
                  padding: 0.28,
                  maxZoom: 0.92,
                  minZoom: 0.35,
                  duration: 180,
                });
              });
            }
          }}
          nodesConnectable={!readOnly}
          nodesDraggable={!readOnly}
          onConnect={handleConnect}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onEdgesChange={handleEdgesChange}
          onNodeClick={handleNodeClick}
          onNodesChange={handleNodesChange}
          onNodesDelete={readOnly ? undefined : handleNodesDelete}
          deleteKeyCode={readOnly ? null : ['Backspace', 'Delete']}>
          <Background gap={20} variant={BackgroundVariant.Dots} />
          <Controls />
          {showMiniMap ? <MiniMap pannable zoomable /> : null}
          {panelHint ? (
            <Panel position='top-right'>
              <span className={styles['workflow-editor-panel-hint']}>{panelHint}</span>
            </Panel>
          ) : null}
        </ReactFlow>
      </div>
    </WorkflowEditorContext.Provider>
  );
}

export function WorkflowEditor(props: IProps) {
  return (
    <ReactFlowProvider>
      <WorkflowEditorInner {...props} />
    </ReactFlowProvider>
  );
}
