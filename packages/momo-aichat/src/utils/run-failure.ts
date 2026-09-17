import type { RunEvent } from '@momo/agent-contracts';
export function runFailureMessage(payload: Record<string, unknown> = {}): string {
  if (typeof payload.message === 'string' && payload.message) return payload.message;
  if (payload.stopReason === 'max-tokens')
    return '模型输出达到设置的最大 Token 数，答复尚未完成。已有工具结果已保存，可提高模型输出上限后继续。';
  if (payload.stopReason === 'blocked') return '本轮执行被当前策略阻止，请检查权限和计划模式。';
  if (payload.stopReason === 'aborted') return '本轮生成已中断，已有输出和工具结果已保留。';
  return '本轮生成未能完成，请下载对话日志查看详细原因。';
}
export function runFailureDetails(events: RunEvent[]) {
  const failure = [...events].reverse().find((e) => e.type === 'run.failed')?.payload ?? {};
  const pending = new Set<unknown>();
  for (const event of events) {
    if (event.type === 'tool.started') pending.add(event.payload.callId);
    if (event.type === 'tool.completed' || event.type === 'tool.failed')
      pending.delete(event.payload.callId);
  }
  const uncertain = Boolean(
    failure.interrupted ||
    pending.size ||
    events.some((e) => e.type === 'tool.failed' && e.payload.unknownOutcome),
  );
  return {
    message: runFailureMessage(failure),
    uncertain,
    label: uncertain
      ? '执行中断 · 部分执行结果尚未确认'
      : failure.stopReason === 'max-tokens'
        ? '答复尚未完成 · 工具结果已保存'
        : '本轮未完成 · 已有输出已保留',
  };
}
