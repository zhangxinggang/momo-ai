import { useCallback } from 'react';

import type { EAiChatGenerationScope } from '@renderer/services/aichat/generation-activity';

export interface IConfirmLeaveAiChatOptions {
  /** 仅检查指定业务入口；省略时检查应用内全部 AI 入口。 */
  scope?: EAiChatGenerationScope;
  /** 调用方已掌握更及时的生成状态时可显式传入。 */
  isGenerating?: boolean;
}

/** 菜单和会话切换不打断后台生成；保留调用接口供各业务入口共用。 */
export function useConfirmLeaveAiChat() {
  return useCallback((_options: IConfirmLeaveAiChatOptions = {}): Promise<boolean> => {
    return Promise.resolve(true);
  }, []);
}
