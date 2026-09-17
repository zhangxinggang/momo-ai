export type EAiChatGenerationScope =
  | 'prompt'
  | 'skill'
  | 'kb'
  | 'note'
  | 'chat'
  | 'toolbox'
  | 'workflow';

const activeOwners = new Map<symbol, EAiChatGenerationScope>();

/** 记录一个 AI 入口的生成状态；非生成态直接移除，避免残留无效记录。 */
export function setAiChatGenerationActivity(
  owner: symbol,
  scope: EAiChatGenerationScope,
  isGenerating: boolean,
): void {
  if (isGenerating) {
    activeOwners.set(owner, scope);
    return;
  }
  activeOwners.delete(owner);
}

export function clearAiChatGenerationActivity(owner: symbol): void {
  activeOwners.delete(owner);
}

/** 不传 scope 时检查应用内全部 AI 入口。 */
export function hasActiveAiChatGeneration(scope?: EAiChatGenerationScope): boolean {
  if (!scope) {
    return activeOwners.size > 0;
  }
  return Array.from(activeOwners.values()).some((value) => value === scope);
}
