/** AI 对话中本地路径点击配置（由 Electron 等宿主注入） */
export interface ILocalPathConfig {
  /** 将消息中的相对路径解析为绝对路径 */
  resolveLocalPath?: (rawPath: string) => string | null;
  /** 在系统默认应用中打开路径 */
  onOpenLocalPath?: (absolutePath: string) => void | Promise<void>;
  /** 检测路径是否存在 */
  checkPathExists?: (path: string) => Promise<boolean>;
}
