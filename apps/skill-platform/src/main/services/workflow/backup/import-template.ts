import type {
  EWorkflowBackupConflictAction,
  IPrompt,
  ISkill,
  IWorkflowBackupConflictItem,
  IWorkflowBackupResourceDecision,
  IWorkflowImportCommitResult,
  IWorkflowTemplatePackagePayload,
} from '@/types/modules';
import { v4 as uuidv4 } from 'uuid';

import { detectAllConflicts } from './conflicts';
import { remapWorkflowResourceIds } from './graph';
import { allocateUniqueName } from './names';

export type ICommitWorkflowTemplateDeps = {
  payload: IWorkflowTemplatePackagePayload;
  decisions: IWorkflowBackupResourceDecision[];
  getLocalPrompts: () => Promise<IPrompt[]>;
  getLocalSkills: () => Promise<ISkill[]>;
  listWorkflowNames: () => Promise<string[]>;
  createPrompt: (prompt: IPrompt) => Promise<void>;
  updatePrompt: (id: string, prompt: IPrompt) => Promise<void>;
  createSkill: (skill: ISkill, files: Record<string, Uint8Array>) => Promise<string>;
  updateSkill: (id: string, skill: ISkill, files: Record<string, Uint8Array>) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  deleteSkill: (id: string) => Promise<void>;
  createWorkflow: (data: {
    name: string;
    graphJson: string;
    folderId: null;
  }) => Promise<{ id: string; name: string }>;
  deleteWorkflow: (id: string) => Promise<void>;
};

function decisionMap(
  decisions: IWorkflowBackupResourceDecision[],
): Map<string, EWorkflowBackupConflictAction> {
  const map = new Map<string, EWorkflowBackupConflictAction>();
  for (const decision of decisions) {
    map.set(`${decision.kind}:${decision.packageId}`, decision.action);
  }
  return map;
}

