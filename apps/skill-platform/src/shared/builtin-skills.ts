import manifest from '../../default/skills/builtIn/manifest.json';

/** 固定资源映射同时约束主进程 IPC 和各功能模块的可读取文件。 */
export const BUILTIN_SKILL_PATHS = manifest;
export type BuiltinSkillId = keyof typeof manifest;
export type BuiltinSkillCatalog = Record<BuiltinSkillId, string>;

const sources = import.meta.glob<string>('../../default/skills/builtIn/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

export function builtinSkillBody(source: string): string {
  return source
    .replace(/^\uFEFF/, '')
    .replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '')
    .trim();
}

export const DEFAULT_BUILTIN_SKILLS = Object.fromEntries(
  Object.entries(manifest).map(([id, relativePath]) => {
    const source = sources['../../default/skills/builtIn/' + relativePath];
    if (!source) throw new Error(`内置技能资源不存在：${relativePath}`);
    const body = builtinSkillBody(source);
    if (!body) throw new Error(`内置技能内容为空：${relativePath}`);
    return [id, body];
  }),
) as BuiltinSkillCatalog;

let activeCatalog = { ...DEFAULT_BUILTIN_SKILLS };

/** 先校验整份快照，再替换，避免部分资源更新后的混合状态。 */
export function setBuiltinSkillCatalog(catalog: BuiltinSkillCatalog): void {
  const next = {} as BuiltinSkillCatalog;
  for (const id of Object.keys(manifest) as BuiltinSkillId[]) {
    if (typeof catalog[id] !== 'string' || !catalog[id].trim()) {
      throw new Error(`内置技能内容为空：${id}`);
    }
    next[id] = catalog[id].trim();
  }
  activeCatalog = next;
}

/** 单次替换命名参数；参数中的模板标记不会被再次展开。 */
export function renderBuiltinSkillPrompt(
  template: string,
  variables: Record<string, string> = {},
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_token, name: string) => {
    if (!Object.hasOwn(variables, name)) throw new Error(`内置技能缺少参数：${name}`);
    return variables[name];
  });
}

export function getBuiltinSkillPrompt(
  id: BuiltinSkillId,
  variables?: Record<string, string>,
): string {
  const template = activeCatalog[id];
  if (typeof template !== 'string') throw new Error(`未知内置技能：${id}`);
  return renderBuiltinSkillPrompt(template, variables);
}
