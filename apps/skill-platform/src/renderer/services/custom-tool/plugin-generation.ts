import type { ICustomToolPlugin, ICustomToolSaveInput } from '@/types/modules';
import type { IAIConfig } from '@renderer/services/ai';
import { validateCustomToolPlugin } from './api';
import { streamCustomToolView, type ICustomToolGenerationOptions } from './generation';

export function pluginGenerationPrompt(identifier: string): string {
  return `生成一个可复用的 DeepSeek Harness AI 插件实现。工具标识固定为 ${JSON.stringify(identifier)}。
只输出 JSON：{"content":"function execute(input) { ... }","plugin":{"identifier":${JSON.stringify(identifier)},"description":"具体中文功能描述、适用场景与限制","inputSchema":{"type":"object","properties":{},"required":[],"additionalProperties":false},"outputSchema":{},"tests":[{"name":"用例名称","input":{},"expected":{}}]}}。
根据用户需求设计具体功能、参数、description、title、默认值与输出 JSON Schema，参数以业务名称显示。实现必须是真实算法，禁止硬编码测试答案、占位返回和模拟调用。
执行环境为隔离 JavaScript，仅有语言标准内建（Math、JSON、Date、RegExp 等）；无 process、require、import、fetch、DOM、定时器、文件与网络访问。若需求依赖外部数据，将真实数据作为输入参数，明确说明，不编造数据。
content 为完整的 function execute(input) 或 async function execute(input)，可在函数内定义辅助函数。返回 JSON 可序列化业务数据；不得返回源码、HTML 或 Markdown 代码块。
输入必须为 object；使用严格 JSON Schema，类型与 required 一致，不使用外部 $ref 或 format。输出按业务字段组织，便于生成验证表单与结果界面。
至少给出两个不同输入的独立测试，覆盖常规与边界场景（最多 8 个），expected 必须为精确可比 JSON 结果；不要使用随机值或当前时间作为预期输出。`;
}

export function parsePluginGeneration(raw: string, identifier: string): ICustomToolSaveInput {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');
  const value = JSON.parse(cleaned);
  if (typeof value.content !== 'string' || !value.plugin || value.plugin.identifier !== identifier)
    throw Error('生成的插件标识或源码无效');
  return {
    kind: 'plugin',
    content: value.content,
    plugin: value.plugin as ICustomToolPlugin,
    components: {},
  };
}

export async function generateCustomToolPlugin(
  config: IAIConfig,
  input: {
    identifier: string;
    instruction: string;
    currentContent: string;
    currentPlugin?: ICustomToolPlugin;
  },
  onDraft: (draft: ICustomToolSaveInput, repairing: boolean) => void,
  options: ICustomToolGenerationOptions = {},
): Promise<ICustomToolSaveInput> {
  const messages = [
    { role: 'system' as const, content: pluginGenerationPrompt(input.identifier) },
    {
      role: 'user' as const,
      content:
        input.instruction +
        (input.currentContent
          ? '\n当前插件：\n' +
            JSON.stringify({ content: input.currentContent, plugin: input.currentPlugin })
          : ''),
    },
  ];
  let error: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    options.abortSignal?.throwIfAborted();
    let output = '';
    await streamCustomToolView(
      config,
      messages,
      (chunk) => {
        output += chunk;
      },
      options,
    );
    options.abortSignal?.throwIfAborted();
    try {
      const draft = parsePluginGeneration(output, input.identifier);
      await validateCustomToolPlugin(draft);
      options.abortSignal?.throwIfAborted();
      onDraft(draft, attempt > 0);
      return draft;
    } catch (failure) {
      if (options.abortSignal?.aborted) throw failure;
      error = failure;
      messages.push({
        role: 'user',
        content: `上一版未通过真实执行校验，请修复源码或参数契约，保留功能与独立测试，不要仅修改 expected 掩盖错误。错误：${String(failure)}\n上一版：${output}`,
      });
    }
  }
  throw error;
}
