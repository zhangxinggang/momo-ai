import { useEffect } from 'react';

import { WorkflowListView } from '@renderer/components/Workflow/WorkflowListView';
import { useUIStore } from '@renderer/store';

/**
 * 工作流模块入口：列表视图（编辑/工作在 WorkflowModalsHost）
 */
export function WorkflowManager() {
  useEffect(() => {
    useUIStore.getState().resumeWorkflowStudioIfPending();
  }, []);

  return <WorkflowListView />;
}
