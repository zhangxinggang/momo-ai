import type { IRegistrySkill, ISkill, ISkillSafetyReport } from '@/types/modules';
import { useToast } from '@renderer/components/ui/Toast';
import {
  formatSkillTranslationError,
  getErrorMessage,
  getSafetyScanAIConfig,
  groupSkillSafetyFindings,
  renderImmersiveSegments,
  resolveSkillDescription,
  stripFrontmatter,
} from '@renderer/services/skill/detail-utils';
import { computeSkillContentFingerprint } from '@renderer/services/skill/store-update';
import {
  isSkillTranslationStale,
  readSkillTranslationSidecar,
  writeSkillTranslationSidecar,
  type ISkillTranslationSidecar,
} from '@renderer/services/skill/translation-sidecar';
import { useSettingsStore, useSkillStore } from '@renderer/store';
import { Button, Modal } from 'antd';
import {
  CheckIcon,
  DownloadIcon,
  GlobeIcon,
  LanguagesIcon,
  Loader2Icon,
  RefreshCwIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  TagIcon,
  TrashIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SkillIcon } from '../SkillIcon';
import { SkillMarkdown } from '../SkillMarkdown';
import { SkillQuickInstall } from '../SkillQuickInstall';

interface IProps {
  skill: IRegistrySkill;
  isInstalled: boolean;
  onClose: () => void;
}

/**
 * Skill Store Detail Modal
 * 技能商店详情弹窗
 */
