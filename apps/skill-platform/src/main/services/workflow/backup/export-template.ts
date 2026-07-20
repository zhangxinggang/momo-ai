import type {
  IPrompt,
  ISkill,
  IWorkflowTemplatePackagePayload,
  IWorkflowTemplateSkillFile,
} from '@/types/modules';

import { collectWorkflowResourceIds, sanitizeWorkflowGraphJson } from './graph';

export type IBuildWorkflowTemplateDeps = {
  workflowId: string;
  getWorkflow: (id: string) => Promise<{ id: string; name: string; graphJson: string } | null>;
  getPrompt: (id: string) => Promise<IPrompt | null>;
  getSkill: (id: string) => Promise<ISkill | null>;
  /** 返回相对路径 → bytes；失败返回 null */
  readSkillFiles: (skill: ISkill) => Promise<Record<string, Uint8Array> | null>;
};

function toExportSkill(skill: ISkill): IWorkflowTemplateSkillFile['skill'] {
  const { local_repo_path: _localRepoPath, ...rest } = skill;
  return { ...rest, local_repo_path: null };
}

/** 从本机构建可编码的工作流模板包 */
export async function buildWorkflowTemplatePayload(
  deps: IBuildWorkflowTemplateDeps,
): Promise<{ payload: IWorkflowTemplatePackagePayload; skillFileWarnings: string[] }> {
  const workflow = await deps.getWorkflow(deps.workflowId);
  if (!workflow) {
    throw new Error('工作流不存在');
  }

  const { promptIds, skillIds } = collectWorkflowResourceIds(workflow.graphJson);
  const { graphJson, strippedLocalPathCount } = sanitizeWorkflowGraphJson(workflow.graphJson);

  const prompts: IPrompt[] = [];
  const missingResourceIds: string[] = [];
  for (const promptId of promptIds) {
    const prompt = await deps.getPrompt(promptId);
    if (!prompt) {
      missingResourceIds.push(promptId);
      continue;
    }
    prompts.push(prompt);
  }

  const skills: IWorkflowTemplatePackagePayload['skills'] = [];
  const skillFileWarnings: string[] = [];
  for (const skillId of skillIds) {
    const skill = await deps.getSkill(skillId);
    if (!skill) {
      missingResourceIds.push(skillId);
      continue;
    }
    const files = await deps.readSkillFiles(skill);
    if (files === null) {
      skillFileWarnings.push(`Skill「${skill.name}」本地文件读取失败，仅导出元数据`);
      skills.push({ skill: toExportSkill(skill), files: {} });
    } else {
      skills.push({ skill: toExportSkill(skill), files });
    }
  }

  const payload: IWorkflowTemplatePackagePayload = {
    manifest: {
      version: 1,
      kind: 'workflow-template',
      exportedAt: new Date().toISOString(),
      workflowName: workflow.name,
      promptIds: prompts.map((prompt) => prompt.id),
      skillIds: skills.map((entry) => entry.skill.id),
      missingResourceIds,
      strippedLocalPathCount,
    },
    workflow: {
      id: workflow.id,
      name: workflow.name,
      graphJson,
    },
    prompts,
    skills,
  };

  return { payload, skillFileWarnings };
}
