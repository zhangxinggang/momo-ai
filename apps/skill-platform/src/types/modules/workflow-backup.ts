import type { IPrompt } from './prompt';
import type { ISkill } from './skill';

export type EWorkflowBackupConflictReason = 'sameId' | 'sameName';

export type EWorkflowBackupConflictAction = 'skip' | 'overwrite' | 'createCopy';

export type EWorkflowBackupResourceKind = 'prompt' | 'skill';

export interface IWorkflowTemplateManifest {
  version: 1;
  kind: 'workflow-template';
  exportedAt: string;
  workflowName: string;
  promptIds: string[];
  skillIds: string[];
  missingResourceIds: string[];
  strippedLocalPathCount: number;
}

export interface IWorkflowTemplateWorkflowFile {
  id: string;
  name: string;
  graphJson: string;
}

/** Skill 写入 zip 的元数据（无 local_repo_path） */
export interface IWorkflowTemplateSkillFile {
  skill: Omit<ISkill, 'local_repo_path'> & { local_repo_path?: null };
  /** files/ 下相对路径列表（仅清单；内容在 zip 内） */
  filePaths: string[];
}

export interface IWorkflowBackupConflictItem {
  kind: EWorkflowBackupResourceKind;
  packageId: string;
  packageName: string;
  existingId: string;
  existingName: string;
  reason: EWorkflowBackupConflictReason;
}

export interface IWorkflowBackupResourceDecision {
  kind: EWorkflowBackupResourceKind;
  packageId: string;
  action: EWorkflowBackupConflictAction;
}

export interface IWorkflowExportResult {
  canceled: boolean;
  path?: string;
  promptCount?: number;
  skillCount?: number;
  missingCount?: number;
  strippedLocalPathCount?: number;
  skillFileWarnings?: string[];
}

export interface IWorkflowImportPreviewResult {
  canceled: boolean;
  sessionId?: string;
  workflowName?: string;
  promptCount?: number;
  skillCount?: number;
  strippedLocalPathCount?: number;
  conflicts?: IWorkflowBackupConflictItem[];
  error?: string;
}

export interface IWorkflowImportCommitResult {
  canceled: boolean;
  workflowId?: string;
  workflowName?: string;
  promptCount?: number;
  skillCount?: number;
  strippedLocalPathCount?: number;
  error?: string;
}

/** 组包时内部用（测试可构造） */
export interface IWorkflowTemplatePackagePayload {
  manifest: IWorkflowTemplateManifest;
  workflow: IWorkflowTemplateWorkflowFile;
  prompts: IPrompt[];
  skills: Array<{
    skill: IWorkflowTemplateSkillFile['skill'];
    /** 相对路径 → 文件内容 */
    files: Record<string, Uint8Array>;
  }>;
}
