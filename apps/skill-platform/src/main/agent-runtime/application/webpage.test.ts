import type { RuntimeTurnInput } from '@momo/agent-contracts';
import fs from 'node:fs/promises';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { buildWebPagePrompt } from '../../../renderer/services/webpage-chat';
import { testStore } from '../persistence/test-store';
import { ChatApplicationService } from './service';

const mocks = vi.hoisted(() => ({ prepare: vi.fn() }));
vi.mock('../../runtime-paths', () => ({
  getNotesDir: () => 'unused',
  getSkillSessionWorkspaceDir: (id: string) => process.cwd() + '/../../temp/runtime-tests/' + id,
}));
vi.mock('../../services/knowledge-v2/worker-client', () => ({ knowledgeWorkerClient: {} }));
vi.mock('../../services/mcp/hub', () => ({ getMcpHub: () => ({ listTools: () => [] }) }));
vi.mock('../../services/agent-app', () => ({
  listAgentAppSlash: async () => ({ items: [] }),
  prepareAgentAppSubmit: mocks.prepare,
  resolveAgentAppContext: async () => null,
}));

let store: ReturnType<typeof testStore>;
let service: ChatApplicationService;
let request: ReturnType<typeof vi.fn>;
let turn: RuntimeTurnInput;
beforeEach(async () => {
  store = testStore();
  const root = await fs.realpath(process.cwd());
  const folderPaths = [root];
  store.set('project:web-project', JSON.stringify({ folderPaths }));
  service = new ChatApplicationService(store, {} as never, root);
  mocks.prepare.mockImplementation(async (input) => ({ action: 'allow', content: input.content }));
  request = vi.fn(async (method: string) =>
    method === 'listAgents' ? [{ id: 'momo-default' }] : undefined,
  );
  vi.spyOn(service as any, 'settings').mockReturnValue([{ id: 'model', type: 'chat' }]);
  vi.spyOn(service as any, 'runtime').mockResolvedValue({
    manifest: { bundleId: 'bundle' },
    runtime: { request },
  });
  turn = {
    sessionId: 'web-session',
    projectId: 'web-project',
    turnId: 'web-turn',
    idempotencyKey: 'web-key',
    modelProfileId: 'model',
    agentId: 'momo-default',
    modeId: 'ask',
    rawIntent: '总结当前网页',
    displayInput: '总结当前网页',
    apiInput: buildWebPagePrompt(
      {
        url: 'https://example.com/article',
        title: '当前文章',
        content: '本轮已读取的网页正文',
        truncated: false,
      },
      '总结当前网页',
    ),
    folderPaths,
    sourceRefs: [],
    invocations: [],
    webBrowsing: true,
  };
});
afterEach(async () => {
  await service.dispose();
  store.db.close();
  vi.restoreAllMocks();
});

it('passes frozen current-page content as the actual Harness prompt, including resumed conversations', async () => {
  const first = await service.start({
    ...turn,
    history: [{ role: 'user', content: turn.apiInput! }],
  });
  const started = request.mock.calls.find(([method]) => method === 'start')![1] as any;
  expect(mocks.prepare).toHaveBeenCalledWith(
    expect.objectContaining({ content: turn.apiInput, displayContent: turn.displayInput }),
  );
  expect(started.prompt).toContain('本轮已读取的网页正文');
  expect(started.history).toEqual([]);
  expect(started.tools).toContainEqual(
    expect.objectContaining({ name: 'web_fetch', effects: ['read', 'network'] }),
  );
  (service as any).emit(first.runId, 'run.completed', {});
  request.mockClear();
  await service.start({
    ...turn,
    turnId: 'web-turn-2',
    idempotencyKey: 'web-key-2',
    apiInput: turn.apiInput!.replace('本轮已读取的网页正文', '页面更新后的正文'),
  });
  const resumed = request.mock.calls.find(([method]) => method === 'start')![1] as any;
  expect(resumed.resume).toBe(true);
  expect(resumed.prompt).toContain('页面更新后的正文');
  expect(resumed.history).toEqual([]);
});

it('keeps legacy inputs working and leaves web fetching out of ordinary chat catalogs', async () => {
  await service.start({ ...turn, apiInput: undefined, webBrowsing: undefined });
  const started = request.mock.calls.find(([method]) => method === 'start')![1] as any;
  expect(started.prompt).toBe(turn.displayInput);
  expect(started.tools.some((tool: any) => tool.name === 'web_fetch')).toBe(false);
});
