import type { IChatStreamMessage } from '@momo/aichat';

const SYSTEM_PROMPT = `你是一个前端工具页生成助手。根据用户需求生成完整可运行的 HTML 单文件页面（含必要的 CSS/JS）。
要求：
1. 只输出 HTML 代码本身，不要 Markdown 围栏，不要解释文字。
2. 若用户提供了当前 HTML，请在其基础上按需求修改，并输出完整最新 HTML。
3. 页面应自包含、可直接在浏览器打开。`;

/** 从模型输出中提取 HTML（去掉可能的代码围栏） */
export function extractHtmlFromModelOutput(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:html)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }
  return trimmed;
}

/**
 * 单轮生成/改写：系统提示 + 当前 HTML（若有）+ 用户指令。
 * 不含历史多轮。
 */
export function buildToolHtmlMessages(
  currentHtml: string,
  instruction: string,
): IChatStreamMessage[] {
  const htmlPart = currentHtml.trim()
    ? `当前 HTML：\n${currentHtml.trim()}\n\n用户需求：\n${instruction.trim()}`
    : `用户需求：\n${instruction.trim()}`;

  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: htmlPart },
  ];
}
