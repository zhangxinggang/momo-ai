import { computeSkillContentFingerprint } from './store-update';

export interface ISkillTranslationMeta {
  schemaVersion: 1;
  sourceFile: 'SKILL.md';
  sourceFingerprint: string;
  targetLanguage: string;
  translationMode: 'immersive' | 'full';
  translatedAt: number;
}

export interface ISkillTranslationSidecar {
  content: string;
  meta: ISkillTranslationMeta;
}

function sanitizePathSegment(value: string): string {
  const trimmed = value.trim();
  return trimmed.replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, '-');
}

function getTranslationBaseDir(
  targetLanguage: string,
  translationMode: 'immersive' | 'full',
): string {
  return [
    '.prompthub',
    'translations',
    sanitizePathSegment(targetLanguage),
    sanitizePathSegment(translationMode),
  ].join('/');
}

export function buildSkillTranslationPaths(
  targetLanguage: string,
  translationMode: 'immersive' | 'full',
): { baseDir: string; skillMdPath: string; metaPath: string } {
  const baseDir = getTranslationBaseDir(targetLanguage, translationMode);
  return {
    baseDir,
    skillMdPath: `${baseDir}/SKILL.md`,
    metaPath: `${baseDir}/meta.json`,
  };
}

export async function readSkillTranslationSidecar(
  skillId: string,
  targetLanguage: string,
  translationMode: 'immersive' | 'full',
): Promise<ISkillTranslationSidecar | null> {
  const repoPath = await window.api.skill.getRepoPath(skillId);
  if (!repoPath) {
    return null;
  }

  const { metaPath, skillMdPath } = buildSkillTranslationPaths(targetLanguage, translationMode);

  const [metaEntry, contentEntry] = await Promise.all([
    window.api.skill.readLocalFile(skillId, metaPath),
    window.api.skill.readLocalFile(skillId, skillMdPath),
  ]);

  if (!metaEntry || metaEntry.isDirectory || !contentEntry || contentEntry.isDirectory) {
    return null;
  }

  try {
    const meta = JSON.parse(metaEntry.content) as ISkillTranslationMeta;
    if (meta.schemaVersion !== 1 || meta.sourceFile !== 'SKILL.md') {
      return null;
    }

    return {
      content: contentEntry.content,
      meta,
    };
  } catch {
    return null;
  }
}

export async function writeSkillTranslationSidecar(input: {
  skillId: string;
  sourceContent: string;
  translatedContent: string;
  targetLanguage: string;
  translationMode: 'immersive' | 'full';
}): Promise<ISkillTranslationSidecar> {
  const { baseDir, metaPath, skillMdPath } = buildSkillTranslationPaths(
    input.targetLanguage,
    input.translationMode,
  );
  const sourceFingerprint = computeSkillContentFingerprint(input.sourceContent);
  const meta: ISkillTranslationMeta = {
    schemaVersion: 1,
    sourceFile: 'SKILL.md',
    sourceFingerprint,
    targetLanguage: input.targetLanguage,
    translationMode: input.translationMode,
    translatedAt: Date.now(),
  };

  await window.api.skill.createLocalDir(input.skillId, baseDir);
  await window.api.skill.writeLocalFile(input.skillId, skillMdPath, input.translatedContent);
  await window.api.skill.writeLocalFile(input.skillId, metaPath, JSON.stringify(meta, null, 2));

  return {
    content: input.translatedContent,
    meta,
  };
}

export function isSkillTranslationStale(
  sidecar: ISkillTranslationSidecar | null,
  sourceContent: string,
): boolean {
  if (!sidecar) {
    return false;
  }

  return sidecar.meta.sourceFingerprint !== computeSkillContentFingerprint(sourceContent);
}
