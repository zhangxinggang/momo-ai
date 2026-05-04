export { AiChatView } from './components/AiChatView';
export { AiChatConfigProvider, useAiChatConfig } from './contexts/AiChatConfigContext';
export { ChatProvider, useChatContext } from './contexts/ChatContext';

// 会话类型与工具
export {
  DEFAULT_SYSTEM_PROMPT_PLACEHOLDER,
  DEFAULT_WELCOME_MESSAGE,
  ECliAgent,
  STORAGE_KEYS,
  buildStorageKeys,
  generateId,
  generateMessageId,
  generateSessionTitle,
} from './types/chat';
export type {
  EAgentMode,
  IChatAttachment,
  IChatAttachmentMeta,
  IChatContext,
  IChatMessage,
  IChatSession,
} from './types/chat';

export { createDefaultAiChatServices } from './adapters/create-services';
export type {
  IAiChatServices,
  IChatStreamMessage,
  IChatSyncAdapter,
  ICliAgentCallInput,
  ICliAgentCallResult,
  IKbChunk,
  IKbCollection,
  TCallAiChatStream,
  TCallCliAgent,
} from './adapters/types';

export { CLI_AGENT_OPTIONS, CLI_MODEL_PREFIX, isCliModelId, parseCliAgent } from './utils/model-id';

export { buildChatStorageKeys, createMemoryChatStorage } from './storage/chat-storage';
export type {
  IChatAdvancedSettingsSnapshot,
  IChatStorageAdapter,
  IChatStorageKeys,
} from './storage/chat-storage';

/** 宿主构建需引入：import '@momo/aichat/markdown-styles' 或 alias @momo/markdown-styles */

// UI 子组件（按需组合）
export { default as ChatInputPanel } from './components/ChatInputPanel';
export type { IChatInputPanelRef } from './components/ChatInputPanel';
export { ChatWorkspaceControl } from './components/ChatWorkspaceControl';
export { default as CitationCard } from './components/CitationCard';
export { default as CollapsibleThinking } from './components/CollapsibleThinking';
export { default as DropOverlay } from './components/DropOverlay';
export { default as MarkdownRenderer } from './components/MarkdownRenderer';
export { default as StopGenerationButton } from './components/StopGenerationButton';
export { buildChatWorkspaceConfig, useChatWorkspaceConfig } from './hooks/useChatWorkspaceConfig';
export type { IUseChatWorkspaceConfigOptions } from './hooks/useChatWorkspaceConfig';
export type { IChatWorkspaceConfig } from './types/workspace';
export { formatWorkspaceDisplayPath } from './utils/workspace-display';
