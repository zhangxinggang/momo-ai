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

import { getRulesIpc } from '../ipc';

function requireRulesIpc() {
  const rules = getRulesIpc();
  if (!rules) {
    throw new Error('当前环境不支持 Rules IPC');
  }
  return rules;
}

export function listRules(): Promise<IRuleFileDescriptor[]> {
  return requireRulesIpc().list();
}

export function scanRules(): Promise<IRuleFileDescriptor[]> {
  return requireRulesIpc().scan();
}

export function readRule(ruleId: IRuleFileId): Promise<IRuleFileContent> {
  return requireRulesIpc().read(ruleId);
}

export function saveRule(ruleId: IRuleFileId, content: string): Promise<IRuleFileContent> {
  return requireRulesIpc().save(ruleId, content);
}

export function resolveRuleConflict(
  ruleId: IRuleFileId,
  strategy: ERuleConflictResolutionStrategy,
): Promise<IRuleFileContent> {
  return requireRulesIpc().resolveConflict(ruleId, strategy);
}

export function rewriteRule(payload: DRuleRewriteRequest): Promise<IRuleRewriteResult> {
  return requireRulesIpc().rewrite(payload);
}

export function addRuleProject(input: DCreateRuleProject): Promise<IRuleFileDescriptor> {
  return requireRulesIpc().addProject(input);
}

export function removeRuleProject(projectId: string): Promise<{ success: boolean }> {
  return requireRulesIpc().removeProject(projectId);
}

export function importRuleRecords(
  records: IRuleBackupRecord[],
  options?: { replace?: boolean },
): Promise<{ success: boolean }> {
  return requireRulesIpc().importRecords(records, options);
}
