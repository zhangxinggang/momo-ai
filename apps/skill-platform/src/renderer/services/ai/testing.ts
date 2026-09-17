import { chatCompletion } from './chat';
import { isImageGenerationConfig } from './image/capabilities';
import { testImageGeneration } from './image/test';
import { createResponseLike, getAITransport } from './internal/transport';
import {
  buildEmbeddingEndpointFromBase,
  buildHeadersForProtocol,
  resolveAIProtocol,
  resolveProtocolBase,
} from './protocol';
import type { IAIConfig, IAITestResult, IStreamCallbacks } from './types';

/** Test the OpenAI-compatible embeddings endpoint used by knowledge ingestion. */
export async function testEmbeddingConnection(config: IAIConfig): Promise<IAITestResult> {
  const startTime = Date.now();
  const endpoint = buildEmbeddingEndpointFromBase(resolveProtocolBase(config.apiUrl, 'openai'));
  try {
    const headers = buildHeadersForProtocol('openai', config.apiKey);
    const transport = getAITransport();
    const response = transport
      ? createResponseLike(
          await transport.request({
            method: 'POST',
            url: endpoint,
            headers,
            body: JSON.stringify({ model: config.model, input: ['AIM embedding connection test'] }),
          }),
        )
      : await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({ model: config.model, input: ['AIM embedding connection test'] }),
        });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`);
    }
    const body = (await response.json()) as { data?: Array<{ embedding?: number[] }> };
    const dimension = body.data?.[0]?.embedding?.length ?? 0;
    if (!dimension) {
      throw new Error('响应中没有有效的 embedding 向量');
    }
    return {
      id: config.id,
      success: true,
      response: `Embedding succeeded (${dimension} dimensions)`,
      latency: Date.now() - startTime,
      model: config.model,
      provider: config.provider,
    };
  } catch (error) {
    return {
      id: config.id,
      success: false,
      error: error instanceof Error ? error.message : String(error),
      latency: Date.now() - startTime,
      model: config.model,
      provider: config.provider,
    };
  }
}

/** 测试 AI 配置是否可用 */
export async function testAIConnection(
  config: IAIConfig,
  testPrompt?: string,
  streamCallbacks?: IStreamCallbacks,
): Promise<IAITestResult> {
  if (isImageGenerationConfig(config)) {
    const imageResult = await testImageGeneration(config, testPrompt);
    return {
      id: config.id,
      success: imageResult.success,
      response: imageResult.success ? 'Image generation succeeded' : undefined,
      error: imageResult.error,
      latency: imageResult.latency,
      model: imageResult.model,
      provider: imageResult.provider,
    };
  }

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
