import { describe, expect, it, vi } from 'vitest';

import type { IPrompt, ISkill, IWorkflowTemplatePackagePayload } from '@/types/modules';

import {
  buildImportPreviewFromPayload,
  commitWorkflowTemplateImport,
} from './import-template';

function makePrompt(id: string, title: string): IPrompt {
  return {
    id,
    title,
    userPrompt: 'u',
    variables: [],
    tags: [],
    isFavorite: false,
    isPinned: false,
    version: 1,
    currentVersion: 1,
    usageCount: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

function makeSkill(id: string, name: string): ISkill {
  return {
    id,
    name,
    content: 'c',
    protocol_type: 'skill',
    is_favorite: false,
  };
}

function makePayload(): IWorkflowTemplatePackagePayload {
  return {
    manifest: {
      version: 1,
      kind: 'workflow-template',
      exportedAt: '2026-07-20T00:00:00.000Z',
      workflowName: 'Demo',
      promptIds: ['p1'],
      skillIds: ['s1'],
      missingResourceIds: [],
      strippedLocalPathCount: 2,
    },
    workflow: {
      id: 'w1',
      name: 'Demo',
      graphJson: JSON.stringify({
        nodes: [
          { id: 'n1', data: { resourceKind: 'prompt', resourceId: 'p1' } },
          { id: 'n2', data: { resourceKind: 'skill', resourceId: 's1' } },
        ],
        edges: [],
      }),
    },
    prompts: [makePrompt('p1', 'PromptA')],
    skills: [{ skill: makeSkill('s1', 'SkillA'), files: {} }],
  };
}

describe('buildImportPreviewFromPayload', () => {
  it('检测同名冲突', () => {
    const preview = buildImportPreviewFromPayload(
      makePayload(),
      [makePrompt('other', 'PromptA')],
      [],
    );
    expect(preview.conflicts).toHaveLength(1);
    expect(preview.conflicts[0].reason).toBe('sameName');
  });
});

describe('commitWorkflowTemplateImport', () => {
  it('无冲突时新建并重映射', async () => {
    const createdPrompts: IPrompt[] = [];
    const createdSkills: ISkill[] = [];
    let workflowGraph = '';

    const result = await commitWorkflowTemplateImport({
      payload: makePayload(),
      decisions: [],
      getLocalPrompts: async () => [],
      getLocalSkills: async () => [],
      listWorkflowNames: async () => [],
      createPrompt: async (prompt) => {
        createdPrompts.push(prompt);
      },
      updatePrompt: async () => undefined,
      createSkill: async (skill) => {
        createdSkills.push(skill);
        return skill.id;
      },
      updateSkill: async () => undefined,
      deletePrompt: async () => undefined,
      deleteSkill: async () => undefined,
      createWorkflow: async (data) => {
        workflowGraph = data.graphJson;
        return { id: 'new-w', name: data.name };
      },
      deleteWorkflow: async () => undefined,
    });

    expect(result.error).toBeUndefined();
    expect(result.workflowId).toBe('new-w');
    expect(createdPrompts[0].id).not.toBe('p1');
    expect(createdSkills[0].id).not.toBe('s1');
    const parsed = JSON.parse(workflowGraph) as {
      nodes: Array<{ data: { resourceId: string } }>;
    };
    expect(parsed.nodes[0].data.resourceId).toBe(createdPrompts[0].id);
    expect(parsed.nodes[1].data.resourceId).toBe(createdSkills[0].id);
  });

  it('skip 映射到已有 id', async () => {
    const createPrompt = vi.fn();
    let workflowGraph = '';
    await commitWorkflowTemplateImport({
      payload: makePayload(),
      decisions: [{ kind: 'prompt', packageId: 'p1', action: 'skip' }],
      getLocalPrompts: async () => [makePrompt('local-p', 'PromptA')],
      getLocalSkills: async () => [],
      listWorkflowNames: async () => [],
      createPrompt,
      updatePrompt: async () => undefined,
      createSkill: async (skill) => skill.id,
      updateSkill: async () => undefined,
      deletePrompt: async () => undefined,
      deleteSkill: async () => undefined,
      createWorkflow: async (data) => {
        workflowGraph = data.graphJson;
        return { id: 'w', name: data.name };
      },
      deleteWorkflow: async () => undefined,
    });
    expect(createPrompt).not.toHaveBeenCalled();
    const parsed = JSON.parse(workflowGraph) as {
      nodes: Array<{ data: { resourceId: string } }>;
    };
    expect(parsed.nodes[0].data.resourceId).toBe('local-p');
  });

  it('overwrite 调用 updatePrompt', async () => {
    const updatePrompt = vi.fn();
    await commitWorkflowTemplateImport({
      payload: makePayload(),
      decisions: [{ kind: 'prompt', packageId: 'p1', action: 'overwrite' }],
      getLocalPrompts: async () => [makePrompt('local-p', 'PromptA')],
      getLocalSkills: async () => [],
      listWorkflowNames: async () => [],
      createPrompt: async () => undefined,
      updatePrompt,
      createSkill: async (skill) => skill.id,
      updateSkill: async () => undefined,
      deletePrompt: async () => undefined,
      deleteSkill: async () => undefined,
      createWorkflow: async (data) => ({ id: 'w', name: data.name }),
      deleteWorkflow: async () => undefined,
    });
    expect(updatePrompt).toHaveBeenCalled();
    expect(updatePrompt.mock.calls[0][0]).toBe('local-p');
  });

  it('createCopy 使用副本名', async () => {
    const created: IPrompt[] = [];
    await commitWorkflowTemplateImport({
      payload: makePayload(),
      decisions: [{ kind: 'prompt', packageId: 'p1', action: 'createCopy' }],
      getLocalPrompts: async () => [makePrompt('local-p', 'PromptA')],
      getLocalSkills: async () => [],
      listWorkflowNames: async () => [],
      createPrompt: async (prompt) => {
        created.push(prompt);
      },
      updatePrompt: async () => undefined,
      createSkill: async (skill) => skill.id,
      updateSkill: async () => undefined,
      deletePrompt: async () => undefined,
      deleteSkill: async () => undefined,
      createWorkflow: async (data) => ({ id: 'w', name: data.name }),
      deleteWorkflow: async () => undefined,
    });
    expect(created[0].title).toBe('PromptA（副本）');
  });

  it('中途失败回滚已创建 prompt', async () => {
    const deleted: string[] = [];
    const createdIds: string[] = [];
    const result = await commitWorkflowTemplateImport({
      payload: makePayload(),
      decisions: [],
      getLocalPrompts: async () => [],
      getLocalSkills: async () => [],
      listWorkflowNames: async () => [],
      createPrompt: async (prompt) => {
        createdIds.push(prompt.id);
      },
      updatePrompt: async () => undefined,
      createSkill: async () => {
        throw new Error('skill fail');
      },
      updateSkill: async () => undefined,
      deletePrompt: async (id) => {
        deleted.push(id);
      },
      deleteSkill: async () => undefined,
      createWorkflow: async (data) => ({ id: 'w', name: data.name }),
      deleteWorkflow: async () => undefined,
    });
    expect(result.error).toBe('skill fail');
    expect(deleted).toEqual(createdIds);
  });

  it('同名工作流加导入后缀', async () => {
    const result = await commitWorkflowTemplateImport({
      payload: makePayload(),
      decisions: [],
      getLocalPrompts: async () => [],
      getLocalSkills: async () => [],
      listWorkflowNames: async () => ['Demo'],
      createPrompt: async () => undefined,
      updatePrompt: async () => undefined,
      createSkill: async (skill) => skill.id,
      updateSkill: async () => undefined,
      deletePrompt: async () => undefined,
      deleteSkill: async () => undefined,
      createWorkflow: async (data) => ({ id: 'w', name: data.name }),
      deleteWorkflow: async () => undefined,
    });
    expect(result.workflowName).toBe('Demo（导入）');
  });
});
