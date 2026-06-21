import type { ReactNode } from 'react';
import type { IChatStorageAdapter } from '../storage/chat-storage';
import type { IChatAttachment, IChatAttachmentMeta, IChatSession } from '../types/chat';
import type { ISlashCommandsConfig } from '../types/slash-command';
import type { INoteReferencesConfig } from '../types/note-reference';
import type { ILocalPathConfig } from '../types/local-path';
import type { IChatWorkspaceConfig } from '../types/workspace';

export interface IChatStreamMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface IChatStreamStats {
  model: string;
  responseTime: string;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  citations?: Array<{
    title?: string;
    preview?: string;
    docId: number;
    chunkId: number;
    score?: number;
    idx?: number;
  }>;
}

export interface IChatStreamOptions {
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  abortController?: AbortController;
  user_system_prompt?: string;
  kb_enabled?: boolean;
  kb_collection_id?: number;
  kb_top_k?: number;
  /** 生图模型：当前轮用户上传的参考图 */
  referenceImages?: Array<{
    name?: string;
    mimeType: string;
    base64: string;
  }>;
  /** 思考内容流式回调（增量 chunk） */
  onThinking?: (chunk: string) => void;
}

export interface ICliAgentCallInput {
  agent: 'claude' | 'codex';
  prompt: string;
  sessionId?: string;
  cwd?: string;
}

export interface ICliAgentCallResult {
  content: string;
  sessionId: string;
  model: string;
  responseTimeSec: string;
}

export type TCallCliAgent = (input: ICliAgentCallInput) => Promise<ICliAgentCallResult>;

export type TCallAiChatStream = (
  messages: IChatStreamMessage[],
  onChunk: (chunk: string) => void,
  onError?: (error: string) => void,
  onStats?: (stats: IChatStreamStats) => void,
  model?: string,
  options?: IChatStreamOptions,
) => Promise<void>;

export type TUploadFilesFn = (
  files: File[],
  onProgress?: (fileIndex: number, progress: number) => void,
) => Promise<IChatAttachment[]>;

export type TValidateLocalFilesFn = (files: File[]) => { ok: boolean; message?: string };

export interface IKbCollection {
  id: number;
  name: string;
}

export interface IKbChunk {
  docName: string;
  idx: number;
  tokens: number;
  content: string;
}

export interface IChatSyncAdapter {
  syncGuestData: (guestSessions: IChatSession[]) => Promise<boolean>;
  loadCloudData: () => Promise<IChatSession[]>;
  saveMessage: (
    sessionId: string,
    role: 'user' | 'assistant',
    content: string,
    title?: string,
  ) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
}

/** 宿主可注入的 AI 对话服务能力 */

export interface IAiChatServices {
  apiBaseUrl: string;
  callAIChatStream: TCallAiChatStream;
  uploadFiles: TUploadFilesFn;
  validateLocalFiles: TValidateLocalFilesFn;
  getIsAuthenticated?: () => boolean;
  chatSync?: IChatSyncAdapter | null;
  listKbCollections?: () => Promise<IKbCollection[]>;
  getKbChunk?: (chunkId: number) => Promise<IKbChunk>;
  /** 附件图标基础路径，默认 /icons/ */
  attachmentIconBasePath?: string;
  defaultModel?: string;
  storageKeyPrefix?: string;
  /** 可选对话模型列表，供输入栏模型选择器使用 */
  chatModels?: Array<{ id: string; label: string; group?: string }>;
  /** 分组模型选项（对话 / 图像），优先于 chatModels 平铺列表 */
  chatModelOptionGroups?: Array<{
    label: string;
    options: Array<{ id: string; label: string }>;
  }>;
  /** 自定义模型选择器（树形下拉），优先于内置 Select */
  renderModelSelect?: (props: {
    value?: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    variant?: 'default' | 'borderless';
    className?: string;
  }) => ReactNode;
  /** 工作区上下文（由宿主注入） */
  workspace?: IChatWorkspaceConfig;
  /** 游客模式会话持久化（由宿主注入，包内不直接访问 Web Storage） */
  chatStorage: IChatStorageAdapter;
  /** CLI Agent 调用（Electron 主进程 spawn） */
  callCliAgent?: TCallCliAgent;
  /** Superpowers 系统提示词（仅 API 模型，每次发送前注入） */
  superpowerPrompts?: {
    workflow: string;
  };
  /** 输入框斜杠命令补全（由宿主注入，如 Claude Code） */
  slashCommands?: ISlashCommandsConfig;
  /** 输入框 @ 笔记引用（由宿主注入） */
  noteReferences?: INoteReferencesConfig;
  /** 消息内本地路径点击（由宿主注入） */
  localPath?: ILocalPathConfig;
  /** 判断模型 id 是否为生图模型 */
  isImageModel?: (modelId: string) => boolean;
  /** 生图模型输入框占位提示 */
  getImageModelInputHint?: (modelId: string) => string | undefined;
}

export type { IChatAttachment, IChatAttachmentMeta, IChatSession };
