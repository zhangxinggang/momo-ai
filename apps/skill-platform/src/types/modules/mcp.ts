/** MCP 传输类型 */
export enum EMcpTransportType {
  EStdio = 'stdio',
  ESse = 'sse',
  EHttp = 'http',
}

/** MCP 连接状态 */
export enum EMcpConnectionStatus {
  EIdle = 'idle',
  EConnecting = 'connecting',
  EConnected = 'connected',
  EError = 'error',
  EDisabled = 'disabled',
}

/** 单个 MCP Server 配置（对齐 Cursor mcp.json 条目） */
export interface IMcpServerEntry {
  type?: EMcpTransportType | `${EMcpTransportType}`;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  cwd?: string;
  url?: string;
  headers?: Record<string, string>;
  disabled?: boolean;
}

/** mcp.json 根结构 */
export interface IMcpServersFile {
  mcpServers: Record<string, IMcpServerEntry>;
}

/** 运行时列表项 */
export interface IMcpServerRuntimeStatus {
  name: string;
  entry: IMcpServerEntry;
  transport: EMcpTransportType;
  status: EMcpConnectionStatus;
  errorMessage?: string;
  toolCount: number;
}

/** 暴露给模型的工具描述 */
export interface DMcpTool {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
  serverName: string;
  toolName: string;
}

export interface DMcpCallToolRequest {
  name: string;
  arguments?: Record<string, unknown>;
}

export interface DMcpCallToolResult {
  ok: boolean;
  content: string;
  isError?: boolean;
}
