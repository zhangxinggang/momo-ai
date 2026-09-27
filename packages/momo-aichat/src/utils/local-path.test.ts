import { describe, expect, it } from 'vitest';

import {
  isWorkspaceRelativePath,
  normalizeLocalPathValue,
  splitPlainTextByLocalPaths,
  stripTrailingPathPunctuation,
} from './local-path';

describe('stripTrailingPathPunctuation', () => {
  it('剥离尾随反引号与中文句号', () => {
    const base = 'G:\\work\\source\\zhangxg\\momo-ai\\temp\\chat-1785666200911-gukjwaf';
    expect(stripTrailingPathPunctuation(`${base}\``)).toBe(base);
    expect(stripTrailingPathPunctuation(`${base}。`)).toBe(base);
  });
});

describe('workspace file references', () => {
  it('recognizes relative files only when explicitly enabled', () => {
    expect(
      splitPlainTextByLocalPaths('已修改 src/index.ts 和 README.md', true)
        .filter((part) => part.kind === 'path')
        .map((part) => part.value),
    ).toEqual(['src/index.ts', 'README.md']);
    expect(splitPlainTextByLocalPaths('src/index.ts').some((part) => part.kind === 'path')).toBe(
      false,
    );
    expect(isWorkspaceRelativePath('src/长 文件名.ts')).toBe(true);
    expect(isWorkspaceRelativePath('https://example.com/file.ts')).toBe(false);
    expect(isWorkspaceRelativePath('const a = "foo.ts";')).toBe(false);
  });
  it('decodes file links and strips line locations before opening', () => {
    expect(normalizeLocalPathValue('file:///C:/My%20Work/src/a.ts#L12')).toBe(
      'C:/My Work/src/a.ts',
    );
    expect(normalizeLocalPathValue('src/a.ts:12:3')).toBe('src/a.ts');
  });
});

describe('normalizeLocalPathValue', () => {
  it('规范化时去掉尾随标点', () => {
    const base = 'G:\\work\\source\\zhangxg\\momo-ai\\temp\\chat-1';
    expect(normalizeLocalPathValue(`${base}。`)).toBe(base);
  });
});

describe('splitPlainTextByLocalPaths', () => {
  it('匹配路径时不吞掉尾随句号', () => {
    const base = 'G:\\work\\source\\zhangxg\\momo-ai\\temp\\chat-1785666200911-gukjwaf';
    const parts = splitPlainTextByLocalPaths(`路径在 ${base}。`);
    const pathPart = parts.find((part) => part.kind === 'path');
    expect(pathPart?.value).toBe(base);
    expect(parts.some((part) => part.kind === 'text' && part.value.includes('。'))).toBe(true);
  });
});
