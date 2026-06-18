import type { IChatStreamMessage, TCallAiChatStream } from '@momo/aichat';

import type { IAIConfig, IChatMessage } from '@renderer/services/ai';
import { isImageGenerationConfig } from '@renderer/services/ai/image/capabilities';
import { getEnabledWorkspaceContext } from '@renderer/services/workspace/context';
import { MERMAID_SYSTEM_PROMPT } from '../core/mermaid-system-prompt';
import { buildRagContext } from '../core/rag-context';
import { resolveStreamModelConfig, runChatCompletionStream } from './chat-completion-stream';
import { runImageGenerationInChat } from './image-chat-stream';

export interface IGeneralChatStreamOptions {
  getModelConfig: (modelKey: string) => IAIConfig | null;
  getDefaultConfig: () => IAIConfig | null;
  onNeedModel?: () => void;
}

function toApiMessages(messages: IChatStreamMessage[]): IChatMessage[] {
  return messages.map((m) => ({ role: m.role, content: m.content }));
}

/** 通用 AI 对话流式适配：支持多模型与 RAG 指定知识库检索 */
export function createGeneralChatStream(options: IGeneralChatStreamOptions): TCallAiChatStream {
  return async (messages, onChunk, onError, onStats, modelKey, streamOptions) => {
    const config = resolveStreamModelConfig(options, modelKey);
    if (!config?.apiKey || !config.apiUrl || !config.model) {
      const msg = '请先在设置中配置 AI 对话模型';
      options.onNeedModel?.();
      onError?.(msg);
      return;
    }

    if (isImageGenerationConfig(config)) {
      await runImageGenerationInChat({
        config,
        messages,
        referenceImages: streamOptions?.referenceImages,
        onChunk,
        onError,
        onStats,
      });
      return;
    }

    let apiMessages = toApiMessages(messages);
    const { ragSystemPrompt, citations } = await buildRagContext(messages, streamOptions);
    if (ragSystemPrompt) {
      apiMessages = [{ role: 'system', content: ragSystemPrompt }, ...apiMessages];
    }

    const workspaceContext = await getEnabledWorkspaceContext();
    if (workspaceContext.trim()) {
      apiMessages = [{ role: 'system', content: workspaceContext }, ...apiMessages];
    }

    apiMessages = [{ role: 'system', content: MERMAID_SYSTEM_PROMPT }, ...apiMessages];

    if (streamOptions?.user_system_prompt?.trim()) {
      apiMessages = [
        { role: 'system', content: streamOptions.user_system_prompt.trim() },
        ...apiMessages,
      ];
    }

    try {
      const { elapsedSec, usage } = await runChatCompletionStream({
        config,
        apiMessages,
        onChunk,
        streamCallbacks: streamOptions,
      });

      onStats?.({
        model: config.model,
        responseTime: `${elapsedSec}s`,
        totalTokens: usage?.totalTokens ?? 0,
        promptTokens: usage?.promptTokens ?? 0,
        completionTokens: usage?.completionTokens ?? 0,
        citations,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      onError?.(msg);
    }
  };
}
