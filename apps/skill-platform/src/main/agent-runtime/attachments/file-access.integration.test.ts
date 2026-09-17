import type { RunEvent, RuntimeTurnInput } from '@momo/agent-contracts';
import { strToU8, zipSync } from 'fflate';
import { createHash, randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { ChatApplicationService } from '../application/service';
import { testStore } from '../persistence/test-store';

const mocks = vi.hoisted(() => ({ root: '', parse: vi.fn() }));
vi.mock('../../runtime-paths', () => ({
  getNotesDir: () => mocks.root,
  getToolsDir: () => path.join(mocks.root, 'tools'),
}));
vi.mock('../../services/knowledge-v2/worker-client', () => ({
  knowledgeWorkerClient: { call: mocks.parse },
}));
vi.mock('../../services/agent-app', () => ({
  listAgentAppSlash: async () => ({ items: [] }),
  prepareAgentAppSubmit: async (input: any) => ({
    action: 'allow',
    content: input.content,
    invocations: [],
  }),
  resolveAgentAppContext: async () => null,
}));
vi.mock('../../services/mcp/hub', () => ({ getMcpHub: () => ({ listTools: () => [] }) }));

const docxMime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
function docx() {
  return Buffer.from(
    zipSync({
      '[Content_Types].xml': strToU8(
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/></Types>',
      ),
      'word/document.xml': strToU8(
        '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>项目概述：体育健身中心施工。评分标准：技术60分，报价40分。</w:t></w:r></w:p></w:body></w:document>',
      ),
    }),
  );
}

describe('real Harness access to uploaded originals', () => {
  it.each([
    { hasWorkspace: true, mode: 'normal' },
    { hasWorkspace: false, mode: 'normal' },
    { hasWorkspace: true, mode: 'timeout' },
    { hasWorkspace: false, mode: 'output-limit' },
    { hasWorkspace: false, mode: 'cancel' },
    { hasWorkspace: true, mode: 'full-access' },
    { hasWorkspace: true, mode: 'upgrade' },
    { hasWorkspace: true, mode: 'max-tokens' },
    { hasWorkspace: false, mode: 'persistent-limit' },
    { hasWorkspace: false, mode: 'provider-error' },
  ])(
    'accesses external DOCX on demand %j',
    async ({ hasWorkspace, mode }) => {
      const root = path.resolve('../../temp/harness-file-access-' + randomUUID());
      const bundle = path.resolve('../../packages/momo-harness-runner/dist');
      mocks.root = root;
      mocks.parse.mockReset().mockRejectedValue(new Error('Host must not parse uploads'));
      await fs.mkdir(path.join(root, 'workspace'), { recursive: true });
      await fs.mkdir(path.join(root, 'external'), { recursive: true });
      const original = path.join(root, 'external', '体育健身中心施工招标文件.docx');
      const bytes = docx();
      await fs.writeFile(original, bytes);
      const folderPaths = hasWorkspace ? [await fs.realpath(path.join(root, 'workspace'))] : [];
      const requests: any[] = [],
        readPaths: string[] = [];
      let expectedThinking = false,
        expectedMaxTokens = 2048,
        truncatedOnce = false;
      const server = createServer(async (req, res) => {
        try {
          let body = '';
          for await (const part of req) body += part;
          const input = JSON.parse(body);
          requests.push(input);
          if (input.enable_thinking !== expectedThinking)
            throw Error('Qwen thinking setting was not applied');
          if ((input.max_tokens ?? input.max_completion_tokens) !== expectedMaxTokens)
            throw Error('Output cap was not applied');
          if (
            !input.messages.some(
              (m: any) =>
                m.role === 'system' &&
                String(m.content).includes('思考过程') &&
                String(m.content).includes('简体中文'),
            )
          )
            throw Error('Chinese output policy missing');
          if (mode === 'provider-error') {
            res.writeHead(401, { 'content-type': 'application/json' });
            res.end(
              JSON.stringify({
                error: {
                  message: 'Incorrect API key provided',
                  type: 'invalid_request_error',
                  code: 'invalid_api_key',
                },
              }),
            );
            return;
          }
          const texts = input.messages
            .filter((m: any) => m.role === 'user')
            .map((m: any) =>
              typeof m.content === 'string'
                ? m.content
                : m.content.map((c: any) => c.text ?? '').join(''),
            )
            .join('\n');
          const handle = texts.match(/verbatim read-only copy saved at ("(?:[^"\\]|\\.)*")/);
          if (!handle) throw Error('Readable native file handle missing: ' + texts);
          const filePath = JSON.parse(handle[1]);
          readPaths.push(filePath);
          res.writeHead(200, { 'content-type': 'text/event-stream' });
          const chunk = (delta: any, finish_reason: string | null = null) =>
            res.write(
              'data: ' +
                JSON.stringify({
                  id: 'file-test',
                  object: 'chat.completion.chunk',
                  model: input.model,
                  choices: [{ index: 0, delta, finish_reason }],
                }) +
                '\n\n',
            );
          const last = input.messages.at(-1);
          const continuing =
            last.role === 'user' && JSON.stringify(last.content).includes('上一段模型输出');
          if (continuing) {
            if (mode === 'persistent-limit') {
              chunk({ role: 'assistant', reasoning_content: '继续用中文分析，但输出仍达到上限。' });
              chunk({}, 'length');
            } else {
              chunk({
                role: 'assistant',
                content: '项目概述：体育健身中心施工。评分标准：技术60分，报价40分。',
              });
              chunk({}, 'stop');
            }
          } else if (last.role !== 'tool') {
            // This is model-authored, on-demand reading; admission only stored the original bytes.
            let code =
              'import zipfile, xml.etree.ElementTree as ET\nwith zipfile.ZipFile(' +
              JSON.stringify(filePath) +
              ') as z:\n    root = ET.fromstring(z.read("word/document.xml"))\n';
            if (mode === 'output-limit') code += 'print("x" * 70000)\n';
            code += 'print("".join(root.itertext()), flush=True)';
            if (mode === 'timeout') code += '\nimport time; time.sleep(60)';
            if (mode === 'cancel')
              code +=
                '\nimport os, time\nopen(' +
                JSON.stringify(path.join(root, 'execution-pid')) +
                ', "w").write(str(os.getpid()))\ntime.sleep(60)';
            chunk({
              role: 'assistant',
              tool_calls: [
                {
                  index: 0,
                  id: 'read-' + randomUUID(),
                  type: 'function',
                  function: {
                    name: 'execution_run',
                    arguments: JSON.stringify({
                      runtime: 'python',
                      code,
                      timeoutMs: mode === 'timeout' ? 1500 : 10000,
                    }),
                  },
                },
              ],
            });
            chunk({}, 'tool_calls');
          } else {
            const result = JSON.parse(last.content);
            if (
              (mode !== 'timeout' && result.exitCode !== 0) ||
              !result.stdout.includes('技术60分')
            )
              throw Error('Original DOCX was not read: ' + last.content);
            if (mode === 'timeout' && !result.timedOut) throw Error('Timeout was not enforced');
            if (
              mode === 'output-limit' &&
              (!result.truncated || Buffer.byteLength(result.stdout) > 64000)
            )
              throw Error('Output was not bounded');
            if ((mode === 'max-tokens' && !truncatedOnce) || mode === 'persistent-limit') {
              truncatedOnce = true;
              chunk({
                role: 'assistant',
                reasoning_content: '已读取原件，正在整理项目概述和评分标准。',
              });
              chunk({}, 'length');
            } else {
              if (expectedThinking)
                chunk({
                  role: 'assistant',
                  reasoning_content: '已复用上传原件的读取结果，现用中文回答。',
                });
              chunk({ role: 'assistant', content: result.stdout });
              chunk({}, 'stop');
            }
          }
          res.end('data: [DONE]\n\n');
        } catch (error) {
          if (!res.headersSent) res.writeHead(500);
          res.end(String(error));
        }
      });
      await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
      const store = testStore();
      store.db.exec('CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)');
      const model = {
        id: 'qwen-profile',
        type: 'chat',
        apiProtocol: 'openai',
        apiUrl: `http://127.0.0.1:${(server.address() as any).port}/v1`,
        apiKey: 'local-file-contract-only',
        model: 'qwen-file-test',
        chatParams: { maxTokens: 2048, enableThinking: false },
      };
      store.db
        .prepare('INSERT INTO settings VALUES (?,?)')
        .run('aiModels', JSON.stringify([model]));
      store.set('project:project', JSON.stringify({ folderPaths }));
      const manifest = JSON.parse(await fs.readFile(path.join(bundle, 'runtime.json'), 'utf8'));
      const service = new ChatApplicationService(
        store,
        { get: async () => ({ root: bundle, manifest }) } as any,
        root,
      );
      const frames: RunEvent[] = [];
      let settle: ((frame: RunEvent) => void) | undefined;
      service.onEvent = (frame) => {
        frames.push(frame);
        if (frame.type === 'interaction.requested') {
          if (mode === 'upgrade') void service.setPermission('chat', 'danger-full-access');
          else
            void service.respond({
              runId: frame.runId,
              requestId: frame.payload.requestId as string,
              decision: 'allowed-once',
            });
        }
        if (['run.completed', 'run.failed', 'run.cancelled'].includes(frame.type)) settle?.(frame);
      };
      try {
        const ref = await service.sources.save({
          name: path.basename(original),
          mimeType: docxMime,
          encoding: 'base64',
          content: bytes.toString('base64'),
          originalAvailable: true,
        });
        const send = async (sourceRefs: RuntimeTurnInput['sourceRefs']) => {
          const turnId = randomUUID();
          let timer: ReturnType<typeof setTimeout>;
          const terminal = new Promise<RunEvent>((resolve, reject) => {
            settle = resolve;
            timer = setTimeout(() => reject(Error('File access turn timeout')), 20000);
          });
          void terminal.catch(() => {});
          try {
            const result = await service.start({
              sessionId: 'chat',
              projectId: 'project',
              turnId,
              idempotencyKey: turnId,
              modelProfileId: model.id,
              agentId: 'momo-default',
              modeId: 'ask',
              rawIntent: '请提取项目概述和评分标准',
              displayInput: '请提取项目概述和评分标准',
              invocations: [],
              folderPaths,
              sourceRefs,
              permissionMode: mode === 'full-access' ? 'danger-full-access' : 'workspace-write',
            });
            if (mode === 'cancel') {
              for (let i = 0; i < 100; i++) {
                if (
                  await fs.stat(path.join(root, 'execution-pid')).then(
                    () => true,
                    () => false,
                  )
                )
                  break;
                await new Promise((resolve) => setTimeout(resolve, 50));
              }
              expect(await fs.readFile(path.join(root, 'execution-pid'), 'utf8')).toMatch(/^\d+$/);
              await service.cancel(result.runId);
            }
            const end = await terminal;
            expect(end.type).toBe(
              mode === 'cancel'
                ? 'run.cancelled'
                : ['persistent-limit', 'provider-error'].includes(mode)
                  ? 'run.failed'
                  : 'run.completed',
            );
            if (mode === 'persistent-limit')
              expect(end.payload).toMatchObject({
                stopReason: 'max-tokens',
                message: expect.stringContaining('最大 Token 数'),
              });
            if (mode === 'provider-error')
              expect(end.payload).toMatchObject({
                stopReason: 'error',
                errorCode: 'AUTH',
                message: expect.stringContaining('认证失败'),
              });
            return result;
          } finally {
            clearTimeout(timer!);
            settle = undefined;
          }
        };
        await send([ref]);
        const initialContext = frames.filter((f) => f.type === 'context.updated');
        expect(initialContext.length).toBeGreaterThan(0);
        for (const frame of initialContext) {
          expect(frame.payload).toMatchObject({
            maxOutputTokens: 2048,
            modelProfileId: model.id,
            contextWindowSource: 'unknown',
          });
          expect(frame.payload.contextWindow).toBeUndefined();
        }
        if (!['cancel', 'persistent-limit', 'provider-error'].includes(mode)) {
          if (mode === 'normal') {
            expectedThinking = true;
            expectedMaxTokens = 4096;
            model.chatParams = { maxTokens: expectedMaxTokens, enableThinking: expectedThinking };
            store.db
              .prepare('UPDATE settings SET value=? WHERE key=?')
              .run(JSON.stringify([model]), 'aiModels');
          }
          // Simulate a conversation created before the readable attachment index existed.
          store.db.prepare('DELETE FROM agent_kv WHERE key=?').run('uploaded-files:chat');
          await send([]);
        }
        if (mode === 'provider-error') {
          expect(frames.filter((f) => f.type === 'tool.started')).toHaveLength(0);
          expect(requests).toHaveLength(1);
          return;
        }
        expect(readPaths.length).toBeGreaterThanOrEqual(
          ['cancel', 'persistent-limit'].includes(mode) ? 1 : 4,
        );
        expect(new Set(readPaths).size).toBe(1);
        const cachePath = readPaths[0];
        expect(cachePath).not.toBe(original);
        expect(path.relative(path.join(root, 'workspace'), cachePath).startsWith('..')).toBe(true);
        expect((await fs.readFile(cachePath)).equals(bytes)).toBe(true);
        expect(
          createHash('sha256')
            .update(await fs.readFile(original))
            .digest('hex'),
        ).toBe(createHash('sha256').update(bytes).digest('hex'));
        expect(await fs.readdir(path.join(root, 'workspace'))).toEqual([]);
        expect(mocks.parse).not.toHaveBeenCalled();
        if (!['cancel', 'persistent-limit'].includes(mode)) {
          expect(
            frames
              .filter((frame) => frame.type === 'assistant.commit')
              .some((frame) => String(frame.payload.content).includes('报价40分')),
          ).toBe(true);
          expect(
            frames.filter(
              (frame) =>
                frame.type === 'tool.completed' && frame.payload.toolId === 'execution.run',
            ),
          ).toHaveLength(2);
        }
        if (mode === 'full-access')
          expect(frames.filter((f) => f.type === 'interaction.requested')).toHaveLength(0);
        if (mode === 'upgrade') {
          expect(frames.filter((f) => f.type === 'interaction.requested')).toHaveLength(1);
          expect(
            frames.find((f) => f.type === 'interaction.resolved')?.payload.permissionMode,
          ).toBe('danger-full-access');
        }
        if (mode === 'max-tokens') {
          expect(frames.filter((f) => f.type === 'agent.status')).toHaveLength(1);
          expect(frames.filter((f) => f.type === 'run.failed')).toHaveLength(0);
        }
        if (mode === 'persistent-limit') {
          expect(frames.filter((f) => f.type === 'agent.status')).toHaveLength(2);
          expect(frames.filter((f) => f.type === 'tool.completed')).toHaveLength(1);
        }
        if (mode === 'normal')
          expect(
            frames.filter((f) => f.type === 'context.updated').at(-1)?.payload.maxOutputTokens,
          ).toBe(4096);
        if (mode === 'normal')
          expect(
            frames.some(
              (f) => f.type === 'thinking.delta' && String(f.payload.text).includes('中文'),
            ),
          ).toBe(true);
        expect((await service.sources.load([ref]))[0].derivedText).toBe('');
        await fs.writeFile(
          path.join(root, 'file-access-report.json'),
          JSON.stringify(
            {
              hasWorkspace,
              mode,
              cachePath,
              requests: requests.length,
              hostParsed: false,
              originalUnchanged: true,
            },
            null,
            2,
          ),
        );
      } finally {
        await service.dispose();
        if (mode === 'cancel') {
          const pid = Number(await fs.readFile(path.join(root, 'execution-pid'), 'utf8'));
          expect(() => process.kill(pid, 0)).toThrow();
        }
        store.db.close();
        server.closeAllConnections();
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    },
    60000,
  );
});
