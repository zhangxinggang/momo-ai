import { describe, expect, it } from 'vitest';

import { buildContextPlan } from './context-plan';

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
});
