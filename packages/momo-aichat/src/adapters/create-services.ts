import { createMemoryChatStorage } from '../storage/chat-storage';
import { createCallAIChatStream } from '../utils/ai-stream';
import { createChatSyncAdapter } from '../utils/chat-sync-api';
import { createUploadFiles, validateLocalFiles } from '../utils/file-upload';
import { createKbApi } from '../utils/kb-api';
import type { IAiChatServices } from './types';

const DEFAULT_API_BASE = 'http://localhost:3001';
const DEFAULT_MODEL = 'Qwen/Qwen3-Next-80B-A3B-Instruct';

export function createDefaultAiChatServices(overrides?: Partial<IAiChatServices>): IAiChatServices {
  const apiBaseUrl = overrides?.apiBaseUrl ?? DEFAULT_API_BASE;
  const kb = createKbApi(apiBaseUrl);

  const base: IAiChatServices = {
    apiBaseUrl,
    callAIChatStream: createCallAIChatStream(apiBaseUrl),
    uploadFiles: createUploadFiles(apiBaseUrl),
    validateLocalFiles,
    getIsAuthenticated: () => false,
    chatSync: createChatSyncAdapter(apiBaseUrl),
    listKbCollections: () => kb.listCollections(),
    getKbChunk: (chunkId) => kb.getChunk(chunkId),
    attachmentIconBasePath: '/icons/',
    defaultModel: DEFAULT_MODEL,
    storageKeyPrefix: 'momo-aichat',
    chatStorage: createMemoryChatStorage(),
  };

  return { ...base, ...overrides };
}
