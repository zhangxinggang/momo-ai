import { chatCompletion } from './chat';
import { resolveAIProtocol } from './protocol';
import type {
  IAIConfig,
  IAITestResult,
  IChatMessage,
  IMultiModelCompareResult,
  IStreamCallbacks,
} from './types';

/** 测试 AI 配置是否可用 */
export async function testAIConnection(
  config: IAIConfig,
  testPrompt?: string,
  streamCallbacks?: IStreamCallbacks,
): Promise<IAITestResult> {
  const startTime = Date.now();
  const prompt = testPrompt || 'Hello! Please respond with a brief greeting.';
  const useStream =
    resolveAIProtocol(config) === 'anthropic' ? false : (config.chatParams?.stream ?? false);
  const useThinking = config.chatParams?.enableThinking ?? false;

  try {
    const result = await chatCompletion(config, [{ role: 'user', content: prompt }], {
      maxTokens: 2048,
      stream: useStream,
      enableThinking: useThinking,
      streamCallbacks,
    });

    return {
      id: config.id,
      success: true,
      response: result.content,
      thinkingContent: result.thinkingContent,
      latency: Date.now() - startTime,
      model: config.model,
      provider: config.provider,
    };
  } catch (error) {
    return {
      id: config.id,
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      latency: Date.now() - startTime,
      model: config.model,
      provider: config.provider,
    };
  }
}

/** 并行测试多个 AI 配置 */
export async function compareAIModels(
  configs: IAIConfig[],
  testPrompt: string,
): Promise<IAITestResult[]> {
  const promises = configs.map((config) => testAIConnection(config, testPrompt));
  return Promise.all(promises);
}

/** 多模型提示词对比分析（并行执行，支持流式输出） */
export async function multiModelCompare(
  configs: IAIConfig[],
  messages: IChatMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    streamCallbacksMap?: Map<string, IStreamCallbacks>;
  },
): Promise<IMultiModelCompareResult> {
  const startTime = Date.now();

  const promises = configs.map(async (config) => {
    const resultStartTime = Date.now();
    const streamCallbacks = options?.streamCallbacksMap?.get(config.id || config.model);

    try {
      const useStream = config.chatParams?.stream ?? false;
      const useThinking = config.chatParams?.enableThinking ?? false;

      const result = await chatCompletion(config, messages, {
        temperature: options?.temperature,
        maxTokens: options?.maxTokens,
        stream: useStream,
        enableThinking: useThinking,
        streamCallbacks,
      });

      return {
        id: config.id,
        success: true,
        response: result.content,
        thinkingContent: result.thinkingContent,
        latency: Date.now() - resultStartTime,
        model: config.model,
        provider: config.provider,
      } as IAITestResult;
    } catch (error) {
      return {
        id: config.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        latency: Date.now() - resultStartTime,
        model: config.model,
        provider: config.provider,
      } as IAITestResult;
    }
  });

  const results = await Promise.all(promises);

  return {
    messages,
    results,
    totalTime: Date.now() - startTime,
  };
}
