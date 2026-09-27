/** @ 引用树节点（由宿主注入，可表示笔记或工作区文件） */
export interface INoteReferenceNode {
  id: string;
  name: string;
  kind: 'folder' | 'file';
  noteType?: 'note' | 'workspace' | string;
  children?: INoteReferenceNode[];
}

export interface INoteReferencesConfig {
  /** 由宿主提供显式引用的回答规则。 */
  systemHint?: string;
  /** 获取可引用资源树 */
  listTree: () => Promise<INoteReferenceNode[]>;
  /** 按需加载文件夹的直接子项；提供后引用树会在展开时动态加载 */
  loadChildren?: (folder: INoteReferenceNode) => Promise<INoteReferenceNode[]>;
  /** 按引用 id 读取资源正文 */
  readContent: (path: string) => Promise<string>;
  /** 发送前将引用 token 展开为资源正文（可选） */
  resolveContent?: (content: string) => Promise<string>;
}
