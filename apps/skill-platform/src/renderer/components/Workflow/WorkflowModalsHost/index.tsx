import clsx from 'clsx';

import { WorkflowStudio } from '@renderer/components/Workflow/WorkflowStudio';
import { WorkflowWorkPage } from '@renderer/components/Workflow/WorkflowWorkPage';
import { useUIStore } from '@renderer/store';
import styles from './index.module.less';

/**
 * 工作流全屏层宿主：Studio 使用 overlay；工作页使用 FullscreenModal
 */
export function WorkflowModalsHost() {
  const workflowScreen = useUIStore((s) => s.workflowScreen);
  const activeWorkflowId = useUIStore((s) => s.activeWorkflowId);
  const openWorkflowList = useUIStore((s) => s.openWorkflowList);

  const isStudioOpen = workflowScreen === 'studio';
  const isWorkOpen = workflowScreen === 'work' && Boolean(activeWorkflowId);
  const studioKey = activeWorkflowId ?? 'new';

  return (
    <>
      <div
        className={clsx(
          styles['workflow-modals-host'],
          isStudioOpen && styles['workflow-modals-host--open'],
        )}>
        {isStudioOpen ? (
          <div className={styles['workflow-modals-overlay']}>
            <WorkflowStudio
              key={`studio-${studioKey}`}
              onClose={openWorkflowList}
              workflowId={activeWorkflowId}
            />
          </div>
        ) : null}
      </div>
      {isWorkOpen && activeWorkflowId ? (
        <WorkflowWorkPage
          key={`work-${activeWorkflowId}`}
          onClose={openWorkflowList}
          workflowId={activeWorkflowId}
        />
      ) : null}
    </>
  );
}
