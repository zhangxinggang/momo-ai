import type { ToolAction, ToolPackageActions } from '@momo/agent-contracts';
import Ajv from 'ajv';
const ajv = new Ajv({ strict: true, allErrors: true, validateFormats: false });
export function validateSchema(schema: Record<string, unknown>, value: unknown) {
  const validate = ajv.compile(schema);
  if (!validate(value)) throw new Error('Schema 校验失败：' + ajv.errorsText(validate.errors));
}
export function validateActionManifest(raw: any): ToolPackageActions {
  if (raw && ('version' in raw || 'packageVersion' in raw)) throw new Error('工具不支持版本字段');
  if (
    raw?.kind !== 'tool' ||
    typeof raw.id !== 'string' ||
    !/^[a-zA-Z0-9._-]{1,80}$/.test(raw.id) ||
    !Array.isArray(raw.actions) ||
    raw.actions.length > 50
  )
    throw new Error('INVALID_ACTION_MANIFEST');
  for (const field of ['name', 'description']) {
    if (
      raw[field] !== undefined &&
      (typeof raw[field] !== 'string' || !raw[field].trim() || raw[field].length > 500)
    )
      throw new Error('INVALID_TOOL_' + field.toUpperCase());
  }
  if (
    raw.aliases !== undefined &&
    (!Array.isArray(raw.aliases) ||
      raw.aliases.length > 20 ||
      raw.aliases.some(
        (alias: unknown) => typeof alias !== 'string' || !alias.trim() || alias.length > 100,
      ))
  )
    throw new Error('INVALID_TOOL_ALIASES');
  const ids = new Set<string>();
  for (const action of raw.actions as ToolAction[]) {
    if (!action || !/^[a-zA-Z0-9._-]{1,80}$/.test(action.id) || ids.has(action.id))
      throw new Error('INVALID_ACTION_ID');
    ids.add(action.id);
    for (const field of ['title', 'description'])
      if (typeof (action as any)[field] !== 'string' || !(action as any)[field].trim())
        throw new Error('Missing ' + field);
    for (const schema of [action.inputSchema, action.outputSchema]) {
      if (!schema || typeof schema !== 'object' || !ajv.validateSchema(schema))
        throw new Error('INVALID_ACTION_SCHEMA');
      ajv.compile(schema);
    }
    if (action.inputSchema.type !== 'object') throw new Error('ACTION_INPUT_MUST_BE_OBJECT');
    if (!['node', 'python', 'http'].includes(action.executor?.runtime))
      throw new Error('INVALID_EXECUTOR');
    if (
      action.executor.export !== undefined &&
      (typeof action.executor.export !== 'string' ||
        !/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(action.executor.export))
    )
      throw new Error('INVALID_ACTION_EXPORT');
    if (action.executor.runtime === 'http') {
      if (action.executor.method !== undefined && !['GET', 'POST'].includes(action.executor.method))
        throw new Error('INVALID_ACTION_METHOD');
      const url = new URL(action.executor.url!);
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password)
        throw new Error('INVALID_ACTION_URL');
    } else if (
      !action.executor.entry ||
      !/^(actions|backend|scripts)\/[\w./-]+$/.test(action.executor.entry) ||
      action.executor.entry.split('/').includes('..')
    )
      throw new Error('INVALID_ACTION_ENTRY');
    if (
      !Array.isArray(action.capabilities) ||
      action.capabilities.some((c) => typeof c !== 'string')
    )
      throw new Error('INVALID_CAPABILITIES');
    if (
      !Array.isArray(action.effects) ||
      action.effects.some((e) => !['read', 'write', 'network', 'execute'].includes(e))
    )
      throw new Error('INVALID_EFFECTS');
    if (
      action.executor.runtime === 'http'
        ? !action.effects.includes('network')
        : !action.effects.includes('execute')
    )
      throw new Error('MISSING_EXECUTOR_EFFECT');
    if (!Number.isInteger(action.timeoutMs) || action.timeoutMs < 100 || action.timeoutMs > 300000)
      throw new Error('INVALID_TIMEOUT');
    if (
      !Number.isInteger(action.retry) ||
      action.retry < 0 ||
      action.retry > 2 ||
      (action.retry > 0 && !action.idempotent)
    )
      throw new Error('UNSAFE_RETRY');
    if (typeof action.parallelSafe !== 'boolean' || typeof action.idempotent !== 'boolean')
      throw new Error('INVALID_ACTION_POLICY');
    if (
      action.examples !== undefined &&
      (!Array.isArray(action.examples) || action.examples.length > 50)
    )
      throw new Error('INVALID_ACTION_EXAMPLES');
    for (const example of action.examples ?? []) {
      validateSchema(action.inputSchema, example.input);
      validateSchema(action.outputSchema, example.output);
    }
  }
  return raw;
}

/** AI 生成流程的发布约束；手工创建的空白页面工具仍可在编辑阶段存在。 */
export function validateCallableActionManifest(raw: any): ToolPackageActions {
  const manifest = validateActionManifest(raw);
  if (manifest.actions.length === 0)
    throw new Error('AI 生成的工具必须至少包含一个可供 AI 对话调用的 action');
  return manifest;
}
