import fs from 'node:fs';
import path from 'node:path';

import {
  BUILTIN_SKILL_PATHS,
  DEFAULT_BUILTIN_SKILLS,
  builtinSkillBody,
  renderBuiltinSkillPrompt,
  type BuiltinSkillCatalog,
  type BuiltinSkillId,
} from '@/shared/builtin-skills';

/** 不依赖 Electron，知识库 utility process 也使用应用 cwd 下的同一份资源。 */
export function getBuiltinSkillsDir(): string {
  return path.join(process.cwd(), 'default', 'skills', 'builtIn');
}

function readBuiltinSkill(id: BuiltinSkillId, directory: string): string {
  if (!Object.hasOwn(BUILTIN_SKILL_PATHS, id)) throw new Error(`未知内置技能：${id}`);
  const file = path.join(directory, BUILTIN_SKILL_PATHS[id]);
  let source: string;
  try {
    source = fs.readFileSync(file, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    // 兼容缺少外部资源的旧安装包，回退内容也来自 builtIn，而非另一份硬编码提示词。
    return DEFAULT_BUILTIN_SKILLS[id];
  }
  const body = builtinSkillBody(source);
  if (!body) throw new Error(`内置技能内容为空：${file}`);
  return body;
}

export function loadBuiltinSkillCatalog(directory = getBuiltinSkillsDir()): BuiltinSkillCatalog {
  return Object.fromEntries(
    (Object.keys(BUILTIN_SKILL_PATHS) as BuiltinSkillId[]).map((id) => [
      id,
      readBuiltinSkill(id, directory),
    ]),
  ) as BuiltinSkillCatalog;
}

export function getBuiltinSkillPrompt(
  id: BuiltinSkillId,
  variables?: Record<string, string>,
): string {
  return renderBuiltinSkillPrompt(readBuiltinSkill(id, getBuiltinSkillsDir()), variables);
}
