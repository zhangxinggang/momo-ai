import type { ICliAgentCallInput, ICliAgentCallResult } from '@momo/aichat';
import { ipcMain } from 'electron';

import { IPC_CHANNELS } from '@/types/constants/ipc-channels';

import { callCliAgent, detectCliAgents } from '../services/aichat/cli-agent';

function isCliAgentCallInput(value: unknown): value is ICliAgentCallInput {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const input = value as ICliAgentCallInput;
  return (input.agent === 'claude' || input.agent === 'codex') && typeof input.prompt === 'string';
}

export function registerAichatIPC(): void {
  ipcMain.handle(
    IPC_CHANNELS.AICHAT_CLI_AGENT_CALL,
    async (_, input: unknown): Promise<ICliAgentCallResult> => {
      if (!isCliAgentCallInput(input)) {
        throw new Error('aichat:cliAgentCall 参数无效');
      }
      return callCliAgent(input);
    },
  );

  ipcMain.handle(IPC_CHANNELS.AICHAT_CLI_AGENT_DETECT, async () => detectCliAgents());
}
