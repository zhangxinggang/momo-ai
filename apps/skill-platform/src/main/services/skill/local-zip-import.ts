import fs from 'fs/promises';
import path from 'path';

import type { DCreateSkill } from '@/types/modules';
import type { SkillDB } from '../../database';
import { getAppTempDir } from '../../runtime-paths';
import { SkillInstaller } from './installer';
import { saveToLocalRepo } from './installer/repo';
import { extractZipToDir, findSkillMdFile } from './installer/zip-archive';
import { parseSkillMd } from './safety/validator';

export interface ILocalZipFileInput {
  fileName: string;
  base64: string;
}

export interface ILocalZipPreviewItem {
  fileName: string;
  name: string;
  description: string;
  version?: string;
  author: string;
  tags: string[];
  isInstalled: boolean;
  existingSkillId?: string;
  error?: string;
}

export interface ILocalZipImportItem extends ILocalZipFileInput {
  /** 同名已存在时是否覆盖（先删后建） */
  overwrite: boolean;
}

export interface ILocalZipImportResult {
  imported: number;
  overwritten: number;
  skipped: number;
  failed: Array<{ fileName: string; reason: string }>;
}

function decodeBase64ToUint8Array(base64: string): Uint8Array {
  const buffer = Buffer.from(base64, 'base64');
  return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
}

function getLocalZipCacheDir(fileName: string): string {
  const safeName = fileName.replace(/[^\w.\-]+/g, '_').replace(/\.(zip|md)$/i, '');
  return path.join(getAppTempDir(), 'local-zip-import', `${Date.now()}-${safeName}`);
}

function isSkillMdFileName(fileName: string): boolean {
  return path.basename(fileName).toLowerCase() === 'skill.md';
}

interface IParsedLocalZip {
  fileName: string;
  name: string;
  description: string;
  version?: string;
  author: string;
  tags: string[];
  instructions: string;
  extractDir: string;
}

function buildParsedSkillMeta(
  fileName: string,
  instructions: string,
  extractDir: string,
  fallbackName: string,
): IParsedLocalZip {
  const parsed = parseSkillMd(instructions);
  const name = (parsed?.frontmatter.name?.trim() || fallbackName).trim();
  if (!name) {
    throw new Error('无法解析技能名称');
  }

  return {
    fileName,
    name,
    description: parsed?.frontmatter.description ?? '',
    version: parsed?.frontmatter.version,
    author: parsed?.frontmatter.author ?? 'User',
    tags: parsed?.frontmatter.tags ?? [],
    instructions,
    extractDir,
  };
}

/** 解析单个 SKILL.md 文件并写入临时目录 */
async function parseLocalSkillMd(fileName: string, base64: string): Promise<IParsedLocalZip> {
  const instructions = Buffer.from(base64, 'base64').toString('utf-8');
  if (!instructions.trim()) {
    throw new Error('SKILL.md 内容为空');
  }

  const extractDir = getLocalZipCacheDir(fileName);
  await fs.mkdir(extractDir, { recursive: true });
  await fs.writeFile(path.join(extractDir, 'SKILL.md'), instructions, 'utf-8');

  const fallbackName = path.basename(fileName, path.extname(fileName)) || 'skill';
  return buildParsedSkillMeta(fileName, instructions, extractDir, fallbackName);
}

async function parseLocalZip(
  fileName: string,
  base64: string,
): Promise<IParsedLocalZip> {
  const extractDir = getLocalZipCacheDir(fileName);
  await extractZipToDir(decodeBase64ToUint8Array(base64), extractDir);

  const skillMdPath = await findSkillMdFile(extractDir);
  if (!skillMdPath) {
    throw new Error('压缩包中未找到 SKILL.md');
  }

  const instructions = await fs.readFile(skillMdPath, 'utf-8');
  const fallbackName = fileName.replace(/\.zip$/i, '');
  return buildParsedSkillMeta(fileName, instructions, extractDir, fallbackName);
}

