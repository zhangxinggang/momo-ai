import { ipcMain } from 'electron';

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

import { rewriteRuleWithAi } from '../services/rules/rewrite';
import {
  createProjectRule,
  importRuleBackupRecords,
  listCachedRuleDescriptors,
  readRuleContent,
  removeProjectRule,
  resolveRuleConflict,
  saveRuleContent,
  scanRuleDescriptors,
} from '../services/rules/workspace';

/** 注册 Rules IPC 处理器 */
export function registerRulesIPC(): void {
  ipcMain.handle(IPC_CHANNELS.RULES_LIST, async (): Promise<IRuleFileDescriptor[]> => {
    return listCachedRuleDescriptors();
  });

  ipcMain.handle(IPC_CHANNELS.RULES_SCAN, async (): Promise<IRuleFileDescriptor[]> => {
    return scanRuleDescriptors();
  });

  ipcMain.handle(
    IPC_CHANNELS.RULES_READ,
    async (_event, ruleId: IRuleFileId): Promise<IRuleFileContent> => {
      return readRuleContent(ruleId);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.RULES_SAVE,
    async (_event, ruleId: IRuleFileId, content: string): Promise<IRuleFileContent> => {
      if (typeof content !== 'string') {
        throw new Error('rules:save requires a string content');
      }
      return saveRuleContent(ruleId, content);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.RULES_RESOLVE_CONFLICT,
    async (
      _event,
      ruleId: IRuleFileId,
      strategy: ERuleConflictResolutionStrategy,
    ): Promise<IRuleFileContent> => {
      if (!ruleId || typeof ruleId !== 'string') {
        throw new Error('rules:resolveConflict requires a ruleId');
      }
      if (strategy !== 'use-managed' && strategy !== 'use-target') {
        throw new Error('rules:resolveConflict requires a valid strategy');
      }
      return resolveRuleConflict(ruleId, strategy);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.RULES_REWRITE,
    async (_event, payload: DRuleRewriteRequest): Promise<IRuleRewriteResult> => {
      if (!payload || typeof payload.instruction !== 'string') {
        throw new Error('rules:rewrite requires an instruction payload');
      }
      return rewriteRuleWithAi(payload);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.RULES_ADD_PROJECT,
    async (_event, input: DCreateRuleProject): Promise<IRuleFileDescriptor> => {
      if (!input || typeof input.name !== 'string' || typeof input.rootPath !== 'string') {
        throw new Error('rules:addProject requires name and rootPath');
      }
      return createProjectRule(input);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.RULES_REMOVE_PROJECT,
    async (_event, projectId: string): Promise<{ success: boolean }> => {
      if (!projectId || typeof projectId !== 'string') {
        throw new Error('rules:removeProject requires a project id');
      }
      await removeProjectRule(projectId);
      return { success: true };
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.RULES_IMPORT_RECORDS,
    async (
      _event,
      records: IRuleBackupRecord[],
      options?: { replace?: boolean },
    ): Promise<{ success: boolean }> => {
      if (!Array.isArray(records)) {
        throw new Error('rules:importRecords requires an array payload');
      }
      await importRuleBackupRecords(records, {
        replace: options?.replace === true,
      });
      return { success: true };
    },
  );
}
