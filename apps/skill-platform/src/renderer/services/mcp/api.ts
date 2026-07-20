import type {
  DMcpCallToolRequest,
  DMcpCallToolResult,
  DMcpTool,
  IMcpServerRuntimeStatus,
  IMcpServersFile,
} from '@/types/modules/mcp';

import { getMcpIpc } from '../ipc';

function requireMcpIpc() {
  const mcp = getMcpIpc();
  if (!mcp) {
    throw new Error('当前环境不支持 MCP IPC');
  }
  return mcp;
}

export function getMcpConfig(): Promise<IMcpServersFile> {
  return requireMcpIpc().getConfig();
}

export function setMcpConfig(file: IMcpServersFile): Promise<{
  errors: Array<{ name: string; message: string }>;
}> {
  return requireMcpIpc().setConfig(file);
}

export function setMcpServerDisabled(name: string, disabled: boolean): Promise<void> {
  return requireMcpIpc().setServerDisabled(name, disabled);
}

export function listMcpServers(): Promise<IMcpServerRuntimeStatus[]> {
  return requireMcpIpc().listServers() as Promise<IMcpServerRuntimeStatus[]>;
}

export function listMcpTools(): Promise<DMcpTool[]> {
  return requireMcpIpc().listTools() as Promise<DMcpTool[]>;
}

export function callMcpTool(req: DMcpCallToolRequest): Promise<DMcpCallToolResult> {
  return requireMcpIpc().callTool(req) as Promise<DMcpCallToolResult>;
}

export function reconnectMcp(name?: string): Promise<void> {
  return requireMcpIpc().reconnect(name);
}
