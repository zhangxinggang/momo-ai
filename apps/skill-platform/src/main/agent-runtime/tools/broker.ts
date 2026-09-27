import type { PermissionMode, ToolDescriptor } from '@momo/agent-contracts';
import { createHash, randomUUID } from 'node:crypto';

import type { AgentStore } from '../persistence/store';
import { validateSchema } from './manifest';

export interface BrokerContext {
  depth?: number;
  nested?: boolean;
  runId: string;
  projectId: string;
  modeId: string;
  roots: string[];
  signal: AbortSignal;
  permissionMode?: PermissionMode;
  getPermissionMode?: () => PermissionMode;
  emit: (type: any, payload: Record<string, unknown>) => void;
  askApproval: (request: {
    toolId: string;
    callId: string;
    reason: string;
    arguments: unknown;
  }) => Promise<{ decision: string; remember?: boolean }>;
}

export interface HostTool extends ToolDescriptor {
  execute: (args: any, context: BrokerContext) => Promise<unknown>;
}

/** Host tools and validated custom plugins share authorization and JSON Schema enforcement. */
export class ToolBroker {
  private catalogs = new Map<string, Map<string, HostTool>>();
  private authorized = new Map<string, string>();
  private queues = new Map<string, Promise<unknown>>();

  constructor(private readonly store: AgentStore) {}

  register(runId: string, tools: HostTool[]) {
    const catalog = new Map<string, HostTool>();
    for (const tool of tools) {
      if (catalog.has(tool.name)) throw new Error('DUPLICATE_TOOL');
      catalog.set(tool.name, tool);
    }
    this.catalogs.set(runId, catalog);
  }

  forget(runId: string) {
    this.catalogs.delete(runId);
    for (const key of this.authorized.keys()) {
      if (key.startsWith(`${runId}:`)) this.authorized.delete(key);
    }
  }

  async authorize(name: string, args: unknown, callId: string, context: BrokerContext) {
    const tool = this.catalogs.get(context.runId)?.get(name);
    if (!tool) return { allowed: false, reason: '工具未授权或已被移除' };
    if (typeof callId !== 'string' || !callId || callId.length > 200) {
      throw new Error('INVALID_CALL_ID');
    }
    const inputJson = JSON.stringify(args);
    if (inputJson === undefined || Buffer.byteLength(inputJson) > 2 * 1024 * 1024) {
      throw new Error('TOOL_INPUT_TOO_LARGE');
    }
    validateSchema(tool.inputSchema, args);
    context.signal.throwIfAborted();
    if (context.modeId === 'plan' && tool.effects.some((effect) => effect !== 'read')) {
      return { allowed: false, reason: '计划模式只允许读取工具' };
    }

    const permission = context.getPermissionMode?.() ?? context.permissionMode ?? 'workspace-write';
    const sideEffect = tool.effects.some((effect) => effect !== 'read');
    if (permission === 'read-only' && sideEffect) {
      return { allowed: false, reason: '仅可查看权限不允许修改、联网或执行代码' };
    }
    const scopedWrite =
      (tool.id.startsWith('workspace.') || tool.id === 'artifact.create') &&
      tool.effects.every((effect) => effect === 'read' || effect === 'write');
    const automatic =
      permission === 'danger-full-access' || (permission === 'workspace-write' && scopedWrite);
    const hash = createHash('sha256')
      .update(JSON.stringify({ args, roots: context.roots, permission }))
      .digest('hex');
    const key = `${context.runId}:${callId}`;
    const identity = `${tool.revision}:${hash}`;
    if (this.authorized.get(key) === identity) return { allowed: true };
    const remembered = this.store.db
      .prepare(
        'SELECT id FROM agent_grants WHERE project_id=? AND tool_id=? AND revision=? AND target_hash=? AND expires_at>?',
      )
      .get(context.projectId, tool.id, tool.revision, hash, Date.now());
    if (sideEffect && !automatic && !remembered) {
      const answer = await context.askApproval({
        toolId: tool.id,
        callId,
        reason: tool.effects.includes('execute')
          ? '此操作将运行代码，允许后会按下方参数执行。'
          : '此操作具有写入或网络副作用',
        arguments: args,
      });
      context.signal.throwIfAborted();
      if ((context.getPermissionMode?.() ?? permission) === 'read-only') {
        return { allowed: false, reason: '权限已切换为仅可查看' };
      }
      this.store.audit(context.runId, 'approval', {
        toolId: tool.id,
        revision: tool.revision,
        hash,
        decision: answer.decision,
      });
      if (answer.decision !== 'allowed-once') return { allowed: false, reason: '用户拒绝执行' };
      if (answer.remember && !tool.effects.includes('execute')) {
        this.store.db
          .prepare('INSERT INTO agent_grants VALUES (?,?,?,?,?,?)')
          .run(
            randomUUID(),
            context.projectId,
            tool.id,
            tool.revision,
            hash,
            Date.now() + 86_400_000,
          );
      }
    }
    this.authorized.set(key, identity);
    return { allowed: true };
  }

