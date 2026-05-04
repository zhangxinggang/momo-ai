import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type { ISettings } from '@/types/modules';
import { ipcRenderer } from 'electron';

export const settingsApi = {
  get: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET),
  set: (settings: Partial<ISettings>) => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SET, settings),
};
