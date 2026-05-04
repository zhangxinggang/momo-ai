/** AI 对话工作区上下文配置（由宿主注入目录选择与持久化） */
export interface IChatWorkspaceConfig {
  /** 是否启用工作区上下文 */
  enabled: boolean;
  /** 当前选中的工作区目录 */
  path: string | null;
  /** 启用状态变更 */
  onEnabledChange: (enabled: boolean) => void;
  /** 选择工作区目录（启用时触发） */
  onSelectFolder: () => void;
}
