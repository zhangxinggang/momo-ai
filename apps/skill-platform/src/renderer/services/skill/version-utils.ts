import type { ISkillFileSnapshot, ISkillLocalFileEntry, ISkillVersion } from '@/types/modules';

export interface ISkillVersionFileDiffEntry {
  path: string;
  oldContent: string;
  newContent: string;
  unchanged: boolean;
}

function compareFilePath(a: string, b: string): number {
  const aSkillMd = a.toLowerCase() === 'skill.md';
  const bSkillMd = b.toLowerCase() === 'skill.md';
  if (aSkillMd && !bSkillMd) return -1;
  if (!aSkillMd && bSkillMd) return 1;
  return a.localeCompare(b);
}

function ensureSkillMdSnapshot(
  snapshots: ISkillFileSnapshot[],
  fallbackContent: string,
): ISkillFileSnapshot[] {
  if (snapshots.some((snapshot) => snapshot.relativePath.toLowerCase() === 'skill.md')) {
    return snapshots;
  }

  if (!fallbackContent.trim()) {
    return snapshots;
  }

  return [
    {
      relativePath: 'SKILL.md',
      content: fallbackContent,
    },
    ...snapshots,
  ];
}

export function normalizeVersionSnapshot(
  snapshots?: ISkillFileSnapshot[],
  fallbackContent = '',
): ISkillFileSnapshot[] {
  const normalized = (snapshots || [])
    .filter(
      (
        snapshot,
      ): snapshot is {
        relativePath: string;
        content: string;
      } =>
        !!snapshot &&
        typeof snapshot.relativePath === 'string' &&
        typeof snapshot.content === 'string' &&
        snapshot.relativePath.trim().length > 0,
    )
    .map((snapshot) => ({
      relativePath: snapshot.relativePath,
      content: snapshot.content,
    }));

  return ensureSkillMdSnapshot(normalized, fallbackContent);
}

export function snapshotsFromLocalFiles(
  files: ISkillLocalFileEntry[],
  fallbackContent = '',
): ISkillFileSnapshot[] {
  const normalized = files
    .filter((file) => !file.isDirectory)
    .map((file) => ({
      relativePath: file.path,
      content: file.content,
    }));

  return ensureSkillMdSnapshot(normalized, fallbackContent);
}

export function resolveVersionSnapshots(
  version: ISkillVersion | null,
  fallbackContent = '',
): ISkillFileSnapshot[] {
  return normalizeVersionSnapshot(version?.filesSnapshot, fallbackContent);
}

export function buildVersionFileDiffEntries(
  oldSnapshots: ISkillFileSnapshot[],
  newSnapshots: ISkillFileSnapshot[],
): ISkillVersionFileDiffEntry[] {
  const oldMap = new Map(oldSnapshots.map((snapshot) => [snapshot.relativePath, snapshot.content]));
  const newMap = new Map(newSnapshots.map((snapshot) => [snapshot.relativePath, snapshot.content]));

  const paths = Array.from(new Set([...oldMap.keys(), ...newMap.keys()])).sort(compareFilePath);

  return paths.map((path) => {
    const oldContent = oldMap.get(path) || '';
    const newContent = newMap.get(path) || '';
    return {
      path,
      oldContent,
      newContent,
      unchanged: oldContent === newContent,
    };
  });
}
