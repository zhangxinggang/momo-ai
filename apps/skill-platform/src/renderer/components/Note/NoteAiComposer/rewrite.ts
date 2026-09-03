import type { IChatStreamMessage } from '@momo/aichat';

/** 单轮改写：当前笔记作为上下文，模型只输出新的全文 */
export function buildNoteRewriteMessages(
  noteContent: string,
  instruction: string,
): IChatStreamMessage[] {
  const body = noteContent.trim() ? noteContent : '（当前笔记为空）';
  const system = `你正在改写用户的当前笔记。用户指令会要求你润色、缩短、补全，或就笔记内容作答。

约束：
1. 只输出改写后的完整 Markdown 正文，作为新的笔记全文
2. 不要解释、不要前言后语、不要用代码围栏包裹全文
3. 若用户是提问，把完整回答作为新的笔记正文

当前笔记：
${body}`;

  return [
    { role: 'system', content: system },
    { role: 'user', content: instruction },
  ];
}

/** 去掉模型偶尔包住全文的 markdown 代码围栏 */
export function unwrapFullDocumentFence(text: string): string {
  const trimmed = text.trim();
  const match = /^```(?:markdown|md)?\r?\n([\s\S]*?)\r?\n```$/i.exec(trimmed);
  return match?.[1] ?? text;
}