export function SkillStoreDetail({ skill, isInstalled, onClose }: IProps) {
  const { showToast } = useToast();
  const installRegistrySkill = useSkillStore((state) => state.installRegistrySkill);
  const updateRegistrySkill = useSkillStore((state) => state.updateRegistrySkill);
  const getRegistrySkillUpdateStatus = useSkillStore((state) => state.getRegistrySkillUpdateStatus);
  const uninstallRegistrySkill = useSkillStore((state) => state.uninstallRegistrySkill);
  const skills = useSkillStore((state) => state.skills);
  const saveSafetyReport = useSkillStore((state) => state.saveSafetyReport);
  const translateContent = useSkillStore((state) => state.translateContent);
  const getTranslationState = useSkillStore((state) => state.getTranslationState);
  const clearTranslation = useSkillStore((state) => state.clearTranslation);
  const translationMode = useSettingsStore((state) => state.translationMode);
  const autoScanBeforeInstall = useSettingsStore((state) => state.autoScanStoreSkillsBeforeInstall);
  const aiModels = useSettingsStore((state) => state.aiModels);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isUninstalling, setIsUninstalling] = useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [justInstalled, setJustInstalled] = useState(false);
  const [justUninstalled, setJustUninstalled] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isScanningSafety, setIsScanningSafety] = useState(false);
  const [safetyReport, setSafetyReport] = useState<ISkillSafetyReport | null>(null);
  const [pendingHighRiskInstallReport, setPendingHighRiskInstallReport] =
    useState<ISkillSafetyReport | null>(null);
  const groupedSafetyFindings = safetyReport
    ? groupSkillSafetyFindings(safetyReport.findings ?? [])
    : [];
  const [showTranslation, setShowTranslation] = useState(false);
  const [showRetranslatePrompt, setShowRetranslatePrompt] = useState(false);
  const [deploySkill, setDeploySkill] = useState<ISkill | null>(null);
  const stalePromptFingerprintRef = useRef<string | null>(null);
  const [translationSidecar, setTranslationSidecar] = useState<ISkillTranslationSidecar | null>(
    null,
  );

  const targetLang = '中文';

  const installedSkill = skills.find(
    (item) => item.registry_slug === skill.slug || item.name === skill.name,
  );
  const installedSkillMdContent = installedSkill?.instructions || installedSkill?.content || '';
  const registrySkillMdContent = typeof skill.content === 'string' ? skill.content : '';
  const originalSkillMdContent =
    installedSkillMdContent.trim() || registrySkillMdContent.trim() || skill.description;
  const translationCacheKey = `storedoc_v2_${skill.slug}_${targetLang}_${translationMode}`;
  const translationFingerprint = useMemo(
    () => computeSkillContentFingerprint(originalSkillMdContent),
    [originalSkillMdContent],
  );
  const translationState = getTranslationState(translationCacheKey, translationFingerprint);
  const hasStaleTranslation = translationSidecar
    ? isSkillTranslationStale(translationSidecar, originalSkillMdContent)
    : translationState.isStale;
  const cachedTranslation = hasStaleTranslation
    ? null
    : (translationSidecar?.content ?? translationState.value);
  const effectiveSkillMdContent =
    showTranslation && cachedTranslation ? cachedTranslation : originalSkillMdContent;
  const effectiveRenderedContent = useMemo(
    () => stripFrontmatter(effectiveSkillMdContent),
    [effectiveSkillMdContent],
  );
  const translatedRenderedContent = useMemo(
    () => (cachedTranslation ? stripFrontmatter(cachedTranslation) : null),
    [cachedTranslation],
  );
  const resolvedDescription = useMemo(
    () => resolveSkillDescription(effectiveSkillMdContent) || skill.description,
    [effectiveSkillMdContent, skill.description],
  );

  const scanSafety = useCallback(async () => {
    setIsScanningSafety(true);
    try {
      const report = await window.api.skill.scanSafety({
        name: skill.name,
        content: skill.content,
        sourceUrl: skill.source_url,
        contentUrl: skill.content_url,
        securityAudits: skill.security_audits,
        aiConfig: getSafetyScanAIConfig(aiModels),
      });
      setSafetyReport(report);
      // If already installed, persist to DB
      const installedSkill = skills.find(
        (s) => s.registry_slug === skill.slug || s.name === skill.name,
      );
      if (installedSkill) {
        try {
          await saveSafetyReport(installedSkill.id, report);
        } catch (err) {
          console.warn('Failed to persist store safety report:', err);
        }
      }
      return report;
    } catch (error: unknown) {
      showToast(`安全扫描失败: ${getErrorMessage(error)}`, 'error');
      return null;
    } finally {
      setIsScanningSafety(false);
    }
  }, [
    aiModels,
    saveSafetyReport,
    showToast,
    skill.content,
    skill.content_url,
    skill.name,
    skill.security_audits,
    skills,
    skill.source_url,
  ]);

  const handleTranslate = async () => {
    if (cachedTranslation) {
      setShowTranslation(!showTranslation);
      return;
    }
    setIsTranslating(true);
    try {
      const translated = await translateContent(
        originalSkillMdContent,
        translationCacheKey,
        targetLang,
        {
          sourceFingerprint: translationFingerprint,
        },
      );

      if (!translated) {
        throw new Error('TRANSLATION_EMPTY');
      }

      if (installedSkill && originalSkillMdContent.trim()) {
        const sidecar = await writeSkillTranslationSidecar({
          skillId: installedSkill.id,
          sourceContent: originalSkillMdContent,
          translatedContent: translated,
          targetLanguage: targetLang,
          translationMode,
        });
        setTranslationSidecar(sidecar);
      }

      setShowTranslation(true);
      showToast('翻译完成', 'success');
    } catch (error: unknown) {
      showToast(formatSkillTranslationError(error), 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleRefreshTranslation = async () => {
    setIsTranslating(true);
    try {
      clearTranslation(translationCacheKey);
      const translated = await translateContent(
        originalSkillMdContent,
        translationCacheKey,
        targetLang,
        {
          forceRefresh: true,
          sourceFingerprint: translationFingerprint,
        },
      );

      if (!translated) {
        throw new Error('TRANSLATION_EMPTY');
      }

      if (installedSkill && originalSkillMdContent.trim()) {
        const sidecar = await writeSkillTranslationSidecar({
          skillId: installedSkill.id,
          sourceContent: originalSkillMdContent,
          translatedContent: translated,
          targetLanguage: targetLang,
          translationMode,
        });
        setTranslationSidecar(sidecar);
      }

      setShowTranslation(true);
      setShowRetranslatePrompt(false);
      showToast('翻译已刷新', 'success');
    } catch (error: unknown) {
      showToast(formatSkillTranslationError(error), 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  useEffect(() => {
    stalePromptFingerprintRef.current = null;
    setShowRetranslatePrompt(false);
    setTranslationSidecar(null);
  }, [skill.slug]);

  useEffect(() => {
    let cancelled = false;

    async function loadTranslationSidecar() {
      if (!installedSkill) {
        setTranslationSidecar(null);
        return;
      }

      try {
        const sidecar = await readSkillTranslationSidecar(
          installedSkill.id,
          targetLang,
          translationMode,
        );
        if (!cancelled) {
          setTranslationSidecar(sidecar);
        }
      } catch {
        if (!cancelled) {
          setTranslationSidecar(null);
        }
      }
    }

    void loadTranslationSidecar();

    return () => {
      cancelled = true;
    };
  }, [installedSkill?.id, targetLang, translationMode]);

  useEffect(() => {
    setShowTranslation(Boolean(cachedTranslation));
  }, [cachedTranslation]);

  useEffect(() => {
    if (!hasStaleTranslation) {
      stalePromptFingerprintRef.current = null;
      return;
    }

    setShowTranslation(false);
    if (stalePromptFingerprintRef.current === translationFingerprint) {
      return;
    }

    stalePromptFingerprintRef.current = translationFingerprint;
    setShowRetranslatePrompt(true);
  }, [hasStaleTranslation, translationFingerprint]);

  const handleInstall = async () => {
    if (isInstalling || installed) {
      return;
    }
    setIsInstalling(true);
    try {
      const performInstall = async () => {
        const result = await installRegistrySkill(skill);
        if (result) {
          setJustInstalled(true);
          showToast(`${'已导入'}: ${skill.name}`, 'success');
          setDeploySkill(result);
          setTimeout(() => setJustInstalled(false), 2000);
        }
      };

      if (autoScanBeforeInstall) {
        const report = await scanSafety();
        const shouldBlockInstall = report?.scanMethod === 'ai' && report.level === 'blocked';
        if (shouldBlockInstall) {
          showToast('因安全风险已阻止安装。', 'error');
          return;
        }
        if (report?.scanMethod === 'ai' && report.level === 'high-risk') {
          setPendingHighRiskInstallReport(report);
          return;
        }
        if (
          report?.scanMethod === 'static' &&
          (report.level === 'blocked' || report.level === 'high-risk')
        ) {
          showToast(
            '静态扫描发现了潜在风险模式。安装前请先查看安全报告，但在没有 AI 确认前不会直接阻止安装。',
            'warning',
          );
        }
      }

      await performInstall();
    } catch (e) {
      const message = getErrorMessage(e);
      if (message.includes('ISkill 已存在') || message.includes('ISkill already exists')) {
        showToast('ISkill 已存在', 'warning');
        return;
      }
      showToast(`${'导入失败'}: ${message}`, 'error');
    } finally {
      setIsInstalling(false);
    }
  };

  const handleUninstall = async () => {
    setIsUninstalling(true);
    try {
      const success = await uninstallRegistrySkill(skill.slug);
      if (success) {
        setJustUninstalled(true);
        showToast(`卸载成功: ${skill.name}`, 'success');
        setTimeout(() => {
          setJustUninstalled(false);
          onClose();
        }, 1000);
      }
    } catch (e) {
      showToast(`${'更新失败'}: ${e}`, 'error');
    } finally {
      setIsUninstalling(false);
    }
  };

  const handleCheckUpdate = async () => {
    setIsCheckingUpdate(true);
    try {
      const check = await getRegistrySkillUpdateStatus(skill);
      setUpdateStatus(check.status);
      const message =
        check.status === 'update-available'
          ? '有可用更新'
          : check.status === 'conflict'
            ? '本地修改与商店更新冲突'
            : check.status === 'local-modified'
              ? '检测到本地修改'
              : check.status === 'up-to-date'
                ? '已是最新'
                : '未安装';
      showToast(message, check.status === 'update-available' ? 'success' : 'info');
    } catch (error) {
      showToast(`检查更新失败: ${getErrorMessage(error)}`, 'error');
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const handleUpdate = async (overwriteLocalChanges = false) => {
    setIsUpdating(true);
    try {
      const result = await updateRegistrySkill(skill.slug, { overwriteLocalChanges });
      if (!result) {
        showToast('更新失败', 'error');
        return;
      }
      setUpdateStatus(result.status);
      if (result.status === 'updated') {
        showToast(`更新成功: ${skill.name}`, 'success');
        return;
      }
      if (result.status === 'conflict' || result.status === 'local-modified') {
        showToast('本地修改与商店更新冲突', 'warning');
        return;
      }
      if (result.status === 'up-to-date') {
        showToast('已是最新', 'info');
      }
    } catch (error) {
      showToast(`${'更新失败'}: ${getErrorMessage(error)}`, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const installed = isInstalled || justInstalled;
  const canShowUpdateActions = installed && Boolean(skill.content_url || skill.content);

  return (
    <>
      <Modal
        open
        zIndex={1000}
        onCancel={onClose}
        width={672}
        title={
          <div className='flex items-start gap-3 pr-6'>
            <SkillIcon
              iconUrl={skill.icon_url}
              iconEmoji={skill.icon_emoji}
              backgroundColor={skill.icon_background}
              name={skill.name}
              size='lg'
            />
            <div className='min-w-0 flex-1'>
              <h2 className='text-foreground text-base font-bold'>{skill.name}</h2>
              <p className='text-muted-foreground mt-1 line-clamp-2 text-xs'>
                {resolvedDescription}
              </p>
              <div className='mt-2 flex items-center gap-3'>
                <span className='bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[11px] font-bold'>
                  v{skill.version}
                </span>
                <div className='text-muted-foreground flex items-center gap-1 text-[11px]'>
                  <GlobeIcon className='h-3 w-3' />
                  {skill.author}
                </div>
              </div>
            </div>
          </div>
        }
        footer={
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <div className='text-muted-foreground text-xs'>
              {skill.category && <span className='capitalize'>{skill.category}</span>}
            </div>
            <div className='flex flex-wrap items-center justify-end gap-2'>
              {installed && !justUninstalled ? (
                <>
                  {canShowUpdateActions && (
                    <>
                      <Button
                        size='small'
                        onClick={handleCheckUpdate}
                        disabled={isCheckingUpdate || isUpdating}
                        icon={
                          isCheckingUpdate ? (
                            <Loader2Icon className='h-3.5 w-3.5 animate-spin' />
                          ) : (
                            <RefreshCwIcon className='h-3.5 w-3.5' />
                          )
                        }
                        className='border-border hover:bg-muted/60 flex items-center gap-1.5 rounded-lg border px-3'>
                        {'检查更新'}
                      </Button>
                      <Button
                        type='primary'
                        size='small'
                        onClick={() => handleUpdate(false)}
                        disabled={isCheckingUpdate || isUpdating}
                        icon={
                          isUpdating ? (
                            <Loader2Icon className='h-3.5 w-3.5 animate-spin' />
                          ) : (
                            <DownloadIcon className='h-3.5 w-3.5' />
                          )
                        }
                        className='flex items-center gap-1.5 rounded-lg px-3'>
                        {'更新'}
                      </Button>
                      {(updateStatus === 'conflict' || updateStatus === 'local-modified') && (
                        <Button
                          size='small'
                          onClick={() => handleUpdate(true)}
                          disabled={isUpdating}
                          className='rounded-lg bg-amber-500/10 px-3 text-xs text-amber-600 hover:bg-amber-500/20'>
                          {'覆盖本地修改'}
                        </Button>
                      )}
                    </>
                  )}
                  <Button
                    type='text'
                    danger
                    size='small'
                    onClick={handleUninstall}
                    disabled={isUninstalling}
                    icon={
                      isUninstalling ? (
                        <Loader2Icon className='h-3.5 w-3.5 animate-spin' />
                      ) : (
                        <TrashIcon className='h-3.5 w-3.5' />
                      )
                    }
                    className='text-destructive hover:bg-destructive/10 flex items-center gap-1.5 rounded-lg px-3'>
                    {'从我的 Skills 中移除'}
                  </Button>
                  <div className='flex items-center gap-2 rounded-xl bg-green-500/10 px-4 py-2 text-sm font-bold text-green-500'>
                    <CheckIcon className='h-4 w-4' />
                    {'已导入'}
                  </div>
                </>
              ) : (
                <Button
                  type='primary'
                  onClick={handleInstall}
                  disabled={isInstalling}
                  loading={isInstalling}
                  icon={isInstalling ? undefined : <DownloadIcon className='h-4 w-4' />}
                  className='shadow-primary/20 rounded-xl px-6 py-2.5 text-sm font-bold shadow-lg active:scale-95'>
                  {isInstalling ? '添加中...' : '导入到我的 Skills'}
                </Button>
              )}
            </div>
          </div>
        }
        styles={{
          body: { maxHeight: 'min(70vh, 560px)', overflowY: 'auto', padding: '1.25rem' },
          mask: { backdropFilter: 'blur(4px)' },
        }}
        destroyOnClose={false}>
        <div className='scrollbar-hide'>
          {/* Translate button */}
          <div className='mb-3 flex items-center justify-end'>
            <div className='flex items-center gap-2'>
              <Button
                size='small'
                onClick={handleTranslate}
                disabled={isTranslating}
                icon={
                  isTranslating ? (
                    <Loader2Icon className='h-3.5 w-3.5 animate-spin' />
                  ) : (
                    <LanguagesIcon className='h-3.5 w-3.5' />
                  )
                }
                className={`flex items-center gap-1.5 rounded-lg px-3 text-xs font-medium ${
                  showTranslation && cachedTranslation
                    ? 'bg-primary/10 text-primary'
                    : 'bg-accent/50 hover:bg-accent text-muted-foreground hover:text-foreground'
                }`}>
                {isTranslating
                  ? '翻译中...'
                  : showTranslation && cachedTranslation
                    ? '显示原文'
                    : cachedTranslation
                      ? '显示译文'
                      : 'AI 翻译'}
              </Button>
              {cachedTranslation && (
                <Button
                  size='small'
                  onClick={handleRefreshTranslation}
                  disabled={isTranslating}
                  icon={
                    <RefreshCwIcon
                      className={`h-3.5 w-3.5 ${isTranslating ? 'animate-spin' : ''}`}
                    />
                  }
                  className='bg-accent/50 hover:bg-accent text-muted-foreground hover:text-foreground rounded-lg px-3 text-xs font-medium'
                  title={'刷新翻译'}>
                  {'刷新翻译'}
                </Button>
              )}
            </div>
          </div>

          {/* SKILL.md content rendered as markdown */}
          {(() => {
            if (showTranslation && translatedRenderedContent) {
              // Immersive mode: interleaved original + translation
              if (translationMode === 'immersive') {
                const segments = renderImmersiveSegments(translatedRenderedContent);
                return (
                  <div className='prose prose-sm dark:prose-invert prose-headings:text-foreground prose-h1:text-base prose-h1:font-bold prose-h2:text-sm prose-h2:font-semibold prose-h3:text-xs prose-h3:font-semibold prose-p:text-foreground/80 prose-p:text-[13px] prose-strong:text-foreground prose-li:text-foreground/80 prose-li:text-[13px] prose-code:text-primary prose-pre:bg-muted prose-pre:border prose-pre:border-border max-w-none text-[13px]'>
                    <div className='markdown-body'>
                      {segments.map((seg, i) =>
                        seg.type === 'translation' ? (
                          <div
                            key={i}
                            className='border-primary/40 text-primary/70 my-1 border-l-2 pl-3 text-[12px] italic'>
                            <SkillMarkdown
                              content={seg.text}
                              sourceUrl={skill.source_url}
                              contentUrl={skill.content_url}
                            />
                          </div>
                        ) : (
                          <SkillMarkdown
                            key={i}
                            content={seg.text}
                            sourceUrl={skill.source_url}
                            contentUrl={skill.content_url}
                          />
                        ),
                      )}
                    </div>
                  </div>
                );
              }
              // Full mode: show translated text only
              return (
                <div className='prose prose-sm dark:prose-invert prose-headings:text-foreground prose-h1:text-base prose-h1:font-bold prose-h2:text-sm prose-h2:font-semibold prose-h3:text-xs prose-h3:font-semibold prose-p:text-foreground/80 prose-p:text-[13px] prose-strong:text-foreground prose-li:text-foreground/80 prose-li:text-[13px] prose-code:text-primary prose-pre:bg-muted prose-pre:border prose-pre:border-border max-w-none text-[13px]'>
                  <div className='markdown-body'>
                    <SkillMarkdown
                      content={translatedRenderedContent}
                      sourceUrl={skill.source_url}
                      contentUrl={skill.content_url}
                    />
                  </div>
                </div>
              );
            }

            return (
              <div className='prose prose-sm dark:prose-invert prose-headings:text-foreground prose-h1:text-base prose-h1:font-bold prose-h2:text-sm prose-h2:font-semibold prose-h3:text-xs prose-h3:font-semibold prose-p:text-foreground/80 prose-p:text-[13px] prose-strong:text-foreground prose-li:text-foreground/80 prose-li:text-[13px] prose-code:text-primary prose-pre:bg-muted prose-pre:border prose-pre:border-border max-w-none text-[13px]'>
                <div className='markdown-body'>
                  <SkillMarkdown
                    content={effectiveRenderedContent}
                    sourceUrl={skill.source_url}
                    contentUrl={skill.content_url}
                  />
                </div>
              </div>
            );
          })()}

          {/* Prerequisites */}
          {skill.prerequisites && skill.prerequisites.length > 0 && (
            <div className='mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3'>
              <h4 className='mb-2 text-xs font-bold uppercase tracking-wider text-amber-500'>
                {'前置条件'}
              </h4>
              <ul className='space-y-1'>
                {skill.prerequisites.map((prereq, i) => (
                  <li key={i} className='text-foreground/80 flex items-start gap-2 text-xs'>
                    <span className='mt-0.5 text-amber-500'>•</span>
                    {prereq}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Meta info */}
          <div className='mt-4 grid grid-cols-2 gap-2'>
            {skill.weekly_installs && (
              <div className='bg-accent/30 border-border rounded-xl border p-3'>
                <span className='text-muted-foreground text-[10px] font-bold uppercase tracking-wider'>
                  {'每周安装量'}
                </span>
                <div className='text-foreground mt-1 text-xs'>{skill.weekly_installs}</div>
              </div>
            )}

            {skill.github_stars && (
              <div className='bg-accent/30 border-border rounded-xl border p-3'>
                <span className='text-muted-foreground text-[10px] font-bold uppercase tracking-wider'>
                  {'GitHub Star'}
                </span>
                <div className='text-foreground mt-1 text-xs'>{skill.github_stars}</div>
              </div>
            )}

            {/* Source */}
            {skill.source_url && (
              <div className='bg-accent/30 border-border rounded-xl border p-3'>
                <span className='text-muted-foreground text-[10px] font-bold uppercase tracking-wider'>
                  {'来源'}
                </span>
                <a
                  href={skill.source_url}
                  target='_blank'
                  rel='noreferrer'
                  className='text-primary mt-1 block truncate text-xs hover:underline'>
                  {skill.source_url.replace('https://github.com/', '')}
                </a>
              </div>
            )}

            {skill.store_url && (
              <div className='bg-accent/30 border-border rounded-xl border p-3'>
                <span className='text-muted-foreground text-[10px] font-bold uppercase tracking-wider'>
                  {'商店页面'}
                </span>
                <a
                  href={skill.store_url}
                  target='_blank'
                  rel='noreferrer'
                  className='text-primary mt-1 block truncate text-xs hover:underline'>
                  {skill.store_url.replace('https://', '')}
                </a>
              </div>
            )}

            {/* Compatibility */}
            {skill.compatibility && skill.compatibility.length > 0 && (
              <div className='bg-accent/30 border-border rounded-xl border p-3'>
                <span className='text-muted-foreground text-[10px] font-bold uppercase tracking-wider'>
                  {'兼容平台'}
                </span>
                <div className='mt-1 flex flex-wrap gap-1'>
                  {skill.compatibility.map((platform) => (
                    <span
                      key={platform}
                      className='bg-primary/10 text-primary rounded px-1.5 py-0.5 text-[10px] capitalize'>
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className='bg-accent/30 border-border col-span-2 rounded-xl border p-3'>
              <div className='flex items-center justify-between gap-2'>
                <div className='flex min-w-0 items-center gap-1.5'>
                  {safetyReport?.level === 'safe' ? (
                    <ShieldCheckIcon className='h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400' />
                  ) : safetyReport ? (
                    <ShieldAlertIcon className='h-3.5 w-3.5 shrink-0 text-amber-500' />
                  ) : (
                    <ShieldAlertIcon className='text-muted-foreground h-3.5 w-3.5 shrink-0' />
                  )}
                  <span className='text-muted-foreground text-[10px] font-bold uppercase tracking-wider'>
                    {'安全扫描'}
                  </span>
                  {safetyReport && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                        safetyReport.level === 'safe'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : safetyReport.level === 'blocked'
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                      }`}>
                      {(
                        {
                          safe: '安全',
                          warn: '需留意',
                          'high-risk': '高风险',
                          blocked: '已拦截',
                        } as Record<string, string>
                      )[safetyReport.level] ?? safetyReport.level}
                    </span>
                  )}
                </div>
                <Button
                  type='link'
                  size='small'
                  onClick={() => void scanSafety()}
                  disabled={isScanningSafety}
                  className='text-muted-foreground hover:text-foreground h-auto shrink-0 p-0 text-[10px] font-medium'>
                  {isScanningSafety ? '扫描中...' : '扫描'}
                </Button>
              </div>
              {safetyReport && (
                <p className='text-muted-foreground mt-1.5 text-[11px] leading-relaxed'>
                  {(() => {
                    const high = safetyReport.findings.filter((f) => f.severity === 'high').length;
                    const warn = safetyReport.findings.filter((f) => f.severity === 'warn').length;
                    if (safetyReport.level === 'safe') {
                      return `未发现明显恶意模式，共检查 ${safetyReport.checkedFileCount} 个文件。`;
                    }
                    if (safetyReport.level === 'warn') {
                      return `发现 ${warn} 条需留意项，共检查 ${safetyReport.checkedFileCount} 个文件。建议在添加或执行前再看一眼源码。`;
                    }
                    if (safetyReport.level === 'high-risk') {
                      return `发现 ${high} 条高风险项、${warn} 条警告，共检查 ${safetyReport.checkedFileCount} 个文件。建议人工审查后再决定是否继续。`;
                    }
                    if (safetyReport.level === 'blocked') {
                      return `发现明显危险模式，共检查 ${safetyReport.checkedFileCount} 个文件。当前建议直接拦截，不要继续安装。`;
                    }
                    return safetyReport.summary;
                  })()}
                </p>
              )}
              {safetyReport && (
                <p className='text-muted-foreground mt-1 text-[10px] leading-relaxed'>
                  {safetyReport.scanMethod === 'ai'
                    ? 'AI 扫描会结合模型上下文审阅 SKILL.md 和相关仓库文件，因此它才是安装决策的主要依据。'
                    : '静态扫描只检查基础恶意模式，例如 pipe-to-shell、危险删除命令、明显持久化钩子、可疑下载或打包可执行文件。它不能替代 AI 对意图和上下文的审查。'}
                </p>
              )}
              {groupedSafetyFindings.length > 0 && (
                <ul className='mt-1.5 space-y-0.5'>
                  {groupedSafetyFindings.slice(0, 3).map((finding) => (
                    <li
                      key={`${finding.code}-${finding.filePaths[0] || finding.evidences[0] || ''}`}
                      className='text-muted-foreground text-[11px]'>
                      •{' '}
                      {(
                        {
                          'shell-pipe-exec': '检测到远程下载后直接管道执行',
                          'dangerous-delete': '检测到高危删除命令',
                          'encoded-powershell': '检测到编码后的 PowerShell 执行',
                          'encoded-shell-bootstrap': '检测到编码载荷解码后立即执行',
                          'privilege-escalation': '检测到提权执行请求',
                          'system-persistence': '检测到系统持久化或服务机制',
                          'secret-access': '检测到读取密钥或凭证路径',
                          'security-bypass': '检测到绕过审批或沙箱的描述',
                          'network-exfil': '检测到可能的凭证外传行为',
                          'exec-bit': '检测到可执行权限修改',
                          'network-bootstrap': '检测到远程下载行为',
                          'env-mutation': '检测到环境变量或 shell 配置修改',
                          'untrusted-source-host': '来源主机不是常见可信商店',
                          'external-audits': '商店提供了外部安全审计元数据',
                          'internal-source': '来源地址指向本地或内网',
                          'unknown-source': '缺少来源信息',
                          'invalid-source-url': '来源地址格式无效',
                          'insecure-source-url': '来源地址不是 HTTPS',
                          'persistence-file': '仓库包含 workflow 或持久化相关文件',
                          'high-risk-binary': '仓库包含高风险可执行文件',
                          'script-file': '仓库包含脚本文件',
                        } as Record<string, string>
                      )[finding.code] ?? finding.title}
                      {finding.count > 1 ? ` × ${finding.count}` : ''}
                      {finding.filePaths[0] ? ` · ${finding.filePaths[0]}` : ''}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {skill.security_audits && skill.security_audits.length > 0 && (
            <div className='bg-accent/30 border-border mt-4 rounded-xl border p-3'>
              <span className='text-muted-foreground text-[10px] font-bold uppercase tracking-wider'>
                {'安全审计'}
              </span>
              <div className='mt-2 space-y-1'>
                {skill.security_audits.map((audit) => (
                  <div key={audit} className='text-foreground/80 text-xs'>
                    {audit}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {skill.tags.length > 0 && (
            <div className='mt-4 flex flex-wrap items-center gap-2'>
              <TagIcon className='text-muted-foreground h-3 w-3' />
              {skill.tags.map((tag) => (
                <span
                  key={tag}
                  className='bg-accent text-muted-foreground rounded-full px-2 py-0.5 text-[10px]'>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Deploy to Platforms modal — auto-shown after adding from store */}
      {deploySkill && (
        <SkillQuickInstall skill={deploySkill} onClose={() => setDeploySkill(null)} />
      )}

      <Modal
        open={Boolean(pendingHighRiskInstallReport)}
        title={'检测到高风险技能'}
        onCancel={() => setPendingHighRiskInstallReport(null)}
        onOk={async () => {
          if (!pendingHighRiskInstallReport) return;
          setPendingHighRiskInstallReport(null);
          setIsInstalling(true);
          try {
            const result = await installRegistrySkill(skill);
            if (result) {
              setJustInstalled(true);
              showToast(`${'已导入'}: ${skill.name}`, 'success');
              setDeploySkill(result);
              setTimeout(() => setJustInstalled(false), 2000);
            }
          } catch (error) {
            const message = getErrorMessage(error);
            if (message.includes('ISkill 已存在') || message.includes('ISkill already exists')) {
              showToast('ISkill 已存在', 'warning');
              return;
            }
            showToast(`导入失败: ${message}`, 'error');
          } finally {
            setIsInstalling(false);
          }
        }}
        okText={'仍然添加'}
        cancelText={'取消'}
        okButtonProps={{ danger: true }}
        cancelButtonProps={{ autoFocus: true }}
        destroyOnClose>
        {pendingHighRiskInstallReport ? (
          <div className='space-y-3 text-left'>
            <p>{pendingHighRiskInstallReport.summary}</p>
            <ul className='space-y-1'>
              {pendingHighRiskInstallReport.findings.slice(0, 5).map((finding) => (
                <li key={`${finding.code}-${finding.filePath || finding.evidence || ''}`}>
                  •{' '}
                  {(
                    {
                      'shell-pipe-exec': '检测到远程下载后直接管道执行',
                      'dangerous-delete': '检测到高危删除命令',
                      'encoded-powershell': '检测到编码后的 PowerShell 执行',
                      'encoded-shell-bootstrap': '检测到编码载荷解码后立即执行',
                      'privilege-escalation': '检测到提权执行请求',
                      'system-persistence': '检测到系统持久化或服务机制',
                      'secret-access': '检测到读取密钥或凭证路径',
                      'security-bypass': '检测到绕过审批或沙箱的描述',
                      'network-exfil': '检测到可能的凭证外传行为',
                      'exec-bit': '检测到可执行权限修改',
                      'network-bootstrap': '检测到远程下载行为',
                      'env-mutation': '检测到环境变量或 shell 配置修改',
                      'untrusted-source-host': '来源主机不是常见可信商店',
                      'external-audits': '商店提供了外部安全审计元数据',
                      'internal-source': '来源地址指向本地或内网',
                      'unknown-source': '缺少来源信息',
                      'invalid-source-url': '来源地址格式无效',
                      'insecure-source-url': '来源地址不是 HTTPS',
                      'persistence-file': '仓库包含 workflow 或持久化相关文件',
                      'high-risk-binary': '仓库包含高风险可执行文件',
                      'script-file': '仓库包含脚本文件',
                    } as Record<string, string>
                  )[finding.code] ?? finding.title}
                  {finding.filePath ? ` · ${finding.filePath}` : ''}
                </li>
              ))}
            </ul>
            <p className='text-xs opacity-80'>{'这个技能已被标记为高风险。确定仍要继续吗？'}</p>
          </div>
        ) : null}
      </Modal>
      <Modal
        open={showRetranslatePrompt}
        title={'已保存的翻译已过期'}
        onCancel={() => setShowRetranslatePrompt(false)}
        onOk={async () => {
          setShowRetranslatePrompt(false);
          await handleRefreshTranslation();
        }}
        okText={'立即重新翻译'}
        cancelText={'取消'}
        cancelButtonProps={{ autoFocus: true }}
        destroyOnClose>
        <p>{'这个技能的 SKILL.md 在上次翻译后已经发生变化，现在要重新翻译吗？'}</p>
      </Modal>
    </>
  );
}
