/** AI 对话工作区上下文配置（由宿主注入目录选择与持久化） */
export interface IChatWorkspaceConfig {
  /** 是否启用工作区上下文 */
  enabled: boolean;
  /** 已添加的工作区目录列表 */
  paths: string[];
  /** 兼容旧版：首个目录，无目录时为 null */
  path: string | null;
  /** 启用状态变更 */
  onEnabledChange: (enabled: boolean) => void;
  /** 添加工作区目录 */
  onAddFolder: () => void;
  /** 移除指定工作区目录 */
  onRemoveFolder: (folderPath: string) => void;
  /** @deprecated 请使用 onAddFolder */
  onSelectFolder?: () => void;
}
