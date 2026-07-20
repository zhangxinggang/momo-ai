import type { DMcpTool } from '@/types/modules/mcp';
import type { DChatCompletionTool, IChatToolCall } from '@renderer/types/ai';

/** 将 MCP tools 转为 OpenAI function tools */
export function mcpToolsToOpenAITools(tools: DMcpTool[]): DChatCompletionTool[] {
  return tools.map((tool) => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema ?? { type: 'object', properties: {} },
    },
  }));
}

/** 合并流式 delta.tool_calls 分片 */
export function aggregateToolCallDeltas(
  existing: IChatToolCall[],
  deltas: Array<Partial<IChatToolCall> & { index?: number }>,
): IChatToolCall[] {
  const next = [...existing];
  for (const delta of deltas) {
    const index = delta.index ?? 0;
    const current = next[index] ?? {
      id: '',
      type: 'function' as const,
      function: { name: '', arguments: '' },
    };
    next[index] = {
      id: delta.id || current.id,
      type: 'function',
      function: {
        name: delta.function?.name || current.function.name,
        arguments: (current.function.arguments || '') + (delta.function?.arguments || ''),
      },
    };
  }
  return next;
}
