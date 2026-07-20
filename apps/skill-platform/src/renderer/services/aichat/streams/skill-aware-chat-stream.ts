import type { IChatStreamMessage, TCallAiChatStream } from '@momo/aichat';

import { isProductDesignOrConsultIntent } from '../intent/product-design';
import {
  createSkillLangGraphStream,
  type ISkillLangGraphStreamOptions,
} from '../skill/stream';
import {
  createGeneralChatStream,
  type IGeneralChatStreamOptions,
} from './general-chat-stream';

export interface ISkillAwareChatStreamOptions {
  general: IGeneralChatStreamOptions;
  skill: ISkillLangGraphStreamOptions;
  /** 有选中技能时走 SKILL LangGraph，否则走通用对话 */
  getActiveSkillId: () => string | null;
}

function getLastUserText(messages: IChatStreamMessage[]): string {
  return [...messages].reverse().find((item) => item.role === 'user')?.content?.trim() ?? '';
}

/** 通用对话与技能对话共用：按是否选中技能切换执行链路 */
export function createSkillAwareChatStream(
  options: ISkillAwareChatStreamOptions,
): TCallAiChatStream {
  const generalStream = createGeneralChatStream(options.general);
  const skillStream = createSkillLangGraphStream(options.skill);

  return async (
    messages: IChatStreamMessage[],
    onChunk,
    onError,
    onStats,
    modelKey,
    streamOptions,
  ) => {
    const lastUserText = getLastUserText(messages);
    const hasActiveSkill = Boolean(options.getActiveSkillId()?.trim());
    // 产品/功能设计咨询优先走通用对话 + 工作区检索，避免误入技能脚本执行
    const preferGeneral =
      !hasActiveSkill || isProductDesignOrConsultIntent(lastUserText);

    if (!preferGeneral) {
      await skillStream(messages, onChunk, onError, onStats, modelKey, streamOptions);
      return;
    }
    await generalStream(messages, onChunk, onError, onStats, modelKey, streamOptions);
  };
}
