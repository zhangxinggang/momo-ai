/** 笔记引用 token：@[note:path]（path 为笔记相对路径，如 asdfa/f.md） */
export const NOTE_MENTION_TOKEN_REGEX = /@\[note:([^\]|]+)(?:\|[^\]]+)?\]/g;

export function buildNoteMentionToken(path: string): string {
  return `@[note:${path}]`;
}

export interface INoteMentionMatch {
  path: string;
  start: number;
  end: number;
}

export function getNoteMentionDisplayPath(path: string): string {
  return path.replace(/\\/g, '/');
}

/** 解析文本中的笔记引用片段 */
export function parseNoteReferenceContent(
  content: string,
): Array<{ type: 'text'; value: string } | { type: 'mention'; path: string }> {
  const segments: Array<{ type: 'text'; value: string } | { type: 'mention'; path: string }> = [];
  const regex = new RegExp(NOTE_MENTION_TOKEN_REGEX.source, 'g');
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content))) {
    const start = match.index;
    if (start > lastIndex) {
      segments.push({ type: 'text', value: content.slice(lastIndex, start) });
    }
    segments.push({ type: 'mention', path: match[1] });
    lastIndex = start + match[0].length;
  }

  if (lastIndex < content.length) {
    segments.push({ type: 'text', value: content.slice(lastIndex) });
  }

  return segments;
}

/** 编辑区展示：起始 em 空格（icon 占位）+ 路径 + 结束分隔符，避免后续输入被吞进引用 */
export const SURFACE_MENTION_START = '\u2003';
export const SURFACE_MENTION_END = '\u2004';
export const SURFACE_MENTION_REGEX = /\u2003([^\u2004]+)\u2004/g;

export function mentionToSurfaceText(path: string): string {
  return `${SURFACE_MENTION_START}${getNoteMentionDisplayPath(path)}${SURFACE_MENTION_END}`;
}

export function valueToSurface(value: string): string {
  const regex = new RegExp(NOTE_MENTION_TOKEN_REGEX.source, 'g');
  return value.replace(regex, (_, path: string) => mentionToSurfaceText(path));
}

interface IValueSurfaceSegment {
  type: 'text' | 'mention';
  valueStart: number;
  valueEnd: number;
  surfaceStart: number;
  surfaceEnd: number;
}

function buildValueSurfaceSegments(value: string): IValueSurfaceSegment[] {
  const segments: IValueSurfaceSegment[] = [];
  const regex = new RegExp(NOTE_MENTION_TOKEN_REGEX.source, 'g');
  let lastIndex = 0;
  let valuePos = 0;
  let surfacePos = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(value))) {
    const start = match.index;
    if (start > lastIndex) {
      const text = value.slice(lastIndex, start);
      segments.push({
        type: 'text',
        valueStart: valuePos,
        valueEnd: valuePos + text.length,
        surfaceStart: surfacePos,
        surfaceEnd: surfacePos + text.length,
      });
      valuePos += text.length;
      surfacePos += text.length;
    }

    const path = match[1];
    const surfaceText = mentionToSurfaceText(path);
    segments.push({
      type: 'mention',
      valueStart: valuePos,
      valueEnd: valuePos + match[0].length,
      surfaceStart: surfacePos,
      surfaceEnd: surfacePos + surfaceText.length,
    });
    valuePos += match[0].length;
    surfacePos += surfaceText.length;
    lastIndex = start + match[0].length;
  }

  if (lastIndex < value.length) {
    const text = value.slice(lastIndex);
    segments.push({
      type: 'text',
      valueStart: valuePos,
      valueEnd: valuePos + text.length,
      surfaceStart: surfacePos,
      surfaceEnd: surfacePos + text.length,
    });
  }

  return segments;
}

function mapIndexAcrossSegments(
  segments: IValueSurfaceSegment[],
  index: number,
  from: 'value' | 'surface',
): number {
  for (const segment of segments) {
    const start = from === 'value' ? segment.valueStart : segment.surfaceStart;
    const end = from === 'value' ? segment.valueEnd : segment.surfaceEnd;
    const targetStart = from === 'value' ? segment.surfaceStart : segment.valueStart;
    const targetEnd = from === 'value' ? segment.surfaceEnd : segment.valueEnd;

    if (index >= start && index <= end) {
      const offset = index - start;
      const span = end - start;
      const targetSpan = targetEnd - targetStart;
      if (span === 0) {
        return targetStart;
      }
      const ratio = offset / span;
      return targetStart + Math.round(ratio * targetSpan);
    }
  }

  const last = segments.at(-1);
  if (!last) {
    return index;
  }
  return from === 'value' ? last.surfaceEnd : last.valueEnd;
}