function conflictMap(
  conflicts: IWorkflowBackupConflictItem[],
): Map<string, IWorkflowBackupConflictItem> {
  const map = new Map<string, IWorkflowBackupConflictItem>();
  for (const item of conflicts) {
    map.set(`${item.kind}:${item.packageId}`, item);
  }
  return map;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function buildImportPreviewFromPayload(
  payload: IWorkflowTemplatePackagePayload,
  localPrompts: IPrompt[],
  localSkills: ISkill[],
): {
  workflowName: string;
  promptCount: number;
  skillCount: number;
  strippedLocalPathCount: number;
  conflicts: IWorkflowBackupConflictItem[];
} {
  return {
    workflowName: payload.workflow.name,
    promptCount: payload.prompts.length,
    skillCount: payload.skills.length,
    strippedLocalPathCount: payload.manifest.strippedLocalPathCount,
    conflicts: detectAllConflicts(payload.prompts, payload.skills, localPrompts, localSkills),
  };
}

/** 按决策写入资源并创建工作流；失败时回滚本会话新建项 */
export async function commitWorkflowTemplateImport(
  deps: ICommitWorkflowTemplateDeps,
): Promise<IWorkflowImportCommitResult> {
  const localPrompts = await deps.getLocalPrompts();
  const localSkills = await deps.getLocalSkills();
  const conflicts = detectAllConflicts(
    deps.payload.prompts,
    deps.payload.skills,
    localPrompts,
    localSkills,
  );
  const byConflict = conflictMap(conflicts);
  const byDecision = decisionMap(deps.decisions);

  const idMap = new Map<string, string>();
  const createdPromptIds: string[] = [];
  const createdSkillIds: string[] = [];
  let createdWorkflowId: string | undefined;
  let promptCount = 0;
  let skillCount = 0;

  const promptNameSet = new Set(localPrompts.map((prompt) => prompt.title));
  const skillNameSet = new Set(localSkills.map((skill) => skill.name));

  try {
    for (const prompt of deps.payload.prompts) {
      const key = `prompt:${prompt.id}`;
      const conflict = byConflict.get(key);
      const action = conflict ? (byDecision.get(key) ?? 'createCopy') : 'createCopy';

      if (!conflict) {
        const newId = uuidv4();
        const next: IPrompt = {
          ...prompt,
          id: newId,
          folderId: null,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };
        await deps.createPrompt(next);
        createdPromptIds.push(newId);
        idMap.set(prompt.id, newId);
        promptNameSet.add(next.title);
        promptCount += 1;
        continue;
      }

      if (action === 'skip') {
        idMap.set(prompt.id, conflict.existingId);
        continue;
      }

      if (action === 'overwrite') {
        const next: IPrompt = {
          ...prompt,
          id: conflict.existingId,
          folderId: null,
          updatedAt: nowIso(),
        };
        await deps.updatePrompt(conflict.existingId, next);
        idMap.set(prompt.id, conflict.existingId);
        promptCount += 1;
        continue;
      }

      const newId = uuidv4();
      const title = allocateUniqueName(prompt.title, promptNameSet, '（副本）');
      const next: IPrompt = {
        ...prompt,
        id: newId,
        title,
        folderId: null,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      await deps.createPrompt(next);
      createdPromptIds.push(newId);
      idMap.set(prompt.id, newId);
      promptNameSet.add(title);
      promptCount += 1;
    }

    for (const entry of deps.payload.skills) {
      const skill = entry.skill as ISkill;
      const key = `skill:${skill.id}`;
      const conflict = byConflict.get(key);
      const action = conflict ? (byDecision.get(key) ?? 'createCopy') : 'createCopy';

      if (!conflict) {
        const newId = uuidv4();
        const next: ISkill = {
          ...skill,
          id: newId,
          local_repo_path: undefined,
        };
        const finalId = await deps.createSkill(next, entry.files);
        createdSkillIds.push(finalId);
        idMap.set(skill.id, finalId);
        skillNameSet.add(next.name);
        skillCount += 1;
        continue;
      }

      if (action === 'skip') {
        idMap.set(skill.id, conflict.existingId);
        continue;
      }

      if (action === 'overwrite') {
        const next: ISkill = {
          ...skill,
          id: conflict.existingId,
          local_repo_path: undefined,
        };
        await deps.updateSkill(conflict.existingId, next, entry.files);
        idMap.set(skill.id, conflict.existingId);
        skillCount += 1;
        continue;
      }

      const newId = uuidv4();
      const name = allocateUniqueName(skill.name, skillNameSet, '（副本）');
      const next: ISkill = {
        ...skill,
        id: newId,
        name,
        local_repo_path: undefined,
      };
      const finalId = await deps.createSkill(next, entry.files);
      createdSkillIds.push(finalId);
      idMap.set(skill.id, finalId);
      skillNameSet.add(name);
      skillCount += 1;
    }

    const remappedGraph = remapWorkflowResourceIds(deps.payload.workflow.graphJson, idMap);
    const existingWorkflowNames = new Set(await deps.listWorkflowNames());
    const workflowName = allocateUniqueName(
      deps.payload.workflow.name,
      existingWorkflowNames,
      '（导入）',
    );
    const created = await deps.createWorkflow({
      name: workflowName,
      graphJson: remappedGraph,
      folderId: null,
    });
    createdWorkflowId = created.id;

    return {
      canceled: false,
      workflowId: created.id,
      workflowName: created.name,
      promptCount,
      skillCount,
      strippedLocalPathCount: deps.payload.manifest.strippedLocalPathCount,
    };
  } catch (error) {
    if (createdWorkflowId) {
      await deps.deleteWorkflow(createdWorkflowId).catch(() => undefined);
    }
    for (const skillId of [...createdSkillIds].reverse()) {
      await deps.deleteSkill(skillId).catch(() => undefined);
    }
    for (const promptId of [...createdPromptIds].reverse()) {
      await deps.deletePrompt(promptId).catch(() => undefined);
    }
    const message = error instanceof Error ? error.message : String(error);
    return {
      canceled: false,
      error: message,
      strippedLocalPathCount: deps.payload.manifest.strippedLocalPathCount,
    };
  }
}
