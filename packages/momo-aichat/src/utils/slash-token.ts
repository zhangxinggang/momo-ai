import type { ISlashInvocation } from '../types/slash-command';

/**
 * 行内 Skill/Command token。元数据经 URI 编码后随消息持久化，编辑、重试和
 * 历史恢复时无需依赖易失的 React 状态。
 */
export const SLASH_INVOCATION_TOKEN_REGEX = /@\[slash:([^\]]+)\]/g;
export const SURFACE_SLASH_START = '\u2005\u2005\u2005\u2005';
export const SURFACE_SLASH_END = '\u2006';
export const SURFACE_SLASH_SKILL = '\u200b';
export const SURFACE_SLASH_COMMAND = '\u200c';
export const SURFACE_SLASH_REGEX = /\u2005\u2005\u2005\u2005([\u200b\u200c])([^\u2006]+)\u2006/g;

export interface ISlashInvocationTokenMatch {
  invocation: ISlashInvocation;
  token: string;
  start: number;
  end: number;
}

function normalizeInvocation(value: unknown): ISlashInvocation | null {
  if (!value || typeof value !== 'object') return null;
  const input = value as Partial<ISlashInvocation>;
  if (
    typeof input.resourceId !== 'string' ||
    typeof input.resourceRevision !== 'string' ||
    typeof input.command !== 'string' ||
    (input.kind !== 'skill' && input.kind !== 'command') ||
    !['application', 'project', 'global'].includes(String(input.scope))
  ) {
    return null;
  }
  return {
    resourceId: input.resourceId,
    resourceRevision: input.resourceRevision,
    command: input.command.startsWith('/') ? input.command : `/${input.command}`,
    label: typeof input.label === 'string' ? input.label : undefined,
    kind: input.kind,
    scope: input.scope!,
    category: typeof input.category === 'string' ? input.category : undefined,
    tags: Array.isArray(input.tags)
      ? input.tags.filter((tag): tag is string => typeof tag === 'string').slice(0, 8)
      : undefined,
  };
}

export function buildSlashInvocationToken(invocation: ISlashInvocation): string {
  const normalized = normalizeInvocation(invocation);
  if (!normalized) {
    throw new Error('Invalid slash invocation');
  }
  return `@[slash:${encodeURIComponent(JSON.stringify(normalized))}]`;
}

export function parseSlashInvocationToken(token: string): ISlashInvocation | null {
  const match = token.match(/^@\[slash:([^\]]+)\]$/);
  if (!match) return null;
  try {
    return normalizeInvocation(JSON.parse(decodeURIComponent(match[1])));
  } catch {
    return null;
  }
}

export function getSlashInvocationLabel(invocation: ISlashInvocation): string {
  return (invocation.label || invocation.command.replace(/^\//, '')).trim();
}

export function slashInvocationToSurfaceText(invocation: ISlashInvocation): string {
  const kindMarker = invocation.kind === 'skill' ? SURFACE_SLASH_SKILL : SURFACE_SLASH_COMMAND;
  return `${SURFACE_SLASH_START}${kindMarker}${getSlashInvocationLabel(invocation)}${SURFACE_SLASH_END}`;
}

export function findSlashInvocationTokens(value: string): ISlashInvocationTokenMatch[] {
  const result: ISlashInvocationTokenMatch[] = [];
  const regex = new RegExp(SLASH_INVOCATION_TOKEN_REGEX.source, 'g');
  let match: RegExpExecArray | null;
  while ((match = regex.exec(value))) {
    const invocation = parseSlashInvocationToken(match[0]);
    if (!invocation) continue;
    result.push({
      invocation: { ...invocation, token: match[0] },
      token: match[0],
      start: match.index,
      end: match.index + match[0].length,
    });
  }
  return result;
}

export function slashTokensToSurface(value: string): string {
  const matches = findSlashInvocationTokens(value);
  let result = value;
  for (const match of [...matches].reverse()) {
    const surface = slashInvocationToSurfaceText(match.invocation);
    result = `${result.slice(0, match.start)}${surface}${result.slice(match.end)}`;
  }
  return result;
}

export function slashTokensToPlainText(value: string): string {
  const matches = findSlashInvocationTokens(value);
  let result = value;
  for (const match of [...matches].reverse()) {
    const label = `/${getSlashInvocationLabel(match.invocation)}`;
    result = `${result.slice(0, match.start)}${label}${result.slice(match.end)}`;
  }
  return result;
}

export function removeSlashInvocationTokenAt(value: string, cursorPos: number): string | null {
  const hit = findSlashInvocationTokens(value).find(
    (item) => cursorPos > item.start && cursorPos <= item.end,
  );
  if (!hit) return null;
  return `${value.slice(0, hit.start)}${value.slice(hit.end)}`;
}
