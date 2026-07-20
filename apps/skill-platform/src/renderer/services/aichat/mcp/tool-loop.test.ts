import { describe, expect, it } from 'vitest';

import { buildToolResultMessages, shouldStopToolLoop } from './tool-loop-helpers';

describe('shouldStopToolLoop', () => {
  it('无 toolCalls 停止', () => {
    expect(shouldStopToolLoop(1, 8, [])).toBe(true);
  });

  it('达到上限停止', () => {
    expect(shouldStopToolLoop(8, 8, [{ id: '1' }])).toBe(true);
  });

  it('有 toolCalls 且未达上限则继续', () => {
    expect(shouldStopToolLoop(1, 8, [{ id: '1' }])).toBe(false);
  });
});

describe('buildToolResultMessages', () => {
  it('按 tool_call_id 生成 tool 消息', () => {
    const messages = buildToolResultMessages(
      [{ id: 'c1', type: 'function', function: { name: 'a__b', arguments: '{}' } }],
      [{ ok: true, content: 'ok' }],
    );
    expect(messages[0]).toMatchObject({ role: 'tool', tool_call_id: 'c1', content: 'ok' });
  });
});
