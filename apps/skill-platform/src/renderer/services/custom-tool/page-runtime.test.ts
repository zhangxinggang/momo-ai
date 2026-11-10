// @vitest-environment jsdom
import { useToolTaskStore } from '@renderer/store/tool-task';
import { beforeEach, expect, it, vi } from 'vitest';
import { isPageTaskRunning, pageTaskKey, runPageTask, stopPageTask } from './page-runtime';
const mocks = vi.hoisted(() => ({ execute: vi.fn(), upload: vi.fn(), load: vi.fn() }));
vi.mock('@momo/aichat', () => ({
  emptyProjection: () => ({ status: 'running', events: [], content: '' }),
}));
vi.mock('@renderer/services/agent-runtime/client', () => ({
  uploadHarnessAttachments: mocks.upload,
  harnessSourceStore: { load: mocks.load },
}));
vi.mock('./tool-task', () => ({
  executeToolTask: mocks.execute,
  newToolTask: () => ({
    sessionId: 'session',
    projection: { status: 'running', events: [], content: '' },
  }),
  taskSources: (task: any) =>
    task.sources.concat(
      task.projection.events.flatMap((event: any) =>
        event.payload?.sourceRef ? [event.payload.sourceRef] : [],
      ),
    ),
}));
const action = {
  capability: 'model.generate' as const,
  title: '生成',
  instruction: '只处理真实数据',
  result: 'json' as const,
};
const input = { key: 'page:project:one', action, modelId: 'model', projectId: 'project' };
beforeEach(() => {
  useToolTaskStore.setState({ tasks: {} });
  vi.clearAllMocks();
  mocks.upload.mockResolvedValue([]);
});
it('persists progress and results independently of a mounted page and rejects duplicate runs', async () => {
  let finish!: (value: any) => void;
  mocks.execute.mockImplementation(async (args) => {
    args.onUpdate({ status: 'running', content: '', events: [{ type: 'tool.call' }] });
    return new Promise((resolve) => {
      finish = resolve;
    });
  });
  const pending = runPageTask(input);
  await vi.waitFor(() => expect(finish).toBeDefined());
  expect(isPageTaskRunning(input.key)).toBe(true);
  await expect(runPageTask(input)).rejects.toThrow('仍在处理中');
  expect(useToolTaskStore.getState().tasks[input.key].projection.events).toHaveLength(1);
  finish({ status: 'completed', content: '{"total":37}', events: [] });
  await expect(pending).resolves.toEqual({ total: 37 });
  expect(isPageTaskRunning(input.key)).toBe(false);
  expect(useToolTaskStore.getState().tasks[input.key].result).toEqual({ total: 37 });
  expect(pageTaskKey('same', 'project-a', action)).not.toBe(
    pageTaskKey('same', 'project-b', action),
  );
});
it('loads a complete result only through a registered artifact reference', async () => {
  mocks.execute.mockResolvedValue({
    status: 'completed',
    content: '{"resultSourceId":"report"}',
    events: [
      {
        type: 'artifact.created',
        payload: { sourceRef: { sourceId: 'report', name: 'report.json', size: 20 } },
      },
    ],
  });
  mocks.load.mockResolvedValue([{ encoding: 'utf8', content: '{"rows":[1,2,3]}' }]);
  await expect(runPageTask(input)).resolves.toEqual({ rows: [1, 2, 3] });
  mocks.execute.mockResolvedValue({
    status: 'completed',
    content: '{"resultSourceId":"unknown"}',
    events: [],
  });
  await expect(runPageTask(input)).rejects.toThrow('结果文件不可用');
  expect(mocks.load).toHaveBeenCalledTimes(1);
});
it('cancels a live task without accepting a late result', async () => {
  let finish!: (value: any) => void;
  mocks.execute.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const pending = runPageTask(input);
  await vi.waitFor(() => expect(finish).toBeDefined());
  stopPageTask(input.key);
  finish({ status: 'completed', content: '{}', events: [] });
  await expect(pending).rejects.toThrow('已停止');
  expect(useToolTaskStore.getState().tasks[input.key].projection.status).toBe('cancelled');
});
