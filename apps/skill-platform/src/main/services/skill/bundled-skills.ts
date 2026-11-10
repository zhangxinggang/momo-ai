import type { SkillDB } from '../../database';
import fs from 'node:fs/promises';
import path from 'node:path';
import { getDefaultSkillsDir, importDefaultSkills } from './default-skills';

/** Feature skills are installed without replacing the user's existing copies. */
export async function ensureBundledSkills(db: SkillDB) {
  const missing: string[] = [];
  const catalog: { name: string; autoInstall?: boolean }[] = JSON.parse(
    await fs.readFile(path.join(getDefaultSkillsDir(), '../catalog.json'), 'utf8'),
  );
  for (const { name, autoInstall } of catalog) {
    if (!autoInstall) continue;
    if (!/^[a-z][a-z0-9-]*$/.test(name)) throw new Error(`无效的默认技能名称: ${name}`);
    if (!(await db.getByName(name))) missing.push(`${name}.zip`);
  }
  if (!missing.length) return;
  const result = await importDefaultSkills(db, missing, { overwrite: false });
  if (result.failed.length)
    throw new Error(result.failed.map((item) => `${item.zipFileName}: ${item.reason}`).join('; '));
}