  async execute(name: string, args: any, callId: string, context: BrokerContext) {
    const tool = this.catalogs.get(context.runId)?.get(name);
    if (!tool) throw new Error('TOOL_NOT_AUTHORIZED');
    const decision = await this.authorize(name, args, callId, context);
    if (!decision.allowed) throw new Error(decision.reason);
    this.authorized.delete(`${context.runId}:${callId}`);
    const perform = async () => {
      context.signal.throwIfAborted();
      if (
        (context.getPermissionMode?.() ?? context.permissionMode) === 'read-only' &&
        tool.effects.some((effect) => effect !== 'read')
      ) {
        throw new Error('权限已切换为仅可查看');
      }
      if (!this.catalogs.has(context.runId)) throw new Error('TOOL_NOT_AUTHORIZED');
      if (this.catalogs.get(context.runId)?.get(name)?.revision !== tool.revision)
        throw new Error('工具已更新或删除，请重新调用');
      context.emit('tool.started', { toolId: tool.id, title: tool.title, callId, arguments: args });
      this.store.audit(context.runId, 'tool.started', {
        toolId: tool.id,
        revision: tool.revision,
        callId,
        args,
      });
      const timeout = AbortSignal.timeout(tool.timeoutMs);
      const signal = AbortSignal.any([context.signal, timeout]);
      try {
        let abort!: () => void;
        const cancelled = new Promise<never>((_resolve, reject) => {
          abort = () => reject(signal.reason);
          signal.addEventListener('abort', abort, { once: true });
          if (signal.aborted) abort();
        });
        void cancelled.catch(() => undefined);
        let value: unknown;
        try {
          value = await Promise.race([tool.execute(args, { ...context, signal }), cancelled]);
        } finally {
          signal.removeEventListener('abort', abort);
        }
        signal.throwIfAborted();
        if (tool.outputSchema) validateSchema(tool.outputSchema, value);
        const serialized = JSON.stringify(value);
        if (serialized === undefined || Buffer.byteLength(serialized) > 2 * 1024 * 1024) {
          throw new Error('TOOL_RESULT_TOO_LARGE');
        }
        context.emit('tool.completed', {
          toolId: tool.id,
          title: tool.title,
          callId,
          preview: serialized.slice(0, 12_000),
        });
        this.store.audit(context.runId, 'tool.completed', { toolId: tool.id, callId, value });
        return value;
      } catch (error) {
        const failure = error as Error;
        const unknownOutcome = signal.aborted && tool.effects.some((effect) => effect !== 'read');
        context.emit('tool.failed', {
          toolId: tool.id,
          callId,
          message: failure.message,
          unknownOutcome,
        });
        this.store.audit(context.runId, 'tool.failed', {
          toolId: tool.id,
          callId,
          message: failure.message,
          unknownOutcome,
        });
        throw failure;
      }
    };
    if (tool.parallelSafe || context.nested) return perform();
    const previous = this.queues.get(context.projectId) ?? Promise.resolve();
    const next = previous.catch(() => undefined).then(perform);
    this.queues.set(context.projectId, next);
    try {
      return await next;
    } finally {
      if (this.queues.get(context.projectId) === next) this.queues.delete(context.projectId);
    }
  }
}
