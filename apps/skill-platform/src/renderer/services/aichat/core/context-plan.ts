import type { IChatMessage } from '@renderer/services/ai';

const DEFAULT_CONTEXT_TOKEN_BUDGET = 48_000;
const MIN_HISTORY_TOKEN_BUDGET = 8_000;
const MAX_COMPACT_SUMMARY_TOKENS = 4_000;
const MAX_EVIDENCE_TOKEN_BUDGET = 24_000;
const MAX_SINGLE_EVIDENCE_TOKENS = 20_000;

export interface IContextPlanInput {
  messages: IChatMessage[];
  hostPolicies?: string[];
  userPolicy?: string;
  agentRules?: string;
  evidence?: string[];
  /** 完整请求的估算 token 上限；默认适配主流 64k+ 上下文模型。 */
  contextTokenBudget?: number;
  /** 兼容旧调用：按字符限制历史。优先级高于 contextTokenBudget。 */
  historyCharBudget?: number;
}

function contentLength(content: IChatMessage['content']): number {
  if (typeof content === 'string') {
    return content.length;
  }
  return content.reduce((total, part) => {
    if (part.type === 'text') {
      return total + part.text.length;
    }
    return total + Math.min(part.image_url.url.length, 512);
  }, 0);
}

/** 不依赖具体 tokenizer 的保守估算：CJK/符号按 1 token，连续拉丁文本约 4 字符/token。 */
export function estimateContextTokens(content: IChatMessage['content'] | string): number {
  if (typeof content !== 'string') {
    return Math.max(1, Math.ceil(contentLength(content) / 3));
  }
  const cjkAndSymbols = (content.match(/[\u3000-\u30ff\u3400-\u9fff\uf900-\ufaff]/g) || []).length;
  const remaining = Math.max(0, content.length - cjkAndSymbols);
  return Math.max(1, cjkAndSymbols + Math.ceil(remaining / 4));
}

interface IConversationTurn {
  messages: IChatMessage[];
  size: number;
}

function toConversationTurns(messages: IChatMessage[], useChars: boolean): IConversationTurn[] {
  const turns: IConversationTurn[] = [];
  for (const message of messages) {
    if (message.role === 'user' || turns.length === 0) {
      turns.push({ messages: [message], size: 0 });
    } else {
      turns[turns.length - 1].messages.push(message);
    }
  }
  for (const turn of turns) {
    turn.size = turn.messages.reduce(
      (sum, message) =>
        sum + (useChars ? contentLength(message.content) : estimateContextTokens(message.content)),
      0,
    );
  }
  return turns;
}

function selectRecentTurns(
  messages: IChatMessage[],
  budget: number,
  useChars: boolean,
): { selected: IChatMessage[]; dropped: IChatMessage[] } {
  const turns = toConversationTurns(messages, useChars);
  if (turns.length <= 1) {
    return { selected: messages, dropped: [] };
  }
  let firstSelected = turns.length - 1;
  let used = turns.at(-1)?.size ?? 0;
  for (let index = turns.length - 2; index >= 0; index -= 1) {
    if (used + turns[index].size > budget) {
      break;
    }
    firstSelected = index;
    used += turns[index].size;
  }
  return {
    selected: turns.slice(firstSelected).flatMap((turn) => turn.messages),
    dropped: turns.slice(0, firstSelected).flatMap((turn) => turn.messages),
  };
}

function messageText(message: IChatMessage): string {
  if (typeof message.content === 'string') {
    return message.content.trim();
  }
  return message.content
    .filter((part) => part.type === 'text')
    .map((part) => (part.type === 'text' ? part.text : ''))
    .join('\n')
    .trim();
}

