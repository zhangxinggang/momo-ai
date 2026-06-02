import {
  createStreamState,
  finalizeStreamState,
  getErrorMessageFromResponse,
  normalizeAssistantContent,
  processStreamTextChunk,
} from './internal/stream';
import { createFetchResponseLike, createResponseLike, getAITransport } from './internal/transport';
import type { IResponseLike } from './internal/types';
import { normalizeTokenUsage } from './internal/usage';
import {
  buildChatEndpointFromBase,
  buildHeadersForProtocol,
  resolveAIProtocol,
  resolveProtocolBase,
} from './protocol';
import type {
  DChatCompletionRequest,
  DChatCompletionResponse,
  IAIConfig,
  IChatCompletionResult,
  IChatMessage,
  IStreamCallbacks,
} from './types';

export async function chatCompletion(
  config: IAIConfig,
  messages: IChatMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    topK?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stream?: boolean;
    enableThinking?: boolean;
    onStream?: (chunk: string) => void; // 兼容旧版 / Legacy compatibility
    streamCallbacks?: IStreamCallbacks;
    // Output format options / 输出格式选项
    responseFormat?: {
      type: 'text' | 'json_object' | 'json_schema';
      jsonSchema?: {
        name: string;
        strict?: boolean;
        schema: Record<string, unknown>;
      };
    };
  },
): Promise<IChatCompletionResult> {
  const { provider, apiKey, apiUrl, model, chatParams } = config;
  const providerId = provider?.toLowerCase() || '';
  const protocol = resolveAIProtocol(config);
  const isGemini = protocol === 'gemini';
  const isAnthropic = protocol === 'anthropic';
  const normalizedModel = isGemini ? model.replace(/^models\//, '') : model;

  if (!apiKey) {
    throw new Error('API Key is not configured');
  }

  if (!apiUrl) {
    throw new Error('API URL is not configured');
  }

  if (!model) {
    throw new Error('No model selected');
  }

  const endpoint = buildChatEndpointFromBase(resolveProtocolBase(apiUrl, protocol));

  // 合并参数：config.chatParams < options（options 优先级更高）
  // Merge parameters: config.chatParams < options (options takes precedence)
  const mergedParams = {
    temperature: options?.temperature ?? chatParams?.temperature ?? 0.7,
    maxTokens: options?.maxTokens ?? chatParams?.maxTokens ?? 2048,
    topP: options?.topP ?? chatParams?.topP,
    topK: options?.topK ?? chatParams?.topK,
    frequencyPenalty: options?.frequencyPenalty ?? chatParams?.frequencyPenalty,
    presencePenalty: options?.presencePenalty ?? chatParams?.presencePenalty,
    stream: options?.stream ?? chatParams?.stream ?? false,
    enableThinking: options?.enableThinking ?? chatParams?.enableThinking ?? false,
  };

  if (isAnthropic) {
    mergedParams.stream = false;
  }

  // 构建请求头 / Build request headers
  const headers = buildHeadersForProtocol(protocol, apiKey, {
    accept: mergedParams.stream ? 'text/event-stream' : 'application/json',
    apiUrl,
  });

  // 检测是否为需要 max_completion_tokens 的新模型
  // Detect if it's a new model that requires max_completion_tokens
  // Updated for Issue #21: Support automatic fallback/retry for token parameters
  const modelLower = model.toLowerCase();
  let useMaxCompletionTokens =
    modelLower.includes('o1') ||
    modelLower.includes('o3') ||
    modelLower.includes('gpt-4o') ||
    modelLower.includes('gpt-4.5') ||
    /gpt-[5-9]/.test(modelLower) || // Matches gpt-5, gpt-5.2, gpt-6, etc.
    providerId.includes('openai');

  // 构建请求体 / Build request body
  const body: DChatCompletionRequest = {
    model: normalizedModel,
    messages,
    temperature: mergedParams.temperature,
    stream: mergedParams.stream,
  };

  if (isAnthropic) {
    const anthropicMessages = messages
      .filter((message) => message.role !== 'system')
      .map((message) => ({
        role: message.role === 'assistant' ? 'assistant' : 'user',
        content: normalizeAssistantContent(message.content),
      }));

    const anthropicBody: Record<string, unknown> = {
      model,
      max_tokens: mergedParams.maxTokens,
      messages: anthropicMessages,
      stream: false,
    };

    const systemMessage = messages.find((message) => message.role === 'system');
    if (systemMessage) {
      anthropicBody.system = normalizeAssistantContent(systemMessage.content);
    }

    const requestBody = JSON.stringify(anthropicBody);
    const transport = getAITransport();
    const response = transport
      ? createResponseLike(
          await transport.request({
            method: 'POST',
            url: endpoint,
            headers,
            body: requestBody,
          }),
        )
      : createFetchResponseLike(
          await fetch(endpoint, {
            method: 'POST',
            headers,
            body: requestBody,
          }),
        );

    if (!response.ok) {
      throw new Error(await getErrorMessageFromResponse(response));
    }

    const data = await response.json<{
      content?: Array<{ type?: string; text?: string }>;
    }>();
    const content = (data.content || [])
      .filter((item) => item?.type === 'text' && typeof item.text === 'string')
      .map((item) => item.text)
      .join('');

    if (!content) {
      throw new Error('AI returned an unexpected response format');
    }

    return {
      content,
    };
  }

  // 根据模型类型选择正确的 token 限制参数
  // Choose the correct token limit parameter based on model type
  if (useMaxCompletionTokens) {
    body.max_completion_tokens = mergedParams.maxTokens;
  } else {
    body.max_tokens = mergedParams.maxTokens;
  }

  if (mergedParams.stream) {
    body.stream_options = { include_usage: true };
  }

  // 添加可选参数 / Add optional parameters
  if (mergedParams.topP !== undefined) {
    body.top_p = mergedParams.topP;
  }
  if (mergedParams.topK !== undefined) {
    body.top_k = mergedParams.topK;
  }
  if (!isGemini && mergedParams.frequencyPenalty !== undefined) {
    body.frequency_penalty = mergedParams.frequencyPenalty;
  }
  if (!isGemini && mergedParams.presencePenalty !== undefined) {
    body.presence_penalty = mergedParams.presencePenalty;
  }

  // 检测是否为 Qwen 模型 / Detect if Qwen model
  const isQwen =
    providerId.includes('qwen') ||
    providerId.includes('dashscope') ||
    model.toLowerCase().includes('qwen');

  // 处理思考模式 / Handle thinking mode
  // 只有在流式模式下才能启用思考，非流式必须禁用
  if (isQwen) {
    if (mergedParams.stream && mergedParams.enableThinking) {
      body.enable_thinking = true;
    } else {
      body.enable_thinking = false;
    }
  } else if (mergedParams.enableThinking) {
    // 其他支持思考的模型（如 DeepSeek）
    body.enable_thinking = true;
  }

  // 处理自定义参数 / Handle custom parameters
  const customParams = chatParams?.customParams;
  if (customParams && typeof customParams === 'object') {
    const bodyAny = body as unknown as Record<string, unknown>;
    for (const [key, value] of Object.entries(customParams)) {
      if (key && value !== undefined && value !== '') {
        bodyAny[key] = value;
      }
    }
  }

  // 处理输出格式 / Handle response format (Issue #38)
  if (options?.responseFormat && options.responseFormat.type !== 'text') {
    if (options.responseFormat.type === 'json_object') {
      body.response_format = { type: 'json_object' };
    } else if (options.responseFormat.type === 'json_schema' && options.responseFormat.jsonSchema) {
      body.response_format = {
        type: 'json_schema',
        json_schema: {
          name: options.responseFormat.jsonSchema.name,
          strict: options.responseFormat.jsonSchema.strict ?? true,
          schema: options.responseFormat.jsonSchema.schema,
        },
      };
    }
  }

  const transport = getAITransport();

  const sendRequest = async (): Promise<{
    streamResult?: IChatCompletionResult;
    response?: IResponseLike;
  }> => {
    const requestBody = JSON.stringify(body);

    if (mergedParams.stream && transport) {
      const streamState = createStreamState();
      let streamError: string | null = null;

      const response = await transport.requestStream(
        {
          method: 'POST',
          url: endpoint,
          headers,
          body: requestBody,
        },
        {
          onChunk: (chunk) => {
            void processStreamTextChunk(
              chunk,
              streamState,
              options?.onStream,
              options?.streamCallbacks,
            );
          },
          onError: (error) => {
            streamError = error;
          },
        },
      );

      if (!response.ok) {
        return { response: createResponseLike(response) };
      }

      if (streamError) {
        throw new Error(streamError);
      }

      await processStreamTextChunk('', streamState, options?.onStream, options?.streamCallbacks, {
        flush: true,
      });

      return {
        streamResult: finalizeStreamState(streamState, options?.streamCallbacks),
      };
    }

    if (transport) {
      const response = await transport.request({
        method: 'POST',
        url: endpoint,
        headers,
        body: requestBody,
      });
      return { response: createResponseLike(response) };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: requestBody,
    });

    if (mergedParams.stream) {
      console.log('[AI Service] Starting stream response handling...');
      return {
        streamResult: await handleStreamResponse(
          response,
          options?.onStream,
          options?.streamCallbacks,
        ),
      };
    }

    return { response: createFetchResponseLike(response) };
  };

  try {
    let requestResult = await sendRequest();
    let response = requestResult.response;

    if (response && !response.ok) {
      const errorMessage = await getErrorMessageFromResponse(response);

      // Check for token parameter compatibility issues (Issue #21)
      // 检查 Token 参数兼容性问题
      const isTokenParamError =
        errorMessage.includes("'max_tokens' is not supported") ||
        errorMessage.includes("'max_completion_tokens' is not supported") ||
        errorMessage.includes("Use 'max_completion_tokens' instead") ||
        errorMessage.includes("Use 'max_tokens' instead");

      // Check for enable_thinking compatibility issues (Issue #9)
      // 检查 enable_thinking 参数兼容性问题 (Issue #9)
      const isThinkingParamError =
        errorMessage.includes('enable_thinking must be set to false') ||
        errorMessage.includes('enable_thinking only support stream') ||
        errorMessage.includes('parameter.enable_thinking');

      if (isTokenParamError) {
        console.warn(
          `[AI Service] Token parameter mismatch detected: "${errorMessage}". Retrying with alternative parameter...`,
        );

        if (useMaxCompletionTokens) {
          delete body.max_completion_tokens;
          body.max_tokens = mergedParams.maxTokens;
        } else {
          delete body.max_tokens;
          body.max_completion_tokens = mergedParams.maxTokens;
        }

        requestResult = await sendRequest();
        response = requestResult.response;

        if (response && !response.ok) {
          throw new Error(await getErrorMessageFromResponse(response));
        }
      } else if (isThinkingParamError) {
        console.warn(
          `[AI Service] enable_thinking parameter error detected: "${errorMessage}". Retrying with enable_thinking=false...`,
        );

        body.enable_thinking = false;
        requestResult = await sendRequest();
        response = requestResult.response;

        if (response && !response.ok) {
          throw new Error(await getErrorMessageFromResponse(response));
        }
      } else {
        throw new Error(errorMessage);
      }
    }

    if (requestResult.streamResult) {
      return requestResult.streamResult;
    }

    if (!response) {
      throw new Error('AI 返回结果为空');
    }

    // 流式输出处理 / Streaming output handling
    // Debug: Log streaming status / 调试：记录流式状态
    console.log(
      '[AI Service] Stream mode:',
      mergedParams.stream,
      'Callbacks provided:',
      !!options?.streamCallbacks,
    );

    // 非流式响应 / Non-streaming response
    const data: DChatCompletionResponse = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error('AI 返回结果为空');
      // AI returned empty result
    }

    const message = data.choices[0].message;
    return {
      content: normalizeAssistantContent(message.content),
      thinkingContent: message.reasoning_content,
      usage: normalizeTokenUsage(data.usage),
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('网络请求失败，请检查网络连接');
    // Network request failed, please check network connection
  }
}

/**
 * 处理流式响应
 * Handle streaming response
 */
async function handleStreamResponse(
  response: Response,
  onStream?: (chunk: string) => void,
  streamCallbacks?: IStreamCallbacks,
): Promise<IChatCompletionResult> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('无法读取响应流');
    // Cannot read response stream
  }

  const decoder = new TextDecoder();
  const state = createStreamState();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log('[AI Stream] Stream completed, total chunks:', state.chunkCount);
        break;
      }

      await processStreamTextChunk(
        decoder.decode(value, { stream: true }),
        state,
        onStream,
        streamCallbacks,
        { yieldToUi: true },
      );
    }

    await processStreamTextChunk(decoder.decode(), state, onStream, streamCallbacks, {
      flush: true,
      yieldToUi: true,
    });
  } finally {
    reader.releaseLock();
  }

  return finalizeStreamState(state, streamCallbacks);
}
