import type { EAIProtocol } from '@/types/modules';

export interface IChatImageAttachment {
  name?: string;
  mimeType: string;
  base64: string;
}

export type IChatMessageContentPart =
  | { type: 'text'; text: string }
  | {
      type: 'image_url';
      image_url: {
        url: string;
        detail?: 'auto' | 'low' | 'high';
      };
    };

export type TChatMessageContent = string | IChatMessageContentPart[];

export interface IChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: TChatMessageContent;
}

export interface DChatCompletionRequest {
  messages: IChatMessage[];
  model: string;
  temperature?: number;
  max_tokens?: number;
  max_completion_tokens?: number;
  top_p?: number;
  top_k?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
  stream_options?: {
    include_usage?: boolean;
  };
  enable_thinking?: boolean;
  response_format?: {
    type: 'text' | 'json_object' | 'json_schema';
    json_schema?: {
      name: string;
      strict?: boolean;
      schema: Record<string, unknown>;
    };
  };
}

export interface DChatCompletionResponse {
  id: string;
  choices: {
    index: number;
    message: IChatMessage & {
      reasoning_content?: string;
    };
    finish_reason: string;
    delta?: {
      content?: string;
      reasoning_content?: string;
    };
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface IChatParams {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stream?: boolean;
  enableThinking?: boolean;
  customParams?: Record<string, string | number | boolean>;
}

export interface IImageParams {
  size?: string;
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  n?: number;
}

export interface IImageReferenceAttachment {
  name?: string;
  mimeType: string;
  base64: string;
}

export interface IAIConfig {
  id?: string;
  provider: string;
  apiProtocol?: EAIProtocol;
  apiKey: string;
  apiUrl: string;
  model: string;
  type?: 'chat' | 'image';
  chatParams?: IChatParams;
  imageParams?: IImageParams;
}

export interface DImageGenerationRequest {
  prompt: string;
  model?: string;
  n?: number;
  size?: '256x256' | '512x512' | '1024x1024' | '1024x1792' | '1792x1024';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  response_format?: 'url' | 'b64_json';
}

export interface DImageGenerationResponse {
  created: number;
  data: {
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
  }[];
}

export interface IImageTestResult {
  success: boolean;
  imageUrl?: string;
  imageBase64?: string;
  revisedPrompt?: string;
  error?: string;
  latency?: number;
  model: string;
  provider: string;
}

export interface IStreamCallbacks {
  onContent?: (chunk: string) => void;
  onThinking?: (chunk: string) => void;
  onComplete?: (fullContent: string, thinkingContent?: string) => void;
}

export interface ITokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface IChatCompletionResult {
  content: string;
  thinkingContent?: string;
  usage?: ITokenUsage;
}

export interface IAITestResult {
  id?: string;
  success: boolean;
  response?: string;
  thinkingContent?: string;
  error?: string;
  latency?: number;
  model: string;
  provider: string;
}

export interface IMultiModelCompareResult {
  messages: IChatMessage[];
  results: IAITestResult[];
  totalTime: number;
}

export interface IModelInfo {
  id: string;
  name?: string;
  owned_by?: string;
  created?: number;
}

export interface IFetchModelsResult {
  success: boolean;
  models: IModelInfo[];
  error?: string;
  reason?: 'auth' | 'network' | 'unsupported' | 'http' | 'parse';
  endpoint?: string;
  status?: number;
}
