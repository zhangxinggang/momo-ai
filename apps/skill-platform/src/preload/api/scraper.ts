import { ipcRenderer } from 'electron';

import { IPC_CHANNELS } from '@/types/constants/ipc-channels';

export const scraperApi = {
  getModelRanking: () => ipcRenderer.invoke(IPC_CHANNELS.SCRAPE_MODEL_RANKING),
};
