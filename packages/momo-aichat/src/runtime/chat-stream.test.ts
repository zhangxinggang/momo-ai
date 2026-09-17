import type { RuntimeTurnInput } from '@momo/agent-contracts';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const executeRuntimeTurn = vi.fn();

vi.mock('./execute', () => ({
  executeRuntimeTurn: (...args: unknown[]) => executeRuntimeTurn(...args),
}));

import type { IAiChatServices } from '../adapters/types';
import { createRuntimeChatStream } from './chat-stream';

function createRuntime(): NonNullable<IAiChatServices['runtime']> {
  return {
    port: {} as NonNullable<IAiChatServices['runtime']>['port'],
    getAgentId: () => 'agent',
    getResourceContext: () => ({ projectId: 'project', folderPaths: [] }),
  };
}

describe('createRuntimeChatStream session isolation', () => {
  beforeEach(() => {
    executeRuntimeTurn.mockReset();
    executeRuntimeTurn.mockImplementation(async (_port, input: RuntimeTurnInput) => ({
      runId: `run-${input.sessionId}`,
      status: 'completed',
      content: '完成',
      events: [],
      usage: {},
    }));
  });

  it('uses the caller-owned session for the run and its downloadable journal', async () => {
    const stream = createRuntimeChatStream({ runtime: createRuntime() });

    await stream(
      [{ role: 'user', content: '生成当前工具' }],
      vi.fn(),
      vi.fn(),
      undefined,
      'model',
      { sessionId: 'tool-generation-current' },
    );

    expect(executeRuntimeTurn).toHaveBeenCalledTimes(1);
    expect(executeRuntimeTurn.mock.calls[0][1]).toMatchObject({
      sessionId: 'tool-generation-current',
      rawIntent: '生成当前工具',
      history: [{ role: 'user', content: '生成当前工具' }],
    });
  });

  it('keeps separately created editor tasks on different sessions', async () => {
    const stream = createRuntimeChatStream({ runtime: createRuntime() });

    await stream([{ role: 'user', content: '任务 A' }], vi.fn(), vi.fn(), undefined, 'model', {
      sessionId: 'editor-task-a',
    });
    await stream([{ role: 'user', content: '任务 B' }], vi.fn(), vi.fn(), undefined, 'model', {
      sessionId: 'editor-task-b',
    });

    expect(executeRuntimeTurn.mock.calls.map((call) => call[1].sessionId)).toEqual([
      'editor-task-a',
      'editor-task-b',
    ]);
    expect(executeRuntimeTurn.mock.calls[1][1].history).toEqual([
      { role: 'user', content: '任务 B' },
    ]);
  });
});
