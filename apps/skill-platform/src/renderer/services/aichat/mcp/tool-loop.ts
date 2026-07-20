import type { IAIConfig, IChatMessage } from '@renderer/services/ai';
import { chatCompletion } from '@renderer/services/ai';
import { mcpToolsToOpenAITools } from '@renderer/services/ai/tools/openai-tools';
import { callMcpTool, listMcpTools } from '@renderer/services/mcp/api';

import type {
  IChatStreamCallbacks,
  IResponseFormatOption,
  IRunChatCompletionStreamResult,
} from '../streams/chat-completion-stream';
import {
  buildToolResultMessages,
  MCP_TOOL_LOOP_MAX_ROUNDS,
  shouldStopToolLoop,
} from './tool-loop-helpers';

export {
  buildToolResultMessages,
  MCP_TOOL_LOOP_MAX_ROUNDS,
  shouldStopToolLoop,
} from './tool-loop-helpers';

export interface IRunMcpToolLoopInput {
  config: IAIConfig;
  apiMessages: IChatMessage[];
  onChunk: (text: string) => void;
  streamCallbacks?: IChatStreamCallbacks;
  responseFormat?: IResponseFormatOption;
  maxRounds?: number;
  onComplete?: (text: string) => void;
  /** 覆盖 config.chatParams.stream */
  stream?: boolean;
  maxTokens?: number;
  /** 为 true 时才注入 MCP tools；默认 false，避免无关对话误调用 */
  enableMcpTools?: boolean;
}

function parseToolArguments(raw: string): Record<string, unknown> {
  if (!raw?.trim()) {
    return {};
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return {};
  } catch {
    return {};
  }
}

/** 带 MCP tools 的对话循环 */
export async function runMcpToolLoop(
  input: IRunMcpToolLoopInput,
): Promise<IRunChatCompletionStreamResult> {
  const {
    config,
    onChunk,
    streamCallbacks,
    responseFormat,
    onComplete,
    maxRounds = MCP_TOOL_LOOP_MAX_ROUNDS,
    maxTokens,
    enableMcpTools = false,
  } = input;
  const startTime = Date.now();
  const useThinking = !!config.chatParams?.enableThinking;

  let apiMessages = [...input.apiMessages];
  let contentBuffer = '';
  let lastUsage = undefined as IRunChatCompletionStreamResult['usage'];

  let mcpTools: Awaited<ReturnType<typeof listMcpTools>> = [];
  if (enableMcpTools) {
    try {
      mcpTools = await listMcpTools();
    } catch {
      mcpTools = [];
    }
  }
  const openAITools = mcpTools.length > 0 ? mcpToolsToOpenAITools(mcpTools) : undefined;
  // 有 tools 时强制非流式：多数网关在「stream + tool_calls + thinking」下会挂起不结束 SSE
  const useStream = openAITools
    ? false
    : (input.stream ?? !!config.chatParams?.stream);

  for (let round = 1; round <= maxRounds; round += 1) {
    let roundContent = '';
    const result = await chatCompletion(config, apiMessages, {
      stream: useStream,
      enableThinking: useThinking,
      maxTokens,
      tools: openAITools,
      toolChoice: openAITools ? 'auto' : undefined,
      streamCallbacks: useStream
        ? {
            onContent: (chunk) => {
              roundContent += chunk;
              contentBuffer += chunk;
              onChunk(chunk);
            },
            onThinking: (chunk) => {
              streamCallbacks?.onThinking?.(chunk);
            },
          }
        : undefined,
      responseFormat,
    });

    lastUsage = result.usage;
    if (!useStream) {
      if (result.thinkingContent) {
        streamCallbacks?.onThinking?.(result.thinkingContent);
      }
      if (result.content) {
        roundContent = result.content;
        contentBuffer += result.content;
        onChunk(result.content);
      }
    } else if (result.thinkingContent) {
      streamCallbacks?.onThinking?.(result.thinkingContent);
    }

    const toolCalls = (result.toolCalls ?? []).filter((call) => call?.function?.name);
    if (shouldStopToolLoop(round, maxRounds, toolCalls)) {
      if (toolCalls.length > 0 && round >= maxRounds) {
        onChunk('\n\n> 工具调用轮次已达上限，已停止继续调用。\n\n');
      }
      break;
    }

    const names = toolCalls.map((call) => call.function.name).join(', ');
    onChunk(`\n\n> 正在调用 ${names}...\n\n`);

    const results = await Promise.all(
      toolCalls.map((call) =>
        callMcpTool({
          name: call.function.name,
          arguments: parseToolArguments(call.function.arguments),
        }),
      ),
    );

    for (const toolResult of results) {
      onChunk(`\n\`\`\`\n${toolResult.content}\n\`\`\`\n`);
    }

    apiMessages = [
      ...apiMessages,
      {
        role: 'assistant',
        // 部分网关要求有 tool_calls 时 content 为空串或占位，避免 undefined
        content: roundContent || '',
        tool_calls: toolCalls,
      },
      ...buildToolResultMessages(toolCalls, results),
    ];
  }

  if (contentBuffer) {
    onComplete?.(contentBuffer);
  }

  return {
    elapsedSec: ((Date.now() - startTime) / 1000).toFixed(2),
    usage: lastUsage,
  };
}
