/** Agent 应用探测命中项 */
export interface DAgentAppDetectionItem {
  platformId: string;
  matchedFolderPaths: string[];
  matchedMarkers: Array<{
    folderPath: string;
    markerPath: string;
    strength: 'primary' | 'supporting';
  }>;
}

/** 文件夹 Agent 探测结果 */
export interface DAgentAppDetectInput {
  requestKey: string;
  folderPaths: string[];
}

export interface DAgentAppDetectResult {
  requestKey: string;
  folderPaths: string[];
  items: DAgentAppDetectionItem[];
  errors: Array<{
    folderPath: string;
    code: 'not-found' | 'not-directory' | 'unreadable' | 'unauthorized';
  }>;
}

/** 规则/技能/命令资源来源 */
export interface DAgentAppResourceSource {
  scope: 'project' | 'global';
  path: string;
  kind: 'rule' | 'skill' | 'command' | 'hook';
}

/** Agent 运行时上下文（供对话注入） */
export interface DAgentAppContext {
  agentAppId: string;
  agentAppName: string;
  systemPrompt: string;
  sources: DAgentAppResourceSource[];
}

/** 斜杠命令列表项 */
export interface DAgentAppSlashItem {
  resourceId: string;
  resourceRevision: string;
  command: string;
  label: string;
  description?: string;
  kind: 'skill' | 'command';
  scope: 'project' | 'global';
  hasArgs?: boolean;
}

export interface DAgentAppListSlashInput {
  agentAppId: string;
  folderPaths: string[];
  query?: string;
}

export interface DAgentAppListSlashResult {
  items: DAgentAppSlashItem[];
  warning?: string;
}

export interface DAgentAppPrepareSubmitInput {
  agentAppId: string;
  folderPaths: string[];
  content: string;
  displayContent: string;
  invocation?: {
    resourceId: string;
    resourceRevision: string;
    command: string;
    kind: 'skill' | 'command';
    scope: 'project' | 'global';
  };
}

export interface DAgentAppPrepareSubmitResult {
  action: 'allow' | 'deny';
  content?: string;
  displayContent?: string;
  reason?: string;
  invocation?: DAgentAppPrepareSubmitInput['invocation'];
}
