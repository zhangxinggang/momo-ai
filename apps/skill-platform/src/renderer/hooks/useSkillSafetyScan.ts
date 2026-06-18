import type { ISkillSafetyReport } from '@/types/modules';
import { useToast } from '@renderer/components/ui/Toast';
import {
  getErrorMessage,
  getSafetyScanAIConfig,
  groupSkillSafetyFindings,
} from '@renderer/services/skill/detail-utils';
import { useSettingsStore, useSkillStore } from '@renderer/store';
import { useCallback, useEffect, useMemo, useState } from 'react';

export interface ISkillSafetyScanInput {
  name: string;
  content: string;
  sourceUrl?: string;
  contentUrl?: string;
  localRepoPath?: string;
  securityAudits?: string[];
}

interface IUseSkillSafetyScanOptions {
  scanInput: ISkillSafetyScanInput | null;
  persistSkillId?: string;
  autoScan?: boolean;
  initialReport?: ISkillSafetyReport | null;
}

export function useSkillSafetyScan(options: IUseSkillSafetyScanOptions) {
  const { showToast } = useToast();
  const aiModels = useSettingsStore((state) => state.aiModels);
  const saveSafetyReport = useSkillStore((state) => state.saveSafetyReport);
  const [isScanningSafety, setIsScanningSafety] = useState(false);
  const [safetyReport, setSafetyReport] = useState<ISkillSafetyReport | null>(
    options.initialReport ?? null,
  );

  const groupedSafetyFindings = useMemo(
    () => groupSkillSafetyFindings(safetyReport?.findings ?? []),
    [safetyReport?.findings],
  );

  const safetyTone =
    safetyReport?.level === 'blocked'
      ? 'border-destructive/40 bg-destructive/5 text-destructive'
      : safetyReport?.level === 'high-risk'
        ? 'border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-300'
        : safetyReport?.level === 'warn'
          ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300'
          : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';

  const runSafetyScan = useCallback(async () => {
    if (!options.scanInput) {
      return null;
    }

    setIsScanningSafety(true);
    try {
      const report = await window.api.skill.scanSafety({
        name: options.scanInput.name,
        content: options.scanInput.content,
        sourceUrl: options.scanInput.sourceUrl,
        contentUrl: options.scanInput.contentUrl,
        localRepoPath: options.scanInput.localRepoPath,
        securityAudits: options.scanInput.securityAudits,
        aiConfig: getSafetyScanAIConfig(aiModels),
      });
      setSafetyReport(report);

      if (options.persistSkillId) {
        try {
          await saveSafetyReport(options.persistSkillId, report);
        } catch (error) {
          console.warn('Failed to persist safety report:', error);
        }
      }

      return report;
    } catch (error) {
      showToast(`安全扫描失败: ${getErrorMessage(error)}`, 'error');
      return null;
    } finally {
      setIsScanningSafety(false);
    }
  }, [aiModels, options.persistSkillId, options.scanInput, saveSafetyReport, showToast]);

  useEffect(() => {
    if (options.initialReport !== undefined) {
      setSafetyReport(options.initialReport);
    }
  }, [options.initialReport, options.scanInput?.name]);

  useEffect(() => {
    if (!options.autoScan || !options.scanInput) {
      return;
    }

    let cancelled = false;

    const runScan = async () => {
      setIsScanningSafety(true);
      try {
        const report = await window.api.skill.scanSafety({
          name: options.scanInput!.name,
          content: options.scanInput!.content,
          sourceUrl: options.scanInput!.sourceUrl,
          contentUrl: options.scanInput!.contentUrl,
          localRepoPath: options.scanInput!.localRepoPath,
          securityAudits: options.scanInput!.securityAudits,
          aiConfig: getSafetyScanAIConfig(aiModels),
        });
        if (!cancelled) {
          setSafetyReport(report);
          if (options.persistSkillId) {
            try {
              await saveSafetyReport(options.persistSkillId, report);
            } catch (error) {
              console.warn('Failed to persist auto-scan safety report:', error);
            }
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.warn('Failed to auto-scan skill safety:', error);
        }
      } finally {
        if (!cancelled) {
          setIsScanningSafety(false);
        }
      }
    };

    void runScan();

    return () => {
      cancelled = true;
    };
  }, [
    aiModels,
    options.autoScan,
    options.persistSkillId,
    options.scanInput,
    saveSafetyReport,
  ]);

  return {
    isScanningSafety,
    safetyReport,
    setSafetyReport,
    groupedSafetyFindings,
    safetyTone,
    runSafetyScan,
  };
}
