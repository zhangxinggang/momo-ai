import type { RunEvent } from '@momo/agent-contracts';

export interface INormalizedChatUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

function readUsageNumber(usage: Record<string, unknown> | undefined, keys: string[]): number {
  for (const key of keys) {
    const value = Number(usage?.[key]);
    if (Number.isFinite(value) && value >= 0) return Math.round(value);
  }
  return 0;
}

/** 兼容 Harness / OpenAI / Anthropic 风格的 usage 字段。 */
export function normalizeChatUsage(
  usage: Record<string, unknown> | undefined,
): INormalizedChatUsage {
  const promptTokens = readUsageNumber(usage, [
    'inputTokens',
    'input_tokens',
    'promptTokens',
    'prompt_tokens',
  ]);
  const completionTokens = readUsageNumber(usage, [
    'outputTokens',
    'output_tokens',
    'completionTokens',
    'completion_tokens',
  ]);
  const reportedTotal = readUsageNumber(usage, ['totalTokens', 'total_tokens']);
  return {
    promptTokens,
    completionTokens,
    totalTokens: reportedTotal || promptTokens + completionTokens,
  };
}

export function formatResponseTime(elapsedMs: number): string {
  return `${Math.max(0, elapsedMs / 1000).toFixed(2)}s`;
}

const TERMINAL_RUN_EVENTS = new Set<RunEvent['type']>([
  'run.completed',
  'run.failed',
  'run.cancelled',
]);

/**
 * Prefer the duration saved by the request path. Older/recovered Harness messages may have an
 * empty duration, so derive a stable fallback from their persisted run events.
 */
export function resolveResponseTime(
  responseTime: string | undefined,
  events: RunEvent[] | undefined,
): string | undefined {
  const saved = responseTime?.trim();
  if (saved) return saved;
  if (!events?.length) return undefined;

  const validEvents = events.filter(
    (event) => Number.isFinite(event.timestamp) && event.timestamp >= 0,
  );
  const terminalEvent = [...validEvents]
    .reverse()
    .find((event) => TERMINAL_RUN_EVENTS.has(event.type));
  if (!terminalEvent) return undefined;

  const startedEvent = validEvents.find((event) => event.type === 'run.started') ?? validEvents[0];
  if (!startedEvent || terminalEvent.timestamp < startedEvent.timestamp) return undefined;

  return formatResponseTime(terminalEvent.timestamp - startedEvent.timestamp);
}
