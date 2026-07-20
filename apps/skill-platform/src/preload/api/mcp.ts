import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type { DMcpCallToolRequest, IMcpServersFile } from '@/types/modules/mcp';
import { ipcRenderer } from 'electron';

export const mcpApi = {
  getConfig: () => ipcRenderer.invoke(IPC_CHANNELS.MCP_GET_CONFIG) as Promise<IMcpServersFile>,
  setConfig: (file: IMcpServersFile) =>
    ipcRenderer.invoke(IPC_CHANNELS.MCP_SET_CONFIG, file) as Promise<{
      errors: Array<{ name: string; message: string }>;
    }>,
  setServerDisabled: (name: string, disabled: boolean) =>
    ipcRenderer.invoke(IPC_CHANNELS.MCP_SET_SERVER_DISABLED, name, disabled) as Promise<void>,
  listServers: () => ipcRenderer.invoke(IPC_CHANNELS.MCP_LIST_SERVERS),
  listTools: () => ipcRenderer.invoke(IPC_CHANNELS.MCP_LIST_TOOLS),
  callTool: (req: DMcpCallToolRequest) => ipcRenderer.invoke(IPC_CHANNELS.MCP_CALL_TOOL, req),
  reconnect: (name?: string) => ipcRenderer.invoke(IPC_CHANNELS.MCP_RECONNECT, name) as Promise<void>,
};
