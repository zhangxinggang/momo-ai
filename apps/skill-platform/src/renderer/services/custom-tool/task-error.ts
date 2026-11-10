import type { IChatGeneratedView, RunProjection } from '@momo/aichat';

/** Hide Electron's transport wrapper while retaining the actionable runtime error. */
export function toolTaskErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return (
    message.replace(/^Error invoking remote method '[^']+':\s*(?:Error:\s*)?/, '').trim() ||
    '任务失败，请重试'
  );
}

/** Re-open completed runs whose only failure was the now-normalized Stack wrap position. */
export function hasRecoveredLayoutResult(
  snapshot: { error?: string; projection: RunProjection } | undefined,
  view: IChatGeneratedView | undefined,
): boolean {
  if (!snapshot?.error || view?.status !== 'complete' || snapshot.projection.status === 'cancelled')
    return false;
  if (
    !/^field "\/(?:align|justify)" expects one of \[[^\]]+\] but got (?:true|false)$/.test(
      toolTaskErrorMessage(snapshot.error),
    )
  )
    return false;
  const terminal = snapshot.projection.events
    .filter((event) => ['run.completed', 'run.failed', 'run.cancelled'].includes(event.type))
    .at(-1);
  return terminal?.type === 'run.completed';
}
