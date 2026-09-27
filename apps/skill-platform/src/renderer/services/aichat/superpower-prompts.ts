import { getBuiltinSkillPrompt } from '@/shared/builtin-skills';

/** 每次使用时读取当前加载的内置规则。 */
export const SUPERPOWER_PROMPTS = {
  get workflow() {
    return getBuiltinSkillPrompt('chatSuperpowers');
  },
};
