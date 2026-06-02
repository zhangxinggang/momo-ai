import { getDatabase } from '../../database/init';
import { RuleDB } from '../../database/rule';
import { getRulesDir } from '../../runtime-paths';
import {
  getPlatformGlobalRulePath,
  getPlatformRootDir,
  resolvePlatformPath,
} from '../skill/installer/utils';
import { createRulesWorkspaceService } from './workspace-core';

export const desktopRulesWorkspaceService = createRulesWorkspaceService({
  getRulesDir,
  createRuleDb: () => new RuleDB(getDatabase()),
  getPlatformGlobalRulePath,
  getPlatformRootDir,
});

export const {
  listRuleDescriptors,
  listCachedRuleDescriptors,
  scanRuleDescriptors,
  getProjectMetaById,
  resolveRuleMeta,
  readRuleContent,
  saveRuleContent,
  resolveRuleConflict,
  createProjectRule,
  bootstrapRuleWorkspace,
  removeProjectRule,
  exportRuleBackupRecords,
  importRuleBackupRecords,
} = desktopRulesWorkspaceService;

export { resolvePlatformPath };
