/** Host protocol. Upstream types must never cross this boundary. */
export const HOST_PROTOCOL = '1.0';
export const AGENT_CHANNEL = 'agent-runtime';
export const AGENT_EVENT_CHANNEL = 'agent-runtime:event';
export type JsonSchema = Record<string, unknown>;
export interface RuntimeDescriptor {
  protocolVersion: string;
  bundleId: string;
  coreVersion: string;
  adapterVersion: string;
  capabilities: string[];
}
export interface AgentDescriptor {
  id: string;
  title: string;
  description: string;
  modes: string[];
}
export interface SourceRef {
  sourceId: string;
  revision: string;
  name: string;
  mimeType: string;
  encoding: 'utf8' | 'base64';
  size: number;
  originalAvailable?: boolean;
}
export interface ResourceInvocation {
  resourceId?: string;
  resourceRevision?: string;
  command: string;
  label?: string;
  kind?: string;
  scope?: string;
  token?: string;
}
export type PermissionMode = 'read-only' | 'workspace-write' | 'danger-full-access';
export type RuntimeCommand = 'goal' | 'compact';
export interface RuntimeGoal {
  id: string;
  revision: number;
  objective: string;
  phase: 'active' | 'paused' | 'blocked' | 'complete';
  activation: 'armed' | 'disarmed';
  roundsStarted: number;
  maxGoalRounds: number;
  blockedReason?: { code: string; message: string };
}
export interface RuntimeTurnInput {
  sessionId: string;
  projectId: string;
  turnId: string;
  idempotencyKey: string;
  modelProfileId: string;
  agentId: string;
  modeId: 'ask' | 'plan';
  rawIntent: string;
  displayInput: string;
  invocations: ResourceInvocation[];
  sourceRefs: SourceRef[];
  resourceAgentAppId?: string;
  folderPaths: string[];
  systemPrompt?: string;
  kbEnabled?: boolean;
  kbCollectionId?: string;
  temperature?: number;
  topP?: number;
  permissionMode?: PermissionMode;
  command?: RuntimeCommand;
  history?: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
}
export interface QuestionItem {
  id: string;
  question: string;
  header?: string;
  detail?: string;
  multiSelect?: boolean;
  options?: Array<{ label: string; description?: string }>;
  intent?: { kind: string; approve: string };
}
export interface RunInteraction {
  requestId: string;
  kind: 'question' | 'approval';
  questions?: QuestionItem[];
  toolId?: string;
  callId?: string;
  reason?: string;
  arguments?: unknown;
}
export interface RunResponse {
  runId: string;
  requestId: string;
  answers?: Array<{ id: string; selected: string[]; custom?: string }>;
  decision?: 'allowed-once' | 'rejected';
  remember?: boolean;
}
export type RunEventType =
  | 'run.started'
  | 'run.completed'
  | 'run.failed'
  | 'run.cancelled'
  | 'assistant.start'
  | 'assistant.delta'
  | 'assistant.commit'
  | 'assistant.abandoned'
  | 'thinking.delta'
  | 'tool.started'
  | 'tool.completed'
  | 'tool.failed'
  | 'interaction.requested'
  | 'interaction.resolved'
  | 'evidence.added'
  | 'usage.updated'
  | 'artifact.created'
  | 'artifact.opened'
  | 'agent.status'
  | 'context.updated'
  | 'goal.updated'
  | 'runtime.event';
