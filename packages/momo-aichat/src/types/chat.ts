/**
 * 聊天相关的数据类型定义
 */

/** CLI Agent 类型 */
export enum ECliAgent {
  EClaude = 'claude',
  ECodex = 'codex',
}

/** 智能体交互模式 */
export type EAgentMode = 'ask' | 'plan';

// 消息类型定义 - 触发重新编译
export interface IChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  /** 思考模型推理过程（可折叠展示） */
  thinkingContent?: string;
  isLoading?: boolean;
  // 标记是否为错误消息（用于 UI 自动滚动等逻辑，样式保持一致）
  isError?: boolean;
  // AI回复的统计信息
  stats?: {
    model: string;
    responseTime: string;
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
    // 可选：RAG 引用
    citations?: Array<{
      title?: string;
      preview?: string;
      docId: number;
      chunkId: number;
      score?: number;
      idx?: number;
    }>;
  };
  // 附件（仅用于展示的元信息）
  attachments?: IChatAttachmentMeta[];
}

/** 笔记引用快照（会话级） */
export interface INoteSnapshot {
  path: string;
  content: string;
  snapshotAt: number;
  isTruncated: boolean;
  originalLength: number;
}

// 会话类型定义
export interface IChatSession {
  id: string;
  title: string;
  messages: IChatMessage[];
  createdAt: number;
  updatedAt: number;
  isLoading?: boolean; // 每个会话独立的加载状态
  /** CLI Agent 会话 ID（--resume 复用） */
  cliAgentSessionId?: string;
  /** 创建 CLI 会话时的 agent 类型 */
  cliAgentType?: ECliAgent;
  /** 笔记引用快照，key 为规范化路径 */
  noteSnapshots?: Record<string, INoteSnapshot>;
}

// 会话状态管理接口
export interface IChatContext {
  // 当前会话列表
  sessions: IChatSession[];
  // 当前活跃会话ID
  currentSessionId: string | null;
  // 当前活跃会话
  currentSession: IChatSession | null;
  // 是否正在加载AI回复
  isAILoading: boolean;
  // 当前选中的模型
  currentModel: string;
  // 获取指定会话的生成状态
  isSessionGenerating: (sessionId: string) => boolean;

  // 会话管理方法
  createNewSession: () => IChatSession;
  switchToSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;

  // 消息管理方法
  addMessage: (sessionId: string, message: Omit<IChatMessage, 'id' | 'timestamp'>) => IChatMessage;
  updateMessage: (sessionId: string, messageId: string, updates: Partial<IChatMessage>) => void;
  /** 删除用户消息；若其后有助手回复则一并删除 */
  deleteUserMessage: (userMessageId: string) => void;
  /** 在原有问答记录上重试（不新增用户消息） */
  retryAssistantReply: (userMessageId: string) => Promise<void>;

  // AI交互方法
  sendMessage: (
    content: string,
    attachmentsMeta?: IChatAttachmentMeta[],
    options?: {
      displayContent?: string;
      /** 生图模型：参考图 base64 */
      referenceImages?: Array<{
        name?: string;
        mimeType: string;
        base64: string;
      }>;
      /** 重试模式：复用已有用户/助手消息，不新增记录 */
      retry?: {
        userMessageId: string;
        assistantMessageId: string;
      };
    },
  ) => Promise<void>;
  // 停止生成方法
  stopGeneration: (sessionId: string) => void;
  // 设置当前模型
  setCurrentModel: (modelId: string) => void;

  /** 当前选中的是否为 CLI Agent 模型 */
  isCliModel: boolean;

  // 智能新对话逻辑
  handleNewChat: () => void;

  // 高级设置：温度、top_p 与系统提示词
  temperature: number;
  topP: number;
  systemPrompt: string;
  setTemperature: (v: number) => void;
  setTopP: (v: number) => void;
  setSystemPrompt: (v: string) => void;
  // RAG 设置
  kbEnabled: boolean;
  setKbEnabled: (v: boolean) => void;
  kbCollectionId?: number;
  setKbCollectionId: (id?: number) => void;
  /** 智能体模式：ask 直接问答，plan 计划梳理 */
  agentMode: EAgentMode;
  setAgentMode: (mode: EAgentMode) => void;

  /** 从持久化存储重新加载会话（弹窗写入历史后刷新侧栏） */
  refreshSessionsFromStorage: () => void;
}

/** 外部写入 AI 对话持久化后通知各 ChatProvider 刷新 */
export const AI_CHAT_SESSIONS_UPDATED_EVENT = 'ai-chat:sessions-updated';

// 本地存储键名常量（默认前缀）
export const STORAGE_KEYS = {
  CHAT_SESSIONS: 'chat-studio-sessions',
  CURRENT_SESSION_ID: 'chat-studio-current-session-id',
  CURRENT_MODEL: 'chat-studio-current-model',
  ADVANCED_SETTINGS: 'chat-studio-advanced-settings',
} as const;

/** 根据前缀生成隔离的持久化键名 */
export function buildStorageKeys(prefix: string) {
  return {
    CHAT_SESSIONS: `${prefix}-sessions`,
    CURRENT_SESSION_ID: `${prefix}-current-session-id`,
    CURRENT_MODEL: `${prefix}-current-model`,
    ADVANCED_SETTINGS: `${prefix}-advanced-settings`,
  } as const;
}

// 默认欢迎消息
export const DEFAULT_WELCOME_MESSAGE = '你好！我是 AI 助手，有什么可以帮助您的吗？';

// 默认系统提示词（作为占位符展示，不默认生效）
export const DEFAULT_SYSTEM_PROMPT_PLACEHOLDER =
  '你是 AI 助手。请以清晰、简洁且结构化的方式作答，必要时使用项目符号或表格帮助理解。避免编造信息。';

// 生成唯一ID的工具函数
// 兼容 HTTP（非安全上下文）：crypto.randomUUID 仅在 HTTPS/localhost 下可用
export const generateId = (): string => {
  // 优先使用标准 API
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // 回退：使用 crypto.getRandomValues 手动构造 UUID v4
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  // 最终回退：Math.random（HTTP 非安全环境兜底）
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// 生成消息ID的工具函数
export const generateMessageId = (): string => {
  return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// 截取标题的工具函数（取用户消息前8字）
export const generateSessionTitle = (firstUserMessage: string): string => {
  if (!firstUserMessage.trim()) return '新对话';
  return firstUserMessage.trim().slice(0, 10) + (firstUserMessage.length > 10 ? '...' : '');
};

// 上传附件类型定义
export interface IChatAttachment {
  id: string;
  name: string;
  size: number;
  mime: string;
  ext: string;
  text: string;
  snippet: string;
  /** 图片附件的 base64 数据（不含 data URL 前缀） */
  imageBase64?: string;
}

// 消息中展示的附件精简信息
// 增加可选的字符统计，用于输入面板展示“文字数量”
export type IChatAttachmentMeta = Pick<
  IChatAttachment,
  'id' | 'name' | 'size' | 'mime' | 'ext' | 'snippet'
> & {
  charCount?: number;
  /** 图片附件 base64，用于生图重试 */
  imageBase64?: string;
};
