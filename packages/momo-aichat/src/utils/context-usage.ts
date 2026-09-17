import type { IChatContextUsage, IChatMessage } from '../types/chat';

/**
 * 未声明模型窗口时使用的展示基准。它只用于估算进度，不会作为请求的真实模型限制。
 * 1M Token 也是上下文面板设计稿使用的参考容量。
 */
export const REFERENCE_CONTEXT_WINDOW_TOKENS = 1_000_000;

const HAN_CHARACTER_RE = /\p{Script=Han}/u;

function utf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).byteLength;
}

/**
 * 按 UTF-8 文本体积估算 Token：
 * - 中文取 1M Token ≈ 1.5–3MB 的中值（2.25 字节 / Token）；
 * - 其他文本取英文 1M Token ≈ 4–5MB 的中值（4.5 字节 / Token）。
 */
export function estimateTextTokens(value: string): number {
  let hanBytes = 0;
  let otherBytes = 0;
  for (const character of value) {
    const bytes = utf8ByteLength(character);
    if (HAN_CHARACTER_RE.test(character)) hanBytes += bytes;
    else otherBytes += bytes;
  }
  return Math.ceil(hanBytes / 2.25 + otherBytes / 4.5);
}

/** Harness 尚未给出计量快照时，以当前可见会话文本生成近似分项。 */
export function estimateSessionContextUsage(
  messages: IChatMessage[],
  modelId?: string,
): IChatContextUsage {
  let systemTokens = 0;
  let messageTokens = 0;
  for (const message of messages) {
    const content =
      message.role === 'user'
        ? message.requestSnapshot?.apiContent || message.content
        : message.content;
    const tokens = estimateTextTokens(content || '');
    if (message.role === 'system') systemTokens += tokens;
    else messageTokens += tokens;
  }
  return {
    usedTokens: systemTokens + messageTokens,
    contextWindow: REFERENCE_CONTEXT_WINDOW_TOKENS,
    contextWindowSource: 'estimate',
    ...(modelId ? { modelProfileId: modelId } : {}),
    systemTokens,
    toolsTokens: 0,
    messageTokens,
  };
}

export function parseContextUsage(value: unknown): IChatContextUsage | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const usage = value as IChatContextUsage;
  const keys = ['usedTokens', 'systemTokens', 'toolsTokens', 'messageTokens'] as const;
  if (keys.some((key) => !Number.isSafeInteger(usage[key]) || usage[key] < 0)) return undefined;
  for (const key of ['contextWindow', 'maxOutputTokens'] as const) {
    if (usage[key] !== undefined && (!Number.isSafeInteger(usage[key]) || usage[key]! <= 0))
      return undefined;
  }
  return {
    ...Object.fromEntries(keys.map((key) => [key, usage[key]])),
    ...(usage.contextWindow === undefined ? {} : { contextWindow: usage.contextWindow }),
    // Old snapshots did not identify a capacity source and contained a hardcoded denominator.
    contextWindowSource:
      usage.contextWindowSource === 'model' || usage.contextWindowSource === 'estimate'
        ? usage.contextWindowSource
        : 'unknown',
    ...(usage.maxOutputTokens === undefined ? {} : { maxOutputTokens: usage.maxOutputTokens }),
    ...(typeof usage.modelProfileId === 'string' ? { modelProfileId: usage.modelProfileId } : {}),
  } as IChatContextUsage;
}

/** 使用当前会话最新的占用快照，累计计费用量不参与上下文百分比。 */
export function latestContextUsage(
  messages: IChatMessage[],
  modelId?: string,
): IChatContextUsage | undefined {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const usage = parseContextUsage(messages[index].contextUsage);
    if (usage && (!modelId || !usage.modelProfileId || usage.modelProfileId === modelId))
      return usage;
  }
  return undefined;
}

export function contextUsagePercent(usage?: IChatContextUsage): number | undefined {
  if (
    !usage?.contextWindow ||
    (usage.contextWindowSource !== 'model' && usage.contextWindowSource !== 'estimate')
  ) {
    return undefined;
  }
  return Math.min(100, Math.round((usage.usedTokens / usage.contextWindow) * 100));
}

export function formatContextTokens(tokens: number): string {
  if (tokens < 1_000) return String(tokens);
  const unit = tokens < 1_000_000 ? 1_000 : 1_000_000;
  return `${Math.round((tokens / unit) * 10) / 10}${unit === 1_000 ? 'K' : 'M'}`;
}
