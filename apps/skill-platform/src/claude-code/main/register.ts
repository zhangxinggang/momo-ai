import { ipcMain } from 'electron';

import { IPC_CHANNELS } from '../../types/constants/ipc-channels';
import type { IListClaudeSlashInput } from '../types';
import { listClaudeSlashCommands } from './list-commands';

function isListInput(value: unknown): value is IListClaudeSlashInput {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const input = value as IListClaudeSlashInput;
  if (input.query !== undefined && typeof input.query !== 'string') {
    return false;
  }
  if (input.cwd !== undefined && typeof input.cwd !== 'string') {
    return false;
  }
  if (input.workspacePaths !== undefined) {
    if (!Array.isArray(input.workspacePaths)) {
      return false;
    }
    if (!input.workspacePaths.every((item) => typeof item === 'string')) {
      return false;
    }
  }
  return true;
}

/** 注册 Claude Code 斜杠命令 IPC（删除本模块时一并移除） */
export function registerClaudeCodeIPC(): void {
  ipcMain.handle(IPC_CHANNELS.CLAUDE_CODE_LIST_SLASH, async (_, input: unknown) => {
    if (!isListInput(input)) {
      throw new Error('claudeCode:listSlashCommands 参数无效');
    }
    return listClaudeSlashCommands(input);
  });
}
