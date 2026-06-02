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
  const activeBusinessId = useUIStore((s) => s.activeBusinessId);
  const closeWorkflowStudio = useUIStore((s) => s.closeWorkflowStudio);
  const closeWorkflowBusinessWork = useUIStore((s) => s.closeWorkflowBusinessWork);

  const isStudioOpen = workflowScreen === 'studio';
  const isBusinessWorkOpen =
    workflowScreen === 'business-work' && Boolean(activeWorkflowId) && Boolean(activeBusinessId);
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
              onClose={closeWorkflowStudio}
              workflowId={activeWorkflowId}
            />
          </div>
        ) : null}
      </div>
      {isBusinessWorkOpen && activeWorkflowId && activeBusinessId ? (
        <WorkflowWorkPage
          key={`work-${activeWorkflowId}-${activeBusinessId}`}
          businessId={activeBusinessId}
          onClose={closeWorkflowBusinessWork}
          workflowId={activeWorkflowId}
        />
      ) : null}
    </>
  );
}
