import { describe, expect, it } from 'vitest';
import { lineChanges, undoUntouched } from './file-change-diff';

describe('undo only untouched AI changes', () => {
  it('restores the actual baseline, including CRLF, trailing newline, Chinese and emoji', () => {
    const before = '用户原有修改\r\nconst n = 1;\r\n目标🙂\r\n';
    const after = '用户原有修改\r\nconst n = 2;\r\n目标🙃\r\n';
    expect(undoUntouched(before, after, after).content).toBe(before);
  });
  it('preserves a manual correction in one region while undoing another', () => {
    const before = 'const a = 1;\nconst b = 3;\n';
    const after = 'const a = 2;\nconst b = 4;\n';
    const current = 'const a = 42;\nconst b = 4;\n// 用户添加\n';
    const result = undoUntouched(before, after, current);
    expect(result.content).toBe('const a = 42;\nconst b = 3;\n// 用户添加\n');
    expect(result.skipped).toBeGreaterThan(0);
  });
  it('maps independent user insertions before the changed region', () => {
    expect(undoUntouched('head\na=1\n', 'head\na=2\n', '// mine\nhead\na=2\n').content).toBe(
      '// mine\nhead\na=1\n',
    );
  });
  it('restores AI deletions without touching manual additions elsewhere', () => {
    expect(undoUntouched('keep\nremoved\nend\n', 'keep\nend\n', 'mine\nkeep\nend\n').content).toBe(
      'mine\nkeep\nremoved\nend\n',
    );
  });
  it('does not restore deletions at a manually changed anchor', () => {
    expect(undoUntouched('head\nold\ntail\n', 'head\ntail\n', 'head\nmanual\ntail\n').content).toBe(
      'head\nmanual\ntail\n',
    );
  });
  it('ignores explicitly protected edits even if a user changes back to the AI text', () => {
    expect(undoUntouched('a=1\nb=1', 'a=2\nb=2', 'a=2\nb=2', [{ from: 2, to: 3 }]).content).toBe(
      'a=2\nb=1',
    );
  });
  it('counts additions and deletions without an artificial line for an empty file', () => {
    expect(lineChanges('', 'hello\n世界\n')).toMatchObject({
      added: 2,
      removed: 0,
      additions: [1, 2],
    });
    expect(lineChanges('hello\n', '')).toMatchObject({ added: 0, removed: 1, deletions: [1] });
  });
});
