import type { DRuleRewriteRequest, IRuleRewriteResult } from '@/types/modules/rules';
import type { ISafetyScanAiConfig } from '@/types/modules/skill';

import { chatCompletion } from '../ai/client';

export function buildRuleRewritePrompt(payload: DRuleRewriteRequest): string {
  return [
    `You are editing a rules file for ${payload.platformName}.`,
    `Target file: ${payload.fileName}`,
    'Rewrite the rules file based on the user instruction.',
    'IMPORTANT: Only return the final file content. Do not include introductory or concluding conversational text.',
    'Preserve useful existing structure when possible.',
    'Return valid markdown only.',
    'User instruction:',
    payload.instruction.trim(),
    'Current content:',
    payload.currentContent.trim() || '(empty)',
  ].join('\n\n');
}

/** 使用 AI 改写规则文件内容 */
export async function rewriteRuleWithAi(payload: DRuleRewriteRequest): Promise<IRuleRewriteResult> {
  if (!payload.aiConfig?.apiKey) {
    throw new Error('请先在设置中配置 AI API Key');
  }

  const messages = [
    {
      role: 'system' as const,
      content:
        'You are an expert AI Rules engineer. Rewrite local AI rules files according to user instructions. Return ONLY production-ready markdown. Do NOT wrap output in code fences.',
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