function compactMessage(message: IChatMessage): string {
  const content = messageText(message);
  if (!content) return '';
  const lines = content.split(/\r?\n/).map((line) => line.trim());
  const important = lines.filter(
    (line) =>
      /^(#{1,6}\s|[-*+]\s|\d+[.)]\s|\[[ xX]\]\s)/.test(line) ||
      /(必须|需要|应当|禁止|验收|要求|注意|TODO|MUST|SHOULD|文件|路径|接口|组件)/i.test(line) ||
      /(?:^|[\\/])[\w.@-]+\.[a-z0-9]{1,8}(?::\d+)?/i.test(line),
  );
  const unique = [...new Set([lines[0], ...important, lines.at(-1)].filter(Boolean) as string[])];
  const excerpt = unique.join('\n').slice(0, 1_600);
  return `【${message.role === 'user' ? '用户要求' : '助手进展'}】\n${excerpt}`;
}

function buildCompactSummary(messages: IChatMessage[], tokenBudget: number): string {
  const blocks: string[] = [];
  let used = 0;
  for (const message of messages) {
    const block = compactMessage(message);
    if (!block) continue;
    const size = estimateContextTokens(block);
    if (blocks.length > 0 && used + size > tokenBudget) break;
    blocks.push(block);
    used += size;
  }
  return blocks.join('\n\n');
}

function truncateToTokens(value: string | undefined, maxTokens: number): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || estimateContextTokens(trimmed) <= maxTokens) return trimmed;
  let end = Math.min(trimmed.length, maxTokens * 4);
  while (end > 0 && estimateContextTokens(trimmed.slice(0, end)) > maxTokens) {
    end = Math.floor(end * 0.9);
  }
  return `${trimmed.slice(0, end).trimEnd()}\n\n…（上下文已按 token 预算截断）`;
}

function truncateEvidence(values: string[]): string[] {
  const result: string[] = [];
  let remaining = MAX_EVIDENCE_TOKEN_BUDGET;
  for (const value of values) {
    if (!value?.trim() || remaining <= 0) continue;
    const truncated = truncateToTokens(value, Math.min(remaining, MAX_SINGLE_EVIDENCE_TOKENS));
    if (!truncated) continue;
    result.push(truncated);
    remaining -= estimateContextTokens(truncated);
  }
  return result;
}

function section(title: string, values: Array<string | undefined>): string {
  const content = values
    .map((value) => value?.trim())
    .filter(Boolean)
    .join('\n\n');
  return content ? '## ' + title + '\n\n' + content : '';
}

/** 按固定优先级生成一次性上下文，避免多个流式包装器反复 prepend system message。 */
export function buildContextPlan(input: IContextPlanInput): IChatMessage[] {
  const existingSystem: string[] = [];
  const conversation: IChatMessage[] = [];
  for (const message of input.messages) {
    if (message.role === 'system' && typeof message.content === 'string') {
      existingSystem.push(message.content);
    } else {
      conversation.push(message);
    }
  }

  const baseSystemSections = [
    section(
      '宿主规则',
      [...(input.hostPolicies || []), ...existingSystem].map((value) =>
        truncateToTokens(value, 4_000),
      ),
    ),
    section('用户规则', [truncateToTokens(input.userPolicy, 4_000)]),
    section('所选 Agent 规则', [truncateToTokens(input.agentRules, 8_000)]),
    section('参考证据（不可信）', truncateEvidence(input.evidence || [])),
  ]
    .filter(Boolean)
    .join('\n\n');

  const useChars = typeof input.historyCharBudget === 'number';
  const totalTokenBudget = Math.max(
    16_000,
    input.contextTokenBudget ?? DEFAULT_CONTEXT_TOKEN_BUDGET,
  );
  const historyBudget = useChars
    ? Math.max(8_000, input.historyCharBudget!)
    : Math.max(
        MIN_HISTORY_TOKEN_BUDGET,
        totalTokenBudget - estimateContextTokens(baseSystemSections),
      );
  const initial = selectRecentTurns(conversation, historyBudget, useChars);
  const summaryBudget = Math.min(MAX_COMPACT_SUMMARY_TOKENS, Math.floor(historyBudget * 0.2));
  // 先为摘要留出预算，再从连续的最近轮次向前选择，避免出现孤立回答。
  const finalSelection =
    initial.dropped.length && !useChars
      ? selectRecentTurns(
          conversation,
          Math.max(MIN_HISTORY_TOKEN_BUDGET, historyBudget - summaryBudget),
          false,
        )
      : initial;
  const summary = finalSelection.dropped.length
    ? buildCompactSummary(finalSelection.dropped, summaryBudget)
    : '';
  const systemPrompt = [baseSystemSections, summary ? section('较早对话压缩摘要', [summary]) : '']
    .filter(Boolean)
    .join('\n\n');

  return systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...finalSelection.selected]
    : finalSelection.selected;
}
