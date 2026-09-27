import { getBuiltinSkillPrompt } from '@/shared/builtin-skills';
import type { ECustomToolGeneratedViewKind } from '@/types/modules';
import type { IChatGeneratedView, IChatStreamMessage } from '@momo/aichat';
import { createParser } from '@openuidev/react-lang';
import {
  chatCompletion,
  type IAIConfig,
  type IChatImageAttachment,
  type IChatMessage,
} from '@renderer/services/ai';
import { momoOpenuiLibrary } from './openui-library';

export interface ICustomToolGenerationOptions {
  temperature?: number;
  topP?: number;
  abortSignal?: AbortSignal;
  referenceImages?: IChatImageAttachment[];
  /** 聊天界面默认普通样式；工具箱继续使用自身的视觉规范。 */
  context?: 'chat' | 'toolbox';
}

export const CUSTOM_TOOL_TECH_DESIGN_GUIDANCE = getBuiltinSkillPrompt('customToolTechDesign');

function visualDesignPrompt(context: ICustomToolGenerationOptions['context']): string {
  if (context === 'chat') return getBuiltinSkillPrompt('chatViewDesign');
  return getBuiltinSkillPrompt('customToolVisualDesign', {
    techDesign: getBuiltinSkillPrompt('customToolTechDesign'),
  });
}

export function openuiPrompt(context?: ICustomToolGenerationOptions['context']): string {
  return momoOpenuiLibrary.prompt({
    toolCalls: false,
    bindings: false,
    inlineMode: false,
    additionalRules: [
      getBuiltinSkillPrompt('customToolOpenui', { visualDesign: visualDesignPrompt(context) }),
    ],
  });
}

export function resolveCustomToolGenerationKind(instruction: string): ECustomToolGeneratedViewKind {
  const text = instruction.normalize('NFKC').toLowerCase();
  if (
    /(?:不要|不再|无需|禁止|避免|别).{0,12}html|(?:do\s+not|don't|without|avoid|no).{0,16}\bhtml\b/.test(
      text,
    ) ||
    /(?:生成|使用|输出|写成|改成|切换|保留|采用).{0,12}openui|openui\s*(?:界面|源码|文件|模式|版本)/.test(
      text,
    )
  ) {
    return 'openui';
  }
  // 该技能强调高保真科技视觉，HTML 才能完整表达主题、纹理、地图/拓扑与响应式构图。
  if (/\/(?:custom-tool-tech-design)\b/.test(text)) return 'html';
  return /(?:生成|使用|输出|写成|改成|切换|保留|采用).{0,12}html|html\s*(?:页面|源码|文件|模式|版本)|(?:generate|create|build|use|output|write|convert|switch\s+to).{0,16}\bhtml\b|\bhtml\b\s*(?:page|source|file|mode|version)/.test(
    text,
  )
    ? 'html'
    : 'openui';
}

export function stripGeneratedView(raw: string, kind: ECustomToolGeneratedViewKind): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(
    kind === 'html'
      ? /^\s*```html\s*([\s\S]*?)```\s*$/i
      : /^\s*```(?:openui|txt|text)?\s*([\s\S]*?)```\s*$/i,
  );
  return (fenced?.[1] ?? trimmed).trim();
}

export function validateGeneratedView(
  content: string,
  kind: ECustomToolGeneratedViewKind,
): string | null {
  const source = content.trim();
  if (!source) return '生成内容为空';
  if (kind === 'html') {
    return /^\s*(?:<!doctype\s+html\b|<html\b)/i.test(source) ? null : '没有生成完整 HTML 页面';
  }
  if (!/^root\s*=/.test(source)) return '界面源码必须以 root = 声明开始';
  const result = createParser(momoOpenuiLibrary.toJSONSchema()).parse(source);
  if (!result.root) return '界面源码没有可渲染的 root 组件';
  if (result.meta.unresolved.length)
    return `界面源码存在未解析引用：${result.meta.unresolved.join('、')}`;
  if (result.meta.errors.length)
    return result.meta.errors
      .map((error) => error.message.replace(/openui/gi, '界面源码'))
      .join('；');
  return null;
}

export function buildCustomToolGenerationMessages(
  instruction: string,
  kind: ECustomToolGeneratedViewKind,
  currentContent: string,
  history: IChatStreamMessage[] = [],
  context?: ICustomToolGenerationOptions['context'],
): IChatStreamMessage[] {
  const current = currentContent.trim()
    ? `\n\n当前界面源码如下，请在满足新要求时保留仍然有用的内容：\n${currentContent}`
    : '';
  return [
    {
      role: 'system',
      content:
        kind === 'openui'
          ? openuiPrompt(context)
          : getBuiltinSkillPrompt('customToolHtml', { visualDesign: visualDesignPrompt(context) }),
    },
    ...history.filter((message) => message.role !== 'system'),
    { role: 'user', content: `${instruction}${current}` },
  ];
}

/** 工具箱与聊天界面模式共用生成、预览投影、校验和一次 OpenUI 修复。 */
export async function generateCustomToolView(
  config: IAIConfig,
  input: {
    instruction: string;
    kind: ECustomToolGeneratedViewKind;
    currentContent: string;
    history?: IChatStreamMessage[];
  },
  onUpdate: (view: IChatGeneratedView) => void,
  options: ICustomToolGenerationOptions = {},
): Promise<IChatGeneratedView> {
  const { kind } = input;
  const publish = (raw: string, status: IChatGeneratedView['status']): IChatGeneratedView => {
    const view = { kind, content: stripGeneratedView(raw, kind), status };
    onUpdate(view);
    return view;
  };
  options.abortSignal?.throwIfAborted();
  publish('', 'generating');
  let output = '';
  await streamCustomToolView(
    config,
    buildCustomToolGenerationMessages(
      input.instruction,
      kind,
      input.currentContent,
      input.history,
      options.context,
    ),
    (chunk) => publish((output += chunk), 'generating'),
    options,
  );
  options.abortSignal?.throwIfAborted();
  let content = stripGeneratedView(output, kind);
  let validationError = validateGeneratedView(content, kind);
  if (validationError && kind === 'openui') {
    publish(content, 'repairing');
    let repairedOutput = '';
    await streamCustomToolView(
      config,
      buildCustomToolOpenUIRepairMessages(content, validationError, options.context),
      (chunk) => publish((repairedOutput += chunk), 'repairing'),
      { ...options, temperature: 0.1, referenceImages: [] },
    );
    options.abortSignal?.throwIfAborted();
    content = stripGeneratedView(repairedOutput, kind);
    validationError = validateGeneratedView(content, kind);
  }
  if (validationError) throw new Error(validationError);
  return publish(content, 'complete');
}

export function buildCustomToolOpenUIRepairMessages(
  content: string,
  validationError: string,
  context?: ICustomToolGenerationOptions['context'],
): IChatStreamMessage[] {
  return [
    { role: 'system', content: openuiPrompt(context) },
    {
      role: 'user',
      content: getBuiltinSkillPrompt('customToolRepair', { validationError, content }),
    },
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
