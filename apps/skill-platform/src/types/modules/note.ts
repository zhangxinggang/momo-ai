/** 笔记类型：文本 / 绘图 */
export type ENoteType = 'text' | 'image';

/** 树节点种类 */
export type ENoteNodeKind = 'folder' | 'file';

/** 笔记树节点（相对 notes 根目录的路径作为 id） */
export interface INoteTreeNode {
  id: string;
  name: string;
  kind: ENoteNodeKind;
  noteType?: ENoteType;
  children?: INoteTreeNode[];
}

export interface DCreateNoteFolder {
  parentPath: string | null;
  name: string;
}

export interface DCreateNoteFile {
  parentPath: string | null;
  name: string;
  noteType?: ENoteType;
}

export interface DRenameNoteNode {
  path: string;
  newName: string;
}

export interface DMoveNoteNode {
  sourcePath: string;
  targetParentPath: string | null;
}

export interface IReadNoteFileResult {
  path: string;
  content: string;
  noteType: ENoteType;
}
