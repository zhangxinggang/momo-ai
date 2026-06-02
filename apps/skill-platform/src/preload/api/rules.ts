import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type {
  DCreateRuleProject,
  DRuleRewriteRequest,
  ERuleConflictResolutionStrategy,
  IRuleBackupRecord,
  IRuleFileContent,
  IRuleFileDescriptor,
  IRuleFileId,
  IRuleRewriteResult,
} from '@/types/modules/rules';
import { ipcRenderer } from 'electron';

export const rulesApi = {
  list: (): Promise<IRuleFileDescriptor[]> => ipcRenderer.invoke(IPC_CHANNELS.RULES_LIST),

  scan: (): Promise<IRuleFileDescriptor[]> => ipcRenderer.invoke(IPC_CHANNELS.RULES_SCAN),

  read: (ruleId: IRuleFileId): Promise<IRuleFileContent> =>
    ipcRenderer.invoke(IPC_CHANNELS.RULES_READ, ruleId),

  save: (ruleId: IRuleFileId, content: string): Promise<IRuleFileContent> =>
    ipcRenderer.invoke(IPC_CHANNELS.RULES_SAVE, ruleId, content),

  resolveConflict: (
    ruleId: IRuleFileId,
    strategy: ERuleConflictResolutionStrategy,
  ): Promise<IRuleFileContent> =>
    ipcRenderer.invoke(IPC_CHANNELS.RULES_RESOLVE_CONFLICT, ruleId, strategy),

  rewrite: (payload: DRuleRewriteRequest): Promise<IRuleRewriteResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.RULES_REWRITE, payload),

  addProject: (input: DCreateRuleProject): Promise<IRuleFileDescriptor> =>
    ipcRenderer.invoke(IPC_CHANNELS.RULES_ADD_PROJECT, input),

  removeProject: (projectId: string): Promise<{ success: boolean }> =>
    ipcRenderer.invoke(IPC_CHANNELS.RULES_REMOVE_PROJECT, projectId),

  importRecords: (
    records: IRuleBackupRecord[],
    options?: { replace?: boolean },
  ): Promise<{ success: boolean }> =>
    ipcRenderer.invoke(IPC_CHANNELS.RULES_IMPORT_RECORDS, records, options),
};
