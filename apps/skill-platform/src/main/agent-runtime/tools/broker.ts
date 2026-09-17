import type { PermissionMode, ToolAction, ToolDescriptor } from '@momo/agent-contracts';
import { spawn } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { AgentStore } from '../persistence/store';
import { safeExistingPath } from '../supervisor/bundles';
import { validateActionManifest, validateSchema } from './manifest';
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
export interface CustomToolPackageStatus {
  path: string;
  status: 'callable' | 'page-only' | 'invalid';
  reason?: string;
  id?: string;
  name?: string;
  aliases: string[];
}
export interface CustomToolCatalog {
  tools: HostTool[];
  status: CustomToolPackageStatus[];
}

const GENERIC_TOOL_ALIASES = new Set(['tool', 'tools', '工具', '工具箱', 'action', '操作']);
const TOOL_ALIAS_MARKER = '(?:工具箱|工具|tools?|action|操作)';

function naturalToolAliasVariants(alias: string): string[] {
  const compact = alias.replace(/\s+/g, '');
  if (!compact || /[./\\]/.test(compact)) return compact === alias ? [] : [compact];
  const withoutMarker = compact
    .replace(new RegExp(`^${TOOL_ALIAS_MARKER}[\uff1a:_-]*`, 'iu'), '')
    .replace(new RegExp(`[\uff1a:_-]*${TOOL_ALIAS_MARKER}$`, 'iu'), '');
  return [compact, withoutMarker].filter((value) => value && value !== alias);
}

function uniqueToolAliases(values: unknown[]): string[] {
  const aliases = new Map<string, string>();
  for (const value of values.flatMap((item) => (Array.isArray(item) ? item : [item]))) {
    if (typeof value !== 'string') continue;
    const alias = value.trim();
    for (const candidate of [alias, ...naturalToolAliasVariants(alias)]) {
      const normalized = candidate.normalize('NFKC').toLocaleLowerCase();
      if (!candidate || candidate.length > 200 || GENERIC_TOOL_ALIASES.has(normalized)) continue;
      aliases.set(normalized, candidate);
    }
  }
  return [...aliases.values()].slice(0, 40);
}

function containsToolAlias(content: string, alias: string): boolean {
  const text = content.normalize('NFKC').toLocaleLowerCase();
  const term = alias.normalize('NFKC').toLocaleLowerCase().trim();
  if (!term || GENERIC_TOOL_ALIASES.has(term)) return false;
  const compactText = text.replace(/\s+/g, '');
  const compactTerm = term.replace(/\s+/g, '');
  const escapedCompactTerm = compactTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const framed = new RegExp(
    `(?:${TOOL_ALIAS_MARKER}[\uff1a:_-]*${escapedCompactTerm}|${escapedCompactTerm}[\uff1a:_-]*${TOOL_ALIAS_MARKER})`,
    'iu',
  ).test(compactText);
  if (/^[a-z0-9_]+$/.test(term)) {
    if (term.length < 3) return framed;
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return framed || new RegExp(`(^|[^a-z0-9_])${escaped}([^a-z0-9_]|$)`, 'i').test(text);
  }
  return framed || (compactTerm.length >= 2 && compactText.includes(compactTerm));
}

/** 只把本轮提示词、规则或已展开 Skill 明确点名的工具箱 action 临时开放给模型。 */
export function findReferencedToolboxToolIds(
  tools: HostTool[],
  sources: Array<string | undefined>,
): Set<string> {
  const content = sources.filter((source): source is string => Boolean(source?.trim())).join('\n');
  const ids = new Set<string>();
  if (!content) return ids;
  for (const tool of tools) {
    if (
      tool.id.startsWith('toolbox.') &&
      tool.aliases?.some((alias) => containsToolAlias(content, alias))
    )
      ids.add(tool.id);
  }
  return ids;
}

export function findReferencedUnavailableToolPackages(
  status: CustomToolPackageStatus[],
  sources: Array<string | undefined>,
) {
  const content = sources.filter((source): source is string => Boolean(source?.trim())).join('\n');
  if (!content) return [];
  return status.filter(
    (item) =>
      item.status !== 'callable' && item.aliases.some((alias) => containsToolAlias(content, alias)),
  );
}

