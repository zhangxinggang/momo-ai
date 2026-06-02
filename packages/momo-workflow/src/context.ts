import { createContext, useContext } from 'react';

import type { IWorkflowEditorNodeEvent } from './types';

export interface IWorkflowEditorContextValue {
  onNodeEdit?: (payload: IWorkflowEditorNodeEvent) => void;
  onNodeDelete?: (payload: IWorkflowEditorNodeEvent) => boolean | Promise<boolean | void> | void;
  removeNodeById: (nodeId: string) => void;
  readOnly: boolean;
  /** 并行容器拖入高亮状态 */
  parallelDropState: { parallelId: string; kind: 'valid' | 'invalid' } | null;
  setParallelDropHighlight: (parallelId: string, kind: 'valid' | 'invalid') => void;
  clearParallelDropHighlight: () => void;
  attachNodeToParallel: (parallelId: string, childId: string) => void;
}

export const WorkflowEditorContext = createContext<IWorkflowEditorContextValue | null>(null);

export function useWorkflowEditorContext(): IWorkflowEditorContextValue {
  const ctx = useContext(WorkflowEditorContext);
  if (!ctx) {
    throw new Error('useWorkflowEditorContext 必须在 WorkflowEditor 内使用');
  }
  return ctx;
}
