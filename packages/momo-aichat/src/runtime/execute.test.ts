import type { ChatRuntimePort, RunEvent, RuntimeTurnInput } from '@momo/agent-contracts';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { executeRuntimeTurn } from './execute';

const input: RuntimeTurnInput = {
  sessionId: 'session',
  projectId: 'project',
  turnId: 'turn',
  idempotencyKey: 'key',
  agentId: 'agent',
  modelProfileId: 'model',
  modeId: 'ask',
  rawIntent: 'hello',
  displayInput: 'hello',
  folderPaths: [],
  sourceRefs: [],
  invocations: [],
};
function event(seq: number, type: RunEvent['type'], payload: RunEvent['payload']): RunEvent {
  return {
    eventSchemaVersion: '1',
    eventId: String(seq),
    runId: 'run',
    sessionId: 'session',
    projectId: 'project',
    turnId: 'turn',
    timestamp: seq,
    seq,
    type,
    payload,
  };
}
function portWithEvents(events: ReturnType<typeof vi.fn>) {
  const off = vi.fn();
  const port = {
    startTurn: vi.fn().mockResolvedValue({ runId: 'run' }),
    events,
    onEvent: vi.fn(() => off),
    cancel: vi.fn(),
  } as unknown as ChatRuntimePort;
  return { port, off };
}
afterEach(() => vi.useRealTimers());

describe('executeRuntimeTurn replay', () => {
  it('fails promptly and removes its subscription if the receipt run is unavailable', async () => {
    const events = vi.fn().mockResolvedValue(null);
    const { port, off } = portWithEvents(events);
    await expect(
      executeRuntimeTurn(port, input, new AbortController().signal, vi.fn()),
    ).rejects.toThrow('本轮执行记录已不可用');
    expect(events).toHaveBeenCalledTimes(1);
    expect(off).toHaveBeenCalledTimes(1);
  });

  it('settles a run lost during polling and retains its partial output', async () => {
    vi.useFakeTimers();
    const events = vi
      .fn()
      .mockResolvedValueOnce([event(1, 'assistant.delta', { text: 'partial' })])
      .mockResolvedValue(null);
    const { port, off } = portWithEvents(events);
    const pending = executeRuntimeTurn(port, input, new AbortController().signal, vi.fn());
    await vi.advanceTimersByTimeAsync(1500);
    await expect(pending).resolves.toMatchObject({
      content: 'partial',
      status: 'failed',
      error: expect.stringContaining('执行记录已不可用'),
    });
    await vi.advanceTimersByTimeAsync(4500);
    expect(events).toHaveBeenCalledTimes(2);
    expect(off).toHaveBeenCalledTimes(1);
  });

  it('keeps polling an existing run with no new events until it completes', async () => {
    vi.useFakeTimers();
    const events = vi
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        event(1, 'assistant.delta', { text: 'answer' }),
        event(2, 'run.completed', {}),
      ]);
    const { port } = portWithEvents(events);
    const pending = executeRuntimeTurn(port, input, new AbortController().signal, vi.fn());
    await vi.advanceTimersByTimeAsync(1500);
    await expect(pending).resolves.toMatchObject({ content: 'answer', status: 'completed' });
  });
});