export function valueIndexToSurfaceIndex(value: string, valueIndex: number): number {
  return mapIndexAcrossSegments(buildValueSurfaceSegments(value), valueIndex, 'value');
}

export function surfaceIndexToValueIndex(value: string, surfaceIndex: number): number {
  return mapIndexAcrossSegments(buildValueSurfaceSegments(value), surfaceIndex, 'surface');
}

export function surfaceToValue(surface: string, previousValue: string): string {
  const mentions = findNoteMentions(previousValue);
  if (mentions.length === 0) {
    return surface;
  }

  let result = surface;
  let searchFrom = 0;

  for (const mention of mentions) {
    const surfaceMention = mentionToSurfaceText(mention.path);
    const idx = result.indexOf(surfaceMention, searchFrom);
    if (idx < 0) {
      continue;
    }
    const token = buildNoteMentionToken(mention.path);
    result = result.slice(0, idx) + token + result.slice(idx + surfaceMention.length);
    searchFrom = idx + token.length;
  }

  return result;
}

export function findNoteMentions(value: string): INoteMentionMatch[] {
  const matches: INoteMentionMatch[] = [];
  const regex = new RegExp(NOTE_MENTION_TOKEN_REGEX.source, 'g');
  let match: RegExpExecArray | null;
  while ((match = regex.exec(value))) {
    matches.push({
      path: match[1],
      start: match.index,
      end: match.index + match[0].length,
    });
  }
  return matches;
}

/** 光标是否落在笔记引用 token 内 */
export function findMentionAtCursor(value: string, cursorPos: number): INoteMentionMatch | null {
  return (
    findNoteMentions(value).find(
      (item) => cursorPos >= item.start && cursorPos <= item.end,
    ) ?? null
  );
}

export function isIndexInsideMention(value: string, index: number): boolean {
  return findNoteMentions(value).some((item) => index >= item.start && index < item.end);
}

export interface IAtQueryContext {
  query: string;
  atIndex: number;
}

/** 提取光标前的 @ 查询片段 */
export function extractAtQuery(value: string, cursorPos: number): IAtQueryContext | null {
  const beforeCursor = value.slice(0, cursorPos);
  const atIndex = beforeCursor.lastIndexOf('@');
  if (atIndex < 0) {
    return null;
  }

  const query = beforeCursor.slice(atIndex + 1);
  if (/\s/.test(query)) {
    return null;
  }

  const charBeforeAt = atIndex > 0 ? beforeCursor[atIndex - 1] : '';
  if (charBeforeAt && /[^\s([{,，、]/.test(charBeforeAt)) {
    return null;
  }

  if (isIndexInsideMention(value, atIndex)) {
    return null;
  }

  return { query, atIndex };
}

export function replaceAtQueryWithMention(
  value: string,
  atIndex: number,
  cursorPos: number,
  path: string,
): string {
  const token = buildNoteMentionToken(path);
  return `${value.slice(0, atIndex)}${token} ${value.slice(cursorPos)}`;
}

export function replaceMentionToken(
  value: string,
  mention: INoteMentionMatch,
  path: string,
): string {
  const token = buildNoteMentionToken(path);
  return `${value.slice(0, mention.start)}${token}${value.slice(mention.end)}`;
}

export function removeMentionTokenAt(value: string, cursorPos: number): string | null {
  const mentions = findNoteMentions(value);
  const hit = mentions.find((item) => cursorPos > item.start && cursorPos <= item.end);
  if (!hit) {
    return null;
  }
  return `${value.slice(0, hit.start)}${value.slice(hit.end)}`;
}

export async function resolveNoteMentionsInContent(
  content: string,
  readContent: (path: string) => Promise<string>,
): Promise<string> {
  const mentions = findNoteMentions(content);
  if (mentions.length === 0) {
    return content;
  }

  let result = content;
  for (const mention of [...mentions].reverse()) {
    const displayPath = getNoteMentionDisplayPath(mention.path);
    try {
      const noteText = await readContent(mention.path);
      const block = [
        `--- 笔记: ${displayPath} START ---`,
        noteText,
        `--- 笔记: ${displayPath} END ---`,
      ].join('\n');
      result = `${result.slice(0, mention.start)}${block}${result.slice(mention.end)}`;
    } catch {
      result = `${result.slice(0, mention.start)}[笔记 ${displayPath} 读取失败]${result.slice(mention.end)}`;
    }
  }
  return result;
}