export class ToolBroker {
  private catalogs = new Map<string, Map<string, HostTool>>();
  private authorized = new Map<string, string>();
  private queues = new Map<string, Promise<unknown>>();
  constructor(
    private store: AgentStore,
    private toolsRoot: string,
    private workerRoot: string,
    private node: string,
  ) {}
  async customTools(): Promise<CustomToolCatalog> {
    const tools: HostTool[] = [],
      status: CustomToolPackageStatus[] = [];
    const packageIds = new Set<string>();
    const scan = async (dir: string, depth: number) => {
      if (depth > 5) return;
      for (const item of await fs.readdir(dir, { withFileTypes: true }).catch(() => [])) {
        if (!item.isDirectory() || item.name === 'node_modules' || item.name.startsWith('.'))
          continue;
        const full = path.join(dir, item.name),
          rel = path.relative(this.toolsRoot, full);
        let raw: any;
        try {
          raw = JSON.parse(await fs.readFile(path.join(full, 'tool.json'), 'utf8'));
        } catch {
          await scan(full, depth + 1);
          continue;
        }
        const normalizedPath = rel.replaceAll('\\', '/');
        const packageAliases = uniqueToolAliases([
          raw?.id,
          raw?.name,
          raw?.title,
          raw?.aliases,
          normalizedPath,
          path.basename(rel),
        ]);
        try {
          const manifest = validateActionManifest(raw);
          if (packageIds.has(manifest.id)) throw new Error('DUPLICATE_PACKAGE_ID');
          packageIds.add(manifest.id);
          const packageTools: HostTool[] = [];
          const snapshot = await this.fingerprint(full);
          const revision = createHash('sha256').update(JSON.stringify(snapshot)).digest('hex');
          for (const action of manifest.actions) {
            let entry: string | undefined;
            if (action.executor.runtime !== 'http')
              entry = await safeExistingPath(full, action.executor.entry!);
            const id = 'toolbox.' + manifest.id + '.' + action.id;
            const displayName = manifest.name?.trim() || path.basename(rel);
            const aliases = uniqueToolAliases([id, packageAliases, action.id, action.title]);
            packageTools.push({
              id,
              name: 'toolbox_' + createHash('sha256').update(id).digest('hex').slice(0, 24),
              title: action.title,
              description: `工具箱「${displayName}」的「${action.title}」动作。${action.description}\n稳定标识：${id}`,
              aliases,
              revision,
              inputSchema: action.inputSchema,
              outputSchema: action.outputSchema,
              effects: action.effects,
              timeoutMs: action.timeoutMs,
              parallelSafe: action.parallelSafe,
              idempotent: action.idempotent,
              execute: (args, context) =>
                this.executeSnapshotAction(action, full, snapshot, revision, args, context),
            });
          }
          tools.push(...packageTools);
          status.push({
            path: rel,
            status: manifest.actions.length ? 'callable' : 'page-only',
            id: manifest.id,
            name: manifest.name?.trim() || path.basename(rel),
            aliases: packageAliases,
          });
        } catch (error) {
          status.push({
            path: rel,
            status: 'invalid',
            reason: (error as Error).message,
            id: typeof raw?.id === 'string' ? raw.id : undefined,
            name: typeof raw?.name === 'string' ? raw.name : path.basename(rel),
            aliases: packageAliases,
          });
        }
      }
    };
    await scan(this.toolsRoot, 0);
    return { tools, status };
  }
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
    for (const key of this.authorized.keys())
      if (key.startsWith(runId + ':')) this.authorized.delete(key);
  }
  async authorize(name: string, args: unknown, callId: string, context: BrokerContext) {
    const tool = this.catalogs.get(context.runId)?.get(name);
    if (!tool) return { allowed: false, reason: '工具未授权或已被移除' };
    if (typeof callId !== 'string' || !callId || callId.length > 200)
      throw new Error('INVALID_CALL_ID');
    const inputJson = JSON.stringify(args);
    if (inputJson === undefined || Buffer.byteLength(inputJson) > 2 * 1024 * 1024)
      throw new Error('TOOL_INPUT_TOO_LARGE');
    validateSchema(tool.inputSchema, args);
    context.signal.throwIfAborted();
    if (context.modeId === 'plan' && tool.effects.some((e) => e !== 'read'))
      return { allowed: false, reason: '计划模式只允许读取工具' };
    const permission = context.getPermissionMode?.() ?? context.permissionMode ?? 'workspace-write';
    const sideEffect = tool.effects.some((e) => e !== 'read');
    if (permission === 'read-only' && sideEffect)
      return { allowed: false, reason: '仅可查看权限不允许修改、联网或执行代码' };
    const scopedWrite =
      (tool.id.startsWith('workspace.') || tool.id === 'artifact.create') &&
      tool.effects.every((e) => e === 'read' || e === 'write');
    const automatic =
      permission === 'danger-full-access' || (permission === 'workspace-write' && scopedWrite);
    const hash = createHash('sha256')
      .update(JSON.stringify({ args, roots: context.roots, permission }))
      .digest('hex');
    const key = context.runId + ':' + callId;
    const identity = tool.revision + ':' + hash;
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
      if ((context.getPermissionMode?.() ?? permission) === 'read-only')
        return { allowed: false, reason: '权限已切换为仅可查看' };
      this.store.audit(context.runId, 'approval', {
        toolId: tool.id,
        revision: tool.revision,
        hash,
        decision: answer.decision,
      });
      if (answer.decision !== 'allowed-once') return { allowed: false, reason: '用户拒绝执行' };
      if (answer.remember && !tool.effects.includes('execute'))
        this.store.db
          .prepare('INSERT INTO agent_grants VALUES (?,?,?,?,?,?)')
          .run(
            randomUUID(),
            context.projectId,
            tool.id,
            tool.revision,
            hash,
            Date.now() + 86400000,
          );
    }
    this.authorized.set(key, identity);
    return { allowed: true };
  }
  async execute(name: string, args: any, callId: string, context: BrokerContext) {
    const tool = this.catalogs.get(context.runId)?.get(name);
    if (!tool) throw new Error('TOOL_NOT_AUTHORIZED');
    const decision = await this.authorize(name, args, callId, context);
    if (!decision.allowed) throw new Error(decision.reason);
    this.authorized.delete(context.runId + ':' + callId);
    const perform = async () => {
      context.signal.throwIfAborted();
      if (
        (context.getPermissionMode?.() ?? context.permissionMode) === 'read-only' &&
        tool.effects.some((e) => e !== 'read')
      )
        throw new Error('权限已切换为仅可查看');
      if (!this.catalogs.has(context.runId)) throw new Error('TOOL_NOT_AUTHORIZED');
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
        const cancelled = new Promise<never>((_, reject) => {
          abort = () => reject(signal.reason);
          signal.addEventListener('abort', abort, { once: true });
          if (signal.aborted) abort();
        });
        void cancelled.catch(() => {});
        let value: unknown;
        try {
          const execution = tool.execute(args, { ...context, signal });
          value = await (tool.id.startsWith('toolbox.')
            ? execution
            : Promise.race([execution, cancelled]));
        } finally {
          signal.removeEventListener('abort', abort);
        }
        signal.throwIfAborted();
        if (tool.outputSchema) validateSchema(tool.outputSchema, value);
        const serialized = JSON.stringify(value);
        if (serialized === undefined || Buffer.byteLength(serialized) > 2 * 1024 * 1024)
          throw new Error('TOOL_RESULT_TOO_LARGE');
        context.emit('tool.completed', {
          toolId: tool.id,
          title: tool.title,
          callId,
          preview: serialized.slice(0, 12000),
        });
        this.store.audit(context.runId, 'tool.completed', { toolId: tool.id, callId, value });
        return value;
      } catch (e) {
        const error = e as Error;
        const unknownOutcome = signal.aborted && tool.effects.some((e) => e !== 'read');
        context.emit('tool.failed', {
          toolId: tool.id,
          callId,
          message: error.message,
          unknownOutcome,
        });
        this.store.audit(context.runId, 'tool.failed', {
          toolId: tool.id,
          callId,
          message: error.message,
          unknownOutcome,
        });
        throw error;
      }
    };
    if (tool.parallelSafe || context.nested) return perform();
    const previous = this.queues.get(context.projectId) ?? Promise.resolve();
    const next = previous.catch(() => {}).then(perform);
    this.queues.set(context.projectId, next);
    try {
      return await next;
    } finally {
      if (this.queues.get(context.projectId) === next) this.queues.delete(context.projectId);
    }
  }
  private async fingerprint(root: string) {
    const files: Record<string, string> = {};
    let bytes = 0;
    const walk = async (directory: string) => {
      for (const item of (await fs.readdir(directory, { withFileTypes: true })).sort((a, b) =>
        a.name.localeCompare(b.name),
      )) {
        if (
          item.name.startsWith('.') ||
          ['data', 'node_modules', '__pycache__', 'venv'].includes(item.name)
        )
          continue;
        const relative = path.relative(root, path.join(directory, item.name)).replaceAll('\\', '/');
        const file = path.join(root, relative);
        if (item.isSymbolicLink()) throw new Error('ACTION_LINK_NOT_ALLOWED');
        if (item.isDirectory()) await walk(file);
        else if (item.isFile()) {
          bytes += (await fs.stat(file)).size;
          if (bytes > 40 * 1024 * 1024 || Object.keys(files).length > 1000)
            throw new Error('ACTION_PACKAGE_TOO_LARGE');
          files[relative] = createHash('sha256')
            .update(await fs.readFile(file))
            .digest('hex');
        }
      }
    };
    await walk(root);
    return files;
  }
  private async executeSnapshotAction(
    action: ToolAction,
    root: string,
    files: Record<string, string>,
    revision: string,
    input: unknown,
    context: BrokerContext,
  ) {
    const current = await this.fingerprint(root);
    if (JSON.stringify(current) !== JSON.stringify(files))
      throw new Error('ACTION_CHANGED_RESTART_TURN');
    const snapshot = path.join(this.toolsRoot, '.harness-actions', revision);
    await fs.mkdir(snapshot, { recursive: true });
    for (const [relative, hash] of Object.entries(files)) {
      context.signal.throwIfAborted();
      const bytes = await fs.readFile(await safeExistingPath(root, relative));
      if (createHash('sha256').update(bytes).digest('hex') !== hash)
        throw new Error('ACTION_CHANGED_RESTART_TURN');
      const target = path.join(snapshot, relative);
      await fs.mkdir(path.dirname(target), { recursive: true });
      try {
        await fs.writeFile(target, bytes, { flag: 'wx' });
      } catch (e: any) {
        if (e.code !== 'EEXIST') throw e;
      }
      if (
        createHash('sha256')
          .update(await fs.readFile(target))
          .digest('hex') !== hash
      )
        throw new Error('ACTION_SNAPSHOT_CORRUPT');
    }
    const entry =
      action.executor.runtime === 'http'
        ? undefined
        : await safeExistingPath(snapshot, action.executor.entry!);
    // Arbitrary trusted code is not an OS security sandbox. Its declared execute effect always needs approval.
    let attempt = 0;
    while (true) {
      try {
        return await this.executeAction(
          action,
          snapshot,
          entry,
          input,
          context,
          path.join(root, 'data'),
        );
      } catch (error) {
        if (
          context.signal.aborted ||
          !action.idempotent ||
          attempt++ >= action.retry ||
          !/^ACTION_HTTP_(429|503)$/.test((error as Error).message)
        )
          throw error;
        this.store.audit(context.runId, 'tool.retry', { actionId: action.id, attempt });
      }
    }
  }
  private async executeAction(
    action: ToolAction,
    root: string,
    entry: string | undefined,
    input: unknown,
    context: BrokerContext,
    dataDir: string,
  ): Promise<unknown> {
    const signal = context.signal;
    if (action.executor.runtime === 'http') {
      const url = new URL(action.executor.url!);
      if (action.executor.method === 'GET') url.searchParams.set('input', JSON.stringify(input));
      const response = await fetch(url, {
        method: action.executor.method ?? 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: action.executor.method === 'GET' ? undefined : JSON.stringify(input),
        signal,
        redirect: 'error',
      });
      if (!response.ok) throw new Error('ACTION_HTTP_' + response.status);
      const reader = response.body!.getReader(),
        chunks: Buffer[] = [];
      let size = 0;
      try {
        while (true) {
          const part = await reader.read();
          if (part.done) break;
          size += part.value.length;
          if (size > 2 * 1024 * 1024) throw new Error('ACTION_RESULT_TOO_LARGE');
          chunks.push(Buffer.from(part.value));
        }
      } finally {
        await reader.cancel();
      }
      return JSON.parse(Buffer.concat(chunks).toString('utf8'));
    }
    const worker = path.join(
      this.workerRoot,
      action.executor.runtime === 'python' ? 'action-worker.py' : 'action-worker.mjs',
    );
    return new Promise((resolve, reject) => {
      const env: NodeJS.ProcessEnv = {};
      for (const key of [
        'PATH',
        'Path',
        'SystemRoot',
        'WINDIR',
        'TEMP',
        'TMP',
        'HOME',
        'USERPROFILE',
      ])
        if (process.env[key]) env[key] = process.env[key];
      const child = spawn(action.executor.runtime === 'python' ? 'python' : this.node, [worker], {
        cwd: root,
        env,
        windowsHide: true,
        stdio: 'pipe',
      });
      let output = '',
        error = '',
        settled = false,
        bytes = 0;
      let outcome: { failure?: Error; value?: unknown } | undefined;
      const finish = (failure?: Error, value?: unknown) => {
        if (settled) return;
        settled = true;
        signal.removeEventListener('abort', abort);
        outcome = { failure, value };
        child.stdin.end();
        child.kill();
      };
      const abort = () =>
        finish(signal.reason instanceof Error ? signal.reason : new Error('ACTION_CANCELLED'));
      const write = (frame: unknown) => {
        if (!child.stdin.destroyed) child.stdin.write(JSON.stringify(frame) + '\n');
      };
      signal.addEventListener('abort', abort, { once: true });
      if (signal.aborted) abort();
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (chunk) => {
        bytes += Buffer.byteLength(chunk);
        output += chunk;
        if (bytes > 2 * 1024 * 1024) {
          finish(new Error('ACTION_RESULT_TOO_LARGE'));
          return;
        }
        let end;
        while ((end = output.indexOf('\n')) >= 0 && !settled) {
          const line = output.slice(0, end);
          output = output.slice(end + 1);
          let frame: any;
          try {
            frame = JSON.parse(line);
          } catch {
            finish(new Error('ACTION_INVALID_JSON'));
            return;
          }
          if (frame.type === 'result') {
            finish(undefined, frame.value);
            return;
          }
          if (frame.type === 'error') {
            finish(new Error(frame.message));
            return;
          }
          if (
            frame.type !== 'call' ||
            typeof frame.id !== 'string' ||
            typeof frame.toolId !== 'string'
          ) {
            finish(new Error('ACTION_INVALID_FRAME'));
            return;
          }
          void Promise.resolve()
            .then(async () => {
              if ((context.depth ?? 0) >= 4 || !action.capabilities.includes(frame.toolId))
                throw new Error('ACTION_CAPABILITY_DENIED');
              const tool = [...(this.catalogs.get(context.runId)?.values() ?? [])].find(
                (t) => t.id === frame.toolId,
              );
              if (!tool) throw new Error('ACTION_CAPABILITY_UNAVAILABLE');
              return this.execute(tool.name, frame.input, randomUUID(), {
                ...context,
                depth: (context.depth ?? 0) + 1,
                nested: true,
              });
            })
            .then(
              (value) => write({ id: frame.id, value }),
              (failure) => write({ id: frame.id, error: failure.message }),
            );
        }
      });
      child.stderr.on('data', (chunk) => {
        if (error.length < 4000) error += chunk;
      });
      child.stdin.on('error', () => {
        /* Closing a cancelled worker can race its stdin. */
      });
      child.on('error', (e) => finish(e));
      child.on('close', (code) => {
        signal.removeEventListener('abort', abort);
        settled = true;
        const result = outcome ?? { failure: new Error('ACTION_FAILED_' + code + ': ' + error) };
        result.failure ? reject(result.failure) : resolve(result.value);
      });
      write({ entry, export: action.executor.export ?? 'execute', input, toolRoot: root, dataDir });
    });
  }
}
