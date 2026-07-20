import { describe, expect, it } from 'vitest';

import { aggregateToolCallDeltas, mcpToolsToOpenAITools } from './openai-tools';

describe('aggregateToolCallDeltas', () => {
  it('两段 delta 拼出完整 arguments', () => {
    const first = aggregateToolCallDeltas([], [
      {
        index: 0,
        id: 'call_1',
        type: 'function',
        function: { name: 'fs__read', arguments: '{"path":' },
      },
    ]);
    const second = aggregateToolCallDeltas(first, [
      {
        index: 0,
        function: { name: '', arguments: '"a.txt"}' },
      },
    ]);
    expect(second[0]).toEqual({
      id: 'call_1',
      type: 'function',
      function: { name: 'fs__read', arguments: '{"path":"a.txt"}' },
    });
  });
});

describe('mcpToolsToOpenAITools', () => {
  it('映射 name/description/parameters', () => {
    const tools = mcpToolsToOpenAITools([
      {
        name: 'fs__read',
        description: 'read file',
        inputSchema: { type: 'object', properties: { path: { type: 'string' } } },
        serverName: 'fs',
        toolName: 'read',
      },
    ]);
    expect(tools[0].function.name).toBe('fs__read');
    expect(tools[0].function.description).toBe('read file');
  });
});
