import { getBuiltinSkillPrompt } from '@/shared/builtin-skills';
import type { IChatStreamMessage } from '@momo/aichat';

/** 单轮改写：当前笔记作为上下文，模型只输出新的全文 */
export function buildNoteRewriteMessages(
  noteContent: string,
  instruction: string,
): IChatStreamMessage[] {
  const body = noteContent.trim() ? noteContent : '（当前笔记为空）';
  const system = getBuiltinSkillPrompt('noteRewrite', { noteContent: body });

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
