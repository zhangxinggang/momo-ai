import { App } from 'antd';
import { useCallback, useRef } from 'react';

import {
  hasActiveAiChatGeneration,
  type EAiChatGenerationScope,
} from '@renderer/services/aichat/generation-activity';

export interface IConfirmLeaveAiChatOptions {
  /** 仅检查指定业务入口；省略时检查应用内全部 AI 入口。 */
  scope?: EAiChatGenerationScope;
  /** 调用方已掌握更及时的生成状态时可显式传入。 */
  isGenerating?: boolean;
}

/** AI 正在回复时，统一确认是否离开当前对话。 */
export function useConfirmLeaveAiChat() {
  const { modal } = App.useApp();
  const pendingRef = useRef<Promise<boolean> | null>(null);

  return useCallback(
    (options: IConfirmLeaveAiChatOptions = {}): Promise<boolean> => {
      const isGenerating = options.isGenerating ?? hasActiveAiChatGeneration(options.scope);
      if (!isGenerating) {
        return Promise.resolve(true);
      }
      if (pendingRef.current) {
        return pendingRef.current;
      }

      const pending = new Promise<boolean>((resolve) => {
        modal.confirm({
          title: 'AI 正在回答',
          content: '当前对话仍在生成回复，是否确认离开？',
          okText: '离开',
          cancelText: '继续对话',
          okButtonProps: { danger: true },
          onOk: () => resolve(true),
          onCancel: () => resolve(false),
        });
      }).finally(() => {
        pendingRef.current = null;
      });

      pendingRef.current = pending;
      return pending;
    },
    [modal],
  );
}
