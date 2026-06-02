import { App } from 'antd';
import { useCallback } from 'react';

import { useUIStore } from '@renderer/store';
import {
  isSkillEditorDirty,
  skillEditorDirtyLeaveConfirmFields,
} from '@renderer/utils/skill/editor-dirty';

/**
 * 离开页面前统一确认：工作流编辑器（三按钮）+ 技能文件编辑器（两按钮）
 */
export function useConfirmLeaveEditors() {
  const { modal } = App.useApp();

  const confirmLeaveDirtySkillEditor = useCallback((): Promise<boolean> => {
    if (!isSkillEditorDirty()) {
      return Promise.resolve(true);
    }
    return new Promise((resolve) => {
      modal.confirm({
        ...skillEditorDirtyLeaveConfirmFields,
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });
  }, [modal]);

  const confirmLeaveWorkflowEditor = useCallback(async (): Promise<boolean> => {
    const state = useUIStore.getState();
    if (state.workflowScreen === 'business-work') {
      state.closeWorkflowBusinessWork();
    }
    if (state.workflowScreen !== 'studio') {
      return true;
    }
    const ok = await state.confirmWorkflowLeave();
    if (ok) {
      state.closeWorkflowStudio();
    }
    return ok;
  }, []);

  const confirmLeaveAllEditors = useCallback(async (): Promise<boolean> => {
    const workflowOk = await confirmLeaveWorkflowEditor();
    if (!workflowOk) {
      return false;
    }
    return confirmLeaveDirtySkillEditor();
  }, [confirmLeaveDirtySkillEditor, confirmLeaveWorkflowEditor]);

  return {
    confirmLeaveAllEditors,
    confirmLeaveWorkflowEditor,
    confirmLeaveDirtySkillEditor,
  };
}
