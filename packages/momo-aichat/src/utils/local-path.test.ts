import { describe, expect, it } from 'vitest';

import {
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
