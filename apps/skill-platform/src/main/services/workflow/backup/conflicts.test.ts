import { describe, expect, it } from 'vitest';

import type { IPrompt, ISkill } from '@/types/modules';

import { detectAllConflicts } from './conflicts';

function makePrompt(id: string, title: string): IPrompt {
  return {
    id,
    title,
    userPrompt: 'x',
    variables: [],
    tags: [],
    isFavorite: false,
    isPinned: false,
    version: 1,
    currentVersion: 1,
    usageCount: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

function makeSkill(id: string, name: string): ISkill {
  return {
    id,
    name,
    protocol_type: 'skill',
    is_favorite: false,
  };
}

describe('detectAllConflicts', () => {
  it('无冲突返回空', () => {
    expect(
      detectAllConflicts(
        [makePrompt('p1', 'A')],
        [{ skill: makeSkill('s1', 'S') }],
        [],
        [],
      ),
    ).toEqual([]);
  });

  it('同 ID 优先', () => {
    const conflicts = detectAllConflicts(
      [makePrompt('p1', 'NewTitle')],
      [],
      [makePrompt('p1', 'OldTitle')],
      [],
    );
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].reason).toBe('sameId');
    expect(conflicts[0].existingName).toBe('OldTitle');
  });

  it('仅同名', () => {
    const conflicts = detectAllConflicts(
      [makePrompt('p2', 'Same')],
      [],
      [makePrompt('p1', 'Same')],
      [],
    );
    expect(conflicts[0].reason).toBe('sameName');
    expect(conflicts[0].existingId).toBe('p1');
  });

  it('混合 prompt 与 skill', () => {
    const conflicts = detectAllConflicts(
      [makePrompt('p1', 'A')],
      [{ skill: makeSkill('s2', 'Skill') }],
      [makePrompt('p1', 'A')],
      [makeSkill('s1', 'Skill')],
    );
    expect(conflicts).toHaveLength(2);
    expect(conflicts.map((c) => c.kind).sort()).toEqual(['prompt', 'skill']);
  });
});
