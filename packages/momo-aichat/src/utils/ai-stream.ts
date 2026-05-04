import type {
  IChatStreamMessage,
  IChatStreamOptions,
  IChatStreamStats,
  TCallAiChatStream,
} from '../adapters/types';

function handleStreamError(error: unknown): string {
  console.error('AI流式API调用失败:', error);
  if (error instanceof Error) {
    const msg = error.message || '';
    if (
      msg.includes('每个消息必须包含 role 和 content 字段') ||
      (msg.includes('HTTP 400') && msg.includes('Bad Request'))
    ) {
      return '消息格式异常，请刷新页面或重新开始对话。';
    }
    if (
      msg.includes('Failed to fetch') ||
      msg.includes('ERR_CONNECTION_REFUSED') ||
      msg.includes('ECONNREFUSED') ||
      msg.toLowerCase().includes('network')
    ) {
      return '网络连接失败，请检查网络或稍后重试。';
    }
  }
  return 'AI 服务暂时不可用，请稍后重试。';
}

export function createCallAIChatStream(apiBaseUrl: string): TCallAiChatStream {
  return async function callAIChatStream(
    messages: IChatStreamMessage[],
    onChunk: (chunk: string) => void,
    onError?: (error: string) => void,
    onStats?: (stats: IChatStreamStats) => void,
    model = 'Qwen/Qwen3-Next-80B-A3B-Instruct',
    options?: IChatStreamOptions,
  ): Promise<void> {
    try {
      const response = await fetch(`${apiBaseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Connection: 'keep-alive',
          'Accept-Encoding': 'gzip, deflate, br',
        },
        body: JSON.stringify({
          messages,
          model,
          stream: true,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.max_tokens ?? 10000,
          top_p: options?.top_p ?? 0.9,
          user_system_prompt: options?.user_system_prompt,
          kb_enabled: options?.kb_enabled ?? false,
          kb_collection_id: options?.kb_collection_id,
          kb_top_k: options?.kb_top_k ?? 6,
        }),
        signal: options?.abortController?.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          (errorData as { message?: string }).message ||
            `HTTP ${response.status}: ${response.statusText}`,
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流');
      }

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data) as {
              content?: string;
              stats?: IChatStreamStats;
              error?: string;
            };
            if (parsed.content) {
              onChunk(parsed.content);
            } else if (parsed.stats && onStats) {
              onStats(parsed.stats);
            } else if (parsed.error) {
              const errorMsg = handleStreamError(new Error(parsed.error));
              if (onError) {
                onError(errorMsg);
              } else {
                onChunk(errorMsg);
              }
              return;
            }
          } catch {
            // 忽略单行解析错误
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      const errorMsg = handleStreamError(error);
      if (onError) {
        onError(errorMsg);
      } else {
        onChunk(errorMsg);
      }
    }
  };
}
