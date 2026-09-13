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

/** 自定义工具后台进程类型。端口统一由宿主动态分配，工具代码通过 MOMO_TOOL_PORT 获取。 */
export type ECustomToolServiceRuntime = 'none' | 'node' | 'python';

export interface ICustomToolServiceConfig {
  runtime: ECustomToolServiceRuntime;
  /** 相对工具包根目录的服务入口，例如 backend/server.mjs。 */
  entry?: string;
  args?: string[];
  /** 服务就绪探针；未设置时只检查端口是否开始监听。 */
  healthPath?: string;
  startupTimeoutMs?: number;
  env?: Record<string, string>;
}

export interface ICustomToolPermissions {
  /** 允许页面调用的 MCP 聚合工具名（server__tool）。 */
  mcp?: string[];
  /** 允许页面执行的 Skill id 或名称。 */
  skills?: string[];
}

/** 工具包元数据（tool.json）。v1 工具会按纯静态工具兼容读取。 */
export interface DCustomToolMeta {
  kind: 'tool';
  version: number;
  entry?: string;
  service?: ICustomToolServiceConfig;
  permissions?: ICustomToolPermissions;
}

export interface ICustomToolGeneratedFile {
  /** 相对工具包根目录的 POSIX 路径。 */
  path: string;
  content: string;
}

export type ECustomToolRuntimeStatus = 'idle' | 'starting' | 'running' | 'error';

/** 选择工具后由主进程返回的隔离运行信息。 */
export interface ICustomToolRuntimeInfo {
  toolPath: string;
  status: ECustomToolRuntimeStatus;
  /** 宿主静态服务地址，天然支持相对 assets 路径。 */
  previewUrl: string;
  serviceRuntime: ECustomToolServiceRuntime;
  permissions: ICustomToolPermissions;
  errorMessage?: string;
  logs?: string[];
}
