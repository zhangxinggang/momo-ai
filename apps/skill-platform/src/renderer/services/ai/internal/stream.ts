import type {
  IChatCompletionResult,
  IChatMessageContentPart,
  IStreamCallbacks,
  TChatMessageContent,
} from '../types';
import type { IResponseLike, IStreamState } from './types';

export function createStreamState(): IStreamState {
  return {
    fullContent: '',
    thinkingContent: '',
    buffer: '',
    chunkCount: 0,
  };
}

function isGeminiApiHost(apiUrl: string): boolean {
  return apiUrl.includes('generativelanguage.googleapis.com');
}

function isGeminiOpenAICompatEndpoint(endpoint: string): boolean {
  return endpoint.includes('generativelanguage.googleapis.com') && endpoint.includes('/openai/');
}

function yieldToEventLoop() {
  return new Promise<void>((resolve) => {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => resolve());
    } else {
      setTimeout(resolve, 0);
    }
  });
}

export async function processStreamTextChunk(
  chunkText: string,
  state: IStreamState,
  onStream?: (chunk: string) => void,
  streamCallbacks?: IStreamCallbacks,
  options?: {
    flush?: boolean;
    yieldToUi?: boolean;
  },
): Promise<void> {
  state.buffer += chunkText;
  const lines = state.buffer.split('\n');
  state.buffer = options?.flush ? '' : lines.pop() || '';
  let deltasSinceYield = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed === 'data: [DONE]') continue;
    if (!trimmed.startsWith('data: ')) continue;

    try {
      const json = JSON.parse(trimmed.slice(6));
      const delta = json.choices?.[0]?.delta;

      if (!delta) {
        continue;
      }

      state.chunkCount++;
      deltasSinceYield++;

      if (delta.reasoning_content) {
        state.thinkingContent += delta.reasoning_content;
        streamCallbacks?.onThinking?.(delta.reasoning_content);
      }

      if (delta.content) {
        state.fullContent += delta.content;
        onStream?.(delta.content);
        streamCallbacks?.onContent?.(delta.content);
        if (state.chunkCount === 1) {
          console.log('[AI Stream] First content chunk received:', delta.content.slice(0, 50));
        }
      }

      if (options?.yieldToUi && deltasSinceYield >= 20) {
        deltasSinceYield = 0;
        await yieldToEventLoop();
      }
    } catch {
      // 忽略解析错误 / Ignore parse errors
    }
  }

  if (options?.yieldToUi) {
    if (state.chunkCount > 0 && state.chunkCount % 50 === 0) {
      console.log(
        `[AI Stream] Yielding at chunk ${state.chunkCount}, content length: ${state.fullContent.length}`,
      );
    }
    await yieldToEventLoop();
  }
}

export function finalizeStreamState(
  state: IStreamState,
  streamCallbacks?: IStreamCallbacks,
): IChatCompletionResult {
  streamCallbacks?.onComplete?.(state.fullContent, state.thinkingContent || undefined);

  return {
    content: state.fullContent,
    thinkingContent: state.thinkingContent || undefined,
  };
}

export function normalizeAssistantContent(content: TChatMessageContent): string {
  if (typeof content === 'string') {
    return content;
  }

  return content
    .filter(
      (part): part is Extract<IChatMessageContentPart, { type: 'text' }> => part.type === 'text',
    )
    .map((part) => part.text)
    .join('');
}

export async function getErrorMessageFromResponse(response: IResponseLike): Promise<string> {
  const errorText = await response.text();
  let errorMessage = `API 请求失败 (${response.status})`;

  try {
    const errorJson = JSON.parse(errorText);
    errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
  } catch {
    if (errorText) {
      errorMessage = errorText.slice(0, 200);
    }
  }

  if (errorMessage.includes('only available for Coding Agents')) {
    return (
      'Kimi Coding API 仅对 Coding Agent 开放。请确认 API 地址为 https://api.kimi.com/coding ，' +
      '使用 Kimi Code 订阅 Key（sk-kimi-...），模型名建议为 kimi-for-coding。'
    );
  }

  return errorMessage;
}
