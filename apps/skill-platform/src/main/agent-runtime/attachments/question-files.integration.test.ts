import type { RunEvent, RuntimeTurnInput } from '@momo/agent-contracts';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { expect, it, vi } from 'vitest';
import { ChatApplicationService } from '../application/service';
import { testStore } from '../persistence/test-store';

vi.mock('../../runtime-paths', () => ({
  getNotesDir: () => 'unused',
  getSkillSessionWorkspaceDir: (id: string) => process.cwd() + '/../../temp/runtime-tests/' + id,
}));
vi.mock('../../services/knowledge-v2/worker-client', () => ({ knowledgeWorkerClient: {} }));
vi.mock('../../services/mcp/hub', () => ({ getMcpHub: () => ({ listTools: () => [] }) }));
vi.mock('../../services/agent-app', () => ({
  listAgentAppSlash: async () => ({ items: [] }),
  prepareAgentAppSubmit: async (input: any) => ({
    action: 'allow',
    content: input.content,
    invocations: [],
  }),
  resolveAgentAppContext: async () => null,
}));

it('continues a native question with the first original upload, upgrades permission mid-approval and reuses the file next turn', async () => {
  const root = path.resolve('../../temp/question-files-' + randomUUID());
  const workspace = path.join(root, 'workspace');
  await fs.mkdir(workspace, { recursive: true });
  const original = path.join(root, 'outside-workspace.txt');
  const content = '原文件：技术60分，报价40分。';
  await fs.writeFile(original, content);
  let calls = 0;
  let serverError: unknown;
  const server = createServer(async (req, res) => {
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const input = JSON.parse(Buffer.concat(chunks).toString());
      calls++;
      const last = input.messages.at(-1);
      res.writeHead(200, { 'content-type': 'text/event-stream' });
      const emit = (delta: any, finish_reason: string | null = null) =>
        res.write(
          'data: ' +
            JSON.stringify({
              id: 'question-file',
              object: 'chat.completion.chunk',
              model: input.model,
              choices: [{ index: 0, delta, finish_reason }],
            }) +
            '\n\n',
        );
      const tool = (name: string, args: unknown) => {
        emit({
          role: 'assistant',
          tool_calls: [
            {
              index: 0,
              id: 'call-' + randomUUID(),
              type: 'function',
              function: { name, arguments: JSON.stringify(args) },
            },
          ],
        });
        emit({}, 'tool_calls');
      };
      if (calls === 1) {
        tool('ask_user_question', {
          questions: [
            { id: 'original', header: '[file] 原文件', question: '请选择本次处理的原文件' },
          ],
        });
      } else if (last.role !== 'tool' || calls === 2) {
        if (calls === 2) expect(last.content).toContain('用户已选择原文件');
        tool('attachments_list', {});
      } else {
        const result = JSON.parse(last.content);
        if (result.files) {
          expect(result.files).toHaveLength(1);
          expect(result.files[0].name).toBe('outside-workspace.txt');
          expect(await fs.readFile(result.files[0].path, 'utf8')).toBe(content);
          tool('execution_run', {
            runtime: 'node',
            code:
              'console.log(require("node:fs").readFileSync(' +
              JSON.stringify(result.files[0].path) +
              ', "utf8"))',
          });
        } else {
          expect(result.exitCode).toBe(0);
          expect(result.stdout).toContain(content);
          emit({ role: 'assistant', content: result.stdout });
          emit({}, 'stop');
        }
      }
      res.end('data: [DONE]\n\n');
    } catch (error) {
      serverError = error;
      if (!res.headersSent) res.writeHead(500);
      res.end(String(error));
    }
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const store = testStore();
  store.db.exec('CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)');
  const model = {
    id: 'model',
    type: 'chat',
    apiProtocol: 'openai',
    apiUrl: `http://127.0.0.1:${(server.address() as any).port}/v1`,
    apiKey: 'local-test',
    model: 'question-files',
  };
  store.db.prepare('INSERT INTO settings VALUES (?,?)').run('aiModels', JSON.stringify([model]));
  const folderPaths = [await fs.realpath(workspace)];
  store.set('project:p', JSON.stringify({ folderPaths }));
  const bundle = path.resolve(
    process.env.MOMO_TEST_HARNESS_BUNDLE || '../../packages/momo-harness-runner/dist',
  );
  const manifest = JSON.parse(await fs.readFile(path.join(bundle, 'runtime.json'), 'utf8'));
  const service = new ChatApplicationService(
    store,
    { get: async () => ({ root: bundle, manifest }) } as any,
    root,
  );
  const ref = await service.sources.save({
    name: path.basename(original),
    mimeType: 'text/plain',
    encoding: 'base64',
    content: (await fs.readFile(original)).toString('base64'),
  });
  const frames: RunEvent[] = [];
  let resolveTurn: (frame: RunEvent) => void;
  let rejectTurn: (error: unknown) => void;
  service.onEvent = (frame) => {
    frames.push(frame);
    if (frame.type === 'interaction.requested') {
      const operation =
        frame.payload.kind === 'question'
          ? service.respond({
              runId: frame.runId,
              requestId: String(frame.payload.requestId),
              answers: [{ id: 'original', selected: [], sourceRefs: [ref] }],
            })
          : service.setPermission('chat', 'danger-full-access');
      void operation.catch((error) => rejectTurn(error));
    }
    if (['run.completed', 'run.failed', 'run.cancelled'].includes(frame.type)) resolveTurn(frame);
  };
  try {
    for (let turn = 0; turn < 2; turn++) {
      const terminal = new Promise<RunEvent>((resolve, reject) => {
        resolveTurn = resolve;
        rejectTurn = reject;
      });
      void terminal.catch(() => {});
      const timer = setTimeout(
        () => rejectTurn(new Error('Question upload turn timed out')),
        45_000,
      );
      try {
        const input: RuntimeTurnInput = {
          sessionId: 'chat',
          projectId: 'p',
          turnId: 'turn-' + turn,
          idempotencyKey: 'turn-' + turn,
          modelProfileId: 'model',
          agentId: 'momo-default',
          modeId: 'ask',
          rawIntent: '继续读取文件',
          displayInput: '继续读取文件',
          sourceRefs: [],
          invocations: [],
          folderPaths,
          permissionMode: 'workspace-write',
        };
        await service.start(input);
        expect((await terminal).type).toBe('run.completed');
      } finally {
        clearTimeout(timer);
      }
    }
    expect(serverError).toBeUndefined();
    expect(
      frames.filter(
        (frame) => frame.type === 'interaction.requested' && frame.payload.kind === 'question',
      ),
    ).toHaveLength(1);
    expect(
      frames.filter(
        (frame) => frame.type === 'interaction.requested' && frame.payload.kind === 'approval',
      ),
    ).toHaveLength(1);
    expect(frames.filter((frame) => frame.type === 'interaction.resolved')).toHaveLength(2);
    expect(store.get('permission:chat')).toBe('danger-full-access');
    expect(await fs.readFile(original, 'utf8')).toBe(content);
  } finally {
    await service.dispose();
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    store.db.close();
  }
}, 120_000);
