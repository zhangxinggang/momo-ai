import { describe, expect, it } from 'vitest';

import {
  getUserSkillTags,
  mergeSkillTagsForSave,
  normalizeSkillTag,
} from './modal-utils';

describe('mergeSkillTagsForSave', () => {
  it('合并原标签与用户标签并去重', () => {
    expect(mergeSkillTagsForSave(['github', 'office'], ['office', 'custom'])).toEqual([
      'github',
      'office',
      'custom',
    ]);
  });

  it('选中已有标签后用户标签差集仍可见', () => {
    const original = ['github'];
    const user = ['design'];
    const saved = mergeSkillTagsForSave(original, user);
    expect(getUserSkillTags({ tags: saved, original_tags: original })).toEqual(['design']);
  });
});

describe('normalizeSkillTag', () => {
  it('统一小写并去空白', () => {
    expect(normalizeSkillTag('  Design ')).toBe('design');
  });
});
