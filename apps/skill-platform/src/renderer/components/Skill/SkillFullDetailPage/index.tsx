import type { ISkill } from '@/types/modules';
import { useToast } from '@renderer/components/ui/Toast';
import { APP_LOCALE } from '@renderer/constants/common';
import { useAppName } from '@renderer/hooks/useAppName';
import { useSkillContentTranslation } from '@renderer/hooks/useSkillContentTranslation';
import { useSkillPlatform } from '@renderer/hooks/useSkillPlatform';
import { useSkillSafetyScan } from '@renderer/hooks/useSkillSafetyScan';
import { useUnsavedLeaveGuard } from '@renderer/hooks/useUnsavedLeaveGuard';
import {
  exportSkill,
  exportSkillZip,
  readSkillLocalFileByPath,
} from '@renderer/services/skill/api';
import {
  downloadSkillExport,
  downloadSkillZipExport,
  getErrorMessage,
} from '@renderer/services/skill/detail-utils';
import type { ESkillInstallMode } from '@renderer/services/skill/platform-sync';
import type { IProjectDetailSkillContext } from '@renderer/services/skill/project-detail-adapter';
import { useSettingsStore, useSkillStore } from '@renderer/store';
import { Button, Modal } from 'antd';
import 'highlight.js/styles/github-dark.css';
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  ArrowUpIcon,
  BookOpenIcon,
  CheckCircleIcon,
  CodeIcon,
  FolderOpenIcon,
  GlobeIcon,
  InfoIcon,
  PencilIcon,
  RefreshCwIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  ShieldIcon,
  TrashIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditSkillModal } from '../EditSkillModal';
import { SkillCodePane } from '../SkillCodePane';
import { SkillFileEditor, type ISkillFileEditorHandle } from '../SkillFileEditor';
import { SkillIcon } from '../SkillIcon';
import '../SkillMarkdown/index.module.less';
import { SkillPlatformPanel } from '../SkillPlatformPanel';
import { SkillPreviewPane } from '../SkillPreviewPane';

/**
 * Full-width ISkill Detail Page
 * 全宽技能详情页
 */
interface IProps {
  overrideSkill?: ISkill;
  projectContext?: IProjectDetailSkillContext | null;
  onBack?: () => void;
}

