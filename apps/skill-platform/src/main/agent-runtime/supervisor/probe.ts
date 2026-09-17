import type { HarnessProcess } from '@momo/harness-adapter';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { deflateSync } from 'node:zlib';
/** Keyless contract verification through the actual CLI, adapter and durable agent loop. */
export async function probeRuntime(factory: () => Promise<HarnessProcess>) {
  const requests: any[] = [],
    frames: any[] = [],
    waiting = new Map<
      string,
      {
        resolve: (frame: any) => void;
        reject: (e: Error) => void;
        timer: ReturnType<typeof setTimeout>;
      }
    >();
  let runtime: HarnessProcess | undefined,
    pauseGoalOnce = true;
  const runSessions = new Map<string, string>();
  const server = createServer(async (req, res) => {
    try {
      let data = '';
      for await (const chunk of req) {
        data += chunk;
        if (data.length > 4_000_000) throw new Error('PROBE_INPUT_TOO_LARGE');
      }
      const input = JSON.parse(data);
      requests.push(input);
      const lastUser = [...input.messages].reverse().find((m: any) => m.role === 'user');
      const text = JSON.stringify(lastUser?.content);
      const toolAnswered = input.messages[input.messages.length - 1]?.role === 'tool';
      res.writeHead(200, { 'content-type': 'text/event-stream' });
      const chunk = (delta: any, finish_reason: string | null = null) =>
        res.write(
          'data: ' +
            JSON.stringify({
              id: 'chatcmpl-momo-probe',
              object: 'chat.completion.chunk',
              model: input.model,
              choices: [{ index: 0, delta, finish_reason }],
            }) +
            '\n\n',
        );
      const tool = (name: string, args: any) => {
        chunk({
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
        chunk({}, 'tool_calls');
      };
      const goalReply = [...input.messages]
        .reverse()
        .find((m: any) => m.role === 'tool' && String(m.content).includes('\"goal\"'));
      const currentGoal = goalReply ? JSON.parse(goalReply.content).goal : undefined;
      if (text.includes('PROBE_GOAL_PAUSE') && pauseGoalOnce) {
        pauseGoalOnce = false;
        chunk({ role: 'assistant', content: 'Pausing goal' });
        const timer = setTimeout(() => {
          chunk({ content: 'late goal output' });
          chunk({}, 'stop');
          res.end('data: [DONE]\n\n');
        }, 10000);
        res.on('close', () => clearTimeout(timer));
        return;
      } else if (text.includes('PROBE_GOAL') && !toolAnswered) tool('get_goal', {});
      else if (text.includes('PROBE_GOAL') && currentGoal?.phase === 'active')
        tool('update_goal', {
          action: 'complete',
          goal_id: currentGoal.id,
          revision: currentGoal.revision,
        });
      else if (text.includes('PROBE_TOOL') && !toolAnswered) tool('momo_probe_sum', { a: 2, b: 3 });
      else if (text.includes('PROBE_QUESTION') && !toolAnswered)
        tool('ask_user_question', {
          questions: [
            { id: 'choice', question: 'Choose', options: [{ label: 'OK' }, { label: 'No' }] },
          ],
        });
      else if (text.includes('PROBE_PLAN') && !toolAnswered)
        tool('exit_plan_mode', { plan: '# Probe plan\nRead the approved project only.' });
      else {
        if (text.includes('PROBE_TEXT'))
          chunk({ role: 'assistant', reasoning_content: 'Probe reasoning.' });
        chunk({ role: 'assistant', content: 'Harness ' });
        if (text.includes('PROBE_CANCEL')) {
          const timer = setTimeout(() => {
            chunk({ content: 'late output' });
            chunk({}, 'stop');
            res.end('data: [DONE]\n\n');
          }, 10000);
          res.on('close', () => clearTimeout(timer));
          return;
        }
        chunk({ content: text.includes('PROBE_TOOL') ? 'sum=5' : 'probe passed' });
        chunk({}, 'stop');
      }
      res.end('data: [DONE]\n\n');
    } catch {
      if (!res.headersSent) res.writeHead(500);
      res.end();
    }
  });
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const port = (server.address() as any).port;
  const model = {
    apiProtocol: 'openai',
    apiUrl: `http://127.0.0.1:${port}/v1`,
    apiKey: 'local-probe-only',
    model: 'momo-probe-model',
  };
  const tool = {
    id: 'probe.sum',
    name: 'momo_probe_sum',
    title: 'sum',
    description: 'Add two numbers',
    revision: 'probe',
    inputSchema: {
      type: 'object',
      properties: { a: { type: 'number', minimum: 0 }, b: { type: 'number', maximum: 10 } },
      required: ['a', 'b'],
      additionalProperties: false,
    },
    outputSchema: { type: 'object', properties: { sum: { type: 'number' } }, required: ['sum'] },
    effects: ['read'],
    timeoutMs: 1000,
    parallelSafe: true,
    idempotent: true,
  };
  const connect = async () => {
    const instance = await factory();
    instance.hostRequest = async (method, params) => {
      if (params.name !== 'momo_probe_sum' || params.args.a !== 2 || params.args.b !== 3)
        throw new Error('UNEXPECTED_PROBE_TOOL');
      return method === 'host.authorize'
        ? { allowed: true }
        : { sum: params.args.a + params.args.b };
    };
    instance.on('event', (frame) => {
      frames.push(frame);
      if (frame.type === 'interaction.requested')
        void instance
          .request('respond', {
            runId: frame.runId,
            requestId: frame.payload.requestId,
            answers: frame.payload.questions.map((q: any) => ({
              id: q.id,
              selected: [q.intent?.approve ?? q.options[0].label],
            })),
          })
          .catch((error) => waiting.get(frame.runId)?.reject(error));
      if (frame.type === 'assistant.delta' && frame.runId.startsWith('pause-'))
        void instance
          .request('controlGoal', { sessionId: runSessions.get(frame.runId), action: 'pause' })
          .catch((error) => waiting.get(frame.runId)?.reject(error));
      if (frame.type === 'assistant.delta' && frame.runId.startsWith('cancel-'))
        void instance
          .request('cancel', { runId: frame.runId })
          .catch((error) => waiting.get(frame.runId)?.reject(error));
      if (['run.completed', 'run.failed', 'run.cancelled'].includes(frame.type)) {
        const item = waiting.get(frame.runId);
        if (item) {
          clearTimeout(item.timer);
          waiting.delete(frame.runId);
          item.resolve(frame);
        }
      }
    });
    instance.on('exit', () => {
      for (const item of waiting.values()) {
        clearTimeout(item.timer);
        item.reject(new Error('PROBE_RUNTIME_EXIT'));
      }
      waiting.clear();
    });
    return instance;
  };
  const turn = async (prompt: string, sessionId = randomUUID(), options: any = {}) => {
    const runId =
      (prompt === 'PROBE_CANCEL'
        ? 'cancel-'
        : prompt === '/goal PROBE_GOAL_PAUSE'
          ? 'pause-'
          : '') + randomUUID();
    runSessions.set(runId, sessionId);
    const terminal = new Promise<any>((resolve, reject) =>
      waiting.set(runId, {
        resolve,
        reject,
        timer: setTimeout(() => {
          waiting.delete(runId);
          reject(new Error('PROBE_TURN_TIMEOUT: ' + prompt));
        }, 20000),
      }),
    );
    void terminal.catch(() => {});
    await runtime!.request('start', {
      runId,
      sessionId,
      agentId: 'momo-default',
      modeId: 'ask',
      model,
      cwd: process.cwd(),
      prompt,
      instructions: 'Contract test',
      tools: [],
      attachments: [],
      ...options,
    });
    const end = await terminal;
    const expected = prompt === 'PROBE_CANCEL' ? 'run.cancelled' : 'run.completed';
    if (end.type !== expected) throw new Error('PROBE_TERMINAL: ' + JSON.stringify(end));
    return { runId, sessionId };
  };
  try {
    runtime = await connect();
    const descriptor = await runtime.describe(),
      agents = await runtime.request('listAgents');
    const file = await runtime.request('prepareAttachment', {
      name: 'probe.txt',
      mimeType: 'text/plain',
      data: Buffer.from('original file bytes').toString('base64'),
    });
    if (file.type !== 'file') throw new Error('PROBE_FILE_STORAGE');
    const pngChunk = (name: string, data: Buffer) => {
      const type = Buffer.from(name),
        body = Buffer.concat([type, data]);
      let crc = 0xffffffff;
      for (const byte of body) {
        crc ^= byte;
        for (let i = 0; i < 8; i++) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
      }
      const length = Buffer.alloc(4),
        checksum = Buffer.alloc(4);
      length.writeUInt32BE(data.length);
      checksum.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
      return Buffer.concat([length, body, checksum]);
    };
    const header = Buffer.alloc(13);
    header.writeUInt32BE(1, 0);
    header.writeUInt32BE(1, 4);
    header[8] = 8;
    header[9] = 6;
    const png = Buffer.concat([
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      pngChunk('IHDR', header),
      pngChunk('IDAT', deflateSync(Buffer.from([0, 255, 0, 0, 255]))),
      pngChunk('IEND', Buffer.alloc(0)),
    ]).toString('base64');
    const seeded = await turn('PROBE_TEXT', undefined, {
      temperature: 0.3,
      attachments: [
        { name: 'pixel.png', mimeType: 'image/png', data: png },
        {
          name: 'probe.txt',
          mimeType: 'text/plain',
          data: Buffer.from('original file bytes').toString('base64'),
        },
      ],
    });
    await turn('PROBE_TOOL', undefined, { tools: [tool] });
    await turn('PROBE_QUESTION');
    await turn('PROBE_PLAN', undefined, { modeId: 'plan' });
    const [cancelled, independent] = await Promise.all([
      turn('PROBE_CANCEL'),
      turn('PROBE_INDEPENDENT'),
    ]);
    if (cancelled.sessionId === independent.sessionId) throw new Error('PROBE_SESSION_ISOLATION');
    await turn('PROBE_AFTER_CANCEL', cancelled.sessionId, { hasNativeHistory: true });
    await runtime.dispose();
    runtime = await connect();
    await turn('PROBE_RESUME', seeded.sessionId, { resume: true, hasNativeHistory: true });
    const resumed = requests[requests.length - 1];
    const compacted = await turn('/compact', seeded.sessionId, {
      command: 'compact',
      resume: true,
      hasNativeHistory: true,
    });
    if (
      !frames.some(
        (f) =>
          f.runId === compacted.runId &&
          f.type === 'assistant.commit' &&
          f.payload.content.startsWith('已压缩'),
      )
    )
      throw new Error('PROBE_COMPACT_CHINESE_CONFIRMATION_MISSING');
    if (
      !frames.some(
        (f) =>
          f.runId === compacted.runId &&
          f.type === 'runtime.event' &&
          f.payload.nativeType === 'compaction/summary',
      )
    )
      throw new Error('PROBE_MANUAL_COMPACTION_MISSING');
    await turn('PROBE_AFTER_COMPACT', seeded.sessionId, { hasNativeHistory: true });
    if (!JSON.stringify(requests.at(-1).messages).includes('Harness probe passed'))
      throw new Error('PROBE_COMPACTED_SUMMARY_MISSING');
    const goalRun = await turn('/goal PROBE_GOAL', undefined, { command: 'goal' });
    if (
      !frames.some(
        (f) =>
          f.runId === goalRun.runId &&
          f.type === 'assistant.commit' &&
          f.payload.content.startsWith('目标已设置'),
      )
    )
      throw new Error('PROBE_GOAL_CHINESE_CONFIRMATION_MISSING');
    if (
      !frames.some(
        (f) =>
          f.runId === goalRun.runId &&
          f.type === 'goal.updated' &&
          f.payload.goal?.phase === 'complete' &&
          f.payload.goal.roundsStarted === 1,
      )
    )
      throw new Error('PROBE_GOAL_COMPLETION_MISSING');
    await runtime.dispose();
    runtime = await connect();
    const goalReplay = await turn('/goal', goalRun.sessionId, {
      command: 'goal',
      resume: true,
      hasNativeHistory: true,
    });
    if (
      !frames.some(
        (f) =>
          f.runId === goalReplay.runId &&
          f.type === 'goal.updated' &&
          f.payload.goal?.phase === 'complete',
      )
    )
      throw new Error('PROBE_GOAL_REPLAY_MISSING');
    const goalClear = await turn('/goal clear', goalRun.sessionId, {
      command: 'goal',
      hasNativeHistory: true,
    });
    if (
      frames.filter((f) => f.runId === goalClear.runId && f.type === 'goal.updated').at(-1)?.payload
        .goal !== null
    )
      throw new Error('PROBE_GOAL_CLEAR_MISSING');
    const paused = await turn('/goal PROBE_GOAL_PAUSE', undefined, { command: 'goal' });
    if (
      frames.filter((f) => f.runId === paused.runId && f.type === 'goal.updated').at(-1)?.payload
        .goal?.phase !== 'paused'
    )
      throw new Error('PROBE_GOAL_PAUSE_MISSING');
    await runtime.dispose();
    runtime = await connect();
    await turn('/goal', paused.sessionId, {
      command: 'goal',
      resume: true,
      hasNativeHistory: true,
    });
    const continued = await turn('/goal resume', paused.sessionId, {
      command: 'goal',
      hasNativeHistory: true,
    });
    if (
      frames.filter((f) => f.runId === continued.runId && f.type === 'goal.updated').at(-1)?.payload
        .goal?.phase !== 'complete'
    )
      throw new Error('PROBE_GOAL_RESUME_MISSING');
    if (!JSON.stringify(resumed.messages).includes('PROBE_TEXT'))
      throw new Error('PROBE_NATIVE_HISTORY_MISSING');
    if (!requests.some((r) => r.temperature === 0.3))
      throw new Error('PROBE_TEMPERATURE_NOT_APPLIED');
    if (
      !frames.some(
        (f) => f.type === 'thinking.delta' && f.payload.text.includes('Probe reasoning.'),
      )
    )
      throw new Error('PROBE_REASONING_NOT_STREAMED');
    if (
      !frames.some(
        (f) => f.type === 'assistant.commit' && f.payload.thinking.includes('Probe reasoning.'),
      )
    )
      throw new Error('PROBE_REASONING_NOT_COMMITTED');
    if (!frames.some((f) => f.type === 'assistant.commit' && f.payload.content.includes('sum=5')))
      throw new Error('PROBE_TOOL_RESULT_MISSING');
    const context = frames.filter((f) => f.type === 'context.updated');
    if (
      !context.some(
        (f) =>
          f.payload.contextWindow === undefined &&
          f.payload.contextWindowSource === 'unknown' &&
          f.payload.maxOutputTokens === 32768 &&
          f.payload.usedTokens > 0 &&
          f.payload.systemTokens > 0 &&
          f.payload.toolsTokens > 0 &&
          f.payload.messageTokens > 0,
      )
    )
      throw new Error('PROBE_CONTEXT_METER_MISSING');
    if (
      !frames.some(
        (f) =>
          f.type === 'runtime.event' &&
          f.payload.nativeType === 'plan/mode' &&
          f.payload.data.active === false,
      )
    )
      throw new Error('PROBE_PLAN_EXIT_MISSING');
    if (!requests.some((r) => JSON.stringify(r.messages).includes('data:image/png;base64,')))
      throw new Error('PROBE_IMAGE_NOT_SENT');
    return {
      checkedAt: Date.now(),
      descriptor,
      agents,
      checks: [
        'text',
        'stream',
        'thinking',
        'temperature',
        'native-commit',
        'context-meter',
        'tool',
        'question',
        'plan-review',
        'image',
        'original-file',
        'cancel',
        'independent-session',
        'continue',
        'native-resume',
        'manual-compaction',
        'goal-round',
        'goal-replay',
        'goal-clear',
        'goal-pause',
        'goal-resume',
      ],
      requests: requests.length,
      events: frames.length,
    };
  } finally {
    for (const item of waiting.values()) {
      clearTimeout(item.timer);
      item.reject(new Error('Probe disposed'));
    }
    waiting.clear();
    await runtime?.dispose();
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}
