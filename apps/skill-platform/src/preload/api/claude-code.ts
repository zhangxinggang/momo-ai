import type { IListClaudeSlashInput, IListClaudeSlashResult } from '@/claude-code/types';
import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import { ipcRenderer } from 'electron';

export const claudeCodeApi = {
  listSlashCommands: (input: IListClaudeSlashInput): Promise<IListClaudeSlashResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.CLAUDE_CODE_LIST_SLASH, input),
};
