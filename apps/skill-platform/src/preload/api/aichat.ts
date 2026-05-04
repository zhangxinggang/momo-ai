import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type { ICliAgentCallInput, ICliAgentCallResult } from '@momo/aichat';
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
  callCliAgent: (input: ICliAgentCallInput): Promise<ICliAgentCallResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.AICHAT_CLI_AGENT_CALL, input),
  detectCliAgents: (): Promise<Record<'claude' | 'codex', boolean>> =>
    ipcRenderer.invoke(IPC_CHANNELS.AICHAT_CLI_AGENT_DETECT),
  parseAttachment: (input: IParseAttachmentInput): Promise<IParseAttachmentResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.AICHAT_PARSE_ATTACHMENT, input),
};