export function SkillFullDetailPage({ overrideSkill, projectContext, onBack }: IProps = {}) {
  const appName = useAppName();
  const { showToast } = useToast();
  const selectedSkillId = useSkillStore((state) => state.selectedSkillId);
  const skills = useSkillStore((state) => state.skills);
  const selectSkill = useSkillStore((state) => state.selectSkill);
  const deleteSkill = useSkillStore((state) => state.deleteSkill);
  const loadSkills = useSkillStore((state) => state.loadSkills);
  const syncSkillFromRepo = useSkillStore((state) => state.syncSkillFromRepo);

  const selectedSkill = useMemo(() => {
    if (overrideSkill) {
      return overrideSkill;
    }
    return skills.find((s) => s.id === selectedSkillId);
  }, [overrideSkill, skills, selectedSkillId]);
  const isProjectDetail = Boolean(projectContext);

  const [copyStatus, setCopyStatus] = useState<Record<string, boolean>>({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'files'>('preview');

  const translationMode = useSettingsStore((state) => state.translationMode);
  const skillInstallMethod = useSettingsStore((state) => state.skillInstallMethod);
  const autoScanInstalledSkills = useSettingsStore((state) => state.autoScanInstalledSkills);
  const [installMode, setInstallMode] = useState<ESkillInstallMode>(() => skillInstallMethod);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [resolvedSkillMdContent, setResolvedSkillMdContent] = useState('');
  const [fileEditorHasUnsavedChanges, setFileEditorHasUnsavedChanges] = useState(false);
  const fileEditorRef = useRef<ISkillFileEditorHandle>(null);
  const contentScrollRef = useRef<HTMLDivElement>(null);

  const targetLang = '中文';
  const translationCacheKey = selectedSkill
    ? `skilldoc_v2_${selectedSkill.id}_${targetLang}_${translationMode}`
    : '';

  const {
    isTranslating,
    showTranslation,
    hasStaleTranslation,
    hasDisplayableTranslation,
    cachedTranslation: effectiveInstructionsTranslation,
    effectiveContent: effectiveSkillMdContent,
    resolvedDescription,
    isRetranslatePromptOpen,
    setIsRetranslatePromptOpen,
    handleTranslate: handleTranslateSkill,
  } = useSkillContentTranslation({
    cacheKey: translationCacheKey,
    sourceContent: resolvedSkillMdContent,
    targetLang,
    sidecarSkillId: isProjectDetail ? undefined : selectedSkill?.id,
    fallbackDescription: selectedSkill?.description,
    resetKey: selectedSkill?.id,
  });

  const safetyScanInput = useMemo(() => {
    if (!selectedSkill) {
      return null;
    }
    return {
      name: selectedSkill.name,
      content: resolvedSkillMdContent || selectedSkill.instructions || selectedSkill.content || '',
      sourceUrl: selectedSkill.source_url,
      contentUrl: selectedSkill.content_url,
      localRepoPath: selectedSkill.local_repo_path,
    };
  }, [resolvedSkillMdContent, selectedSkill]);

  const { isScanningSafety, safetyReport, groupedSafetyFindings, safetyTone, runSafetyScan } =
    useSkillSafetyScan({
      scanInput: safetyScanInput,
      persistSkillId: isProjectDetail ? undefined : selectedSkill?.id,
      autoScan: Boolean(autoScanInstalledSkills && selectedSkill && !isProjectDetail),
      initialReport: selectedSkill?.safetyReport ?? null,
    });

  const { confirmLeave, UnsavedLeaveDialog } = useUnsavedLeaveGuard({
    isDirty: () => activeTab === 'files' && fileEditorHasUnsavedChanges,
    onSave: async () => fileEditorRef.current?.saveUnsavedChanges() ?? true,
    onDiscard: () => fileEditorRef.current?.discardUnsavedChanges(),
  });

  const requestLeaveFileEditing = useCallback(
    (action: () => void) => {
      void (async () => {
        if (activeTab !== 'files' || !fileEditorHasUnsavedChanges) {
          action();
          return;
        }
        const canLeave = await confirmLeave();
        if (canLeave) {
          action();
        }
      })();
    },
    [activeTab, confirmLeave, fileEditorHasUnsavedChanges],
  );

  useEffect(() => {
    if (selectedSkill) {
      setResolvedSkillMdContent(selectedSkill.instructions || selectedSkill.content || '');
    }
  }, [selectedSkill?.id]);

  useEffect(() => {
    let cancelled = false;

    async function resolveSkillMdContent() {
      if (!selectedSkill) {
        setResolvedSkillMdContent('');
        return;
      }

      if (isProjectDetail) {
        try {
          const repoSkillMd = await readSkillLocalFileByPath(
            selectedSkill.local_repo_path || selectedSkill.source_url || '',
            'SKILL.md',
          );
          if (!cancelled) {
            setResolvedSkillMdContent(
              repoSkillMd?.content || selectedSkill.instructions || selectedSkill.content || '',
            );
          }
        } catch {
          if (!cancelled) {
            setResolvedSkillMdContent(selectedSkill.instructions || selectedSkill.content || '');
          }
        }
        return;
      }

      try {
        const syncedSkill = await syncSkillFromRepo(selectedSkill.id);
        const repoSkillMd =
          syncedSkill?.instructions ||
          syncedSkill?.content ||
          selectedSkill.instructions ||
          selectedSkill.content ||
          '';
        if (!cancelled) {
          setResolvedSkillMdContent(repoSkillMd);
        }
      } catch {
        if (!cancelled) {
          setResolvedSkillMdContent(selectedSkill.instructions || selectedSkill.content || '');
        }
      }
    }

    void resolveSkillMdContent();

    return () => {
      cancelled = true;
    };
  }, [
    selectedSkill?.id,
    selectedSkill?.instructions,
    selectedSkill?.content,
    selectedSkill?.updated_at,
    isProjectDetail,
    syncSkillFromRepo,
  ]);

  const {
    availablePlatforms,
    batchInstall: installSelectedPlatforms,
    deselectAllPlatforms,
    installProgress,
    installStatus: skillMdInstallStatus,
    isBatchInstalling,
    selectedPlatforms,
    selectAllPlatforms,
    togglePlatformSelection,
    uninstallFromPlatform: uninstallSkillFromPlatform,
    uninstalledPlatforms,
  } = useSkillPlatform(selectedSkill, installMode);

  const batchInstall = async () => {
    try {
      const result = await installSelectedPlatforms();
      if (result.successCount > 0) {
        const modeLabel = installMode === 'symlink' ? '软链接' : '复制';
        showToast(
          `操作成功 (${modeLabel}) — ${result.successCount}/${result.totalCount}`,
          'success',
        );
      }
    } catch (error) {
      console.error('Batch install failed:', error);
      showToast(`更新失败: ${getErrorMessage(error)}`, 'error');
    }
  };

  const uninstallFromPlatform = async (platformId: string) => {
    try {
      await uninstallSkillFromPlatform(platformId);
      showToast('卸载成功', 'success');
    } catch (error) {
      console.error(`Failed to uninstall from ${platformId}:`, error);
      showToast(`更新失败: ${getErrorMessage(error)}`, 'error');
    }
  };

  if (!selectedSkill) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus({ ...copyStatus, [key]: true });
    setTimeout(() => {
      setCopyStatus({ ...copyStatus, [key]: false });
    }, 2000);
  };

  const handleExport = async (format: 'skillmd' | 'zip') => {
    if (!selectedSkill) return;
    try {
      if (format === 'zip') {
        const zipResult = await exportSkillZip(selectedSkill.id);
        downloadSkillZipExport(zipResult);
      } else {
        const content = await exportSkill(selectedSkill.id, format);
        downloadSkillExport(content, selectedSkill.name, format);
      }

      setCopyStatus({ ...copyStatus, [`export_${format}`]: true });
      setTimeout(() => {
        setCopyStatus({ ...copyStatus, [`export_${format}`]: false });
      }, 2000);
    } catch (error) {
      showToast(`导出失败: ${getErrorMessage(error)}`, 'error');
    }
  };

  const handleDelete = () => {
    if (isProjectDetail) return;
    if (!selectedSkill) return;
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (isProjectDetail) return;
    if (!selectedSkill) return;
    await deleteSkill(selectedSkill.id);
    setIsDeleteConfirmOpen(false);
    selectSkill(null);
  };

  const handleContentScroll = () => {
    const scrollTop = contentScrollRef.current?.scrollTop ?? 0;
    setShowBackToTop(scrollTop > 480);
  };

  const scrollToTop = () => {
    contentScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className='app-wallpaper-section animate-in fade-in slide-in-from-right-4 flex h-full flex-1 flex-col overflow-hidden duration-300'>
      {/* Header with back button */}
      <div className='border-border app-wallpaper-panel-strong sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4'>
        <div className='flex items-center gap-4'>
          <Button
            type='text'
            onClick={() => {
              requestLeaveFileEditing(() => {
                if (onBack) {
                  onBack();
                  return;
                }
                selectSkill(null);
              });
            }}
            className='text-muted-foreground hover:text-foreground hover:bg-accent -ml-2 rounded-lg p-2 active:scale-95'
            title={'返回'}
            icon={<ArrowLeftIcon className='h-5 w-5' />}
          />
          <SkillIcon
            iconUrl={selectedSkill.icon_url}
            iconEmoji={selectedSkill.icon_emoji}
            backgroundColor={selectedSkill.icon_background}
            name={selectedSkill.name}
            size='lg'
          />
          <div>
            <h2 className='text-foreground text-xl font-bold leading-tight'>
              {selectedSkill.name}
            </h2>
            <div className='mt-1 flex flex-wrap items-center gap-3'>
              <div className='text-muted-foreground flex items-center gap-1.5 text-[11px] font-medium'>
                <GlobeIcon className='h-3.5 w-3.5' />
                {selectedSkill.author || '本地存储'}
              </div>
            </div>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          {!isProjectDetail ? (
            <>
              <Button
                type='text'
                onClick={() => setIsEditModalOpen(true)}
                className='text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full p-2.5 active:scale-95'
                title={'编辑技能'}
                icon={<PencilIcon className='h-5 w-5' />}
              />
              <Button
                type='text'
                danger
                onClick={handleDelete}
                className='text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full p-2.5 active:scale-95'
                title={'删除'}
                icon={<TrashIcon className='h-5 w-5' />}
              />
            </>
          ) : null}
        </div>
      </div>

      {/* Tabs */}
      <div className='border-border bg-accent/20 flex items-center gap-6 border-b px-6'>
        <Button
          type='text'
          onClick={() => {
            requestLeaveFileEditing(() => {
              setActiveTab('preview');
            });
          }}
          className={`relative h-auto rounded-none py-3 text-sm font-semibold ${activeTab === 'preview' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          <div className='flex items-center gap-2'>
            <BookOpenIcon className='h-4 w-4' />
            {'预览'}
          </div>
          {activeTab === 'preview' && (
            <div className='bg-primary absolute bottom-0 left-0 right-0 h-0.5 rounded-full' />
          )}
        </Button>
        <Button
          type='text'
          onClick={() => {
            requestLeaveFileEditing(() => {
              setActiveTab('code');
            });
          }}
          className={`relative h-auto rounded-none py-3 text-sm font-semibold ${activeTab === 'code' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          <div className='flex items-center gap-2'>
            <CodeIcon className='h-4 w-4' />
            {'源码/内容'}
          </div>
          {activeTab === 'code' && (
            <div className='bg-primary absolute bottom-0 left-0 right-0 h-0.5 rounded-full' />
          )}
        </Button>
        <Button
          type='text'
          onClick={() => setActiveTab('files')}
          className={`relative h-auto rounded-none py-3 text-sm font-semibold ${activeTab === 'files' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          <div className='flex items-center gap-2'>
            <FolderOpenIcon className='h-4 w-4' />
            {'文件'}
          </div>
          {activeTab === 'files' && (
            <div className='bg-primary absolute bottom-0 left-0 right-0 h-0.5 rounded-full' />
          )}
        </Button>

        {/* Safety pill — compact, right-aligned in tab bar */}
        <Button
          size='small'
          onClick={() => {
            if (safetyReport && !isScanningSafety) {
              setIsSafetyModalOpen(true);
            } else if (!isScanningSafety) {
              void runSafetyScan();
            }
          }}
          disabled={isScanningSafety}
          title={safetyReport ? '安全扫描报告' : '尚未进行安全扫描'}
          className={`my-auto ml-auto flex h-auto items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${safetyReport ? safetyTone : 'border-border text-muted-foreground hover:border-primary/30 hover:text-primary'}`}>
          {isScanningSafety ? (
            <ShieldAlertIcon className='h-3.5 w-3.5 animate-pulse' />
          ) : safetyReport?.level === 'safe' ? (
            <ShieldCheckIcon className='h-3.5 w-3.5' />
          ) : safetyReport ? (
            <ShieldAlertIcon className='h-3.5 w-3.5' />
          ) : (
            <ShieldIcon className='h-3.5 w-3.5' />
          )}
          {isScanningSafety
            ? '扫描中...'
            : safetyReport
              ? `风险等级 - ${
                  (
                    {
                      safe: '安全',
                      warn: '需留意',
                      'high-risk': '高风险',
                      blocked: '已拦截',
                    } as Record<string, string>
                  )[safetyReport.level] ?? safetyReport.level
                }`
              : '安全扫描'}
        </Button>
      </div>

      {/* Main content - two column layout */}
      <div
        ref={contentScrollRef}
        onScroll={handleContentScroll}
        className={`flex flex-1 flex-col ${activeTab === 'files' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        {activeTab === 'files' ? (
          /* Files Tab: inline file editor fills the entire content area */
          <div className='app-wallpaper-panel flex min-h-0 flex-1 flex-col overflow-hidden'>
            <SkillFileEditor
              ref={fileEditorRef}
              skillId={selectedSkill.id}
              localPath={isProjectDetail ? selectedSkill.local_repo_path : undefined}
              skillName={selectedSkill.name}
              isOpen={true}
              onSave={() => (isProjectDetail ? Promise.resolve() : loadSkills())}
              onUnsavedChange={setFileEditorHasUnsavedChanges}
              mode='inline'
            />
          </div>
        ) : (
          <div className='mx-auto w-full max-w-6xl p-6'>
            {activeTab === 'preview' ? (
              <div className='grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-stretch'>
                <SkillPreviewPane
                  cachedInstructionsTranslation={effectiveInstructionsTranslation}
                  copyStatus={copyStatus}
                  handleCopy={handleCopy}
                  handleTranslateSkill={handleTranslateSkill}
                  hasStaleTranslation={hasStaleTranslation}
                  isTranslating={isTranslating}
                  resolvedDescription={resolvedDescription}
                  selectedSkill={selectedSkill}
                  showTranslation={showTranslation}
                  skillContent={effectiveSkillMdContent}
                  translationMode={translationMode}
                />

                {!isProjectDetail ? (
                  <SkillPlatformPanel
                    availablePlatforms={availablePlatforms}
                    handleExport={handleExport}
                    installMode={installMode}
                    installProgress={installProgress}
                    isBatchInstalling={isBatchInstalling}
                    onBatchInstall={batchInstall}
                    selectedPlatforms={selectedPlatforms}
                    selectedSkill={selectedSkill}
                    selectAllPlatforms={selectAllPlatforms}
                    deselectAllPlatforms={deselectAllPlatforms}
                    setInstallMode={setInstallMode}
                    skillMdInstallStatus={skillMdInstallStatus}
                    togglePlatformSelection={togglePlatformSelection}
                    uninstallFromPlatform={uninstallFromPlatform}
                    uninstalledPlatforms={uninstalledPlatforms}
                  />
                ) : (
                  <SkillCodePane
                    copyStatus={copyStatus}
                    handleCopy={handleCopy}
                    selectedSkill={selectedSkill}
                    skillContent={effectiveSkillMdContent}
                  />
                )}
              </div>
            ) : (
              <SkillCodePane
                copyStatus={copyStatus}
                handleCopy={handleCopy}
                selectedSkill={selectedSkill}
                skillContent={effectiveSkillMdContent}
              />
            )}
          </div>
        )}
      </div>

      {showBackToTop && activeTab !== 'files' && (
        <Button
          onClick={scrollToTop}
          icon={<ArrowUpIcon className='h-4 w-4' />}
          className='border-border app-wallpaper-surface text-foreground hover:border-primary/30 hover:bg-accent hover:text-primary absolute bottom-6 left-1/2 z-20 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-lg duration-200 hover:-translate-x-1/2 hover:-translate-y-0.5 hover:shadow-xl'>
          {'返回顶部'}
        </Button>
      )}

      {/* Edit Modal */}
      <EditSkillModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        skill={selectedSkill}
      />

      {/* 删除确认 */}
      <Modal
        open={isDeleteConfirmOpen}
        title={'确认删除'}
        onCancel={() => setIsDeleteConfirmOpen(false)}
        onOk={() => confirmDelete()}
        okText={'删除'}
        cancelText={'取消'}
        okButtonProps={{ danger: true }}
        cancelButtonProps={{ autoFocus: true }}
        destroyOnHidden>
        <div className='space-y-2'>
          <p>{`确定要删除技能"${name}"吗？`}</p>
          <p className='text-muted-foreground/80 text-xs'>
            {`只会从 ${appName} 资料库中移除。源文件会保留，平台安装也会一并卸载。`}
          </p>
        </div>
      </Modal>
      {/* 译文过期提示 */}
      <Modal
        open={isRetranslatePromptOpen}
        title={'已保存的翻译已过期'}
        onCancel={() => setIsRetranslatePromptOpen(false)}
        onOk={() => handleTranslateSkill(true)}
        okText={'立即重新翻译'}
        cancelText={'取消'}
        cancelButtonProps={{ autoFocus: true }}
        destroyOnHidden>
        <p>{'这个技能的 SKILL.md 在上次翻译后已经发生变化，现在要重新翻译吗？'}</p>
      </Modal>
      <UnsavedLeaveDialog />

      {/* 安全扫描报告 */}
      <Modal
        open={isSafetyModalOpen}
        onCancel={() => setIsSafetyModalOpen(false)}
        title={'安全扫描报告'}
        width={720}
        footer={null}
        styles={{
          body: { maxHeight: 'min(70vh, 720px)', overflowY: 'auto', paddingTop: 8 },
        }}
        destroyOnHidden>
        {safetyReport && (
          <div className='space-y-5'>
            {/* Header: level badge + meta */}
            <div className='flex items-start justify-between gap-4'>
              <div className='flex flex-col gap-2'>
                <div
                  className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${safetyTone}`}>
                  {safetyReport.level === 'safe' ? (
                    <ShieldCheckIcon className='h-4 w-4' />
                  ) : (
                    <ShieldAlertIcon className='h-4 w-4' />
                  )}
                  {(
                    {
                      safe: '安全',
                      warn: '需留意',
                      'high-risk': '高风险',
                      blocked: '已拦截',
                    } as Record<string, string>
                  )[safetyReport.level] ?? safetyReport.level}
                </div>
                <p className='text-muted-foreground text-sm leading-relaxed'>
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
              </div>
              {safetyReport.score !== undefined && (
                <div
                  className='flex shrink-0 cursor-help flex-col items-center'
                  title={
                    '评分范围 0–100，越高越安全。根据风险等级和问题数量计算：已拦截 0–10，高风险 20–40，需留意 50–70，安全 80–100。'
                  }>
                  <span className='text-foreground text-2xl font-bold'>{safetyReport.score}</span>
                  <span className='text-muted-foreground text-[10px] uppercase tracking-wide'>
                    {'安全评分'} / 100
                  </span>
                </div>
              )}
            </div>

            {/* Scoring dimensions */}
            {(() => {
              const CONTENT_CODES = new Set([
                'shell-pipe-exec',
                'dangerous-delete',
                'encoded-powershell',
                'encoded-shell-bootstrap',
                'privilege-escalation',
                'system-persistence',
                'secret-access',
                'security-bypass',
                'network-exfil',
                'exec-bit',
                'network-bootstrap',
                'env-mutation',
              ]);
              const SOURCE_CODES = new Set([
                'untrusted-source-host',
                'external-audits',
                'internal-source',
                'unknown-source',
                'invalid-source-url',
                'insecure-source-url',
              ]);
              const REPO_CODES = new Set(['persistence-file', 'high-risk-binary', 'script-file']);
              const findings = safetyReport.findings ?? [];
              const contentCount = findings.filter((f) => CONTENT_CODES.has(f.code)).length;
              const sourceCount = findings.filter((f) => SOURCE_CODES.has(f.code)).length;
              const repoCount = findings.filter((f) => REPO_CODES.has(f.code)).length;
              const dims = [
                {
                  key: 'content',
                  label: '内容模式',
                  desc: '静态正则扫描：Shell 注入、危险删除命令、编码载荷、提权操作、凭证读取、可疑网络调用等。',
                  count: contentCount,
                },
                {
                  key: 'source',
                  label: '来源可信度',
                  desc: '校验来源 URL：HTTPS 合规、是否为可信主机（github.com、skills.sh）、防 SSRF 内网地址检测。',
                  count: sourceCount,
                },
                {
                  key: 'repo',
                  label: '仓库结构',
                  desc: '检查本地仓库文件树：是否含二进制文件、可执行脚本、持久化配置文件（GitHub Actions、LaunchAgents）等。',
                  count: repoCount,
                },
              ];
              return (
                <div className='border-border bg-muted/30 space-y-2 rounded-lg border px-4 py-3'>
                  <p className='text-foreground text-xs font-semibold uppercase tracking-wide'>
                    {'评分维度'}
                  </p>
                  {dims.map((dim) => (
                    <div key={dim.key} className='flex items-center justify-between gap-3'>
                      <div className='flex min-w-0 items-center gap-1.5'>
                        <span className='text-foreground truncate text-sm'>{dim.label}</span>
                        <span
                          className='bg-muted text-muted-foreground inline-flex h-4 w-4 shrink-0 cursor-help items-center justify-center rounded-full text-[10px]'
                          title={dim.desc}>
                          ?
                        </span>
                      </div>
                      <span
                        className={`shrink-0 text-xs font-medium ${
                          dim.count === 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}>
                        {dim.count === 0 ? '无问题' : `${dim.count} 条问题`}
                      </span>
                    </div>
                  ))}
                  <p className='text-muted-foreground border-border/50 border-t pt-1 text-[10px] leading-relaxed'>
                    {
                      '评分公式：风险等级决定基础区间（已拦截 0–10 · 高风险 20–40 · 需留意 50–70 · 安全 80–100），每条问题在区间内扣分。'
                    }
                  </p>
                </div>
              );
            })()}

            {/* Meta row */}
            <div className='text-muted-foreground border-border flex flex-wrap gap-x-6 gap-y-1 border-t pt-3 text-xs'>
              <span>{`共检查 ${safetyReport.checkedFileCount} 个文件`}</span>
              <span>
                {'扫描方式'}: {safetyReport.scanMethod === 'ai' ? 'AI 辅助' : '静态分析'}
              </span>
              <span>
                {'扫描时间'}: {new Date(safetyReport.scannedAt).toLocaleString(APP_LOCALE)}
              </span>
            </div>
            <p className='text-muted-foreground mt-2 text-xs leading-relaxed'>
              {safetyReport.scanMethod === 'ai'
                ? 'AI 扫描会结合模型上下文审阅 SKILL.md 和相关仓库文件，因此它才是安装决策的主要依据。'
                : '静态扫描只检查基础恶意模式，例如 pipe-to-shell、危险删除命令、明显持久化钩子、可疑下载或打包可执行文件。它不能替代 AI 对意图和上下文的审查。'}
            </p>

            {/* Findings list */}
            <div className='space-y-2'>
              {groupedSafetyFindings.length === 0 ? (
                <div className='flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300'>
                  <CheckCircleIcon className='h-4 w-4 shrink-0' />
                  {'未发现问题'}
                </div>
              ) : (
                groupedSafetyFindings.map((finding, idx) => {
                  const severityConfig = {
                    high: {
                      cls: 'border-red-500/30 bg-red-500/5',
                      icon: <AlertTriangleIcon className='text-destructive h-4 w-4 shrink-0' />,
                      badge: 'bg-red-500/15 text-red-700 dark:text-red-400',
                      label: '高风险',
                    },
                    warn: {
                      cls: 'border-amber-500/30 bg-amber-500/5',
                      icon: <AlertTriangleIcon className='h-4 w-4 shrink-0 text-amber-500' />,
                      badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
                      label: '警告',
                    },
                    info: {
                      cls: 'border-blue-500/20 bg-blue-500/5',
                      icon: <InfoIcon className='h-4 w-4 shrink-0 text-blue-500' />,
                      badge: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
                      label: '提示',
                    },
                  };
                  const cfg = severityConfig[finding.severity] ?? severityConfig.info;
                  return (
                    <div key={idx} className={`rounded-lg border px-4 py-3 ${cfg.cls}`}>
                      <div className='flex items-start gap-3'>
                        {cfg.icon}
                        <div className='min-w-0 flex-1'>
                          <div className='flex flex-wrap items-center gap-2'>
                            <span className='text-foreground text-sm font-medium'>
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
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.badge}`}>
                              {cfg.label}
                            </span>
                            {finding.count > 1 && (
                              <span className='text-muted-foreground text-[10px] font-medium'>
                                × {finding.count}
                              </span>
                            )}
                            {finding.filePaths[0] && (
                              <span className='text-muted-foreground truncate font-mono text-[10px]'>
                                {finding.filePaths[0]}
                              </span>
                            )}
                          </div>
                          {finding.detail && (
                            <p className='text-muted-foreground mt-1 text-xs leading-relaxed'>
                              {finding.detail}
                            </p>
                          )}
                          {finding.evidences[0] && (
                            <code className='bg-muted/60 text-muted-foreground mt-1.5 block break-all rounded px-2 py-1 font-mono text-[11px]'>
                              {finding.evidences[0]}
                            </code>
                          )}
                          {finding.filePaths.length > 1 && (
                            <div className='mt-2 flex flex-wrap gap-1.5'>
                              {finding.filePaths.slice(1, 5).map((filePath) => (
                                <span
                                  key={filePath}
                                  className='bg-muted text-muted-foreground rounded-full px-2 py-0.5 font-mono text-[10px]'>
                                  {filePath}
                                </span>
                              ))}
                              {finding.filePaths.length > 5 && (
                                <span className='bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px]'>
                                  +{finding.filePaths.length - 5}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer: rescan button */}
            <div className='border-border flex items-center justify-end border-t pt-4'>
              <Button
                onClick={async () => {
                  setIsSafetyModalOpen(false);
                  await runSafetyScan();
                  setIsSafetyModalOpen(true);
                }}
                disabled={isScanningSafety}
                icon={
                  <RefreshCwIcon className={`h-4 w-4 ${isScanningSafety ? 'animate-spin' : ''}`} />
                }
                className='border-border bg-background hover:bg-muted inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium'>
                {isScanningSafety ? '扫描中...' : '重新扫描'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
