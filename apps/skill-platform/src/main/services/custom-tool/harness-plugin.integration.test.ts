import { HarnessProcess } from '@momo/harness-adapter';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import { createServer } from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { expect, it } from 'vitest';
import type { HostTool } from '../../agent-runtime/tools/broker';
import { CustomToolWorkspaceService } from './workspace';

it('mounts, updates and removes Cordis AI plugins during a live native Harness conversation', async () => {
  const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'momo-harness-plugin-'));
  const bundle = path.resolve('../../packages/momo-harness-runner/dist');
  const workspace = new CustomToolWorkspaceService(path.join(temporary, 'tools'));
  const created = workspace.createTool(null, '求和', { kind: 'plugin', identifier: 'custom-sum' });
  const plugin = {
    identifier: 'custom-sum',
    description: '初版求和',
    inputSchema: {
      type: 'object',
      properties: { a: { type: 'number' }, b: { type: 'number' } },
      required: ['a', 'b'],
      additionalProperties: false,
    },
    outputSchema: { type: 'number' },
    tests: [{ name: '加法', input: { a: 2, b: 3 }, expected: 5 }],
  };
  const content = 'function execute(input) { return input.a + input.b; }';
  await workspace.savePlugin(created.id, { kind: 'plugin', content, plugin, components: {} });
  let catalog = workspace.pluginTools();
  let runtime: HarnessProcess | undefined;
  let requestCount = 0;
  const observed: any[] = [];
  const hostResults: unknown[] = [];
  const descriptors = (tools: HostTool[]) => tools.map(({ execute, ...tool }) => tool);
  let startGate!: () => void;
  const started = new Promise<void>((resolve) => {
    startGate = resolve;
  });
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const server = createServer(async (req, res) => {
    try {
      let body = '';
      for await (const chunk of req) body += chunk;
      const request = JSON.parse(body);
      observed.push(request);
      const step = requestCount++;
      if (step === 0) {
        startGate();
        await gate;
      }
      res.writeHead(200, { 'content-type': 'text/event-stream' });
      const send = (delta: unknown, finish_reason: string | null = null) =>
        res.write(
          'data: ' +
            JSON.stringify({
              id: 'plugin-probe',
              object: 'chat.completion.chunk',
              model: request.model,
              choices: [{ index: 0, delta, finish_reason }],
            }) +
            '\n\n',
        );
      if (step < 2) {
        send({
          role: 'assistant',
          tool_calls: [
            {
              index: 0,
              id: 'call-' + step,
              type: 'function',
              function: { name: 'custom-sum', arguments: JSON.stringify({ a: 2, b: 3 }) },
            },
          ],
        });
        send({}, 'tool_calls');
      } else {
        send({ role: 'assistant', content: '已验证' });
        send({}, 'stop');
      }
      res.end('data: [DONE]\n\n');
    } catch (error) {
      res.destroy(error as Error);
    }
  });
  try {
    await fs.symlink(
      path.join(bundle, 'node_modules'),
      path.join(temporary, 'node_modules'),
      process.platform === 'win32' ? 'junction' : 'dir',
    );
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const profile = path.join(temporary, 'profiles/momo');
    const bridge = path.join(temporary, 'bridge');
    await fs.cp(
      path.resolve('../../packages/momo-harness-runner/plugins/momo-host-bridge'),
      bridge,
      { recursive: true },
    );
    await fs.copyFile(
      path.join(bundle, 'plugins/momo-host-bridge/builtin-policies.json'),
      path.join(bridge, 'builtin-policies.json'),
    );
    await fs.mkdir(profile, { recursive: true });
    await fs.cp(path.join(bundle, 'profile'), profile, { recursive: true });
    const patch = path.join(profile, 'cordis.patch.yml');
    await fs.writeFile(
      patch,
      (await fs.readFile(patch, 'utf8'))
        .replace("'__MOMO_BRIDGE_PLUGIN__'", JSON.stringify(path.join(bridge, 'index.mjs')))
        .replace(
          "'__MOMO_CREDENTIAL_PLUGIN__'",
          JSON.stringify(path.join(bundle, 'plugins/momo-model-credentials/index.mjs')),
        ),
    );
    runtime = new HarnessProcess(
      path.join(bundle, process.platform === 'win32' ? 'node.exe' : 'node'),
      path.join(bundle, 'node_modules/@deepseek-ai/dsh/lib/bin.js'),
      {
        cwd: bundle,
        env: {
          DSH_HOME: temporary,
          MOMO_SESSION_ROOT: path.join(temporary, 'sessions'),
          MOMO_BUNDLE_ID: 'custom-plugin-test',
          MOMO_CORE_VERSION: '0.2.1-alpha.1',
        },
      },
    );
    runtime.hostRequest = async (method, params) => {
      const tool = catalog.find((tool) => tool.name === params.name);
      if (method === 'host.authorize') return { allowed: Boolean(tool) };
      if (!tool) throw Error('Tool removed');
      const result = await tool.execute(params.args, {
        signal: new AbortController().signal,
      } as any);
      hostResults.push(result);
      if (hostResults.length === 1) {
        await workspace.savePlugin(created.id, {
          kind: 'plugin',
          content: 'function execute(input) { return (input.a + input.b) * 2; }',
          plugin: {
            ...plugin,
            description: '更新为两倍之和',
            tests: [{ name: '两倍', input: { a: 2, b: 3 }, expected: 10 }],
          },
          components: {},
        });
        catalog = workspace.pluginTools();
      } else {
        workspace.deleteNode(created.id);
        catalog = [];
      }
      await runtime!.request('updateCustomTools', { tools: descriptors(catalog) });
      return result;
    };
    const end = new Promise<any>((resolve, reject) => {
      const timer = setTimeout(() => reject(Error('Harness plugin test timed out')), 25000);
      runtime!.on('event', (event) => {
        if (['run.completed', 'run.failed'].includes(event.type)) {
          clearTimeout(timer);
          resolve(event);
        }
      });
    });
    void end.catch(() => {});
    const runId = randomUUID();
    await runtime.request('start', {
      runId,
      sessionId: randomUUID(),
      agentId: 'momo-default',
      modeId: 'ask',
      model: {
        apiProtocol: 'openai',
        apiUrl: `http://127.0.0.1:${(server.address() as any).port}/v1`,
        apiKey: 'local-test',
        model: 'plugin-test',
      },
      cwd: temporary,
      prompt: '验证插件',
      tools: [],
      attachments: [],
    });
    await Promise.race([
      started,
      end.then((event) => {
        throw Error('Harness ended before requesting model: ' + JSON.stringify(event));
      }),
    ]);
    // Add after the first model request: registration must take effect without a new turn.
    await runtime.request('updateCustomTools', { tools: descriptors(catalog) });
    release();
    expect((await end).type).toBe('run.completed');
    expect(hostResults).toEqual([5, 10]);
    expect(observed[0].tools?.some((t: any) => t.function?.name === 'custom-sum')).toBeFalsy();
    expect(
      observed[1].tools.find((t: any) => t.function?.name === 'custom-sum').function.description,
    ).toContain('两倍');
    expect(observed[2].tools?.some((t: any) => t.function?.name === 'custom-sum')).toBeFalsy();
  } finally {
    release?.();
    await runtime?.dispose();
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await fs.rm(temporary, { recursive: true, force: true });
  }
}, 60000);
