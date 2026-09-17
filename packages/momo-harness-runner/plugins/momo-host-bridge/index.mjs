import { createUserMessage } from '@deepseek-ai/dsh-llm';
import * as PiAi from '@deepseek-ai/dsh-llm-pi-ai';
import { createHash, randomUUID } from 'node:crypto';
import readline from 'node:readline';
import {
  CHINESE_OUTPUT,
  CONTINUE_AFTER_LIMIT,
  commandResultText,
  failurePayload,
  providerProfile,
  requestConfig,
} from './model-policy.mjs';
import { runManagedCode } from './process.mjs';
import { nativeInputSchema } from './tool-schema.mjs';
export const name = 'momo-host-bridge';
export const inject = [
  'agents',
  'llm',
  'tools',
  'systemPrompt',
  'sessionPersistence',
  'sessionProjections',
  'tokenMeter',
  'attachments',
  'userQuestions',
  'approval',
  'planMode',
  'skills',
  'agentPresets',
  'credentials',
  'commands',
  'goals',
  'compaction',
  'sessions',
  'fs',
  'subprocess',
];
const MAX_FRAME = 24 * 1024 * 1024;
export function apply(ctx) {
  const sessions = new Map(),
    runs = new Map(),
    pending = new Map(),
    interactions = new Map(),
    executions = new Map();
  let seq = 0,
    closed = false,
    providerFiber;
  let providerProfiles = {},
    providerUpdate = Promise.resolve();
  const write = (frame) => {
    const line = JSON.stringify(frame);
    if (line.length > MAX_FRAME) throw Error('RPC_FRAME_TOO_LARGE');
    process.stdout.write(line + '\n');
  };
  const emit = (run, type, payload) => write({ event: { runId: run.runId, type, payload } });
  const call = (method, params, signal) =>
    new Promise((resolve, reject) => {
      const id = 'host-' + ++seq;
      const toolTimeout =
        runs.get(params.runId)?.tools.find((tool) => tool.name === params.name)?.timeoutMs ??
        120000;
      // Approval waits for the user or cancellation; execution respects the advertised host deadline.
      const timer =
        method === 'host.authorize'
          ? undefined
          : setTimeout(() => finish(Error('HOST_RPC_TIMEOUT')), toolTimeout + 5000);
      function abort() {
        write({ method: 'host.cancel', params: { requestId: id } });
        finish(signal.reason ?? Error('cancelled'));
      }
      function finish(error, value) {
        clearTimeout(timer);
        signal?.removeEventListener('abort', abort);
        pending.delete(id);
        error ? reject(error) : resolve(value);
      }
      pending.set(id, { finish });
      if (signal?.aborted) {
        finish(signal.reason ?? Error('cancelled'));
        return;
      }
      signal?.addEventListener('abort', abort, { once: true });
      write({ id, method, params });
    });
  function owner(agent) {
    return [...runs.values()].find((r) => r.agent === agent);
  }
  function ask(run, request, signal) {
    if (!run) return Promise.reject(Error('No owned live run'));
    const requestId = randomUUID();
    return new Promise((resolve, reject) => {
      function abort() {
        interactions.delete(requestId);
        emit(run, 'interaction.resolved', { requestId, cancelled: true });
        reject(Error('Interaction cancelled'));
      }
      if (signal?.aborted) {
        abort();
        return;
      }
      interactions.set(requestId, {
        run,
        request,
        resolve(value) {
          signal?.removeEventListener('abort', abort);
          interactions.delete(requestId);
          emit(run, 'interaction.resolved', { requestId });
          resolve(value);
        },
      });
      signal?.addEventListener('abort', abort, { once: true });
      emit(run, 'interaction.requested', { ...request, requestId });
    });
  }
  ctx.on('user-questions/request', (request) =>
    ask(owner(request.agent), { kind: 'question', questions: request.questions }, request.signal),
  );
  ctx.on('approval/request', (request) =>
    ask(
      owner(request.agent),
      {
        kind: 'approval',
        toolId: request.toolName,
        callId: request.callId,
        reason: request.reason,
      },
      request.signal,
    ).then((answer) => answer.decision),
  );
  ctx.on('agent/request', async ({ agent }, next) => {
    const config = await next();
    const run = owner(agent);
    return run ? requestConfig(config, run) : config;
  });
  ctx.on('agent/assistant-stream', ({ agent, frame }) => {
    const run = owner(agent);
    if (!run) return;
    if (frame.type === 'start') emit(run, 'assistant.start', frame);
    if (frame.type === 'chunk') {
      const chunk = frame.chunk;
      if (chunk.type === 'text-delta' || chunk.type === 'reasoning-delta')
        emit(run, chunk.type === 'text-delta' ? 'assistant.delta' : 'thinking.delta', {
          attemptId: frame.attemptId,
          revision: frame.revision,
          index: frame.index,
          text: chunk.text,
        });
      if (chunk.type === 'usage') emit(run, 'usage.updated', chunk.usage);
    }
    if (frame.type === 'end' && frame.outcome.kind === 'abandoned')
      emit(run, 'assistant.abandoned', frame);
  });
  ctx.on('session/event', (session, event) => {
    const run = [...runs.values()].find((r) => r.agent?.session === session);
    if (!run) return;
    const data = event.data ?? event;
    if (event.type === 'assistant/message') {
      const message = data.message ?? data;
      const blocks = message.content ?? [];
      emit(run, 'assistant.commit', {
        nativeSeq: event.seq,
        messageId: message.id,
        content: blocks
          .filter((b) => b.type === 'text')
          .map((b) => b.text)
          .join(''),
        thinking: blocks
          .filter((b) => b.type === 'reasoning')
          .map((b) => b.text)
          .join(''),
      });
    }
    if (event.type === 'goal/change' || event.type === 'turn/end')
      emit(run, 'goal.updated', { goal: ctx.goals.get(run.agent) ?? null });
    if (event.type === 'turn/end') {
      run.nativeReason = typeof data.reason === 'string' ? { kind: data.reason } : data.reason;
      run.stopReason = run.nativeReason?.kind;
    }
    if (
      [
        'request/header',
        'request/context',
        'system/message',
        'user/message',
        'assistant/message',
        'tool/result',
        'turn/end',
        'compaction/end',
        'compaction/summary',
      ].includes(event.type)
    ) {
      const { contextPressure, contextBreakdown } = ctx.sessionProjections.snapshot(session, [
        'contextPressure',
        'contextBreakdown',
      ]).values;
      const contextWindow = contextPressure?.contextWindow;
      if (contextWindow)
        emit(run, 'context.updated', {
          usedTokens:
            contextPressure.projectedTokens ??
            contextPressure.pressureTokens ??
            ctx.tokenMeter.measure(session).totalTokens,
          ...contextBreakdown,
          contextWindowSource: 'unknown',
          maxOutputTokens: requestConfig({}, run).maxTokens,
          modelProfileId: run.model.id,
        });
    }
    emit(run, 'runtime.event', { nativeSeq: event.seq, nativeType: event.type, data });
  });
  ctx.on('tools/pre-execute', async (exec, next) => {
    const run = owner(exec.agent);
    // All model-accessible paths, including nested dispatch, pass this gate.
    if (!run) return { kind: 'deny', reason: 'No host-owned run' };
    const native = [
      'ask_user_question',
      'exit_plan_mode',
      'skill',
      'get_goal',
      'create_goal',
      'update_goal',
    ];
    if (native.includes(exec.name)) return next();
    if (!run.tools.some((t) => t.name === exec.name))
      return { kind: 'deny', reason: 'Tool not in authorized catalog' };
    const decision = await call(
      'host.authorize',
      { runId: run.runId, name: exec.name, callId: exec.callId, args: exec.arguments },
      exec.signal,
    );
    return decision.allowed
      ? next()
      : { kind: 'deny', reason: decision.reason ?? 'Host denied tool' };
  });
  async function prepareAttachment(input) {
    if (typeof input.data !== 'string' || input.data.length > 15 * 1024 * 1024)
      throw Error('Attachment too large');
    if (Buffer.from(input.data, 'base64').toString('base64') !== input.data)
      throw Error('INVALID_BASE64');
    if (input.mimeType.startsWith('image/')) {
      const [attachment] = await ctx.attachments.saveImages([
        {
          data: new Uint8Array(Buffer.from(input.data, 'base64')),
          mediaType: input.mimeType,
          name: input.name,
        },
      ]);
      return { type: 'image', attachment };
    }
    return {
      type: 'file',
      attachment: await ctx.attachments.admitEncodedFile({ data: input.data, name: input.name }),
    };
  }
  async function start(input) {
    if (runs.has(input.runId)) return { runId: input.runId };
    if ([...runs.values()].some((r) => r.sessionId === input.sessionId))
      throw Error('SESSION_BUSY');
    const content = [{ type: 'text', text: input.prompt }];
    for (const attachment of input.attachments ?? [])
      content.push(attachment.attachment ? attachment : await prepareAttachment(attachment));
    const run = { ...input, agent: undefined, controller: new AbortController() };
    let rec = sessions.get(input.sessionId);
    const modelIdentity = JSON.stringify([
      input.model.apiProtocol ?? 'openai',
      input.model.apiUrl,
      input.model.model,
    ]);
    if (rec && rec.modelIdentity !== modelIdentity)
      throw Error('此会话使用的模型配置已改变，请新建对话');
    let scopedContext, invalidateSkills;
    const configure = async (agentCtx) => {
      scopedContext = agentCtx;
      await ctx.agentPresets.mount(
        agentCtx,
        input.agentId === 'default' ? 'momo-default' : input.agentId,
      );
      agentCtx
        .get('systemPrompt')
        .section({
          name: 'momo:instructions',
          order: 10,
          interpolate: false,
          text: () => rec?.current?.instructions ?? input.instructions ?? '',
        });
      agentCtx
        .get('systemPrompt')
        .section({ name: 'momo:language', order: 1000, interpolate: false, text: CHINESE_OUTPUT });
      agentCtx.get('skills').registerProvider((control) => {
        invalidateSkills = control.invalidate;
        return {
          name: 'momo-host-' + input.sessionId,
          list: async () =>
            (rec?.current?.skillCatalog ?? input.skillCatalog ?? []).map((item) => ({
              name:
                'momo-' + createHash('sha256').update(item.resourceId).digest('hex').slice(0, 32),
              description: item.label + ': ' + (item.description ?? ''),
              source: 'momo-host',
              provider: 'momo-host-' + input.sessionId,
              invocation: { modelInvocable: true, userInvocable: true },
              rank: 100,
              locator: { resourceId: item.resourceId, revision: item.resourceRevision },
            })),
          get: async (candidate, options) => {
            const run = [...runs.values()].find((r) => r.sessionId === input.sessionId);
            if (!run) throw Error('No active host run');
            const result = await call(
              'host.tool',
              {
                runId: run.runId,
                name: 'resources_load',
                args: candidate.locator,
                callId: 'skill-' + randomUUID(),
              },
              options.signal,
            );
            return { ...candidate, content: result.content };
          },
        };
      });
    };
    const registerTools = (agentCtx, tools) => {
      return tools.map((tool) => {
        const parameters = nativeInputSchema(tool.inputSchema);
        const aliases = [...new Set([tool.title, ...(tool.aliases ?? [])].filter(Boolean))];
        const identity = aliases.length ? '\n可识别名称：' + aliases.join('、') : '';
        const description =
          tool.description +
          identity +
          (JSON.stringify(parameters) === JSON.stringify(tool.inputSchema)
            ? ''
            : '\n完整输入约束由宿主严格校验：' + JSON.stringify(tool.inputSchema));
        return agentCtx.get('tools').register({
          name: tool.name,
          description,
          parameters,
          output: {
            schema: {},
            render: (_, value) => [{ type: 'text', text: JSON.stringify(value) }],
          },
          isConcurrencySafe: () => tool.parallelSafe,
          execute: (args, exec) =>
            call(
              'host.tool',
              { runId: owner(exec.agent)?.runId, name: tool.name, args, callId: exec.callId },
              exec.signal,
            ),
        });
      });
    };
    if (!rec) {
      // Configuration and credentials are private protocol data, never renderer-visible events.
      const provider = 'momo-' + input.sessionId.replace(/[^a-zA-Z0-9-]/g, '-');
      const model = input.model;
      const api = {
        openai: 'openai-completions',
        anthropic: 'anthropic-messages',
        gemini: 'google-generative-ai',
      }[model.apiProtocol ?? 'openai'];
      const envKey = 'MOMO_KEY_' + randomUUID().replaceAll('-', '_');
      await ctx.credentials.set(envKey, model.apiKey);
      const profile = providerProfile(model, api, envKey);
      const update = providerUpdate.then(async () => {
        providerProfiles = { ...providerProfiles, [provider]: profile };
        if (!providerFiber) providerFiber = await ctx.plugin(PiAi, { providers: providerProfiles });
        else await providerFiber.update({ providers: providerProfiles }, true);
      });
      providerUpdate = update.catch(() => {});
      await update;
      const options = { provider, model: model.model };
      const setup = configure;
      let handle;
      if (input.resume)
        handle = await ctx.agents.resume({
          resumeSessionId: input.sessionId,
          agentOptions: options,
          setup,
        });
      else
        handle = await ctx.agents.create({
          sessionId: input.sessionId,
          meta: { cwd: input.cwd, agentPreset: input.agentId },
          agentOptions: options,
          setup,
        });
      rec = {
        handle,
        envKey,
        modelIdentity,
        current: input,
        scopedContext,
        invalidateSkills,
        registrations: [],
      };
      sessions.set(input.sessionId, rec);
    }
    rec.current = input;
    rec.invalidateSkills?.();
    await ctx.credentials.set(rec.envKey, input.model.apiKey);
    for (const dispose of rec.registrations) dispose();
    rec.registrations = registerTools(rec.scopedContext, input.tools);
    run.agent = rec.handle.agent;
    runs.set(input.runId, run);
    ctx.planMode.set(run.agent, input.modeId === 'plan');

    if (!input.resume && !input.hasNativeHistory && input.history?.length) {
      run.agent.inject(
        createUserMessage({
          content: [
            {
              type: 'text',
              text:
                '以下为导入的历史对话，仅作上下文，并非 Harness 原生执行日志：\n' +
                JSON.stringify(input.history),
            },
          ],
          source: { kind: 'user' },
        }),
      );
    }
    emit(run, 'run.started', { agentId: input.agentId, bundleId: process.env.MOMO_BUNDLE_ID });
    emit(run, 'goal.updated', { goal: ctx.goals.get(run.agent) ?? null });
    const execute = async () => {
      if (input.command) {
        if (
          !['goal', 'compact'].includes(input.command) ||
          !new RegExp('^/' + input.command + '(?:\\s|$)').test(input.prompt)
        )
          throw Error('INVALID_COMMAND');
        const execution = await ctx.commands.execute(
          run.agent,
          input.prompt,
          [],
          run.controller.signal,
        );
        if (!execution) throw Error('COMMAND_UNAVAILABLE');
        const { result, commandId } = execution;
        const text = commandResultText(input.command, result, ctx.goals.get(run.agent));
        emit(run, 'assistant.commit', { nativeSeq: commandId, content: text, thinking: '' });
        if (result.kind === 'error') throw Error(text);
        run.stopReason = 'completed';
      } else run.agent.followup(createUserMessage({ content, source: { kind: 'user' } }));
      // Keep host tool ownership across the native goal driver's asynchronous checkpoints.
      let continuations = 0;
      while (true) {
        await run.agent.whenIdle();
        await ctx.sessions.flush(run.agent.session);
        await new Promise((resolve) => setImmediate(resolve));
        const goal = ctx.goals.get(run.agent);
        if (run.cancelled) break;
        if (
          run.agent.status !== 'idle' ||
          (goal?.phase === 'active' && goal.activation === 'armed')
        )
          continue;
        // Continue through the native agent and existing journal while preserving the user's cap.
        if (!input.command && !goal && run.stopReason === 'max-tokens' && continuations < 2) {
          continuations++;
          emit(run, 'agent.status', {
            message: '模型输出达到上限，正在继续完成中文答复',
            continuations,
          });
          run.stopReason = undefined;
          run.nativeReason = undefined;
          run.agent.followup(
            createUserMessage({
              content: [{ type: 'text', text: CONTINUE_AFTER_LIMIT }],
              source: { kind: 'user' },
            }),
          );
          continue;
        }
        break;
      }
      emit(run, 'goal.updated', { goal: ctx.goals.get(run.agent) ?? null });
      const completed =
        run.stopReason === 'completed' || ctx.goals.get(run.agent)?.phase === 'paused';
      emit(
        run,
        run.cancelled ? 'run.cancelled' : completed ? 'run.completed' : 'run.failed',
        run.cancelled || completed
          ? { stopReason: run.stopReason }
          : failurePayload(run.nativeReason),
      );
    };
    void execute()
      .catch((error) =>
        emit(
          run,
          run.cancelled ? 'run.cancelled' : 'run.failed',
          failurePayload({ kind: 'error', error: { code: error.code, message: error.message } }),
        ),
      )
      .finally(() => runs.delete(run.runId));
    return { runId: input.runId };
  }
  const methods = {
    async describe() {
      await ctx.get('loader')?.await();
      return {
        protocolVersion: '1.0',
        bundleId: process.env.MOMO_BUNDLE_ID,
        coreVersion: process.env.MOMO_CORE_VERSION,
        adapterVersion: '1.0.0',
        capabilities: [
          'stream',
          'cancel',
          'tools',
          'questions',
          'approvals',
          'attachments',
          'plan',
          'resume',
          'skills',
          'goal',
          'compact',
        ],
      };
    },
    async listAgents() {
      const list = await ctx.agentPresets.list();
      return list
        .filter((p) => !p.broken)
        .map((p) => ({
          id: p.id,
          title: p.name ?? p.id,
          description: p.description ?? '',
          modes: ['ask', 'plan'],
        }));
    },
    prepareAttachment,
    start,
    attachmentPaths({ attachments }) {
      return attachments.map((block) =>
        block.type === 'file'
          ? ctx.fs.processPathFromHostPath(ctx.attachments.fileHostPath(block.attachment))
          : undefined,
      );
    },
    async runProcess(input) {
      const run = runs.get(input.runId);
      if (!run || !run.tools.some((tool) => tool.name === 'execution_run'))
        throw Error('EXECUTION_NOT_AUTHORIZED');
      // The host broker applies the current permission and plan mode before this private RPC.
      const key = input.runId + ':' + input.executionId;
      if (executions.has(key)) throw Error('EXECUTION_BUSY');
      const controller = new AbortController();
      executions.set(key, controller);
      try {
        return await runManagedCode(
          ctx.subprocess,
          { ...input, cwd: run.cwd },
          AbortSignal.any([controller.signal, run.controller.signal]),
        );
      } finally {
        executions.delete(key);
      }
    },
    cancelProcess({ runId, executionId }) {
      executions.get(runId + ':' + executionId)?.abort(Error('Execution cancelled'));
      return {};
    },
    async controlGoal({ sessionId, action }) {
      if (!['pause', 'clear'].includes(action)) throw Error('INVALID_GOAL_ACTION');
      const rec = sessions.get(sessionId);
      if (!rec) throw Error('UNKNOWN_SESSION');
      const agent = rec.handle.agent,
        goal = ctx.goals.get(agent);
      if (!goal) throw Error('NO_GOAL');
      ctx.goals[action](agent, { id: goal.id, revision: goal.revision });
      const run = owner(agent);
      if (run) emit(run, 'goal.updated', { goal: ctx.goals.get(agent) ?? null });
      await ctx.sessions.flush(agent.session);
      return {};
    },
    respond(input) {
      const item = interactions.get(input.requestId);
      if (!item || item.run.runId !== input.runId) throw Error('STALE_INTERACTION');
      if (item.request.kind === 'approval') {
        if (!['allowed-once', 'rejected'].includes(input.decision) || input.answers)
          throw Error('INVALID_DECISION');
        item.resolve({ decision: input.decision });
      } else {
        const questions = item.request.questions;
        if (
          !Array.isArray(input.answers) ||
          input.answers.length !== questions.length ||
          input.decision
        )
          throw Error('INVALID_ANSWERS');
        const ids = new Set();
        for (const answer of input.answers) {
          const question = questions.find((q) => q.id === answer.id);
          if (
            !question ||
            ids.has(answer.id) ||
            !Array.isArray(answer.selected) ||
            answer.selected.some((label) => !question.options?.some((o) => o.label === label)) ||
            (!question.multiSelect && answer.selected.length > 1) ||
            (answer.custom &&
              (typeof answer.custom !== 'string' || answer.custom.length > 32000)) ||
            (!answer.selected.length && !answer.custom?.trim())
          )
            throw Error('INVALID_ANSWER');
          ids.add(answer.id);
        }
        item.resolve({ answers: input.answers });
      }
      return {};
    },
    cancel(input) {
      const run = runs.get(input.runId);
      if (run) {
        run.cancelled = true;
        run.controller.abort(Error('Cancelled'));
        ctx.goals.disarm(run.agent);
        run.agent.cancel({ kind: 'user' });
      }
      return {};
    },
    async shutdown() {
      for (const r of runs.values()) r.agent.cancel({ kind: 'disposed' });
      await Promise.allSettled(
        [...sessions.values()].map(async (r) => {
          await r.handle.dispose();
          await ctx.credentials.unset(r.envKey);
        }),
      );
      await providerFiber?.dispose();
      setImmediate(() => {
        void ctx.root.fiber.dispose().then(() => process.exit(0));
      });
      return {};
    },
  };
  const lines = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
  lines.on('line', (line) => {
    if (line.length > MAX_FRAME) {
      process.exitCode = 1;
      lines.close();
      return;
    }
    let frame;
    try {
      frame = JSON.parse(line);
    } catch {
      process.stderr.write('Malformed host frame\n');
      return;
    }
    if (frame.id && !frame.method) {
      const item = pending.get(frame.id);
      item?.finish(frame.error ? Error(frame.error.message) : undefined, frame.result);
      return;
    }
    if (!Object.hasOwn(methods, frame.method)) {
      write({ id: frame.id, error: { code: 'UNKNOWN_METHOD', message: 'Unknown method' } });
      return;
    }
    void Promise.resolve()
      .then(() => methods[frame.method](frame.params ?? {}))
      .then(
        (result) => write({ id: frame.id, result }),
        (error) =>
          write({ id: frame.id, error: { code: 'RUNTIME_ERROR', message: error.message } }),
      );
  });
  lines.on('close', () => {
    if (!closed) {
      closed = true;
      void methods.shutdown();
    }
  });
  ctx.effect(
    () => () => {
      closed = true;
      lines.close();
      for (const p of pending.values()) p.finish(Error('Runtime disposed'));
    },
    'momo.rpc',
  );
}
