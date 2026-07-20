import type {
  EWorkflowBackupResourceKind,
  IPrompt,
  ISkill,
  IWorkflowBackupConflictItem,
} from '@/types/modules';

function detectOneConflict(options: {
  kind: EWorkflowBackupResourceKind;
  packageId: string;
  packageName: string;
  existingById: Map<string, { id: string; name: string }>;
  existingByName: Map<string, { id: string; name: string }>;
}): IWorkflowBackupConflictItem | null {
  const byId = options.existingById.get(options.packageId);
  if (byId) {
    return {
      kind: options.kind,
      packageId: options.packageId,
      packageName: options.packageName,
      existingId: byId.id,
      existingName: byId.name,
      reason: 'sameId',
    };
  }
  const byName = options.existingByName.get(options.packageName);
  if (byName) {
    return {
      kind: options.kind,
      packageId: options.packageId,
      packageName: options.packageName,
      existingId: byName.id,
      existingName: byName.name,
      reason: 'sameName',
    };
  }
  return null;
}

/** 检测包内提示词 / Skill 与本机的冲突列表 */
export function detectAllConflicts(
  prompts: IPrompt[],
  skills: Array<{ skill: Pick<ISkill, 'id' | 'name'> }>,
  localPrompts: IPrompt[],
  localSkills: ISkill[],
): IWorkflowBackupConflictItem[] {
  const promptById = new Map(
    localPrompts.map((prompt) => [prompt.id, { id: prompt.id, name: prompt.title }]),
  );
  const promptByName = new Map(
    localPrompts.map((prompt) => [prompt.title, { id: prompt.id, name: prompt.title }]),
  );
  const skillById = new Map(
    localSkills.map((skill) => [skill.id, { id: skill.id, name: skill.name }]),
  );
  const skillByName = new Map(
    localSkills.map((skill) => [skill.name, { id: skill.id, name: skill.name }]),
  );

  const conflicts: IWorkflowBackupConflictItem[] = [];

  for (const prompt of prompts) {
    const item = detectOneConflict({
      kind: 'prompt',
      packageId: prompt.id,
      packageName: prompt.title,
      existingById: promptById,
      existingByName: promptByName,
    });
    if (item) {
      conflicts.push(item);
    }
  }

  for (const entry of skills) {
    const item = detectOneConflict({
      kind: 'skill',
      packageId: entry.skill.id,
      packageName: entry.skill.name,
      existingById: skillById,
      existingByName: skillByName,
    });
    if (item) {
      conflicts.push(item);
    }
  }

  return conflicts;
}
