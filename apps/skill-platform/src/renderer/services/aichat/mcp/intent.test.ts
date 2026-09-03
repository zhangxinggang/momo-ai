import { describe, expect, it } from 'vitest';

import { shouldEnableMcpForSkill } from './intent';

describe('shouldEnableMcpForSkill', () => {
  it('普通 skill 协议不启用', () => {
    expect(shouldEnableMcpForSkill({ protocol_type: 'skill' }, '生成 PPT')).toBe(false);
  });

  it('mcp 协议启用', () => {
    expect(shouldEnableMcpForSkill({ protocol_type: 'mcp' })).toBe(true);
  });

  it('指令提及 mcp 时启用', () => {
    expect(shouldEnableMcpForSkill({ protocol_type: 'skill' }, '本技能通过 MCP 调用外部服务')).toBe(
      true,
    );
  });
});
