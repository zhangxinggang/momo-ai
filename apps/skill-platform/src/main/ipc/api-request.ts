import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import { executeApiRequest, type IApiRequestConfig } from '@momo/api-request/core';
import { ipcMain, net } from 'electron';

/** 使用 Chromium 网络栈执行接口调试请求，保留系统代理与证书行为。 */
export function registerApiRequestIPC(): void {
  ipcMain.handle(IPC_CHANNELS.API_REQUEST_EXECUTE, async (_event, config: IApiRequestConfig) =>
    executeApiRequest(config, net.fetch as typeof fetch),
  );
}
