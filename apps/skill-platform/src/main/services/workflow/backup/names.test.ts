import { describe, expect, it } from 'vitest';

import { allocateUniqueName, sanitizeExportFileBaseName } from './names';

describe('sanitizeExportFileBaseName', () => {
  it('替换非法字符', () => {
    expect(sanitizeExportFileBaseName('a/b:c')).toBe('a_b_c');
  });

  it('空串回退为 workflow', () => {
    expect(sanitizeExportFileBaseName('   ')).toBe('workflow');
  });
});

describe('allocateUniqueName', () => {
  it('根名可用时原样返回', () => {
    expect(allocateUniqueName('A', new Set(), '（导入）')).toBe('A');
  });

  it('冲突时加后缀', () => {
    expect(allocateUniqueName('A', new Set(['A']), '（导入）')).toBe('A（导入）');
  });

  it('后缀仍冲突时加数字', () => {
    expect(allocateUniqueName('A', new Set(['A', 'A（导入）']), '（导入）')).toBe('A（导入）2');
  });
});
