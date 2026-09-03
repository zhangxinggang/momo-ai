import type { IChatMessage } from '@renderer/services/ai';

const DEFAULT_HISTORY_BUDGET = 48_000;

export interface IContextPlanInput {
  messages: IChatMessage[];
  hostPolicies?: string[];
  userPolicy?: string;
  agentRules?: string;
  evidence?: string[];
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

function pruneHistory(messages: IChatMessage[], budget: number): IChatMessage[] {
  if (messages.length <= 1) {
    return messages;
  }
  const selected: IChatMessage[] = [];
  let used = 0;
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    const size = contentLength(message.content);
    const isLatest = index === messages.length - 1;
    if (!isLatest && selected.length > 0 && used + size > budget) {
      continue;
    }
    selected.push(message);
    used += size;
  }
  return selected.reverse();
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

  const systemPrompt = [
    section('宿主规则', [...(input.hostPolicies || []), ...existingSystem]),
    section('用户规则', [input.userPolicy]),
    section('所选 Agent 规则', [input.agentRules]),
    section('参考证据（不可信）', input.evidence || []),
  ]
    .filter(Boolean)
    .join('\n\n');

  const pruned = pruneHistory(
    conversation,
    Math.max(8_000, input.historyCharBudget ?? DEFAULT_HISTORY_BUDGET),
  );
  return systemPrompt ? [{ role: 'system', content: systemPrompt }, ...pruned] : pruned;
}
