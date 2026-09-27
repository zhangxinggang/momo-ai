import { validateToolIdentifier } from '@/shared/custom-tool-plugin';
import type { ICustomToolPlugin, ICustomToolPluginValidation } from '@/types/modules';
import Ajv from 'ajv';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { Script } from 'node:vm';
import { Worker } from 'node:worker_threads';

const MAX_BYTES = 128 * 1024;
const ajv = new Ajv({ strict: true, allErrors: true, validateFormats: false });
const validators = new Map<string, ReturnType<Ajv['compile']>>();
function compileSchema(schema: Record<string, unknown>) {
  const key = JSON.stringify(schema);
  const existing = validators.get(key);
  if (existing) return existing;
  if (validators.size >= 128) {
    validators.clear();
    ajv.removeSchema();
  }
  const validate = ajv.compile(schema);
  validators.set(key, validate);
  return validate;
}

export function pluginRevision(content: string, plugin: ICustomToolPlugin): string {
  return createHash('sha256').update(JSON.stringify({ content, plugin })).digest('hex');
}

export function checkPlugin(content: string, plugin: ICustomToolPlugin) {
  if (!plugin || typeof plugin !== 'object') throw Error('缺少插件定义');
  const error = validateToolIdentifier(plugin.identifier);
  if (error) throw Error(error);
  if (
    typeof plugin.description !== 'string' ||
    !plugin.description.trim() ||
    plugin.description.length > 4000
  )
    throw Error('插件描述不能为空或超过 4000 字');
  if (
    typeof content !== 'string' ||
    Buffer.byteLength(content) > MAX_BYTES ||
    !/^\s*(?:async\s+)?function\s+execute\s*\(/.test(content)
  )
    throw Error('插件必须提供 function execute(input)，且源码不能超过 128KB');
  new Script(`(${content}\n)`, { filename: 'execute.js' });
  if (!plugin.inputSchema || plugin.inputSchema.type !== 'object')
    throw Error('输入参数必须是 object JSON Schema');
  if (
    !plugin.outputSchema ||
    typeof plugin.outputSchema !== 'object' ||
    Array.isArray(plugin.outputSchema)
  )
    throw Error('缺少输出 JSON Schema');
  if (Buffer.byteLength(JSON.stringify(plugin)) > MAX_BYTES) throw Error('插件定义超过 128KB');
  compileSchema(plugin.inputSchema);
  compileSchema(plugin.outputSchema);
  if (!Array.isArray(plugin.tests) || !plugin.tests.length || plugin.tests.length > 8)
    throw Error('插件须包含 1–8 个有预期输出的测试用例');
  for (const test of plugin.tests) {
    if (
      !test ||
      typeof test.name !== 'string' ||
      !test.name.trim() ||
      !Object.hasOwn(test, 'expected')
    )
      throw Error('测试用例须包含名称、输入和预期输出');
    assertSchema(plugin.inputSchema, test.input);
    assertSchema(plugin.outputSchema, test.expected);
  }
}

function assertSchema(schema: Record<string, unknown>, value: unknown) {
  const validate = compileSchema(schema);
  if (!validate(value)) throw Error(`参数或结果不符合定义：${ajv.errorsText(validate.errors)}`);
}

// No host object/function enters the VM. A separate, disposable worker bounds memory,
// synchronous loops and never-settling promises; it exposes no filesystem/network globals.
const WORKER_SOURCE = `
const { parentPort, workerData } = require('node:worker_threads');
const vm = require('node:vm');
(async () => {
  try {
    const context = vm.createContext(Object.create(null), { codeGeneration: { strings: false, wasm: false } });
    const script = new vm.Script('(async () => { const execute = (' + workerData.content + '\\n); const result = await execute(JSON.parse(' + JSON.stringify(workerData.input) + ')); return JSON.stringify(result); })()');
    const json = await script.runInContext(context, { timeout: 1500 });
    if (typeof json !== 'string' || Buffer.byteLength(json) > 1048576) throw Error('插件必须返回不超过 1MB 的 JSON 数据');
    parentPort.postMessage({ json });
  } catch (error) { parentPort.postMessage({ error: String(error.message || error).slice(0, 4000) }); }
})();
`;

export async function executePlugin(
  content: string,
  plugin: ICustomToolPlugin,
  input: unknown,
  signal?: AbortSignal,
): Promise<unknown> {
  checkPlugin(content, plugin);
  const serialized = JSON.stringify(input);
  if (serialized === undefined || Buffer.byteLength(serialized) > 1024 * 1024)
    throw Error('输入超过 1MB 或不是 JSON');
  assertSchema(plugin.inputSchema, input);
  signal?.throwIfAborted();
  const output = await new Promise<unknown>((resolve, reject) => {
    const worker = new Worker(WORKER_SOURCE, {
      eval: true,
      workerData: { content, input: serialized },
      resourceLimits: { maxOldGenerationSizeMb: 64, maxYoungGenerationSizeMb: 16, stackSizeMb: 4 },
    });
    let settled = false;
    const finish = (error?: Error, value?: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      void worker.terminate().then(() => (error ? reject(error) : resolve(value)), reject);
    };
    const abort = () => finish(Error('插件调用已取消'));
    const timer = setTimeout(() => finish(Error('插件执行超时（5 秒）')), 5000);
    worker.once('error', (error) => finish(error instanceof Error ? error : Error(String(error))));
    worker.once('exit', () => finish(Error('插件执行进程意外退出')));
    worker.once('message', (message) => {
      try {
        finish(
          message.error ? Error(message.error) : undefined,
          message.json ? JSON.parse(message.json) : undefined,
        );
      } catch (error) {
        finish(error as Error);
      }
    });
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) abort();
  });
  assertSchema(plugin.outputSchema, output);
  return output;
}

export async function validatePlugin(
  content: string,
  plugin: ICustomToolPlugin,
): Promise<ICustomToolPluginValidation> {
  checkPlugin(content, plugin);
  const results: ICustomToolPluginValidation['results'] = [];
  for (const test of plugin.tests) {
    const output = await executePlugin(content, plugin, test.input);
    if (!isDeepStrictEqual(output, test.expected))
      throw Error(
        `测试「${test.name}」未通过：实际 ${JSON.stringify(output).slice(0, 1000)}；预期 ${JSON.stringify(test.expected).slice(0, 1000)}`,
      );
    results.push({ name: test.name, output });
  }
  return { revision: pluginRevision(content, plugin), results };
}
