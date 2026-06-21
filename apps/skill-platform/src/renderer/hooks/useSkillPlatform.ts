import type { ISkillPlatform } from '@/types/constants/platforms';
import type { ISkill } from '@/types/modules';
import {
  detectSkillPlatforms,
  exportSkill,
  getSkillMdInstallStatus,
  getSupportedSkillPlatforms,
  installSkillMd,
  installSkillMdSymlink,
  uninstallSkillMd,
} from '@renderer/services/skill/api';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useSettingsStore, useSkillStore } from '@renderer/store';
import { sortSkillPlatformsByPreference } from '@renderer/utils/skill/platform-sort';

export type ESkillInstallMode = 'copy' | 'symlink';

export interface IBatchInstallResult {
  successCount: number;
  totalCount: number;
}

export function useSkillPlatform(skill: ISkill | null | undefined, installMode: ESkillInstallMode) {
  const loadDeployedStatus = useSkillStore((state) => state.loadDeployedStatus);
  const skillPlatformOrder = useSettingsStore((state) => state.skillPlatformOrder) ?? [];
  const [supportedPlatforms, setSupportedPlatforms] = useState<ISkillPlatform[]>([]);
  const [detectedPlatforms, setDetectedPlatforms] = useState<string[]>([]);
  const [installStatus, setInstallStatus] = useState<Record<string, boolean>>({});
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());
  const [isBatchInstalling, setIsBatchInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const loadPlatforms = useCallback(async () => {
    const [platforms, detected] = await Promise.all([
      getSupportedSkillPlatforms(),
      detectSkillPlatforms(),
    ]);
    setSupportedPlatforms(platforms);
    setDetectedPlatforms(detected);
  }, []);

  const refreshInstallStatus = useCallback(async () => {
    if (!skill) {
      setInstallStatus({});
      setSelectedPlatforms(new Set());
      return;
    }
    const status = await getSkillMdInstallStatus(skill.name);
    setInstallStatus(status);
    setSelectedPlatforms(new Set());
    await loadDeployedStatus();
  }, [loadDeployedStatus, skill]);

  useEffect(() => {
    void loadPlatforms();
  }, [loadPlatforms]);

  useEffect(() => {
    if (!skill) return;
    void refreshInstallStatus();
  }, [refreshInstallStatus, skill]);

  const availablePlatforms = useMemo(
    () =>
      sortSkillPlatformsByPreference(
        supportedPlatforms.filter((platform) => detectedPlatforms.includes(platform.id)),
        skillPlatformOrder,
      ),
    [detectedPlatforms, skillPlatformOrder, supportedPlatforms],
  );

  const uninstalledPlatforms = useMemo(
    () => availablePlatforms.filter((platform) => !installStatus[platform.id]),
    [availablePlatforms, installStatus],
  );

  const togglePlatformSelection = useCallback((platformId: string) => {
    setSelectedPlatforms((previous) => {
      const next = new Set(previous);
      if (next.has(platformId)) {
        next.delete(platformId);
      } else {
        next.add(platformId);
      }
      return next;
    });
  }, []);

  const selectAllPlatforms = useCallback(() => {
    setSelectedPlatforms(new Set(uninstalledPlatforms.map((platform) => platform.id)));
  }, [uninstalledPlatforms]);

  const deselectAllPlatforms = useCallback(() => {
    setSelectedPlatforms(new Set());
  }, []);

  const batchInstall = useCallback(async (): Promise<IBatchInstallResult> => {
    if (!skill || selectedPlatforms.size === 0) {
      return { successCount: 0, totalCount: 0 };
    }

    setIsBatchInstalling(true);
    const platformIds = Array.from(selectedPlatforms);
    setInstallProgress({ current: 0, total: platformIds.length });

    try {
      const skillMdContent = await exportSkill(skill.id, 'skillmd');
      let successCount = 0;

      for (let index = 0; index < platformIds.length; index++) {
        const platformId = platformIds[index];
        setInstallProgress({ current: index + 1, total: platformIds.length });

        try {
          if (installMode === 'symlink') {
            await installSkillMdSymlink(skill.name, skillMdContent, platformId);
          } else {
            await installSkillMd(skill.name, skillMdContent, platformId);
          }
          successCount++;
        } catch (error) {
          console.error(`Failed to install "${skill.name}" to ${platformId}:`, error);
        }
      }

      await refreshInstallStatus();
      return { successCount, totalCount: platformIds.length };
    } finally {
      setIsBatchInstalling(false);
      setInstallProgress(null);
    }
  }, [installMode, refreshInstallStatus, selectedPlatforms, skill]);

  const uninstallFromPlatform = useCallback(
    async (platformId: string) => {
      if (!skill) return;
      await uninstallSkillMd(skill.name, platformId);
      await refreshInstallStatus();
    },
    [refreshInstallStatus, skill],
  );

  return {
    availablePlatforms,
    uninstalledPlatforms,
    installProgress,
    installStatus,
    isBatchInstalling,
    refreshInstallStatus,
    selectedPlatforms,
    togglePlatformSelection,
    selectAllPlatforms,
    deselectAllPlatforms,
    batchInstall,
    uninstallFromPlatform,
  };
}
