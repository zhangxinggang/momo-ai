/** 文件树条目 */
export interface IFileTreeEntry {
  relativePath: string;
  isDirectory: boolean;
  size?: number;
}

/** 宿主注入的文件读写能力 */
export interface IFileEditorAdapter {
  /** 列出目录下全部文件与文件夹 */
  listTree: () => Promise<IFileTreeEntry[]>;
  /** 读取文件文本内容 */
  readFile: (relativePath: string) => Promise<string>;
  /** 读取二进制文件内容，用于 [binary file] 占位时的预览（可选） */
  readFileBuffer?: (relativePath: string) => Promise<ArrayBuffer | null>;
  /** 写入文件，成功返回 true */
  writeFile: (relativePath: string, content: string) => Promise<boolean>;
  /** 删除文件或空目录 */
  deletePath: (relativePath: string) => Promise<boolean>;
  /** 创建目录 */
  createDirectory: (relativePath: string) => Promise<boolean>;
  /** 移动或重命名文件/目录（可选） */
  movePath?: (fromRelativePath: string, toRelativePath: string) => Promise<boolean>;
  /** 过滤不应展示的条目（可选） */
  filterEntry?: (entry: IFileTreeEntry) => boolean;
  /** 打开后默认选中的文件（可选） */
  selectInitialPath?: (entries: IFileTreeEntry[]) => string | null;
}

export type EFileEditorNotifyType = 'success' | 'error';

export interface IFileEditorNotifyPayload {
  message: string;
  type: EFileEditorNotifyType;
}
