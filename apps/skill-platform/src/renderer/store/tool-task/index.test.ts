import { emptyProjection } from '@momo/aichat';
// @vitest-environment jsdom
import { expect, it, vi } from 'vitest';
import { useToolTaskStore } from './index';
vi.mock('@momo/aichat', () => ({
  emptyProjection: () => ({ status: 'running', events: [], content: '' }),
}));

it('restores task results and admitted references without duplicating assistant text or reviving an interrupted run', async () => {
  const source = {
    sourceId: 'original',
    revision: '1',
    name: '资料.txt',
    mimeType: 'text/plain',
    size: 5,
    encoding: 'utf8',
  };
  const task = {
    sessionId: 'task',
    projectId: 'bound-project',
    sources: [source],
    projection: {
      status: 'running',
      content: 'root = PlainText("实际结果")',
      committedContent: 'duplicate text',
      events: [
        { type: 'assistant.commit', payload: { content: 'duplicate text' } },
        { type: 'interaction.requested', payload: { requestId: 'approval' } },
      ],
    },
  };
  useToolTaskStore.getState().setTask('tool:definition:root', task as never);
  const serialized = localStorage.getItem('custom-tool-tasks')!;
  const saved = JSON.parse(serialized).state.tasks['tool:definition:root'];
  expect(saved.projectId).toBe('bound-project');
  expect(saved.sources).toEqual([source]);
  expect(saved.projection.content).toContain('实际结果');
  expect(saved.projection.status).toBe('cancelled');
  expect(serialized).not.toContain('duplicate text');
  expect(saved.projection.events).toHaveLength(1);
  expect(task.projection.status).toBe('running');
  useToolTaskStore.setState({ tasks: {} });
  localStorage.setItem('custom-tool-tasks', serialized);
  await useToolTaskStore.persist.rehydrate();
  expect(useToolTaskStore.getState().tasks['tool:definition:root'].projection.content).toContain(
    '实际结果',
  );
});

it('keeps the completed result usable when persistent cache quota is exhausted', () => {
  const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('Quota exceeded', 'QuotaExceededError');
  });
  const remove = vi.spyOn(Storage.prototype, 'removeItem');
  try {
    const snapshot = {
      sessionId: 'quota-test',
      projection: { ...emptyProjection(), status: 'completed' as const },
      result: { title: 'Report' },
    };
    expect(() => useToolTaskStore.getState().setTask('quota-test', snapshot)).not.toThrow();
    expect(useToolTaskStore.getState().tasks['quota-test'].result).toEqual(snapshot.result);
    expect(remove).toHaveBeenCalledWith('custom-tool-tasks');
  } finally {
    write.mockRestore();
    remove.mockRestore();
  }
});
