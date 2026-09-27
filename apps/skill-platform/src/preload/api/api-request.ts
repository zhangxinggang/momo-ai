import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type { IApiRequestConfig, IApiRequestResponse } from '@momo/api-request/core';
import { ipcRenderer } from 'electron';

export const apiRequestApi = {
  execute: (config: IApiRequestConfig) =>
    ipcRenderer.invoke(IPC_CHANNELS.API_REQUEST_EXECUTE, config) as Promise<IApiRequestResponse>,
};
