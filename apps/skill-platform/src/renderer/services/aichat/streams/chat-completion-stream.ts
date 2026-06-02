import type { IAIConfig, IChatMessage, ITokenUsage } from '@renderer/services/ai';
import { chatCompletion } from '@renderer/services/ai';

export interface IModelConfigAccessors {
  getModelConfig: (modelKey?: string) => IAIConfig | null;
  getDefaultConfig: () => IAIConfig | null;
  onNeedModel?: () => void;
}

export interface IResponseFormatOption {
  type: 'text' | 'json_object' | 'json_schema';
  jsonSchema?: {
    name: string;
    strict?: boolean;
    schema: Record<string, unknown>;
  };
}

export interface IChatStreamCallbacks {
  onThinking?: (chunk: string) => void;
}

export interface IRunChatCompletionStreamInput {
  config: IAIConfig;
  apiMessages: IChatMessage[];
  onChunk: (text: string) => void;
  streamCallbacks?: IChatStreamCallbacks;
  responseFormat?: IResponseFormatOption;
  onComplete?: (text: string) => void;
}

/** 解析 stream 使用的模型配置 */
export function resolveStreamModelConfig(
  accessors: IModelConfigAccessors,
  modelKey?: string,
): IAIConfig | null {
  return (modelKey ? accessors.getModelConfig(modelKey) : null) ?? accessors.getDefaultConfig();
}

export interface IRunChatCompletionStreamResult {
  elapsedSec: string;
  usage?: ITokenUsage;
}

/** 执行 chatCompletion 流式/非流式输出，统一 onChunk 逻辑 */
export async function runChatCompletionStream(
  input: IRunChatCompletionStreamInput,
): Promise<IRunChatCompletionStreamResult> {
  const { config, apiMessages, onChunk, streamCallbacks, responseFormat, onComplete } = input;
  const startTime = Date.now();
  const useStream = !!config.chatParams?.stream;
  const useThinking = !!config.chatParams?.enableThinking;
  let contentBuffer = '';

  const result = await chatCompletion(config, apiMessages, {
    stream: useStream,
    enableThinking: useThinking,
    streamCallbacks: useStream
      ? {
          onContent: (chunk) => {
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

  const finalText = !useStream ? result.content : contentBuffer || result.content;
  const finalThinking = result.thinkingContent || '';

  if (!useStream && finalText) {
    onChunk(finalText);
  }
  if (finalThinking) {
    streamCallbacks?.onThinking?.(finalThinking);
  }
  if (finalText) {
    onComplete?.(finalText);
  }

  return {
    elapsedSec: ((Date.now() - startTime) / 1000).toFixed(2),
    usage: result.usage,
  };
}
