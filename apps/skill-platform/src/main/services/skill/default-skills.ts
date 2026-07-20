import fs from 'fs/promises';
import path from 'path';

import type {
  DCreateSkill,
  IDefaultSkillImportResult,
  IDefaultSkillPreview,
} from '@/types/modules';
import type { SkillDB } from '../../database';
import { getAppTempDir, getProjectRoot } from '../../runtime-paths';
import { saveToLocalRepo } from './installer/repo';
import { extractZipToDir, findSkillMdFile } from './installer/zip-archive';
import { parseSkillMd } from './safety/validator';

export function getDefaultSkillsDir(): string {
  return path.join(getProjectRoot(), 'default', 'skills');
}

function getDefaultImportCacheDir(zipFileName: string): string {
  const base = zipFileName.replace(/\.zip$/i, '');
  return path.join(getAppTempDir(), 'default-import', base);
}

/** 扫描内置 default/skills 目录，解压并解析 zip 预览数据 */
export async function listDefaultSkillPreviews(db: SkillDB): Promise<IDefaultSkillPreview[]> {
  const dir = getDefaultSkillsDir();
  let entries: string[];
  try {
    entries = await fs.readdir(dir);
  } catch {
    return [];
  }

  const zipFiles = entries.filter((fileName) => fileName.toLowerCase().endsWith('.zip'));
  const previews: IDefaultSkillPreview[] = [];

  for (const zipFileName of zipFiles) {
    try {
      const zipPath = path.join(dir, zipFileName);
      const buffer = await fs.readFile(zipPath);
      const extractDir = getDefaultImportCacheDir(zipFileName);
      await extractZipToDir(
        new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength),
        extractDir,
      );

      const skillMdPath = await findSkillMdFile(extractDir);
      if (!skillMdPath) {
        continue;
      }

      const instructions = await fs.readFile(skillMdPath, 'utf-8');
      const parsed = parseSkillMd(instructions);
      const fallbackName = zipFileName.replace(/\.zip$/i, '');
      const name = (parsed?.frontmatter.name?.trim() || fallbackName).trim();
      if (!name) {
        continue;
      }

      const existing = await db.getByName(name);

      previews.push({
        zipFileName,
        name,
        description: parsed?.frontmatter.description ?? '',
        version: parsed?.frontmatter.version,
        author: parsed?.frontmatter.author ?? 'User',
        tags: parsed?.frontmatter.tags ?? [],
        instructions,
        extractDir,
        isInstalled: Boolean(existing),
        existingSkillId: existing?.id,
      });
    } catch (err) {
      console.warn(`[default-skills] skip ${zipFileName}:`, err);
    }
  }

  return previews.sort((a, b) => a.name.localeCompare(b.name));
}

/** 导入选中的默认技能 zip；overwrite 为 true 时覆盖同名技能 */
export async function importDefaultSkills(
  db: SkillDB,
  zipFileNames: string[],
  options: { overwrite: boolean },
): Promise<IDefaultSkillImportResult> {
  const previews = await listDefaultSkillPreviews(db);
  const previewMap = new Map(previews.map((preview) => [preview.zipFileName, preview]));

  const result: IDefaultSkillImportResult = {
    imported: 0,
    overwritten: 0,
    skipped: 0,
    failed: [],
  };

  for (const zipFileName of zipFileNames) {
    const preview = previewMap.get(zipFileName);
    if (!preview) {
      result.failed.push({ zipFileName, reason: '预览数据不存在或 zip 无效' });
      continue;
    }

    try {
      if (preview.isInstalled && preview.existingSkillId) {
        if (!options.overwrite) {
          result.skipped += 1;
          continue;
        }

        await db.update(preview.existingSkillId, {
          description: preview.description,
          instructions: preview.instructions,
          content: preview.instructions,
          version: preview.version,
          author: preview.author,
          original_tags: preview.tags,
          source_url: `default://${preview.zipFileName}`,
        });
        const repoPath = await saveToLocalRepo(preview.name, preview.extractDir);
        await db.update(preview.existingSkillId, { local_repo_path: repoPath });
        result.overwritten += 1;
        continue;
      }

      const createData: DCreateSkill = {
        name: preview.name,
        description: preview.description,
        instructions: preview.instructions,
        content: preview.instructions,
        protocol_type: 'skill',
        version: preview.version,
        author: preview.author,
        tags: [],
        original_tags: preview.tags,
        is_favorite: false,
        source_url: `default://${preview.zipFileName}`,
      };
      const created = await db.create(createData);
      const repoPath = await saveToLocalRepo(preview.name, preview.extractDir);
      await db.update(created.id, { local_repo_path: repoPath });
      result.imported += 1;
    } catch (err) {
      result.failed.push({
        zipFileName,
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return result;
}
