export const MIN_CHAT_OUTPUT_TOKENS = 1;
export const MAX_CHAT_OUTPUT_TOKENS = 131_072;

export function normalizeChatMaxTokens(value: unknown, fallback = 2048): number {
  const normalizedFallback = Number.isFinite(Number(fallback))
    ? Math.trunc(Number(fallback))
    : 2048;
  const numericValue = Number(value);
  const candidate = Number.isFinite(numericValue) ? Math.trunc(numericValue) : normalizedFallback;

  return Math.min(MAX_CHAT_OUTPUT_TOKENS, Math.max(MIN_CHAT_OUTPUT_TOKENS, candidate));
}
