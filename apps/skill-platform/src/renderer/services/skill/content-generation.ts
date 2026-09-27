import { getBuiltinSkillPrompt } from '@/shared/builtin-skills';
import type { IAIConfig, IChatMessage, IStreamCallbacks } from '@renderer/services/ai/types';
import { chatCompletion } from '../ai/chat';

/** 使用 AI 生成 SKILL.md 内容 */
export async function generateSkillContent(
  config: IAIConfig,
  skillName: string,
  skillPurpose: string,
  streamCallbacks?: IStreamCallbacks,
  customSystemPrompt?: string,
): Promise<string> {
  const userPrompt = getBuiltinSkillPrompt('skillCreatorInput', { skillName, skillPurpose });

  const systemPrompt = customSystemPrompt || getBuiltinSkillPrompt('skillCreator');
  const messages: IChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  const result = await chatCompletion(config, messages, {
    temperature: 0.7,
    maxTokens: 4096,
    stream: !!streamCallbacks,
    streamCallbacks,
  });

  return result.content;
}

/** AI 润色 SKILL.md 内容 */
export async function polishSkillContent(
  config: IAIConfig,
  existingContent: string,
  skillName?: string,
  streamCallbacks?: IStreamCallbacks,
): Promise<string> {
  const userPrompt = getBuiltinSkillPrompt('skillPolisherInput', {
    skillNameLine: skillName ? '**ISkill Name**: ' + skillName + '\n' : '',
    existingContent,
  });

  const messages: IChatMessage[] = [
    { role: 'system', content: getBuiltinSkillPrompt('skillPolisher') },
    { role: 'user', content: userPrompt },
  ];

  const result = await chatCompletion(config, messages, {
    temperature: 0.4,
    maxTokens: 4096,
    stream: !!streamCallbacks,
    streamCallbacks,
  });

  return result.content;
}
