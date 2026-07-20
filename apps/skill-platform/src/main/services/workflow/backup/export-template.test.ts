import { describe, expect, it } from 'vitest';

import type { IPrompt, ISkill } from '@/types/modules';

import { buildWorkflowTemplatePayload } from './export-template';

function makePrompt(id: string): IPrompt {
  return {
    id,
    title: id,
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

function makeSkill(id: string): ISkill {
  return {
    id,
    name: id,
    content: 'c',
    protocol_type: 'skill',
    is_favorite: false,
    local_repo_path: 'C:/skills/x',
  };
}

describe('buildWorkflowTemplatePayload', () => {
  it('工作流不存在时抛错', async () => {
    await expect(
      buildWorkflowTemplatePayload({
        workflowId: 'missing',
        getWorkflow: async () => null,
        getPrompt: async () => null,
        getSkill: async () => null,
        readSkillFiles: async () => ({}),
      }),
    ).rejects.toThrow('工作流不存在');
  });

  it('组包并净化本机路径', async () => {
    const graphJson = JSON.stringify({
      nodes: [
        {
          id: '1',
          data: {
            resourceKind: 'prompt',
            resourceId: 'p1',
            kbCollectionId: 1,
            workspacePaths: ['/a'],
          },
        },
        { id: '2', data: { resourceKind: 'skill', resourceId: 's1' } },
        { id: '3', data: { url: 'https://example.com' } },
      ],
      edges: [],
    });

    const { payload } = await buildWorkflowTemplatePayload({
      workflowId: 'w1',
      getWorkflow: async () => ({ id: 'w1', name: 'Demo', graphJson }),
      getPrompt: async (id) => (id === 'p1' ? makePrompt('p1') : null),
      getSkill: async (id) => (id === 's1' ? makeSkill('s1') : null),
      readSkillFiles: async () => ({ 'SKILL.md': new TextEncoder().encode('#') }),
    });

    expect(payload.prompts).toHaveLength(1);
    expect(payload.skills).toHaveLength(1);
    expect(payload.skills[0].skill.local_repo_path).toBeNull();
    expect(payload.manifest.strippedLocalPathCount).toBe(2);
    expect(payload.manifest.missingResourceIds).toEqual([]);
    const parsed = JSON.parse(payload.workflow.graphJson) as {
      nodes: Array<{ data: Record<string, unknown> }>;
    };
    expect(parsed.nodes[0].data.kbCollectionId).toBeUndefined();
    expect(parsed.nodes[2].data.url).toBe('https://example.com');
  });

  it('缺失资源记入 missingResourceIds', async () => {
    const graphJson = JSON.stringify({
      nodes: [{ id: '1', data: { resourceKind: 'prompt', resourceId: 'gone' } }],
      edges: [],
    });
    const { payload } = await buildWorkflowTemplatePayload({
      workflowId: 'w1',
      getWorkflow: async () => ({ id: 'w1', name: 'Demo', graphJson }),
      getPrompt: async () => null,
      getSkill: async () => null,
      readSkillFiles: async () => ({}),
    });
    expect(payload.manifest.missingResourceIds).toEqual(['gone']);
    expect(payload.prompts).toHaveLength(0);
  });

  it('readSkillFiles 失败时记 warning', async () => {
    const graphJson = JSON.stringify({
      nodes: [{ id: '1', data: { resourceKind: 'skill', resourceId: 's1' } }],
      edges: [],
    });
    const { payload, skillFileWarnings } = await buildWorkflowTemplatePayload({
      workflowId: 'w1',
      getWorkflow: async () => ({ id: 'w1', name: 'Demo', graphJson }),
      getPrompt: async () => null,
      getSkill: async () => makeSkill('s1'),
      readSkillFiles: async () => null,
    });
    expect(payload.skills[0].files).toEqual({});
    expect(skillFileWarnings.length).toBe(1);
  });
});
