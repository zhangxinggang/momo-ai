import { describe, expect, it } from 'vitest';

import { isMcpRelatedText, shouldEnableMcpForSkill } from './intent';

describe('isMcpRelatedText', () => {
  it('普通问答不触发', () => {
    expect(isMcpRelatedText('帮我总结这段文字')).toBe(false);
  });

  it('提及 mcp 时触发', () => {
    expect(isMcpRelatedText('请用 MCP 查询天气')).toBe(true);
  });

  it('提及调用工具时触发', () => {
    expect(isMcpRelatedText('调用工具查一下')).toBe(true);
  });
});

describe('shouldEnableMcpForSkill', () => {
  it('普通 skill 协议不启用', () => {
    expect(shouldEnableMcpForSkill({ protocol_type: 'skill' }, '生成 PPT')).toBe(false);
  });

  it('mcp 协议启用', () => {
    expect(shouldEnableMcpForSkill({ protocol_type: 'mcp' })).toBe(true);
  });

  it('指令提及 mcp 时启用', () => {
    expect(
      shouldEnableMcpForSkill({ protocol_type: 'skill' }, '本技能通过 MCP 调用外部服务'),
    ).toBe(true);
  });
});
