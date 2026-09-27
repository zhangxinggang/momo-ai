import { App } from 'antd';
import { useCallback } from 'react';

import { useUIStore } from '@renderer/store';
import {
  isSkillEditorDirty,
  skillEditorDirtyLeaveConfirmFields,
} from '@renderer/utils/skill/editor-dirty';
import { useConfirmLeaveAiChat } from './useConfirmLeaveAiChat';

interface IConfirmLeaveAllOptions {
  /** 当前操作是否真的会离开正在展示的 AI 入口。 */
  checkAiChat?: boolean;
}

/**
 * 离开页面前统一确认：生成中的 AI 对话 + 技能文件编辑器。
 */
export function useConfirmLeaveEditors() {
  const { modal } = App.useApp();
  const confirmLeaveAiChat = useConfirmLeaveAiChat();

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

  const confirmLeaveAllEditors = useCallback(
    async (options: IConfirmLeaveAllOptions = {}): Promise<boolean> => {
      if (options.checkAiChat !== false) {
        const scope = useUIStore.getState().viewMode;
        const chatOk = await confirmLeaveAiChat({ scope });
        if (!chatOk) {
          return false;
        }
      }

      return confirmLeaveDirtySkillEditor();
    },
    [confirmLeaveAiChat, confirmLeaveDirtySkillEditor],
  );

  return {
    confirmLeaveAllEditors,
    confirmLeaveDirtySkillEditor,
  };
}
