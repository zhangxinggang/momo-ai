import { DEFAULT_BUILTIN_SKILLS } from '@/shared/builtin-skills';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { getBuiltinSkillsDir, loadBuiltinSkillCatalog } from './builtin-skills';

const directories: string[] = [];
afterEach(() =>
  directories
    .splice(0)
    .forEach((directory) => fs.rmSync(directory, { recursive: true, force: true })),
);

describe('external builtin skill loading', () => {
  it('reads edits from the external directory and keeps bundled defaults for absent files', () => {
    expect(getBuiltinSkillsDir()).toBe(path.join(process.cwd(), 'default', 'skills', 'builtIn'));
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'aim-builtin-test-'));
    directories.push(directory);
    fs.mkdirSync(path.join(directory, 'chat-title'));
    const file = path.join(directory, 'chat-title/SKILL.md');
    fs.writeFileSync(file, '---\nname: chat-title\n---\n新标题规则');
    expect(loadBuiltinSkillCatalog(directory).chatTitle).toBe('新标题规则');
    expect(loadBuiltinSkillCatalog(directory).skillSafetyReview).toBe(
      DEFAULT_BUILTIN_SKILLS.skillSafetyReview,
    );
    fs.writeFileSync(file, '再次编辑');
    expect(loadBuiltinSkillCatalog(directory).chatTitle).toBe('再次编辑');
  });

  it('reports empty edited files instead of silently discarding an edit', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'aim-builtin-test-'));
    directories.push(directory);
    fs.mkdirSync(path.join(directory, 'chat-title'));
    fs.writeFileSync(path.join(directory, 'chat-title/SKILL.md'), '---\nname: chat-title\n---\n');
    expect(() => loadBuiltinSkillCatalog(directory)).toThrow('内置技能内容为空');
  });
});
