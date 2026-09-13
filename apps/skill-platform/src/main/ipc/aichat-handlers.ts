import { ipcMain } from 'electron';

import { IPC_CHANNELS } from '@/types/constants/ipc-channels';

import { knowledgeWorkerClient } from '../services/knowledge-v2/worker-client';

export function registerAichatIPC(): void {
  ipcMain.handle(
    IPC_CHANNELS.AICHAT_PARSE_ATTACHMENT,
    async (
      _,
      input: { base64?: string; ext?: string; mime?: string },
    ): Promise<{ text: string; snippet: string }> => {
      return knowledgeWorkerClient.call('parseAttachment', input);
    },
  );
}
