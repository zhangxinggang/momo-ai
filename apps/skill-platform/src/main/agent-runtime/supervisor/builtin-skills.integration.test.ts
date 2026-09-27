import { HarnessProcess } from '@momo/harness-adapter';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import { createServer } from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { expect, it } from 'vitest';

it('uses edited host policies for persona, plan, language, continuation and resumed turns', async () => {
  const bundle = path.resolve(
    process.env.MOMO_TEST_HARNESS_BUNDLE || '../../packages/momo-harness-runner/dist',
  );
  const home = await fs.mkdtemp(path.join(os.tmpdir(), 'aim-builtin-harness-'));
  const requests: any[] = [];
  const server = createServer(async (request, response) => {
    let body = '';
    for await (const chunk of request) body += chunk;
    requests.push(JSON.parse(body));
    response.writeHead(200, { 'content-type': 'text/event-stream' });
    const frame = (delta: any, finish_reason: string | null = null) =>
      response.write(
        'data: ' +
          JSON.stringify({
            id: 'policy-test',
            object: 'chat.completion.chunk',
            model: 'mock',
            choices: [{ index: 0, delta, finish_reason }],
          }) +
          '\n\n',
      );
    frame({ role: 'assistant', content: '策略测试' });
    frame({}, requests.length === 1 ? 'length' : 'stop');
    response.end('data: [DONE]\n\n');
  });
  let runtime: HarnessProcess | undefined;
  try {
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const profile = path.join(home, 'profiles/momo');
    await fs.mkdir(profile, { recursive: true });
    await fs.cp(path.join(bundle, 'profile'), profile, { recursive: true });
    const patch = path.join(profile, 'cordis.patch.yml');
    await fs.writeFile(
      patch,
      (await fs.readFile(patch, 'utf8'))
        .replace(
          "'__MOMO_BRIDGE_PLUGIN__'",
          JSON.stringify(path.join(bundle, 'plugins/momo-host-bridge/index.mjs')),
        )
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
          DSH_HOME: home,
          MOMO_SESSION_ROOT: path.join(home, 'sessions'),
          MOMO_BUNDLE_ID: 'builtin-policy-test',
          MOMO_CORE_VERSION: '0.2.1-alpha.1',
        },
      },
    );
    await runtime.describe();
    const sessionId = randomUUID();
    const port = (server.address() as { port: number }).port;
    const turn = async (resume: boolean, language: string) => {
      const runId = randomUUID();
      let cleanup: () => void;
      const terminal = new Promise<any>((resolve, reject) => {
        const timer = setTimeout(() => {
          cleanup();
          reject(new Error('Builtin policy turn timed out'));
        }, 20000);
        const listener = (event: any) => {
          if (event.runId === runId && ['run.completed', 'run.failed'].includes(event.type)) {
            cleanup();
            resolve(event);
          }
        };
        cleanup = () => {
          clearTimeout(timer);
          runtime!.off('event', listener);
        };
        runtime!.on('event', listener);
      });
      void terminal.catch(() => {});
      try {
        await runtime!.request('start', {
          runId,
          sessionId,
          agentId: 'momo-default',
          modeId: resume ? 'ask' : 'plan',
          model: {
            apiProtocol: 'openai',
            apiUrl: `http://127.0.0.1:${port}/v1`,
            apiKey: 'local-test-only',
            model: 'mock',
          },
          cwd: home,
          prompt: '测试本轮规则',
          instructions: '',
          tools: [],
          attachments: [],
          resume,
          hasNativeHistory: resume,
          builtinPolicies: {
            runtimeLanguage: language,
            runtimeAssistant: 'EDITED_PERSONA',
            runtimePlan: 'EDITED_PLAN',
            runtimeContinue: 'EDITED_CONTINUE',
          },
        });
        expect((await terminal).type).toBe('run.completed');
      } finally {
        cleanup!();
      }
    };
    await turn(false, 'EDITED_LANGUAGE');
    const firstSystem = requests[0].messages
      .filter((message: any) => message.role === 'system')
      .map((message: any) => message.content)
      .join('\n');
    for (const marker of ['EDITED_PERSONA', 'EDITED_PLAN', 'EDITED_LANGUAGE'])
      expect(firstSystem).toContain(marker);
    expect(JSON.stringify(requests[1].messages)).toContain('EDITED_CONTINUE');
    await turn(true, 'UPDATED_LANGUAGE');
    const resumedSystem = requests
      .at(-1)
      .messages.filter((message: any) => message.role === 'system')
      .map((message: any) => message.content)
      .join('\n');
    expect(resumedSystem).toContain('UPDATED_LANGUAGE');
    expect(resumedSystem).not.toContain('EDITED_LANGUAGE');
    expect(resumedSystem).not.toContain('EDITED_PLAN');
  } finally {
    await runtime?.dispose();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await fs.rm(home, { recursive: true, force: true });
  }
}, 60000);
