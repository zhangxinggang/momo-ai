import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type { ICliAgentCallInput, ICliAgentCallResult } from '@momo/aichat';
import { ipcRenderer } from 'electron';

export const aichatApi = {
  callCliAgent: (input: ICliAgentCallInput): Promise<ICliAgentCallResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.AICHAT_CLI_AGENT_CALL, input),
  detectCliAgents: (): Promise<Record<'claude' | 'codex', boolean>> =>
    ipcRenderer.invoke(IPC_CHANNELS.AICHAT_CLI_AGENT_DETECT),
};
