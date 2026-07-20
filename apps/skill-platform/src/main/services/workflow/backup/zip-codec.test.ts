import type { IPrompt, IWorkflowTemplatePackagePayload } from '@/types/modules';
import { strToU8, unzipSync, zipSync } from 'fflate';
import { describe, expect, it } from 'vitest';

import { decodeWorkflowTemplateZip, encodeWorkflowTemplateZip } from './zip-codec';

function makePrompt(id: string): IPrompt {
  return {
    id,
    title: `Prompt ${id}`,
    userPrompt: 'hello',
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

describe('zip-codec', () => {
  it('encode/decode 往返一致', () => {
    const payload: IWorkflowTemplatePackagePayload = {
      manifest: {
        version: 1,
        kind: 'workflow-template',
        exportedAt: '2026-07-20T00:00:00.000Z',
        workflowName: 'Demo',
        promptIds: ['p1'],
        skillIds: ['s1'],
        missingResourceIds: [],
        strippedLocalPathCount: 1,
      },
      workflow: {
        id: 'w1',
        name: 'Demo',
        graphJson: JSON.stringify({ nodes: [], edges: [] }),
      },
      prompts: [makePrompt('p1')],
      skills: [
        {
          skill: {
            id: 's1',
            name: 'Skill One',
            content: 'body',
            protocol_type: 'skill',
            is_favorite: false,
            local_repo_path: null,
          },
          files: {
            'SKILL.md': new TextEncoder().encode('# Skill'),
          },
        },
      ],
    };

    const bytes = encodeWorkflowTemplateZip(payload);
    const decoded = decodeWorkflowTemplateZip(bytes);

    expect(decoded.manifest).toEqual(payload.manifest);
    expect(decoded.workflow).toEqual(payload.workflow);
    expect(decoded.prompts).toEqual(payload.prompts);
    expect(decoded.skills).toHaveLength(1);
    expect(decoded.skills[0].skill.id).toBe('s1');
    expect(new TextDecoder().decode(decoded.skills[0].files['SKILL.md'])).toBe('# Skill');
  });

  it('非法 manifest 抛错', () => {
    const bad = encodeWorkflowTemplateZip({
      manifest: {
        version: 1,
        kind: 'workflow-template',
        exportedAt: 'x',
        workflowName: 'x',
        promptIds: [],
        skillIds: [],
        missingResourceIds: [],
        strippedLocalPathCount: 0,
      },
      workflow: { id: 'w', name: 'w', graphJson: '{}' },
      prompts: [],
      skills: [],
    });
    // 篡改：重新打包错误 kind
    const files = unzipSync(bad);
    files['manifest.json'] = strToU8(
      JSON.stringify({
        version: 2,
        kind: 'other',
        exportedAt: 'x',
        workflowName: 'x',
        promptIds: [],
        skillIds: [],
        missingResourceIds: [],
        strippedLocalPathCount: 0,
      }),
    );
    expect(() => decodeWorkflowTemplateZip(zipSync(files))).toThrow(/不支持的工作流模板包/);
  });
});
