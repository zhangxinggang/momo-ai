import type { RuntimeTurnInput } from '@momo/agent-contracts';
import type { IAiChatServices, TCallAiChatStream } from '../adapters/types';
import { generateId } from '../types/chat';
import type { IChatSourceInput } from '../types/source';
import { formatResponseTime, normalizeChatUsage } from '../utils/chat-stats';
import { executeRuntimeTurn } from './execute';

export interface IRuntimeChatStreamOptions {
  runtime: NonNullable<IAiChatServices['runtime']>;
  saveChatSources?: (sources: IChatSourceInput[]) => Promise<RuntimeTurnInput['sourceRefs']>;
  getPermissionMode?: () => RuntimeTurnInput['permissionMode'];
}

/**
 * 为笔记改写、工具生成等非会话式输入框提供 Harness 适配。
 * 正常 AiChatView 会直接使用 services.runtime，不经过这个兼容入口。
 */
export function createRuntimeChatStream(options: IRuntimeChatStreamOptions): TCallAiChatStream {
  return async (messages, onChunk, onError, onStats, modelId, streamOptions) => {
    let lastUserIndex = -1;
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index].role === 'user') {
        lastUserIndex = index;
        break;
      }
    }
    const lastUser = messages[lastUserIndex];
    if (!modelId || !lastUser?.content.trim()) {
      onError?.(!modelId ? '请先选择 AI 对话模型' : '消息不能为空');
      return;
    }

    const sourceInputs: IChatSourceInput[] = [
      ...(streamOptions?.attachment_sources ?? []).map((source) => ({
        sourceRef: source,
        name: source.name,
        mimeType: source.mimeType,
        encoding: source.encoding,
        content: source.content,
      })),
      ...(streamOptions?.referenceImages ?? []).map((image, index) => ({
        name: image.name || `参考图-${index + 1}`,
        mimeType: image.mimeType,
        encoding: 'base64' as const,
        content: image.base64,
      })),
    ];
    const sourceRefs =
      sourceInputs.length && options.saveChatSources
        ? await options.saveChatSources(sourceInputs)
        : [];
    const resource = options.runtime.getResourceContext();
    const requestedSessionId = streamOptions?.sessionId?.trim();
    const sessionId = requestedSessionId || `inline-${generateId()}`;
    const turnId = generateId();
    const controller = streamOptions?.abortController ?? new AbortController();
    const systemPrompt = [
      ...messages.filter((message) => message.role === 'system').map((message) => message.content),
      streamOptions?.user_system_prompt,
    ]
      .filter((value): value is string => Boolean(value?.trim()))
      .join('\n\n');
    const history = messages
      // RuntimeTurnInput 的统一约定包含当前用户消息；主进程创建原生会话时会去掉最后一条再注入历史。
      .slice(0, lastUserIndex + 1)
      .filter((message) => message.role !== 'system')
      .map((message) => ({ role: message.role, content: message.content }));
    const startedAt = Date.now();
    let emittedContent = '';

    try {
      const result = await executeRuntimeTurn(
        options.runtime.port,
        {
          ...resource,
          sessionId,
          turnId,
          idempotencyKey: turnId,
          modelProfileId: modelId,
          agentId: options.runtime.getAgentId(),
          modeId: 'ask',
          rawIntent: lastUser.content,
          displayInput: lastUser.content,
          invocations: [],
          sourceRefs,
          systemPrompt,
          kbEnabled: streamOptions?.kb_enabled,
          kbCollectionId: streamOptions?.kb_collection_id,
          temperature: streamOptions?.temperature,
          topP: streamOptions?.top_p,
          permissionMode: options.getPermissionMode?.() ?? 'workspace-write',
          history,
        },
        controller.signal,
        (projection) => {
          if (projection.content.startsWith(emittedContent)) {
            const delta = projection.content.slice(emittedContent.length);
            if (delta) onChunk(delta);
            emittedContent = projection.content;
          }
        },
      );
      if (result.status === 'failed') {
        onError?.(result.error || 'Harness 执行失败');
        return;
      }
      onStats?.({
        model: modelId,
        responseTime: formatResponseTime(Date.now() - startedAt),
        ...normalizeChatUsage(result.usage),
        citations: result.citations,
      });
    } catch (error) {
      onError?.(error instanceof Error ? error.message : String(error));
    }
  };
}
