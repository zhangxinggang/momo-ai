import type { RuntimeTurnInput } from '@momo/agent-contracts';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { testStore } from '../persistence/test-store';

const mocks = vi.hoisted(() => ({ handler: undefined as any, clearSession: vi.fn() }));
vi.mock('electron', () => ({
  app: { isPackaged: false },
  BrowserWindow: { fromWebContents: () => ({}), getAllWindows: () => [] },
  dialog: {},
  ipcMain: {
    removeHandler: vi.fn(),
    handle: (_channel: string, handler: any) => {
      mocks.handler = handler;
    },
  },
}));
vi.mock('../../runtime-paths', () => ({
  getUserDataPath: () => 'unused',
  getProjectRoot: () => 'unused',
}));
vi.mock('../supervisor/bundles', () => ({ RuntimeBundles: class {} }));
vi.mock('../application/service', () => ({
  ChatApplicationService: class {
    clearSession = mocks.clearSession;
    async start() {
      return { runId: 'run' };
    }
    async dispose() {}
  },
}));

import { disposeAgentRuntime, registerAgentRuntimeIPC } from './index';

let store: ReturnType<typeof testStore>;
const frame = { url: 'file:///chat.html' };
const sender = { id: 1, mainFrame: frame, once: vi.fn() };
const event = { sender, senderFrame: frame };
const turn: RuntimeTurnInput = {
  sessionId: 'session',
  projectId: 'project',
  turnId: 'turn',
  idempotencyKey: 'key',
  agentId: 'momo-default',
  modelProfileId: 'model',
  modeId: 'ask',
  rawIntent: 'hello',
  displayInput: 'hello',
  folderPaths: [],
  sourceRefs: [],
  invocations: [],
};

beforeEach(() => {
  mocks.clearSession.mockReset();
  store = testStore();
  registerAgentRuntimeIPC(store.db);
  store.db.prepare('DELETE FROM agent_events').run();
  store.status('run', 'running');
});
afterEach(async () => {
  await disposeAgentRuntime();
  store.db.close();
});

describe('runtime event replay IPC', () => {
  it('returns null for a missing historical run without rejecting the IPC request', async () => {
    await expect(mocks.handler(event, 'events', { runId: 'imported-run' })).resolves.toBeNull();
  });

  it('distinguishes an existing run with no new events and respects the durable cursor', async () => {
    await expect(mocks.handler(event, 'events', { runId: 'run' })).resolves.toEqual([]);
    store.append('run', 'assistant.delta', { text: 'partial output' });
    const terminal = store.append('run', 'run.failed', { message: 'interrupted' });
    await expect(mocks.handler(event, 'events', { runId: 'run', afterSeq: 1 })).resolves.toEqual([
      terminal,
    ]);
  });

  it('still rejects replay of a run owned by another window', async () => {
    await mocks.handler(event, 'startTurn', turn);
    const otherWindow = { ...event, sender: { ...sender, id: 2 } };
    await expect(mocks.handler(otherWindow, 'events', { runId: 'run' })).rejects.toThrow(
      'SESSION_OWNED_BY_OTHER_WINDOW',
    );
    await expect(mocks.handler(otherWindow, 'cancel', { runId: 'run' })).rejects.toThrow(
      'SESSION_OWNED_BY_OTHER_WINDOW',
    );
  });

  it('makes stopping a missing run idempotent, including repeated cleanup requests', async () => {
    await expect(mocks.handler(event, 'cancel', { runId: 'missing-run' })).resolves.toBeUndefined();
    await expect(mocks.handler(event, 'cancel', { runId: 'missing-run' })).resolves.toBeUndefined();
  });

  it.each([undefined, '', ' ', 123])('rejects malformed run IDs (%s)', async (runId) => {
    await expect(mocks.handler(event, 'events', { runId })).rejects.toThrow('INVALID_RUN_ID');
  });

  it('keeps response operations strict for missing runs', async () => {
    await expect(mocks.handler(event, 'respond', { runId: 'missing-run' })).rejects.toThrow(
      'UNKNOWN_RUN',
    );
  });

  it('allows clearing only from the window that owns the conversation', async () => {
    await mocks.handler(event, 'startTurn', turn);
    const otherWindow = { ...event, sender: { ...sender, id: 2 } };
    await expect(
      mocks.handler(otherWindow, 'clearSession', { sessionId: turn.sessionId }),
    ).rejects.toThrow('SESSION_OWNED_BY_OTHER_WINDOW');
    expect(mocks.clearSession).not.toHaveBeenCalled();
    await mocks.handler(event, 'clearSession', { sessionId: turn.sessionId });
    expect(mocks.clearSession).toHaveBeenCalledExactlyOnceWith(turn.sessionId);
  });
});
