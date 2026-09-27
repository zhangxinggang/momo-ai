import type { RuntimeTurnInput } from '@momo/agent-contracts';
import { afterEach, expect, it, vi } from 'vitest';
import { createHarnessChatOverrides, harnessPort } from './client';

vi.mock('@momo/aichat', () => ({
  createRuntimeChatStream: () => vi.fn(),
  normalizeFolderPaths: (paths: string[]) => paths,
}));
vi.mock('@renderer/store/chat', () => ({
  useChatProjectStore: { getState: () => ({ projects: [{ id: 'project', folderPaths: [] }] }) },
}));
vi.mock('@renderer/store/settings', () => ({
  useSettingsStore: { getState: () => ({ aiModels: [] }) },
}));
afterEach(() => vi.unstubAllGlobals());

it('enables fetch capability only on the webpage port and preserves the actual model input', async () => {
  const start = vi.fn().mockResolvedValue({ runId: 'run' });
  vi.stubGlobal('window', {
    api: {
      settings: { set: vi.fn().mockResolvedValue(undefined) },
      agentRuntime: { syncProjects: vi.fn().mockResolvedValue(undefined), startTurn: start },
    },
  });
  const turn: RuntimeTurnInput = {
    sessionId: 'session',
    projectId: 'project',
    turnId: 'turn',
    idempotencyKey: 'key',
    modelProfileId: 'model',
    agentId: 'momo-default',
    modeId: 'ask',
    rawIntent: '总结',
    displayInput: '总结',
    apiInput: '已读取正文与总结要求',
    folderPaths: [],
    sourceRefs: [],
    invocations: [],
  };
  await createHarnessChatOverrides({ webBrowsing: true }).runtime!.port.startTurn(turn);
  expect(start).toHaveBeenLastCalledWith({ ...turn, webBrowsing: true });
  const ordinary = createHarnessChatOverrides();
  expect(ordinary.runtime!.port).toBe(harnessPort);
  await ordinary.runtime!.port.startTurn(turn);
  expect(start).toHaveBeenLastCalledWith(turn);
  expect(turn.webBrowsing).toBeUndefined();
});
