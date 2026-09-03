import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import { ipcRenderer } from 'electron';

interface IParseAttachmentInput {
  base64: string;
  ext?: string;
  mime?: string;
}

interface IParseAttachmentResult {
  text: string;
  snippet: string;
}

export const aichatApi = {
  parseAttachment: (input: IParseAttachmentInput): Promise<IParseAttachmentResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.AICHAT_PARSE_ATTACHMENT, input),
};
