import { getBuiltinSkillPrompt } from '@/shared/builtin-skills';

/** 约束模型紧扣用户问题，避免被附加上下文带偏 */
export const ANSWER_FOCUS_SYSTEM_PROMPT = getBuiltinSkillPrompt('chatAnswerFocus');
