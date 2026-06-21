import type { IListClaudeSlashInput, IListClaudeSlashResult } from '@/claude-code/types';

import { getClaudeCodeIpc } from '../ipc';

export function getClaudeCodeApi() {
  return getClaudeCodeIpc();
}

export function isClaudeCodeApiAvailable(): boolean {
  return typeof getClaudeCodeIpc()?.listSlashCommands === 'function';
}

export async function listClaudeSlashCommands(
  input: IListClaudeSlashInput,
): Promise<IListClaudeSlashResult | null> {
  const api = getClaudeCodeIpc();
  if (!api?.listSlashCommands) {
    return null;
  }
  return api.listSlashCommands(input);
}
