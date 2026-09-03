export interface ISlashCommandItem {
  resourceId: string;
  resourceRevision: string;
  command: string;
  label: string;
  description?: string;
  kind: 'skill' | 'command';
  scope: 'project' | 'global';
  hasArgs?: boolean;
}

export interface ISlashInvocation {
  resourceId: string;
  resourceRevision: string;
  command: string;
  kind: 'skill' | 'command';
  scope: 'project' | 'global';
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
}

/** 发送前钩子结果：仅 allow/deny 与文本改写，不执行 shell */
export interface IBeforeSubmitPromptResult {
  action: 'allow' | 'deny';
  content?: string;
  displayContent?: string;
  reason?: string;
  invocation?: ISlashInvocation;
}
