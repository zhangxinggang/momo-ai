import { GitBranchIcon } from 'lucide-react';
import { useEffect } from 'react';

import { ModuleEmptyState } from '@renderer/components/ui/ModuleEmptyState';
import { WorkflowBusinessListView } from '@renderer/components/Workflow/WorkflowBusinessListView';
import { useUIStore, useWorkflowStore } from '@renderer/store';

/**
 * 工作流模块入口：侧栏选中工作流后展示业务列表
 */
export function WorkflowManager() {
  const selectedWorkflowId = useWorkflowStore((s) => s.selectedWorkflowId);
  const workflowScreen = useUIStore((s) => s.workflowScreen);

  useEffect(() => {
    useUIStore.getState().resumeWorkflowStudioIfPending();
  }, []);

  if (workflowScreen === 'studio') {
    return null;
  }

  if (!selectedWorkflowId) {
    return (
      <ModuleEmptyState
        centered
        description='从侧栏选择已有工作流，或点击新建工作流开始编排'
        icon={GitBranchIcon}
        title='在左侧选择或新建工作流'
      />
    );
  }

  return <WorkflowBusinessListView workflowId={selectedWorkflowId} />;
}
