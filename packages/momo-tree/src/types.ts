/** 树节点类型：目录或文件 */
export type EMomoTreeNodeKind = 'folder' | 'file';

/** 笔记类型，用于筛选（文本 / 绘图） */
export type EMomoTreeNoteType = 'text' | 'image';

/** 树节点数据（由外部提供） */
export interface IMomoTreeNode {
  id: string;
  name: string;
  kind: EMomoTreeNodeKind;
  children?: IMomoTreeNode[];
  /** 仅文件节点：笔记类型 */
  noteType?: EMomoTreeNoteType;
}

/** 树操作文案 */
export interface IMomoTreeLabels {
  createFolder: string;
  createNote: string;
  copy?: string;
  move: string;
  delete: string;
  rename: string;
  deleteConfirmTitle: string;
  deleteConfirmContent: string;
  renameTitle: string;
  renamePlaceholder: string;
  moveTitle: string;
  movePlaceholder: string;
  confirm: string;
  cancel: string;
  createFolderTitle?: string;
  createNoteTitle?: string;
  createNamePlaceholder?: string;
  duplicateNameError?: string;
  emptyNameError?: string;
  /** 删除含子文件的目录时需输入的确认词 */
  deleteFolderTypedConfirmWord?: string;
  deleteFolderTypedConfirmHint?: string;
}

/** 外部注入的树操作接口 */
export interface IMomoTreeAdapter {
  onCreateFolder: (parentId: string | null, name: string) => Promise<void>;
  onCreateNote: (parentId: string | null, name: string) => Promise<void>;
  onRename: (nodeId: string, newName: string) => Promise<void>;
  onDelete: (nodeId: string) => Promise<void>;
  onMove: (nodeId: string, targetParentId: string | null) => Promise<void>;
  /** 复制文件节点（非目录） */
  onCopy?: (nodeId: string) => Promise<void>;
  /** 统计目录下非目录节点数量，用于删除确认 */
  countNonFolderDescendants?: (folderId: string) => number;
}
