import { diffChars, diffLines, type Change } from 'diff';

export interface TextEdit {
  from: number;
  to: number;
  insert: string;
}
export interface TextRange {
  from: number;
  to: number;
}

function editsFromDiff(changes: Change[]): TextEdit[] {
  const edits: TextEdit[] = [];
  let offset = 0;
  let pending: TextEdit | undefined;
  for (const change of changes) {
    if (!change.added && !change.removed) {
      if (pending) edits.push(pending);
      pending = undefined;
      offset += change.value.length;
    } else {
      pending ??= { from: offset, to: offset, insert: '' };
      if (change.removed) {
        offset += change.value.length;
        pending.to = offset;
      } else pending.insert += change.value;
    }
  }
  if (pending) edits.push(pending);
  return edits;
}

/** Bound expensive character comparisons; line comparison supplies a conservative fallback. */
export function textEdits(before: string, after: string): TextEdit[] {
  const changes =
    diffChars(before, after, { timeout: 150, maxEditLength: 4000 }) ??
    diffLines(before, after, { timeout: 150, maxEditLength: 4000 });
  return changes ? editsFromDiff(changes) : [{ from: 0, to: before.length, insert: after }];
}

export function mapOffset(
  offset: number,
  edits: TextEdit[],
  bias: 'left' | 'right' = 'right',
): number {
  let shift = 0;
  for (const edit of edits) {
    if (edit.to < offset || (edit.to === offset && (edit.from < edit.to || bias === 'right'))) {
      shift += edit.insert.length - (edit.to - edit.from);
    } else if (edit.from < offset) {
      return edit.from + shift + (bias === 'right' ? edit.insert.length : 0);
    }
  }
  return offset + shift;
}

export function mapProtectedRanges(
  ranges: TextRange[],
  before: string,
  after: string,
): TextRange[] {
  const edits = textEdits(before, after);
  return ranges.map((range) => ({
    from: mapOffset(range.from, edits, 'left'),
    to: mapOffset(range.to, edits, 'right'),
  }));
}

function overlaps(a: TextRange, b: TextRange): boolean {
  if (a.from === a.to) return b.from <= a.from && b.to >= a.to;
  if (b.from === b.to) return a.from <= b.from && a.to >= b.from;
  return a.from < b.to && b.from < a.to;
}

/** Reverse only AI edits whose affected text is still unchanged, preserving later edits. */
export function undoUntouched(
  before: string,
  after: string,
  current: string,
  protectedRanges: TextRange[] = [],
) {
  const aiEdits = textEdits(before, after);
  const userEdits = textEdits(after, current);
  const inverses: TextEdit[] = [];
  let shift = 0;
  let skipped = 0;
  for (const edit of aiEdits) {
    const aiRange = { from: edit.from + shift, to: edit.from + shift + edit.insert.length };
    shift += edit.insert.length - (edit.to - edit.from);
    const from = mapOffset(aiRange.from, userEdits, 'right');
    const to = aiRange.from === aiRange.to ? from : mapOffset(aiRange.to, userEdits, 'left');
    if (
      userEdits.some((item) => overlaps(aiRange, item)) ||
      protectedRanges.some((item) => overlaps({ from, to }, item)) ||
      current.slice(from, to) !== edit.insert
    ) {
      skipped++;
      continue;
    }
    inverses.push({ from, to, insert: before.slice(edit.from, edit.to) });
  }
  let content = current;
  for (const edit of [...inverses].reverse())
    content = content.slice(0, edit.from) + edit.insert + content.slice(edit.to);
  return {
    content,
    reverted: inverses.length,
    skipped,
    protectedRanges: protectedRanges.map((range) => ({
      from: mapOffset(range.from, inverses, 'left'),
      to: mapOffset(range.to, inverses, 'right'),
    })),
  };
}

export function lineChanges(before: string, after: string) {
  const changes = diffLines(before, after, { timeout: 200, maxEditLength: 5000 });
  let added = 0,
    removed = 0,
    oldLine = 1,
    newLine = 1;
  const additions: number[] = [],
    deletions: number[] = [];
  for (const change of changes ?? []) {
    if (change.added) {
      added += change.count;
      for (let i = 0; i < change.count; i++) additions.push(newLine++);
    } else if (change.removed) {
      removed += change.count;
      for (let i = 0; i < change.count; i++) deletions.push(oldLine++);
    } else {
      oldLine += change.count;
      newLine += change.count;
    }
  }
  if (!changes) {
    added = after ? after.split('\n').length : 0;
    removed = before ? before.split('\n').length : 0;
  }
  return { added, removed, additions, deletions };
}
