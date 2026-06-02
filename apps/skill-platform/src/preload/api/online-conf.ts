import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type { DOnlineConfFetchResult } from '@/types/modules/online-conf';
import { ipcRenderer } from 'electron';

export const onlineConfApi = {
  fetch: (): Promise<DOnlineConfFetchResult> => ipcRenderer.invoke(IPC_CHANNELS.ONLINE_CONF_FETCH),
};
