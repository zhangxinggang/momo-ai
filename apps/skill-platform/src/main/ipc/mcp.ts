import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type { DMcpCallToolRequest, IMcpServersFile } from '@/types/modules/mcp';
import { ipcMain } from 'electron';

import { getMcpHub } from '../services/mcp';

/** 注册 MCP IPC */
export function registerMcpIPC(): void {
  const hub = getMcpHub();

  ipcMain.handle(IPC_CHANNELS.MCP_GET_CONFIG, async () => hub.getConfig());
  ipcMain.handle(IPC_CHANNELS.MCP_SET_CONFIG, async (_event, file: IMcpServersFile) =>
    hub.setConfig(file),
  );
  ipcMain.handle(
    IPC_CHANNELS.MCP_SET_SERVER_DISABLED,
    async (_event, name: string, disabled: boolean) => hub.setServerDisabled(name, disabled),
  );
  ipcMain.handle(IPC_CHANNELS.MCP_LIST_SERVERS, async () => hub.listServers());
  ipcMain.handle(IPC_CHANNELS.MCP_LIST_TOOLS, async () => hub.listTools());
  ipcMain.handle(IPC_CHANNELS.MCP_CALL_TOOL, async (_event, req: DMcpCallToolRequest) =>
    hub.callTool(req),
  );
  ipcMain.handle(IPC_CHANNELS.MCP_RECONNECT, async (_event, name?: string) => hub.reconnect(name));
}

/** 启动 MCP Hub（异步，失败仅打日志） */
export async function startMcpHub(): Promise<void> {
  await getMcpHub().start();
}
