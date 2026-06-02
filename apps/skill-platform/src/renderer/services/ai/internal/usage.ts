export interface ITokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

function readUsageNumber(source: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }
  return 0;
}

/** 兼容 OpenAI / DashScope 等不同 usage 字段命名 */
export function normalizeTokenUsage(raw: unknown): ITokenUsage | undefined {
  if (!raw || typeof raw !== 'object') {
    return undefined;
  }

  const usage = raw as Record<string, unknown>;
  const promptTokens = readUsageNumber(usage, ['prompt_tokens', 'input_tokens', 'promptTokens']);
  const completionTokens = readUsageNumber(usage, [
    'completion_tokens',
    'output_tokens',
    'completionTokens',
  ]);
  let totalTokens = readUsageNumber(usage, ['total_tokens', 'totalTokens']);

  if (totalTokens <= 0 && (promptTokens > 0 || completionTokens > 0)) {
    totalTokens = promptTokens + completionTokens;
  }

  if (promptTokens <= 0 && completionTokens <= 0 && totalTokens <= 0) {
    return undefined;
  }

  return {
    promptTokens,
    completionTokens,
    totalTokens,
  };
}
