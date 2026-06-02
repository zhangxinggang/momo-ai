export interface IDiffLine {
  type: 'unchanged' | 'add' | 'remove';
  content: string;
  oldLineNum?: number;
  newLineNum?: number;
}

function computeLcs(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array.from({ length: n + 1 }, () => 0),
  );

  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp;
}

/** 生成两段文本的行级 diff */
export function generateTextDiff(oldText: string, newText: string): IDiffLine[] {
  const oldLines = (oldText || '').split('\n');
  const newLines = (newText || '').split('\n');

  if (oldText === newText) {
    return oldLines.map((line, index) => ({
      type: 'unchanged',
      content: line,
      oldLineNum: index + 1,
      newLineNum: index + 1,
    }));
  }

  const dp = computeLcs(oldLines, newLines);
  const stack: IDiffLine[] = [];
  const diff: IDiffLine[] = [];
  let i = oldLines.length;
  let j = newLines.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      stack.push({
        type: 'unchanged',
        content: oldLines[i - 1],
        oldLineNum: i,
        newLineNum: j,
      });
      i -= 1;
      j -= 1;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      stack.push({
        type: 'add',
        content: newLines[j - 1],
        newLineNum: j,
      });
      j -= 1;
    } else if (i > 0) {
      stack.push({
        type: 'remove',
        content: oldLines[i - 1],
        oldLineNum: i,
      });
      i -= 1;
    }
  }

  while (stack.length > 0) {
    diff.push(stack.pop()!);
  }

  return diff;
}
