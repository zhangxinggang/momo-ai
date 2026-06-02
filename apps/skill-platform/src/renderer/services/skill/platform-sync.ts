import type { ISkill } from '@/types/modules';

export type ESkillInstallMode = 'copy' | 'symlink';

export interface IBatchSkillSyncFailure {
  skillName: string;
  platformId: string;
  reason: string;
}

export interface IBatchSkillSyncProgress {
  current: number;
  total: number;
  skillName: string;
  platformId: string;
}

export interface IBatchSkillSyncResult {
  successCount: number;
  totalCount: number;
  failures: IBatchSkillSyncFailure[];
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function syncSkillsToPlatforms(
  skills: ISkill[],
  platformIds: string[],
  installMode: ESkillInstallMode,
  onProgress?: (progress: IBatchSkillSyncProgress) => void,
): Promise<IBatchSkillSyncResult> {
  if (skills.length === 0 || platformIds.length === 0) {
    return { successCount: 0, totalCount: 0, failures: [] };
  }

  const totalCount = skills.length * platformIds.length;
  let current = 0;
  let successCount = 0;
  const failures: IBatchSkillSyncFailure[] = [];

  for (const skill of skills) {
    const skillMdContent = await window.api.skill.export(skill.id, 'skillmd');

    for (const platformId of platformIds) {
      current += 1;
      onProgress?.({
        current,
        total: totalCount,
        skillName: skill.name,
        platformId,
      });

      try {
        if (installMode === 'symlink') {
          await window.api.skill.installMdSymlink(skill.name, skillMdContent, platformId);
        } else {
          await window.api.skill.installMd(skill.name, skillMdContent, platformId);
        }
        successCount += 1;
      } catch (error) {
        failures.push({
          skillName: skill.name,
          platformId,
          reason: getErrorMessage(error),
        });
      }
    }
  }

  return {
    successCount,
    totalCount,
    failures,
  };
}

export async function unsyncSkillsFromPlatforms(
  skills: ISkill[],
  platformIds: string[],
  onProgress?: (progress: IBatchSkillSyncProgress) => void,
): Promise<IBatchSkillSyncResult> {
  if (skills.length === 0 || platformIds.length === 0) {
    return { successCount: 0, totalCount: 0, failures: [] };
  }

  const totalCount = skills.length * platformIds.length;
  let current = 0;
  let successCount = 0;
  const failures: IBatchSkillSyncFailure[] = [];

  for (const skill of skills) {
    for (const platformId of platformIds) {
      current += 1;
      onProgress?.({
        current,
        total: totalCount,
        skillName: skill.name,
        platformId,
      });

      try {
        await window.api.skill.uninstallMd(skill.name, platformId);
        successCount += 1;
      } catch (error) {
        failures.push({
          skillName: skill.name,
          platformId,
          reason: getErrorMessage(error),
        });
      }
    }
  }

  return {
    successCount,
    totalCount,
    failures,
  };
}
