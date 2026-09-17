// @vitest-environment jsdom
import { IPC_CHANNELS } from '@/types/constants';
import type { IAIModelConfig, ISettings } from '@/types/modules/settings';
import type { RuntimeTurnInput } from '@momo/agent-contracts';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  handlers: new Map<string, (...args: any[]) => Promise<any>>(),
}));
vi.mock('electron', () => ({
  ipcMain: { handle: (channel: string, handler: any) => mocks.handlers.set(channel, handler) },
}));
vi.mock('@renderer/services/desktop', () => ({
  setAutoLaunch: vi.fn(),
  setCloseAction: vi.fn(),
  setDebugMode: vi.fn(),
  setMinimizeToTray: vi.fn(),
}));
vi.mock('@renderer/utils/media/url', () => ({ resolveLocalImageSrc: () => '' }));
vi.mock('@renderer/store/chat', () => ({
  useChatProjectStore: { getState: () => ({ projects: [{ id: 'project', folderPaths: [] }] }) },
}));

import { useSettingsStore } from '@renderer/store/settings';
import { testStore } from '../../../main/agent-runtime/persistence/test-store';
import { registerSettingsIPC } from '../../../main/ipc/settings';
import { harnessPort } from './client';

const model: IAIModelConfig = {
  id: 'model_saved_qwen',
  type: 'chat',
  provider: 'qwen',
  apiProtocol: 'openai',
  apiKey: 'local-test-only',
  apiUrl: 'http://127.0.0.1/v1',
  model: 'qwen3.8-flash',
  isDefault: true,
};
const turn: RuntimeTurnInput = {
  sessionId: 'session',
  projectId: 'project',
  turnId: 'turn',
  idempotencyKey: 'turn-key',
  modelProfileId: model.id,
  agentId: 'momo',
  modeId: 'ask',
  rawIntent: '请提取项目概述和评分标准',
  displayInput: '请提取项目概述和评分标准',
  invocations: [],
  sourceRefs: [],
  folderPaths: [],
};
let store: ReturnType<typeof testStore>;
let settingsSet: ReturnType<typeof vi.fn>;
let nativeStart: ReturnType<typeof vi.fn>;
const previousApi = window.api;
function storedModels(): IAIModelConfig[] | undefined {
  const row = store.db.prepare("SELECT value FROM settings WHERE key='aiModels'").get() as
    | { value: string }
    | undefined;
  return row ? JSON.parse(row.value) : undefined;
}
async function writeSettings(settings: Partial<ISettings>) {
  return mocks.handlers.get(IPC_CHANNELS.SETTINGS_SET)!(undefined, settings);
}

beforeEach(() => {
  localStorage.clear();
  useSettingsStore.setState({ aiModels: [], scenarioModelDefaults: {} });
  store = testStore();
  store.db.exec('CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)');
  registerSettingsIPC(store.db);
  settingsSet = vi.fn(writeSettings);
  nativeStart = vi.fn(async () => ({ runId: 'run' }));
  window.api = {
    settings: { set: settingsSet },
    agentRuntime: { syncProjects: vi.fn().mockResolvedValue(true), startTurn: nativeStart },
  } as any;
});
afterEach(() => {
  window.api = previousApi;
  store.db.close();
  mocks.handlers.clear();
  localStorage.clear();
});

describe('settings models available to Harness', () => {
  it('restores existing renderer-only models into the main database without re-saving', async () => {
    localStorage.setItem(
      'aim-settings',
      JSON.stringify({ state: { aiModels: [model] }, version: 9 }),
    );
    await useSettingsStore.persist.rehydrate();
    expect(useSettingsStore.getState().aiModels).toEqual([model]);
    expect(storedModels()).toEqual([model]);
  });

  it('persists additions, edits and deleting the last model through the actual settings IPC', () => {
    const { id: _id, ...config } = model;
    useSettingsStore.getState().addAiModel(config);
    const added = useSettingsStore.getState().aiModels[0];
    expect(storedModels()).toEqual([added]);
    useSettingsStore.getState().updateAiModel(added.id, { apiUrl: 'http://127.0.0.1:9001/v1' });
    expect(storedModels()?.[0].apiUrl).toBe('http://127.0.0.1:9001/v1');
    useSettingsStore.getState().deleteAiModel(added.id);
    expect(storedModels()).toEqual([]);
  });

  it('persists changing the default model', () => {
    const second = { ...model, id: 'second', isDefault: false };
    useSettingsStore.setState({ aiModels: [model, second] });
    useSettingsStore.getState().setDefaultAiModel(second.id);
    expect(storedModels()?.map((m) => [m.id, m.isDefault])).toEqual([
      [model.id, false],
      [second.id, true],
    ]);
  });

  it('writes the selected profile before starting a turn when the main database has no models', async () => {
    useSettingsStore.setState({ aiModels: [model] });
    expect(storedModels()).toBeUndefined();
    nativeStart.mockImplementationOnce(async (input: RuntimeTurnInput) => {
      expect(storedModels()?.find((m) => m.id === input.modelProfileId)).toEqual(model);
      return { runId: 'run' };
    });
    await expect(harnessPort.startTurn(turn)).resolves.toEqual({ runId: 'run' });
    expect(nativeStart).toHaveBeenCalledWith(turn);
  });

  it('waits for durable model settings before starting the runtime', async () => {
    useSettingsStore.setState({ aiModels: [model] });
    let finish!: () => void;
    settingsSet.mockImplementationOnce(
      (settings: Partial<ISettings>) =>
        new Promise((resolve) => {
          finish = () => {
            void writeSettings(settings).then(resolve);
          };
        }),
    );
    const pending = harnessPort.startTurn(turn);
    await Promise.resolve();
    expect(nativeStart).not.toHaveBeenCalled();
    expect(storedModels()).toBeUndefined();
    finish();
    await expect(pending).resolves.toEqual({ runId: 'run' });
    expect(storedModels()).toEqual([model]);
  });

  it('does not start against stale settings when persistence fails', async () => {
    useSettingsStore.setState({ aiModels: [model] });
    settingsSet.mockRejectedValueOnce(new Error('Settings could not be saved'));
    await expect(harnessPort.startTurn(turn)).rejects.toThrow('Settings could not be saved');
    expect(nativeStart).not.toHaveBeenCalled();
    expect(storedModels()).toBeUndefined();
  });
});
