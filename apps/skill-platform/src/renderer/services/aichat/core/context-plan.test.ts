import { describe, expect, it } from 'vitest';

import { buildContextPlan, estimateContextTokens } from './context-plan';

describe('buildContextPlan', () => {
  it('uses one system message with deterministic section order', () => {
    const result = buildContextPlan({
      messages: [{ role: 'user', content: 'question' }],
      hostPolicies: ['host'],
      userPolicy: 'user policy',
      agentRules: 'agent rules',
      evidence: ['evidence'],
    });

    expect(result).toHaveLength(2);
    expect(result[0].role).toBe('system');
    const prompt = String(result[0].content);
    expect(prompt.indexOf('宿主规则')).toBeLessThan(prompt.indexOf('用户规则'));
    expect(prompt.indexOf('用户规则')).toBeLessThan(prompt.indexOf('所选 Agent 规则'));
    expect(prompt.indexOf('所选 Agent 规则')).toBeLessThan(prompt.indexOf('参考证据'));
  });

  it('always retains the latest user message when history is over budget', () => {
    const latest = 'latest-' + 'x'.repeat(9_000);
    const result = buildContextPlan({
      messages: [
        { role: 'user', content: 'old-' + 'x'.repeat(9_000) },
        { role: 'assistant', content: 'middle-' + 'x'.repeat(9_000) },
        { role: 'user', content: latest },
      ],
      historyCharBudget: 8_000,
    });

    expect(result.at(-1)?.content).toBe(latest);
  });

  it('keeps complete recent turns and summarizes older requirements', () => {
    const result = buildContextPlan({
      messages: [
        { role: 'user', content: '# 设计要求\n- 必须保留登录状态\n' + '旧'.repeat(9_000) },
        { role: 'assistant', content: '已理解旧需求。' + '答'.repeat(9_000) },
        { role: 'user', content: '现在开始实现 auth.ts' },
        { role: 'assistant', content: '正在实现。' },
        { role: 'user', content: '继续并运行测试' },
      ],
      contextTokenBudget: 16_000,
      hostPolicies: ['遵守工程约束'],
    });

    expect(result[0].role).toBe('system');
    expect(String(result[0].content)).toContain('较早对话压缩摘要');
    expect(String(result[0].content)).toContain('必须保留登录状态');
    expect(result.slice(1).map((item) => item.role)).toEqual(['user', 'assistant', 'user']);
    expect(result.at(-1)?.content).toBe('继续并运行测试');
  });

  it('estimates CJK more conservatively than latin text', () => {
    expect(estimateContextTokens('需求'.repeat(100))).toBeGreaterThan(
      estimateContextTokens('ab'.repeat(100)),
    );
  });
});
