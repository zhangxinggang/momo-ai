import type { IChatGeneratedView } from '@momo/aichat';
import { openuiPrompt, validateGeneratedView } from '@renderer/services/custom-tool/generation';

const OPENUI_BLOCK = /^```openui[^\S\r\n]*\r?\n([\s\S]*?)(?:^```[^\S\r\n]*$|$(?![\s\S]))/gm;

export function runtimeViewNotes(content: string): string {
  return content.includes('```openui') ? content.replace(OPENUI_BLOCK, '').trim() : '';
}

export function getRuntimeViewPrompt(): string {
  return [
    '本轮用户选择界面模式。先按显式 Skill/Command 完成文件读取、分析和所需工具操作，再遵循技能的界面规范输出一个 ```openui 代码块。技能中的业务模块、字段、布局和显隐规则优先；宿主只提供通用组件，不添加业务按钮或栏目。需要文件预览时用 FilePreview(sourceId)，ID 取自宿主附件清单或 artifact_create 返回的 sourceRef.sourceId。生成文档先写入会话 temp 再用 artifact_create 的 path 参数注册，禁止用文本冒充文档排版。保留必要的文件产物和覆盖说明。',
    openuiPrompt('chat'),
    '以上组件语法用于最终界面代码；本轮在完成技能工作后将源码放入唯一的 openui 围栏中，不另起通用界面生成请求。',
  ].join('\n\n');
}

export function projectRuntimeView(
  content: string,
  streaming: boolean,
): IChatGeneratedView | undefined {
  const blocks = [...content.matchAll(OPENUI_BLOCK)];
  const source =
    blocks.at(-1)?.[1]?.trim() ?? (/^root\s*=/.test(content.trim()) ? content.trim() : '');
  if (!source) return undefined;
  const error = !streaming
    ? blocks.length > 1
      ? '请仅输出一个界面代码块'
      : validateGeneratedView(source, 'openui')
    : null;
  return {
    kind: 'openui',
    content: source,
    status: streaming ? 'generating' : error ? 'error' : 'complete',
    ...(error ? { errorMessage: error } : {}),
  };
}
