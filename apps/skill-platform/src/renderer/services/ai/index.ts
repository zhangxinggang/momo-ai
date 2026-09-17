export type {
  DChatCompletionRequest,
  DChatCompletionResponse,
  DChatCompletionTool,
  DImageGenerationRequest,
  DImageGenerationResponse,
  IAIConfig,
  IAITestResult,
  IChatCompletionResult,
  IChatImageAttachment,
  IChatMessage,
  IChatMessageContentPart,
  IChatParams,
  IChatToolCall,
  IFetchModelsResult,
  IImageParams,
  IImageReferenceAttachment,
  IImageTestResult,
  IModelInfo,
  IStreamCallbacks,
  ITokenUsage,
  TChatMessageContent,
  TChatToolChoice,
} from './types';

export { buildMessagesFromPrompt } from '../prompt/messages';
export { generateSkillContent, polishSkillContent } from '../skill/content-generation';
export { compareAIModels, testAIConnection, testEmbeddingConnection } from './testing';

export { chatCompletion } from './chat';
export { generateImage, testImageGeneration } from './image';
export { fetchAvailableModels } from './models';
export {
  getApiEndpointPreview,
  getEmbeddingApiEndpointPreview,
  getImageApiEndpointPreview,
  resolveAIProtocol,
} from './protocol';
export { getBaseUrl, normalizeApiUrlInput } from './url';
