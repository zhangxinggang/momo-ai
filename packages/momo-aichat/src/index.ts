export { AiChatView } from './components/AiChatView';
export { AiChatConfigProvider, useAiChatConfig } from './contexts/AiChatConfigContext';
export { ChatProvider, useChatContext } from './contexts/ChatContext';

// 会话类型与工具
export {
  AI_CHAT_SESSIONS_UPDATED_EVENT,
  DEFAULT_SYSTEM_PROMPT_PLACEHOLDER,
  DEFAULT_WELCOME_MESSAGE,
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
  INoteSnapshot,
} from './types/chat';

export type {
  IAiChatServices,
  IChatStreamMessage,
  IChatStreamStats,
  IChatSyncAdapter,
  IKbChunk,
  IKbCollection,
  TCallAiChatStream,
} from './adapters/types';
export type { ILocalPathConfig } from './types/local-path';
export type { IChatSourceInput, IChatSourceRef, IResolvedChatSource } from './types/source';

export { buildChatStorageKeys, createMemoryChatStorage } from './storage/chat-storage';
export type {
  IChatAdvancedSettingsSnapshot,
  IChatStorageAdapter,
  IChatStorageKeys,
} from './storage/chat-storage';

/** 宿主构建需引入：import '@momo/aichat/markdown-styles' 或 alias @momo/markdown-styles */

// UI 子组件（按需组合）
export { ChatFeatureDropdown } from './components/ChatFeatureDropdown';
export { default as ChatInputPanel } from './components/ChatInputPanel';
export type { IChatInputPanelRef } from './components/ChatInputPanel';
export { ChatMentionTextarea } from './components/ChatMentionTextarea';
export type { IChatMentionTextareaRef } from './components/ChatMentionTextarea';
export { ChatWorkspaceControl } from './components/ChatWorkspaceControl';
export { ChatWorkspaceToolbar } from './components/ChatWorkspaceToolbar';
export { default as CitationCard } from './components/CitationCard';
export { default as CollapsibleThinking } from './components/CollapsibleThinking';
export { default as DropOverlay } from './components/DropOverlay';
export { default as MarkdownRenderer } from './components/MarkdownRenderer';
export { NoteReferenceChip } from './components/NoteReferenceChip';
export { NoteReferencePopover } from './components/NoteReferencePopover';
export { NoteReferenceText } from './components/NoteReferenceText';
export { SlashCommandPopover } from './components/SlashCommandPopover';
export { default as StopGenerationButton } from './components/StopGenerationButton';
export {
  buildChatWorkspaceConfig,
  buildReadonlyChatWorkspaceConfig,
  useChatWorkspaceConfig,
} from './hooks/useChatWorkspaceConfig';
export type { IUseChatWorkspaceConfigOptions } from './hooks/useChatWorkspaceConfig';
export { useNoteReferenceTrigger } from './hooks/useNoteReferenceTrigger';
export { useSlashCommandTrigger } from './hooks/useSlashCommandTrigger';
export type { INoteReferenceNode, INoteReferencesConfig } from './types/note-reference';
export type { IChatProject } from './types/project';
export type {
  IBeforeSubmitPromptInput,
  IBeforeSubmitPromptResult,
  ISlashCommandItem,
  ISlashCommandsConfig,
  ISlashCommandsListContext,
  ISlashCommandsListResult,
} from './types/slash-command';
export type { IChatWorkspaceConfig, IChatWorkspacePreset } from './types/workspace';
export {
  buildChatProjectUniqueKey,
  getChatProjectDisplayName,
  normalizeFolderPaths,
} from './utils/chat-project';
export {
  enhanceExternalUrlElements,
  isHttpUrl,
  splitPlainTextByHttpUrls,
  trimUrlTrailingPunctuation,
} from './utils/external-url';
export {
  enhanceLocalPathElements,
  isAbsoluteLocalPath,
  isLocalPathLike,
  joinLocalPath,
  normalizeLocalPathValue,
  splitPlainTextByLocalPaths,
  stripCodeLanguagePrefix,
  stripTrailingPathPunctuation,
} from './utils/local-path';
export {
  NOTE_SNAPSHOT_MAX_CHARS,
  NOTE_SNAPSHOT_TRUNCATED_SUFFIX,
  buildNoteMentionToken,
  ensureNoteSnapshots,
  expandNoteMentionsWithSnapshots,
  getNoteMentionDisplayPath,
  normalizeNotePath,
  parseNoteReferenceContent,
  resolveNoteMentionsInContent,
  stripEchoedNoteBlocks,
  truncateNoteContent,
  valueToSurface,
} from './utils/note-mention';
export { formatRelativeCompact } from './utils/relative-compact-time';
export { formatWorkspaceDisplayPath } from './utils/workspace-display';
