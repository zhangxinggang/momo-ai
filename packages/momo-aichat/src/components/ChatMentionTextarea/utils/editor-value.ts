import { buildNoteMentionToken, parseNoteReferenceContent } from '../../../utils/note-mention';

export type IEditorSegment =
  | { type: 'text'; text: string }
  | { type: 'mention'; path: string }
  | { type: 'linebreak' };

function pushTextWithLinebreaks(segments: IEditorSegment[], text: string): void {
  const parts = text.split('\n');
  parts.forEach((part, index) => {
    if (part.length > 0) {
      segments.push({ type: 'text', text: part });
    }
    if (index < parts.length - 1) {
      segments.push({ type: 'linebreak' });
    }
  });
}

export function valueToEditorSegments(value: string): IEditorSegment[] {
  const segments: IEditorSegment[] = [];
  for (const piece of parseNoteReferenceContent(value)) {
    if (piece.type === 'mention') {
      segments.push({ type: 'mention', path: piece.path });
      continue;
    }
    pushTextWithLinebreaks(segments, piece.value);
  }
  return segments;
}

export function editorSegmentsToValue(segments: IEditorSegment[]): string {
  let result = '';
  for (const segment of segments) {
    if (segment.type === 'text') {
      result += segment.text;
    } else if (segment.type === 'mention') {
      result += buildNoteMentionToken(segment.path);
    } else {
      result += '\n';
    }
  }
  return result;
}

function segmentLength(segment: IEditorSegment): number {
  if (segment.type === 'text') {
    return segment.text.length;
  }
  if (segment.type === 'mention') {
    return buildNoteMentionToken(segment.path).length;
  }
  return 1;
}

/** offset：text 为字符偏移；mention 仅 0（块前）或 1（块后）；linebreak 仅 0/1 */
export function getSegmentCursorIndex(
  segments: IEditorSegment[],
  segmentIndex: number,
  offsetInSegment: number,
): number {
  let index = 0;
  for (let i = 0; i < segmentIndex; i += 1) {
    index += segmentLength(segments[i]);
  }
  const current = segments[segmentIndex];
  if (!current) {
    return index;
  }
  if (current.type === 'text') {
    return index + Math.min(Math.max(offsetInSegment, 0), current.text.length);
  }
  if (current.type === 'mention' || current.type === 'linebreak') {
    return index + (offsetInSegment > 0 ? segmentLength(current) : 0);
  }
  return index;
}

export function findSegmentAtValueIndex(
  segments: IEditorSegment[],
  valueIndex: number,
): { segmentIndex: number; offset: number } {
  let cursor = 0;
  for (let i = 0; i < segments.length; i += 1) {
    const len = segmentLength(segments[i]);
    const end = cursor + len;
    // 落在段尾边界时优先归到下一段起点（便于 mention 后继续输入）
    if (valueIndex < end || (valueIndex === end && i === segments.length - 1)) {
      const offset = valueIndex - cursor;
      if (segments[i].type === 'text') {
        return { segmentIndex: i, offset };
      }
      return { segmentIndex: i, offset: offset > 0 ? 1 : 0 };
    }
    cursor = end;
  }
  const last = segments.length - 1;
  if (last < 0) {
    return { segmentIndex: 0, offset: 0 };
  }
  return {
    segmentIndex: last,
    offset: segments[last].type === 'text' ? segments[last].text.length : 1,
  };
}
