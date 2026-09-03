import { ipcMain } from 'electron';

import { IPC_CHANNELS } from '@/types/constants/ipc-channels';

import { extractText } from '../services/kb/file-parser';

export function registerAichatIPC(): void {
  ipcMain.handle(
    IPC_CHANNELS.AICHAT_PARSE_ATTACHMENT,
    async (
      _,
      input: { base64?: string; ext?: string; mime?: string },
    ): Promise<{ text: string; snippet: string }> => {
      if (!input?.base64?.trim()) {
        throw new Error('aichat:parseAttachment 缺少文件内容');
      }
      const buffer = Buffer.from(input.base64, 'base64');
      return extractText({ buffer, ext: input.ext, mime: input.mime });
    },
  );
}
