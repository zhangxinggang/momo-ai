export interface ISlashCommandItem {
  command: string;
  label: string;
  description?: string;
  group?: string;
  hasArgs?: boolean;
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
