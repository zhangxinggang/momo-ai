import type { ECustomToolViewKind } from '@/types/modules';
import type { IChatStreamMessage } from '@momo/aichat';
import { createParser } from '@openuidev/react-lang';
import { openuiLibrary } from '@openuidev/react-ui/genui-lib';
import {
  chatCompletion,
  type IAIConfig,
  type IChatImageAttachment,
  type IChatMessage,
} from '@renderer/services/ai';

export interface ICustomToolGenerationOptions {
  temperature?: number;
  topP?: number;
  abortSignal?: AbortSignal;
  referenceImages?: IChatImageAttachment[];
}

const HTML_PROMPT = `你是 AIM 自定义工具界面生成器。根据用户要求创建一个完整的单文件 HTML 页面。
只输出 HTML 源码，不要 Markdown 围栏、解释、服务端代码、MCP、Skill 或外部执行协议。
页面可以使用内联 CSS 和 JavaScript；必须适合嵌入沙箱 iframe，不能依赖宿主私有 API。`;

function openuiPrompt(): string {
  return openuiLibrary.prompt({
    toolCalls: false,
    bindings: false,
    inlineMode: false,
    additionalRules: [
      '只输出 OpenUI Lang，不要 Markdown 围栏、解释、JSON、HTML、MCP、Skill、Query 或 Mutation。',
      '第一条声明必须是 root = ...。',
      '每个用户可能配置数据的组件都必须先赋给语义清晰且稳定的变量，再由父组件引用；不要把关键组件全部内联。',
      '使用真实的静态示例数据完成初始界面，后续宿主会通过组件数据面板覆盖属性。',
    ],
  });
}

export function resolveCustomToolGenerationKind(instruction: string): ECustomToolViewKind {
  const text = instruction.normalize('NFKC').toLowerCase();
  if (
    /(?:不要|不再|无需|禁止|避免|别).{0,12}html|(?:do\s+not|don't|without|avoid|no).{0,16}\bhtml\b/.test(
      text,
    )
  ) {
    return 'openui';
  }
  return /(?:生成|使用|输出|写成|改成|切换|保留|采用).{0,12}html|html\s*(?:页面|源码|文件|模式|版本)|(?:generate|create|build|use|output|write|convert|switch\s+to).{0,16}\bhtml\b|\bhtml\b\s*(?:page|source|file|mode|version)/.test(
    text,
  )
    ? 'html'
    : 'openui';
}

export function stripGeneratedView(raw: string, kind: ECustomToolViewKind): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(
    kind === 'html'
      ? /^\s*```html\s*([\s\S]*?)```\s*$/i
      : /^\s*```(?:openui|txt|text)?\s*([\s\S]*?)```\s*$/i,
  );
  return (fenced?.[1] ?? trimmed).trim();
}

export function validateGeneratedView(content: string, kind: ECustomToolViewKind): string | null {
  const source = content.trim();
  if (!source) return '生成内容为空';
  if (kind === 'html') {
    return /^\s*(?:<!doctype\s+html\b|<html\b)/i.test(source) ? null : '没有生成完整 HTML 页面';
  }
  if (!/^root\s*=/.test(source)) return 'OpenUI 必须以 root = 声明开始';
  const result = createParser(openuiLibrary.toJSONSchema()).parse(source);
  if (!result.root) return 'OpenUI 没有可渲染的 root 组件';
  if (result.meta.unresolved.length)
    return `OpenUI 存在未解析引用：${result.meta.unresolved.join('、')}`;
  if (result.meta.errors.length) return result.meta.errors.map((error) => error.message).join('；');
  return null;
}

export function buildCustomToolGenerationMessages(
  instruction: string,
  kind: ECustomToolViewKind,
  currentContent: string,
): IChatStreamMessage[] {
  const current = currentContent.trim()
    ? `\n\n当前界面源码如下，请在满足新要求时保留仍然有用的内容：\n${currentContent}`
    : '';
  return [
    { role: 'system', content: kind === 'openui' ? openuiPrompt() : HTML_PROMPT },
    { role: 'user', content: `${instruction}${current}` },
  ];
}

function attachReferenceImages(
  messages: IChatStreamMessage[],
  referenceImages: IChatImageAttachment[],
): IChatMessage[] {
  const result: IChatMessage[] = messages.map((message) => ({ ...message }));
  if (!referenceImages.length) return result;
  const last = result.length - 1;
  const content = result[last]?.content;
  const text = typeof content === 'string' ? content : '';
  result[last] = {
    ...result[last],
    content: [
      { type: 'text', text },
      ...referenceImages.map((image) => ({
        type: 'image_url' as const,
        image_url: {
          url: `data:${image.mimeType};base64,${image.base64}`,
          detail: 'auto' as const,
        },
      })),
    ],
  };
  return result;
}

export async function streamCustomToolView(
  config: IAIConfig,
  messages: IChatStreamMessage[],
  onChunk: (chunk: string) => void,
  options: ICustomToolGenerationOptions = {},
): Promise<void> {
  if (options.abortSignal?.aborted) return;
  let emitted = false;
  const result = await chatCompletion(
    config,
    attachReferenceImages(messages, options.referenceImages ?? []),
    {
      stream: true,
      temperature: options.temperature,
      topP: options.topP,
      onStream: (chunk) => {
        if (!chunk || options.abortSignal?.aborted) return;
        emitted = true;
        onChunk(chunk);
      },
    },
  );
  if (!emitted && result.content && !options.abortSignal?.aborted) onChunk(result.content);
}
