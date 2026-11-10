import type { RunProjection } from '@momo/aichat';
import { expect, it } from 'vitest';
import { projectRuntimeView } from '../aichat/runtime-view';
import { hasRecoveredLayoutResult } from './task-error';

it('recovers a cached layout failure only after a successful runtime and valid complete result', () => {
  const error =
    'field "/align" expects one of ["start", "center", "end", "stretch", "baseline"] but got true';
  const content = 'root = Stack([PlainText("原分析结果")], "row", "s", true)';
  const snapshot = {
    error,
    projection: { status: 'failed', content, events: [{ type: 'run.completed' }] } as RunProjection,
  };
  const view = projectRuntimeView(content, false);
  expect(hasRecoveredLayoutResult(snapshot, view)).toBe(true);
  expect(hasRecoveredLayoutResult({ ...snapshot, error: '模型请求失败' }, view)).toBe(false);
  expect(hasRecoveredLayoutResult(snapshot, projectRuntimeView(content, true))).toBe(false);
  expect(
    hasRecoveredLayoutResult(snapshot, projectRuntimeView('root = Stack([missing])', false)),
  ).toBe(false);
  expect(
    hasRecoveredLayoutResult(
      { ...snapshot, projection: { ...snapshot.projection, events: [] } },
      view,
    ),
  ).toBe(false);
  expect(
    hasRecoveredLayoutResult(
      {
        ...snapshot,
        projection: {
          ...snapshot.projection,
          events: [{ type: 'run.failed' }] as RunProjection['events'],
        },
      },
      view,
    ),
  ).toBe(false);
});
