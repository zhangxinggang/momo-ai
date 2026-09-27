import { afterEach, describe, expect, it } from 'vitest';
import { buildNoteRewriteMessages } from '../renderer/components/Note/NoteAiComposer/rewrite';
import { SUPERPOWER_PROMPTS } from '../renderer/services/aichat/superpower-prompts';
import {
  BUILTIN_SKILL_PATHS,
  DEFAULT_BUILTIN_SKILLS,
  builtinSkillBody,
  getBuiltinSkillPrompt,
  renderBuiltinSkillPrompt,
  setBuiltinSkillCatalog,
} from './builtin-skills';

afterEach(() => setBuiltinSkillCatalog(DEFAULT_BUILTIN_SKILLS));

describe('builtin skill catalog', () => {
  it('loads every registered file without sending its frontmatter to the model', () => {
    expect(Object.keys(DEFAULT_BUILTIN_SKILLS)).toEqual(Object.keys(BUILTIN_SKILL_PATHS));
    expect(DEFAULT_BUILTIN_SKILLS.skillCreator).toContain('You are');
    expect(DEFAULT_BUILTIN_SKILLS.skillCreator).not.toMatch(/^---/);
    expect(builtinSkillBody('\uFEFF---\r\nname: test\r\n---\r\n\r\n正文')).toBe('正文');
  });

  it('injects external edits into existing functional call sites', () => {
    setBuiltinSkillCatalog({
      ...DEFAULT_BUILTIN_SKILLS,
      noteRewrite: '新规则：{{noteContent}}',
      chatSuperpowers: '新的工作流',
    });
    expect(buildNoteRewriteMessages('{{noteContent}} 原文', '缩短')[0].content).toBe(
      '新规则：{{noteContent}} 原文',
    );
    expect(SUPERPOWER_PROMPTS.workflow).toBe('新的工作流');
    expect(getBuiltinSkillPrompt('chatTitle')).toBe(DEFAULT_BUILTIN_SKILLS.chatTitle);
  });

  it('rejects missing parameters and atomically rejects incomplete catalogs', () => {
    expect(() => renderBuiltinSkillPrompt('规则 {{missing}}')).toThrow('缺少参数');
    expect(() =>
      setBuiltinSkillCatalog({ ...DEFAULT_BUILTIN_SKILLS, noteRewrite: '新规则', chatTitle: '' }),
    ).toThrow('内容为空');
    expect(getBuiltinSkillPrompt('chatTitle')).toBe(DEFAULT_BUILTIN_SKILLS.chatTitle);
    expect(getBuiltinSkillPrompt('noteRewrite', { noteContent: '原文' })).toContain('当前笔记');
  });
});
