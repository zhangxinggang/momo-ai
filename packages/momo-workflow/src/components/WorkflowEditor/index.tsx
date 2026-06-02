import '@xyflow/react/dist/style.css';

import type {
  Connection,
  Edge,
  Node,
  NodeMouseHandler,
  OnNodeDrag,
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
  isPaletteDragEvent,
  WORKFLOW_DRAG_MIME,
  WORKFLOW_NODE_TYPE_END,
  WORKFLOW_NODE_TYPE_PARALLEL,
  WORKFLOW_NODE_TYPE_PROMPT,
  WORKFLOW_NODE_TYPE_SKILL,
  WORKFLOW_NODE_TYPE_START,
  type IProps,
  type IWorkflowPaletteDragPayload,
} from '../../types';
import {
  attachResourceNodeToParallel,
  findParallelNodeAtPoint,
  getParallelSize,
  isFreeResourceNode,
  isParallelNode,
  isResourceNode,
  RESOURCE_NODE_HEIGHT,
  RESOURCE_NODE_WIDTH,
} from '../../utils/parallel-graph';
import { ParallelGroupNode } from '../ParallelGroupNode';
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
  [WORKFLOW_NODE_TYPE_PARALLEL]: memo(ParallelGroupNode),
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

function getAbsolutePosition(node: Node, nodeById: Map<string, Node>): { x: number; y: number } {
  if (!node.parentId) {
    return node.position;
  }
  const parent = nodeById.get(node.parentId);
  if (!parent) {
    return node.position;
  }
  const parentAbs = getAbsolutePosition(parent, nodeById);
  return {
    x: parentAbs.x + node.position.x,
    y: parentAbs.y + node.position.y,
  };
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
  const [parallelDropState, setParallelDropState] = useState<{
    parallelId: string;
    kind: 'valid' | 'invalid';
  } | null>(null);

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
      setNodes((nds) => {
        const target = nds.find((n) => n.id === nodeId);
        const childIdsToRemove =
          target && isParallelNode(target) ? [...(target.data.childNodeIds ?? [])] : [];
        const removeIds = new Set([nodeId, ...childIdsToRemove]);
        return nds
          .filter((n) => !removeIds.has(n.id))
          .map((n) => {
            if (!isParallelNode(n)) {
              return n;
            }
            const nextChildIds = (n.data.childNodeIds ?? []).filter((id) => !removeIds.has(id));
            if (nextChildIds.length === (n.data.childNodeIds ?? []).length) {
              return n;
            }
            const size = getParallelSize(nextChildIds.length);
            return {
              ...n,
              data: { ...n.data, childNodeIds: nextChildIds },
              style: { ...n.style, width: size.width, height: size.height },
            };
          });
      });
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    },
    [setEdges, setNodes],
  );

  const attachNodeToParallel = useCallback(
    (parallelId: string, childId: string) => {
      setNodes((nds) => attachResourceNodeToParallel(nds, parallelId, childId));
    },
    [setNodes],
  );

  const setParallelDropHighlight = useCallback((parallelId: string, kind: 'valid' | 'invalid') => {
    setParallelDropState({ parallelId, kind });
  }, []);

  const clearParallelDropHighlight = useCallback(() => {
    setParallelDropState(null);
  }, []);

  const detachNodeFromParallel = useCallback(
    (childId: string) => {
      setNodes((nds) => {
        const child = nds.find((n) => n.id === childId);
        if (!child?.parentId) {
          return nds;
        }
        const parallelId = child.parentId;
        const parallel = nds.find((n) => n.id === parallelId);
        const parentPos = parallel?.position ?? { x: 0, y: 0 };
        const absPos = {
          x: parentPos.x + child.position.x + 24,
          y: parentPos.y + child.position.y + 24,
        };

        return nds.map((n) => {
          if (n.id === parallelId && isParallelNode(n)) {
            const nextChildIds = (n.data.childNodeIds ?? []).filter((id) => id !== childId);
            const size = getParallelSize(nextChildIds.length);
            return {
              ...n,
              data: { ...n.data, childNodeIds: nextChildIds },
              style: { ...n.style, width: size.width, height: size.height },
            };
          }
          if (n.id === childId) {
            const nextNode: Node = {
              ...n,
              position: absPos,
            };
            delete nextNode.parentId;
            delete nextNode.extent;
            return nextNode;
          }
          return n;
        });
      });
    },
    [setNodes],
  );

  const contextValue = useMemo(
    () => ({
      onNodeEdit,
      onNodeDelete,
      removeNodeById,
      readOnly,
      parallelDropState,
      setParallelDropHighlight,
      clearParallelDropHighlight,
      attachNodeToParallel,
    }),
    [
      attachNodeToParallel,
      clearParallelDropHighlight,
      onNodeDelete,
      onNodeEdit,
      parallelDropState,
      readOnly,
      removeNodeById,
      setParallelDropHighlight,
    ],
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
      const sourceNode = nodes.find((n) => n.id === params.source);
      const targetNode = nodes.find((n) => n.id === params.target);
      if (sourceNode?.parentId || targetNode?.parentId) {
        return;
      }
      const hasIncoming = edges.some((e) => e.target === params.target);
      const hasOutgoing = edges.some((e) => e.source === params.source);
      if (hasIncoming || hasOutgoing) {
        return;
      }
      setEdges((eds) => addEdge({ ...params, animated: true }, eds));
    },
    [edges, nodes, readOnly, setEdges],
  );

  const handleNodeClick: NodeMouseHandler = useCallback(
    (event, node) => {
      onNodeClick?.({ event: event as unknown as MouseEvent, node });
    },
    [onNodeClick],
  );

  const handleNodeDrag: OnNodeDrag = useCallback(
    (_, draggedNode) => {
      if (readOnly || !isResourceNode(draggedNode)) {
        setParallelDropState(null);
        return;
      }

      const nodeById = new Map(nodes.map((n) => [n.id, n]));
      const abs = getAbsolutePosition(draggedNode, nodeById);
      const center = {
        x: abs.x + RESOURCE_NODE_WIDTH / 2,
        y: abs.y + RESOURCE_NODE_HEIGHT / 2,
      };

      const parallel = findParallelNodeAtPoint(nodes, center);
      if (parallel) {
        if (draggedNode.parentId === parallel.id) {
          setParallelDropState({ parallelId: parallel.id, kind: 'valid' });
          return;
        }
        const canDrop = isFreeResourceNode(nodes, edges, draggedNode.id);
        setParallelDropState({
          parallelId: parallel.id,
          kind: canDrop ? 'valid' : 'invalid',
        });
        return;
      }
      setParallelDropState(null);
    },
    [edges, nodes, readOnly],
  );

  const handleNodeDragStop: NodeMouseHandler = useCallback(
    (_, draggedNode) => {
      setParallelDropState(null);
      if (readOnly || !isResourceNode(draggedNode)) {
        return;
      }

      const nodeById = new Map(nodes.map((n) => [n.id, n]));
      const abs = getAbsolutePosition(draggedNode, nodeById);
      const center = {
        x: abs.x + RESOURCE_NODE_WIDTH / 2,
        y: abs.y + RESOURCE_NODE_HEIGHT / 2,
      };

      const parallel = findParallelNodeAtPoint(nodes, center);
      if (parallel) {
        if (
          draggedNode.parentId !== parallel.id &&
          isFreeResourceNode(nodes, edges, draggedNode.id)
        ) {
          attachNodeToParallel(parallel.id, draggedNode.id);
        }
        return;
      }

      if (draggedNode.parentId) {
        detachNodeFromParallel(draggedNode.id);
      }
    },
    [attachNodeToParallel, detachNodeFromParallel, edges, nodes, readOnly],
  );

  const handleDragOver = useCallback(
    (event: DragEvent) => {
      if (readOnly || !onCanvasDrop) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';

      if (!isPaletteDragEvent(event)) {
        return;
      }

      const instance = reactFlowRef.current;
      if (!instance) {
        return;
      }
      const flowPosition = instance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const parallel = findParallelNodeAtPoint(nodes, flowPosition);
      if (parallel) {
        setParallelDropState({ parallelId: parallel.id, kind: 'valid' });
      } else {
        setParallelDropState(null);
      }
    },
    [nodes, onCanvasDrop, readOnly],
  );

  const handleDrop = useCallback(
    (event: DragEvent) => {
      if (readOnly || !onCanvasDrop) return;
      event.preventDefault();
      setParallelDropState(null);
      const dragData = parseDragPayload(event);
      if (!dragData) return;
      const instance = reactFlowRef.current;
      if (!instance) return;
      const flowPosition = instance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const parallel = findParallelNodeAtPoint(nodes, flowPosition);
      onCanvasDrop({
        flowPosition,
        dragData,
        targetParallelId: parallel?.id,
      });
    },
    [nodes, onCanvasDrop, readOnly],
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
          onNodeDrag={handleNodeDrag}
          onNodeDragStop={handleNodeDragStop}
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
