import { KNOWN_RULE_FILE_TEMPLATES, RULE_FILE_GROUPS } from '../constants/rules';
import type { EAIProtocol } from './ai';

export type IKnownRuleFileId = keyof typeof KNOWN_RULE_FILE_TEMPLATES;
export type ICustomRuleFileId = `custom:${string}`;
export type ERulePlatformId =
  | (typeof KNOWN_RULE_FILE_TEMPLATES)[keyof typeof KNOWN_RULE_FILE_TEMPLATES]['platformId']
  | `custom:${string}`
  | 'workspace';

export type IRuleFileId = IKnownRuleFileId | ICustomRuleFileId | `project:${string}`;

export type ERuleFileGroup = (typeof RULE_FILE_GROUPS)[number];

export type ERuleSyncStatus = 'synced' | 'target-missing' | 'out-of-sync' | 'sync-error';

export type ERuleConflictResolutionStrategy = 'use-managed' | 'use-target';

export interface IRuleFileDescriptor {
  id: IRuleFileId;
  platformId: ERulePlatformId;
  platformName: string;
  platformIcon: string;
  platformDescription: string;
  name: string;
  description: string;
  path: string;
  exists: boolean;
  group: ERuleFileGroup;
  managedPath?: string;
  targetPath?: string;
  projectRootPath?: string | null;
  syncStatus?: ERuleSyncStatus;
}

export interface IRuleFileContent extends IRuleFileDescriptor {
  content: string;
  targetContent?: string;
}

export interface DCreateRuleProject {
  id?: string;
  name: string;
  rootPath: string;
}

export interface IRuleBackupRecord {
  id: IRuleFileId;
  platformId: ERulePlatformId;
  platformName: string;
  platformIcon: string;
  platformDescription: string;
  name: string;
  description: string;
  path: string;
  managedPath?: string;
  targetPath?: string;
  projectRootPath?: string | null;
  syncStatus?: ERuleSyncStatus;
  content: string;
}

export interface IRuleRecord {
  id: IRuleFileId;
  scope: 'global' | 'project';
  platformId: ERulePlatformId;
  platformName: string;
  platformIcon: string;
  platformDescription: string;
  canonicalFileName: string;
  description: string;
  managedPath: string;
  targetPath: string;
  projectRootPath?: string | null;
  syncStatus: ERuleSyncStatus;
  currentVersion: number;
  contentHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface DRuleRewriteRequest {
  aiConfig?: {
    apiKey: string;
    apiUrl: string;
    model: string;
    provider: string;
    apiProtocol: EAIProtocol;
  };
  instruction: string;
  currentContent: string;
  fileName: string;
  platformName: string;
}

export interface IRuleRewriteResult {
  content: string;
  summary: string;
}

export function isRuleFileId(value: string): value is IRuleFileId {
  return (
    value.startsWith('project:') ||
    value.startsWith('custom:') ||
    value in KNOWN_RULE_FILE_TEMPLATES
  );
}

export function isRulePlatformId(value: string): value is ERulePlatformId {
  if (value === 'workspace') {
    return true;
  }
  if (value.startsWith('custom:')) {
    return true;
  }
  return Object.values(KNOWN_RULE_FILE_TEMPLATES).some((template) => template.platformId === value);
}
