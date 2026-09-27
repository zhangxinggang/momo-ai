import { getBuiltinSkillPrompt } from '@/main/services/builtin-skills';
import type { DRuleRewriteRequest, IRuleRewriteResult } from '@/types/modules/rules';
import type { ISafetyScanAiConfig } from '@/types/modules/skill';

import { chatCompletion } from '../ai/client';

export function buildRuleRewritePrompt(payload: DRuleRewriteRequest): string {
  return getBuiltinSkillPrompt('rulesRewriteInput', {
    platformName: payload.platformName,
    fileName: payload.fileName,
    instruction: payload.instruction.trim(),
    currentContent: payload.currentContent.trim() || '(empty)',
  });
}

/** 使用 AI 改写规则文件内容 */
export async function rewriteRuleWithAi(payload: DRuleRewriteRequest): Promise<IRuleRewriteResult> {
  if (!payload.aiConfig?.apiKey) {
    throw new Error('请先在设置中配置 AI API Key');
  }

  const messages = [
    {
      role: 'system' as const,
      content: getBuiltinSkillPrompt('rulesRewrite'),
    },
    {
      role: 'user' as const,
      content: buildRuleRewritePrompt(payload),
    },
  ];

  const result = await chatCompletion(payload.aiConfig as ISafetyScanAiConfig, messages, {
    temperature: 0.3,
    maxTokens: 4096,
  });

  const content = result.content?.trim();
  if (!content) {
    throw new Error('AI 改写返回空内容');
  }

  return {
    content,
    summary: 'AI 已生成新的规则草稿',
  };
}
