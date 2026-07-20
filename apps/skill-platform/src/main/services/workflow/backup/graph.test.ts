import { describe, expect, it } from 'vitest';

import {
  collectWorkflowResourceIds,
  remapWorkflowResourceIds,
  sanitizeWorkflowGraphJson,
} from './graph';

describe('sanitizeWorkflowGraphJson', () => {
  it('清空 kbCollectionId 与 workspacePaths 并计数', () => {
    const input = JSON.stringify({
      nodes: [
        {
          id: '1',
          type: 'promptResource',
          data: {
            resourceKind: 'prompt',
            resourceId: 'p1',
            kbCollectionId: 3,
            workspacePaths: ['C:/a'],
          },
        },
        {
          id: '2',
          type: 'webpageResource',
          data: { url: 'https://example.com' },
        },
      ],
      edges: [],
    });
    const result = sanitizeWorkflowGraphJson(input);
    expect(result.strippedLocalPathCount).toBe(2);
    const parsed = JSON.parse(result.graphJson) as {
      nodes: Array<{ data: Record<string, unknown> }>;
    };
    expect(parsed.nodes[0].data.kbCollectionId).toBeUndefined();
    expect(parsed.nodes[0].data.workspacePaths).toBeUndefined();
    expect(parsed.nodes[1].data.url).toBe('https://example.com');
  });
});

describe('collectWorkflowResourceIds', () => {
  it('去重收集 prompt 与 skill', () => {
    const graphJson = JSON.stringify({
      nodes: [
        { id: 'a', data: { resourceKind: 'prompt', resourceId: 'p1' } },
        { id: 'b', data: { resourceKind: 'skill', resourceId: 's1' } },
        { id: 'c', data: { resourceKind: 'prompt', resourceId: 'p1' } },
        { id: 'd', data: { url: 'https://x' } },
      ],
      edges: [],
    });
    expect(collectWorkflowResourceIds(graphJson)).toEqual({
      promptIds: ['p1'],
      skillIds: ['s1'],
    });
  });
});

describe('remapWorkflowResourceIds', () => {
  it('按 map 替换 resourceId', () => {
    const graphJson = JSON.stringify({
      nodes: [{ id: 'a', data: { resourceKind: 'prompt', resourceId: 'old' } }],
      edges: [],
    });
    const next = remapWorkflowResourceIds(graphJson, new Map([['old', 'new']]));
    expect(JSON.parse(next).nodes[0].data.resourceId).toBe('new');
  });
});
