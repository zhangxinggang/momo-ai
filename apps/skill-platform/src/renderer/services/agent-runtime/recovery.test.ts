// @vitest-environment jsdom
import type { RunEvent } from '@momo/agent-contracts';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useChatSessions } from '../../../../../../packages/momo-aichat/src/hooks/useChatSessions';
import {
  buildStorageKeys,
  type IChatSession,
} from '../../../../../../packages/momo-aichat/src/types/chat';

const mocks = vi.hoisted(() => ({ config: undefined as any }));
vi.mock('../../../../../../packages/momo-aichat/src/contexts/AiChatConfigContext', () => ({
  useAiChatConfig: () => mocks.config,
}));
vi.mock('../../../../../../packages/momo-aichat/src/hooks/useChatSync', () => ({
  useChatSync: () => ({}),
}));

let root: Root;
let container: HTMLDivElement;
let current: ReturnType<typeof useChatSessions>;
let events: ReturnType<typeof vi.fn>;
function Harness() {
  current = useChatSessions();
  return null;
}
function history(runId: string, runStatus: string): IChatSession {
  return {
    id: runId + '-session',
    title: 'Saved chat',
    createdAt: 1,
    updatedAt: 1,
    messages: [
      {
        id: runId + '-message',
        role: 'assistant',
        runId,
        runStatus,
        content: '已保存的回答',
        thinkingContent: '已保存的思考',
        timestamp: 1,
        isLoading: runStatus === 'running',
      },
    ],
  };
}
async function mount(sessions: IChatSession[]) {
  localStorage.setItem(buildStorageKeys('recovery-test').CHAT_SESSIONS, JSON.stringify(sessions));
  await act(async () => root.render(createElement(Harness)));
  await act(async () => vi.advanceTimersByTimeAsync(1500));
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  localStorage.clear();
  events = vi.fn().mockResolvedValue(null);
  mocks.config = {
    storageKeyPrefix: 'recovery-test',
    chatStorage: localStorage,
    defaultModel: 'model',
    getIsAuthenticated: () => false,
    runtime: {
      port: { events },
      getAgentId: () => 'agent',
      getResourceContext: () => ({ projectId: 'project', folderPaths: [] }),
    },
  };
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  localStorage.clear();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('historical runtime recovery', () => {
  it('stops polling missing runs while preserving completed answers and failing unfinished ones', async () => {
    await mount([history('completed-missing', 'completed'), history('running-missing', 'running')]);
    const completed = current.sessions.find((s) => s.id === 'completed-missing-session')!;
    const unfinished = current.sessions.find((s) => s.id === 'running-missing-session')!;
    expect(completed.messages[0]).toMatchObject({
      content: '已保存的回答',
      thinkingContent: '已保存的思考',
      runStatus: 'completed',
      isLoading: false,
    });
    expect(unfinished.messages[0]).toMatchObject({
      content: '已保存的回答',
      thinkingContent: '已保存的思考',
      runStatus: 'failed',
      isLoading: false,
      isError: true,
    });
    expect(unfinished.isLoading).toBe(false);
    const calls = events.mock.calls.length;
    await act(async () => vi.advanceTimersByTimeAsync(6000));
    expect(events).toHaveBeenCalledTimes(calls);
  });

  it('retries temporary IPC failures and existing empty logs, then restores the durable answer', async () => {
    let available = false;
    let failOnce = true;
    const replay: RunEvent[] = [
      {
        eventSchemaVersion: '1',
        eventId: '1',
        projectId: 'project',
        sessionId: 'known-session',
        turnId: 'turn',
        runId: 'known',
        seq: 1,
        timestamp: 1,
        type: 'assistant.delta',
        payload: { text: '恢复的回答' },
      },
      {
        eventSchemaVersion: '1',
        eventId: '2',
        projectId: 'project',
        sessionId: 'known-session',
        turnId: 'turn',
        runId: 'known',
        seq: 2,
        timestamp: 2,
        type: 'run.completed',
        payload: {},
      },
    ];
    events.mockImplementation(async () => {
      if (failOnce) {
        failOnce = false;
        throw new Error('temporary IPC failure');
      }
      return available ? replay : [];
    });
    await mount([history('known', 'running')]);
    expect(current.sessions[0].messages[0].content).toBe('已保存的回答');
    available = true;
    await act(async () => vi.advanceTimersByTimeAsync(1500));
    expect(current.sessions[0].messages[0]).toMatchObject({
      content: '恢复的回答',
      runStatus: 'completed',
      isLoading: false,
      isError: false,
    });
    const calls = events.mock.calls.length;
    await act(async () => vi.advanceTimersByTimeAsync(4500));
    expect(events).toHaveBeenCalledTimes(calls);
  });
});
