export type {
  DChatCompletionRequest,
  DChatCompletionResponse,
  DImageGenerationRequest,
  DImageGenerationResponse,
  IAIConfig,
  IAITestResult,
  IChatCompletionResult,
  IChatImageAttachment,
  IChatMessage,
  IChatMessageContentPart,
  IChatParams,
  IFetchModelsResult,
  IImageParams,
  IImageReferenceAttachment,
  IImageTestResult,
  IModelInfo,
  IMultiModelCompareResult,
  IStreamCallbacks,
  ITokenUsage,
  TChatMessageContent,
} from './types';

export { buildMessagesFromPrompt } from '../prompt/messages';
export { generateSkillContent, polishSkillContent } from '../skill/content-generation';
export { compareAIModels, multiModelCompare, testAIConnection } from './testing';

export { chatCompletion } from './chat';
export { generateImage, testImageGeneration } from './image';
export { fetchAvailableModels } from './models';
export { getApiEndpointPreview, getImageApiEndpointPreview, resolveAIProtocol } from './protocol';
export { getBaseUrl, normalizeApiUrlInput } from './url';
