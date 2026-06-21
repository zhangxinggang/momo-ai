/** 笔记树节点（由宿主注入） */
export interface INoteReferenceNode {
  id: string;
  name: string;
  kind: 'folder' | 'file';
  noteType?: string;
  children?: INoteReferenceNode[];
}

export interface INoteReferencesConfig {
  /** 获取笔记树 */
  listTree: () => Promise<INoteReferenceNode[]>;
  /** 发送前将引用 token 展开为笔记正文（可选） */
  resolveContent?: (content: string) => Promise<string>;
}