export interface RunEvent {
  eventSchemaVersion: '1';
  eventId: string;
  projectId: string;
  sessionId: string;
  turnId: string;
  runId: string;
  seq: number;
  timestamp: number;
  type: RunEventType;
  payload: Record<string, unknown>;
}
export interface ToolAction {
  id: string;
  title: string;
  description: string;
  inputSchema: JsonSchema;
  outputSchema: JsonSchema;
  executor: {
    runtime: 'node' | 'python' | 'http';
    entry?: string;
    export?: string;
    url?: string;
    method?: 'GET' | 'POST';
  };
  capabilities: string[];
  effects: Array<'read' | 'write' | 'network' | 'execute'>;
  timeoutMs: number;
  retry: number;
  parallelSafe: boolean;
  idempotent: boolean;
  examples?: Array<{ input: unknown; output: unknown }>;
}
export interface ToolPackageActions {
  id: string;
  name?: string;
  description?: string;
  aliases?: string[];
  actions: ToolAction[];
}
export interface ToolDescriptor {
  id: string;
  name: string;
  title: string;
  description: string;
  revision: string;
  /** User-facing names that let the model associate an explicit prompt/Skill reference with this tool. */
  aliases?: string[];
  inputSchema: JsonSchema;
  outputSchema?: JsonSchema;
  effects: ToolAction['effects'];
  timeoutMs: number;
  parallelSafe: boolean;
  idempotent: boolean;
}
export interface RuntimeBundleManifest {
  runtimeId: 'deepseek-harness';
  bundleId: string;
  coreVersion: string;
  coreCommit?: string;
  adapterVersion: string;
  hostProtocolRange: string;
  platform: string;
  arch: string;
  nodeVersion: string;
  entry: string;
  node: string;
  files: Record<string, string>;
  source: string;
}
export interface ChatRuntimePort {
  describe(): Promise<RuntimeDescriptor>;
  listAgents(): Promise<AgentDescriptor[]>;
  startTurn(input: RuntimeTurnInput): Promise<{ runId: string }>;
  respond(input: RunResponse): Promise<void>;
  cancel(input: {
    runId?: string;
    sessionId?: string;
    idempotencyKey?: string;
    reason?: string;
  }): Promise<void>;
  events(runId: string, afterSeq?: number): Promise<RunEvent[]>;
  onEvent(listener: (event: RunEvent) => void): () => void;
  setPermission?(sessionId: string, mode: PermissionMode): Promise<void>;
  controlGoal?(sessionId: string, action: 'pause' | 'clear'): Promise<void>;
  exportSession?(sessionId: string): Promise<Record<string, unknown>>;
}
export function assertRecord(value: unknown): asserts value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Expected object');
}
export function validateTurn(value: unknown): asserts value is RuntimeTurnInput {
  assertRecord(value);
  const text = (
    record: Record<string, unknown>,
    key: string,
    max: number,
    optional = false,
    empty = false,
  ) => {
    const v = record[key];
    if (optional && v === undefined) return;
    if (typeof v !== 'string' || v.length > max || (!empty && !v.trim()) || /\u0000/.test(v))
      throw new Error('Invalid ' + key);
  };
  for (const key of [
    'sessionId',
    'projectId',
    'turnId',
    'idempotencyKey',
    'modelProfileId',
    'agentId',
  ])
    text(value, key, 200);
  for (const key of ['rawIntent', 'displayInput']) text(value, key, 1_000_000, false, true);
  if (!['ask', 'plan'].includes(String(value.modeId))) throw new Error('Invalid mode');
  if (
    value.permissionMode !== undefined &&
    !['read-only', 'workspace-write', 'danger-full-access'].includes(String(value.permissionMode))
  )
    throw new Error('Invalid permission mode');
  if (value.command !== undefined && !['goal', 'compact'].includes(String(value.command)))
    throw new Error('Invalid command');
  for (const key of ['folderPaths', 'sourceRefs', 'invocations'])
    if (!Array.isArray(value[key])) throw new Error('Invalid ' + key);
  const roots = value.folderPaths as unknown[];
  if (
    roots.length > 50 ||
    roots.some((p) => typeof p !== 'string' || !p.trim() || p.length > 4096 || p.includes('\0'))
  )
    throw new Error('Invalid workspace');
  const refs = value.sourceRefs as unknown[];
  if (refs.length > 10) throw new Error('最多上传 10 个附件');
  for (const ref of refs) {
    assertRecord(ref);
    for (const key of ['sourceId', 'revision', 'name', 'mimeType'])
      text(ref, key, key === 'name' ? 240 : 200);
    if (
      !['base64', 'utf8'].includes(String(ref.encoding)) ||
      !Number.isSafeInteger(ref.size) ||
      Number(ref.size) < 0 ||
      Number(ref.size) > 10 * 1024 * 1024
    )
      throw new Error('Invalid source');
    if (ref.originalAvailable !== undefined && typeof ref.originalAvailable !== 'boolean')
      throw new Error('Invalid originalAvailable');
  }
  const invocations = value.invocations as unknown[];
  if (invocations.length > 100) throw new Error('Too many invocations');
  for (const invocation of invocations) {
    assertRecord(invocation);
    text(invocation, 'command', 240);
    for (const key of ['resourceId', 'resourceRevision', 'kind', 'scope', 'label'])
      text(invocation, key, 1000, true);
    text(invocation, 'token', 10000, true);
  }
  for (const key of ['resourceAgentAppId', 'kbCollectionId']) text(value, key, 200, true);
  text(value, 'systemPrompt', 200000, true, true);
  if (value.kbEnabled !== undefined && typeof value.kbEnabled !== 'boolean')
    throw new Error('Invalid knowledge option');
  for (const [key, max] of [
    ['temperature', 2],
    ['topP', 1],
  ] as const)
    if (
      value[key] !== undefined &&
      (typeof value[key] !== 'number' ||
        !Number.isFinite(value[key]) ||
        Number(value[key]) < 0 ||
        Number(value[key]) > max)
    )
      throw new Error('Invalid ' + key);
  if (value.history !== undefined) {
    if (!Array.isArray(value.history) || value.history.length > 1000)
      throw new Error('Invalid history');
    for (const entry of value.history) {
      assertRecord(entry);
      if (!['system', 'user', 'assistant'].includes(String(entry.role)))
        throw new Error('Invalid history role');
      text(entry, 'content', 1_000_000, false, true);
    }
  }
  if (JSON.stringify(value).length > 2 * 1024 * 1024) throw new Error('Turn payload exceeds 2 MiB');
}
