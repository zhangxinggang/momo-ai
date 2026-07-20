import type { DMcpCallToolResult } from '@/types/modules/mcp';
import type { IChatMessage, IChatToolCall } from '@renderer/services/ai';

export const MCP_TOOL_LOOP_MAX_ROUNDS = 8;

/** 是否结束 tool loop */
export function shouldStopToolLoop(
  round: number,
  maxRounds: number,
  toolCalls: unknown[] | undefined,
): boolean {
  if (!toolCalls?.length) {
    return true;
  }
  if (round >= maxRounds) {
    return true;
  }
  return false;
}

/** 根据 tool_calls 与执行结果组装 tool 消息 */
export function buildToolResultMessages(
  toolCalls: IChatToolCall[],
  results: DMcpCallToolResult[],
): IChatMessage[] {
  return toolCalls.map((call, index) => ({
    role: 'tool' as const,
    tool_call_id: call.id,
    content: results[index]?.content ?? '工具无返回',
  }));
}
