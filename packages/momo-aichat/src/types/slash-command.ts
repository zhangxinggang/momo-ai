export interface ISlashCommandItem {
  resourceId: string;
  resourceRevision: string;
  command: string;
  label: string;
  description?: string;
  kind: 'skill' | 'command';
  /** 应用技能、项目 Agent 资源或 Agent 全局资源。 */
  scope: 'application' | 'project' | 'global';
  /** 技能分类与标签仅用于选择器检索和辨识。 */
  category?: string;
  tags?: string[];
  hasArgs?: boolean;
}

export interface ISlashInvocation {
  resourceId: string;
  resourceRevision: string;
  command: string;
  label?: string;
  kind: 'skill' | 'command';
  scope: 'application' | 'project' | 'global';
  category?: string;
  tags?: string[];
  /** 行内序列化 token；同一资源可在一条消息中出现多次。 */
  token?: string;
}

export interface ISlashCommandsListContext {
  workspacePaths: string[];
  workspaceEnabled: boolean;
}

export interface ISlashCommandsListResult {
  items: ISlashCommandItem[];
  warning?: string;
}

export interface ISlashCommandsConfig {
  isActive: (modelId: string) => boolean;
  list: (query: string, ctx: ISlashCommandsListContext) => Promise<ISlashCommandsListResult>;
}

/** 发送前钩子输入 */
export interface IBeforeSubmitPromptInput {
  content: string;
  displayContent: string;
  modelId: string;
  workspacePaths: string[];
  invocation?: ISlashInvocation;
  invocations?: ISlashInvocation[];
}

/** 发送前钩子结果：仅 allow/deny 与文本改写，不执行 shell */
export interface IBeforeSubmitPromptResult {
  action: 'allow' | 'deny';
  content?: string;
  displayContent?: string;
  reason?: string;
  invocation?: ISlashInvocation;
  invocations?: ISlashInvocation[];
}
