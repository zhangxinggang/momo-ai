/** 自定义工具树节点种类：组织目录或工具包 */
export type ECustomToolNodeKind = 'folder' | 'tool';

/** 自定义工具树节点（相对 tools 根目录的路径作为 id） */
export interface ICustomToolTreeNode {
  id: string;
  name: string;
  kind: ECustomToolNodeKind;
  children?: ICustomToolTreeNode[];
}

export interface IReadCustomToolFileResult {
  /** 工具包相对路径（文件夹 id，非 index.html） */
  path: string;
  content: string;
}

/** 工具包元数据（tool.json） */
export interface DCustomToolMeta {
  kind: 'tool';
  version: number;
}
