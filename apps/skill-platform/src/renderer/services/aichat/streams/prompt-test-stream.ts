import type { IChatStreamMessage, TCallAiChatStream } from '@momo/aichat';

import type { IAIConfig, IChatMessage } from '@renderer/services/ai';
import { getEnabledWorkspaceContext } from '@renderer/services/workspace/context';
import { buildRagContext } from '../core/rag-context';
import { resolveStreamModelConfig, runChatCompletionStream } from './chat-completion-stream';

function normalizeContent(content: string): string {
  return content.trim();
}

function getBaseUserText(base: IChatMessage[]): string {
  const user = base.find((m) => m.role === 'user');
  if (!user) return '';
  if (typeof user.content === 'string') return normalizeContent(user.content);
  const textPart = user.content.find((p) => p.type === 'text');
  return textPart && 'text' in textPart ? normalizeContent(textPart.text) : '';
}

/** 合并模板 base 与 AiChatView 会话消息，避免首条用户消息与 base 重复 */
export function mergePromptTestApiMessages(
  base: IChatMessage[],
  streamMessages: IChatStreamMessage[],
): IChatMessage[] {
  const out: IChatMessage[] = [...base];
  if (streamMessages.length === 0) {
    return out;
  }

  const baseUserText = getBaseUserText(base);
  const first = streamMessages[0];
  const firstText = first?.role === 'user' ? normalizeContent(first.content || '') : '';

  if (streamMessages.length === 1 && first?.role === 'user' && firstText === baseUserText) {
    return out;
  }

  let startIdx = 0;
  if (first?.role === 'user' && firstText === baseUserText) {
    startIdx = 1;
  }

  for (let i = startIdx; i < streamMessages.length; i++) {
    const m = streamMessages[i];
    out.push({ role: m.role, content: m.content });
  }

  return out;
}

export interface IPromptTestStreamOptions {
  getModelConfig: (modelKey?: string) => IAIConfig | null;
  getDefaultConfig: () => IAIConfig | null;
  getBaseMessages: () => IChatMessage[];
  getResponseFormat: () =>
    | {
        type: 'text' | 'json_object' | 'json_schema';
        jsonSchema?: {
          name: string;
          strict?: boolean;
          schema: Record<string, unknown>;
        };
      }
    | undefined;
  onComplete?: (text: string) => void;
  onErrorToast?: (message: string) => void;
  onNeedModel?: () => void;
}

/** 将 IPrompt 测试的 chatCompletion 能力注入 momo-aichat */
export function createPromptTestStream(options: IPromptTestStreamOptions): TCallAiChatStream {
  return async (messages, onChunk, onError, onStats, modelKey, streamOptions) => {
    const config = resolveStreamModelConfig(options, modelKey);
    if (!config?.apiKey || !config.apiUrl || !config.model) {
      const msg = '请先配置 AI 模型';
      options.onNeedModel?.();
      options.onErrorToast?.(msg);
      onError?.(msg);
      return;
    }

    let apiMessages = mergePromptTestApiMessages(options.getBaseMessages(), messages);
    const { ragSystemPrompt, citations } = await buildRagContext(messages, streamOptions);
    if (ragSystemPrompt) {
      apiMessages = [{ role: 'system', content: ragSystemPrompt }, ...apiMessages];
    }

    const workspaceContext = await getEnabledWorkspaceContext();
    if (workspaceContext.trim()) {
      apiMessages = [{ role: 'system', content: workspaceContext }, ...apiMessages];
    }

    try {
      const elapsedSec = await runChatCompletionStream({
        config,
        apiMessages,
        onChunk,
        streamCallbacks: streamOptions,
        responseFormat: options.getResponseFormat(),
        onComplete: options.onComplete,
      });

      onStats?.({
        model: config.model,
        responseTime: `${elapsedSec}s`,
        totalTokens: 0,
        promptTokens: 0,
        completionTokens: 0,
        citations,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      onError?.(msg);
    }
  };
}
