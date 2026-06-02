/** Claude Code 斜杠命令来源 */
export enum EClaudeSlashSource {
  EBuiltin = 'builtin',
  EProject = 'project',
  EGlobal = 'global',
  ESkill = 'skill',
}

export interface IClaudeSlashItem {
  command: string;
  label: string;
  description?: string;
  source: EClaudeSlashSource;
  /** 项目级命令关联的工作区根路径 */
  projectPath?: string;
  hasArgs?: boolean;
}

export interface IListClaudeSlashInput {
  query?: string;
  workspacePaths?: string[];
  /** 用于 help 探测的工作目录 */
  cwd?: string;
}

export interface IListClaudeSlashResult {
  items: IClaudeSlashItem[];
  builtinAvailable: boolean;
  warning?: string;
}
