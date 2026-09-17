import type { IWorkflowResourceNodeData } from '@momo/workflow';
import type { Node } from '@xyflow/react';
import { describe, expect, it } from 'vitest';

import { buildWorkflowAutoPrompt, getNextWorkflowStepCursor } from './auto-execution';
import type { IMacroStepViewModel, IResourceStepViewModel } from './step-model';

function resource(nodeId: string): IResourceStepViewModel {
  return {
    kind: 'resource',
    nodeId,
    nodeName: nodeId,
    resourceKind: 'prompt',
    resourceId: nodeId,
    node: {
      id: nodeId,
      type: 'promptResource',
      position: { x: 0, y: 0 },
      data: { resourceKind: 'prompt', resourceId: nodeId },
    } as Node<IWorkflowResourceNodeData>,
  };
}

describe('workflow auto execution', () => {
  it('moves through parallel children before the next macro step', () => {
    const a = resource('a');
    const b = resource('b');
    const c = resource('c');
    const steps: IMacroStepViewModel[] = [
      {
        kind: 'parallel',
        nodeId: 'parallel',
        nodeName: 'parallel',
        children: [a, b],
      },
      c,
    ];

    expect(getNextWorkflowStepCursor(steps, 0, 0)).toEqual({
      macroIndex: 0,
      parallelChildIndex: 1,
      nodeId: 'b',
    });
    expect(getNextWorkflowStepCursor(steps, 0, 1)).toEqual({
      macroIndex: 1,
      parallelChildIndex: 0,
      nodeId: 'c',
    });
    expect(getNextWorkflowStepCursor(steps, 1, 0)).toBeNull();
  });

  it('uses configured prompt text and a skill fallback', () => {
    expect(buildWorkflowAutoPrompt('prompt', '  继续处理  ')).toBe('继续处理');
    expect(buildWorkflowAutoPrompt('skill', '')).toContain('当前技能');
  });
});
