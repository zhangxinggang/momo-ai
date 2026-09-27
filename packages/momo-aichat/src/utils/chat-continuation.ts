import type { IChatMessage } from '../types/chat';
import type { IChatSourceRef } from '../types/source';
import { findSlashInvocationTokens } from './slash-token';

export function isContinuationRequest(content: string): boolean {
  return /^(?:(?:请|请你|麻烦|帮我)\s*)?(?:继续|接着|接上|恢复|重试|重新执行|再试)|^(?:please\s+)?(?:continue|resume|retry|go\s+on)\b/i.test(
    content.trim(),
  );
}

/** Resolve within the current conversation, bounded by the clicked view or retried turn. */
export function continuationContext(
  messages: IChatMessage[],
  content: string,
  fromMessageId?: string,
) {
  const index = fromMessageId ? messages.findIndex((message) => message.id === fromMessageId) : -1;
  if (fromMessageId && index < 0) throw new Error('该界面不属于当前对话，请重新打开对应会话');
  const history = fromMessageId ? messages.slice(0, index + 1) : messages;
  if (!fromMessageId && !isContinuationRequest(content)) return { history };
  let task: IChatMessage | undefined;
  for (const message of [...history].reverse()) {
    if (message.role !== 'user') continue;
    if (message.requestSnapshot?.continuationOf) {
      task = history.find((item) => item.id === message.requestSnapshot!.continuationOf);
      if (task) break;
    }
    if (isContinuationRequest(message.content)) continue;
    task = message;
    break;
  }
  if (!task) task = [...history].reverse().find((message) => message.role === 'user');
  const invocations =
    task?.invocations ??
    (task?.invocation
      ? [task.invocation]
      : findSlashInvocationTokens(task?.requestSnapshot?.apiContent ?? task?.content ?? '').map(
          (item) => item.invocation,
        ));
  const command = (task?.requestSnapshot?.apiContent ?? task?.content ?? '')
    .trim()
    .match(/^\/[\p{L}][\p{L}\p{N}_:-]*(?=\s|$)/u)?.[0];
  return { history, task, invocations, command };
}

/** The latest attachment batch is the active material; a new upload explicitly replaces it. */
export function latestConversationSources(messages: IChatMessage[]): IChatSourceRef[] {
  for (const message of [...messages].reverse()) {
    const refs = [
      ...(message.requestSnapshot?.sourceRefs ?? []),
      ...(message.attachments ?? []).flatMap((attachment) =>
        attachment.sourceRef ? [attachment.sourceRef] : [],
      ),
    ];
    if (refs.length) return [...new Map(refs.map((ref) => [ref.sourceId, ref])).values()];
  }
  return (
    [...messages].reverse().find((message) => message.generatedView?.sourceRefs?.length)
      ?.generatedView?.sourceRefs ?? []
  );
}