async function parseLocalSkillPackage(
  fileName: string,
  base64: string,
): Promise<IParsedLocalZip> {
  if (isSkillMdFileName(fileName)) {
    return parseLocalSkillMd(fileName, base64);
  }
  if (!fileName.toLowerCase().endsWith('.zip')) {
    throw new Error('仅支持 .zip 技能包或 SKILL.md 文件');
  }
  return parseLocalZip(fileName, base64);
}

/** 预览本地 zip：解析名称并检测同名冲突 */
export async function previewLocalSkillZips(
  db: SkillDB,
  files: ILocalZipFileInput[],
): Promise<ILocalZipPreviewItem[]> {
  const previews: ILocalZipPreviewItem[] = [];

  for (const file of files) {
    try {
      if (!file?.fileName || !file?.base64) {
        previews.push({
          fileName: file?.fileName || 'unknown.zip',
          name: '',
          description: '',
          author: '',
          tags: [],
          isInstalled: false,
          error: '无效的技能文件数据',
        });
        continue;
      }

      const parsed = await parseLocalSkillPackage(file.fileName, file.base64);
      const existing = await db.getByName(parsed.name);
      previews.push({
        fileName: parsed.fileName,
        name: parsed.name,
        description: parsed.description,
        version: parsed.version,
        author: parsed.author,
        tags: parsed.tags,
        isInstalled: Boolean(existing),
        existingSkillId: existing?.id,
      });
    } catch (err) {
      previews.push({
        fileName: file.fileName,
        name: '',
        description: '',
        author: '',
        tags: [],
        isInstalled: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return previews;
}

async function deleteExistingSkill(db: SkillDB, skillId: string, skillName: string): Promise<void> {
  try {
    const platforms = SkillInstaller.getSupportedPlatforms();
    await Promise.allSettled(
      platforms.map((platform) => SkillInstaller.uninstallSkillMd(skillName, platform.id)),
    );
  } catch (error) {
    console.warn(`覆盖导入前卸载平台技能失败 "${skillName}":`, error);
  }
  await db.delete(skillId);
}

/** 导入本地 zip；overwrite 为 true 时删除同名技能再新建 */
export async function importLocalSkillZips(
  db: SkillDB,
  items: ILocalZipImportItem[],
): Promise<ILocalZipImportResult> {
  const result: ILocalZipImportResult = {
    imported: 0,
    overwritten: 0,
    skipped: 0,
    failed: [],
  };

  for (const item of items) {
    try {
      if (!item?.fileName || !item?.base64) {
        result.failed.push({
          fileName: item?.fileName || 'unknown',
          reason: '无效的技能文件数据',
        });
        continue;
      }

      const parsed = await parseLocalSkillPackage(item.fileName, item.base64);
      const existing = await db.getByName(parsed.name);

      if (existing) {
        if (!item.overwrite) {
          result.skipped += 1;
          continue;
        }
        await deleteExistingSkill(db, existing.id, existing.name);
      }

      const sourceScheme = isSkillMdFileName(parsed.fileName) ? 'local-skill-md' : 'local-zip';
      const createData: DCreateSkill = {
        name: parsed.name,
        description: parsed.description,
        instructions: parsed.instructions,
        content: parsed.instructions,
        protocol_type: 'skill',
        version: parsed.version,
        author: parsed.author,
        tags: [],
        original_tags: parsed.tags,
        is_favorite: false,
        source_url: `${sourceScheme}://${parsed.fileName}`,
      };
      const created = await db.create(createData);
      const repoPath = await saveToLocalRepo(parsed.name, parsed.extractDir);
      await db.update(created.id, { local_repo_path: repoPath });

      if (existing && item.overwrite) {
        result.overwritten += 1;
      } else {
        result.imported += 1;
      }
    } catch (err) {
      result.failed.push({
        fileName: item.fileName,
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return result;
}
