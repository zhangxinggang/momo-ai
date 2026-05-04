import { createContext, useContext } from 'react';

import type { IWorkflowEditorNodeEvent } from './types';

export interface IWorkflowEditorContextValue {
  onNodeEdit?: (payload: IWorkflowEditorNodeEvent) => void;
  onNodeDelete?: (payload: IWorkflowEditorNodeEvent) => void;
  removeNodeById: (nodeId: string) => void;
  readOnly: boolean;
}

export const WorkflowEditorContext = createContext<IWorkflowEditorContextValue | null>(null);

export function useWorkflowEditorContext(): IWorkflowEditorContextValue {
  const ctx = useContext(WorkflowEditorContext);
  if (!ctx) {
    throw new Error('useWorkflowEditorContext 必须在 WorkflowEditor 内使用');
  }
  return ctx;
}
