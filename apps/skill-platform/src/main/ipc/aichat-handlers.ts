import type { ICliAgentCallInput, ICliAgentCallResult } from '@momo/aichat';
import { ipcMain } from 'electron';

import { IPC_CHANNELS } from '@/types/constants/ipc-channels';

import { extractText } from '../services/kb/file-parser';
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
