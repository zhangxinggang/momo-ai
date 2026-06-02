/** 工作区常用预设 */
export interface IChatWorkspacePreset {
  id: string;
  name: string;
  paths: string[];
}

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
  /** 已保存的常用工作区（可选） */
  presets?: IChatWorkspacePreset[];
  /** 当前选中的常用 id，用于展示对应目录列表 */
  activePresetId?: string | null;
  /** 选中常用并应用其目录 */
  onPresetSelect?: (presetId: string) => void;
  /** 将当前目录保存为常用 */
  onPresetSave?: (name: string, paths: string[]) => void;
  /** 重命名常用 */
  onPresetRename?: (presetId: string, name: string) => void;
  /** 删除常用 */
  onPresetDelete?: (presetId: string) => void;
  /** 在系统文件管理器中打开目录 */
  onOpenFolderPath?: (folderPath: string) => void;
  /** 检测目录是否存在 */
  checkPathExists?: (folderPath: string) => Promise<boolean>;
}
