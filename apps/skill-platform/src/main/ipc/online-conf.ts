import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import { ipcMain } from 'electron';

import { fetchOnlineConf } from '../services/online-conf';

/** 注册在线配置 IPC */
export function registerOnlineConfIPC(): void {
  ipcMain.handle(IPC_CHANNELS.ONLINE_CONF_FETCH, async () => fetchOnlineConf());
}
