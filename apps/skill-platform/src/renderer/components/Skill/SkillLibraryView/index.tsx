import type { IScannedSkill, ISkill } from '@/types/modules';
import { CenteredLoading } from '@renderer/components/ui/CenteredLoading';
import { useToast } from '@renderer/components/ui/Toast';
import { useAppName } from '@renderer/hooks/useAppName';
import {
  SKILL_GALLERY_STAGGER,
  useIncrementalSkillRender,
} from '@renderer/hooks/useIncrementalSkillRender';
import { useSkillStoreRemoteSync } from '@renderer/hooks/useSkillStoreRemoteSync';
import { updateSkillTags, type ESkillBatchTagMode } from '@renderer/services/skill/batch-utils';
import { filterVisibleSkills } from '@renderer/services/skill/filter';
import { computeSkillIdsWithStoreUpdates } from '@renderer/services/skill/store-update';
import { useSettingsStore, useSkillStore } from '@renderer/store';
import { Button, Modal } from 'antd';
import {
  CheckSquareIcon,
  CuboidIcon,
  FolderInputIcon,
  LayoutGridIcon,
  ListIcon,
  SendIcon,
  SquareIcon,
  TagsIcon,
  TrashIcon,
  XIcon,
} from 'lucide-react';
import { lazy, Suspense, useMemo, useState } from 'react';
import { SkillAiChatModal } from '../SkillAiChatModal';
import { SkillGalleryCard } from '../SkillGalleryCard';
import { SkillQuickInstall } from '../SkillQuickInstall';
import { SkillTagFilter } from '../SkillTagFilter';

const SkillListView = lazy(() =>
  import('@renderer/components/Skill/SkillListView').then((m) => ({ default: m.SkillListView })),
);
const SkillScanPreview = lazy(() =>
  import('@renderer/components/Skill/SkillScanPreview').then((m) => ({
    default: m.SkillScanPreview,
  })),
);
const SkillBatchDeployDialog = lazy(() =>
  import('@renderer/components/Skill/SkillBatchDeployDialog').then((m) => ({
    default: m.SkillBatchDeployDialog,
  })),
);
const SkillBatchTagDialog = lazy(() =>
  import('@renderer/components/Skill/SkillBatchTagDialog').then((m) => ({
    default: m.SkillBatchTagDialog,
  })),
);

export function SkillLibraryView() {
  const appName = useAppName();
  const { showToast } = useToast();
  const skills = useSkillStore((state) => state.skills);
  const deleteSkill = useSkillStore((state) => state.deleteSkill);
  const updateSkill = useSkillStore((state) => state.updateSkill);
  const isLoading = useSkillStore((state) => state.isLoading);
  const selectSkill = useSkillStore((state) => state.selectSkill);
  const filterType = useSkillStore((state) => state.filterType);
  const searchQuery = useSkillStore((state) => state.searchQuery);
  const viewMode = useSkillStore((state) => state.viewMode);
  const setViewMode = useSkillStore((state) => state.setViewMode);
  const storeView = useSkillStore((state) => state.storeView);
  const deployedSkillNames = useSkillStore((state) => state.deployedSkillNames);
  const loadDeployedStatus = useSkillStore((state) => state.loadDeployedStatus);
  const skillFilterTags = useSkillStore((state) => state.filterTags);
  const toggleSkillFilterTag = useSkillStore((state) => state.toggleFilterTag);
  const clearSkillFilterTags = useSkillStore((state) => state.clearFilterTags);
  const scanLocalPreview = useSkillStore((state) => state.scanLocalPreview);
  const importScannedSkills = useSkillStore((state) => state.importScannedSkills);
  const customSkillScanPaths = useSettingsStore((state) => state.customSkillScanPaths);

  const effectiveStoreView = storeView;
  const effectiveFilterType = filterType;
  const isDistributionView = effectiveStoreView === 'distribution';

  const tagFilterBaseSkills = useMemo(() => {
    if (isDistributionView) {
      return skills.filter((skill) => deployedSkillNames.has(skill.name));
    }
    if (effectiveFilterType === 'pending') {
      return skills.filter((skill) => !deployedSkillNames.has(skill.name));
    }
    return skills;
  }, [deployedSkillNames, effectiveFilterType, isDistributionView, skills]);

  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const skill of tagFilterBaseSkills) {
      for (const tag of skill.tags ?? []) {
        const trimmed = tag.trim();
        if (trimmed) {
          tagSet.add(trimmed);
        }
      }
    }
    return [...tagSet].sort((a, b) => a.localeCompare(b, 'zh-CN'));
  }, [tagFilterBaseSkills]);

  const showTagFilter =
    availableTags.length >= 1 && (effectiveStoreView === 'my-skills' || isDistributionView);

  const filteredSkills = useMemo(() => {
    return filterVisibleSkills({
      deployedSkillNames,
      filterTags: skillFilterTags,
      filterType: effectiveFilterType,
      searchQuery,
      skills,
      storeView: effectiveStoreView,
    });
  }, [
    deployedSkillNames,
    effectiveFilterType,
    effectiveStoreView,
    skillFilterTags,
    searchQuery,
    skills,
  ]);

  const { renderedCount, largeListThreshold, isChunkRendering } = useIncrementalSkillRender(
    filteredSkills.length,
  );

  const visibleSkills = useMemo(() => {
    if (filteredSkills.length <= largeListThreshold) {
      return filteredSkills;
    }
    return filteredSkills.slice(0, renderedCount);
  }, [filteredSkills, largeListThreshold, renderedCount]);

  const [quickInstallSkill, setQuickInstallSkill] = useState<ISkill | null>(null);
  const [skillAiChatSkillId, setSkillAiChatSkillId] = useState<string | null>(null);
  const [showScanPreview, setShowScanPreview] = useState(false);
  const [showBatchDeployDialog, setShowBatchDeployDialog] = useState(false);
  const [showBatchTagDialog, setShowBatchTagDialog] = useState(false);
  const [scannedSkills, setScannedSkills] = useState<IScannedSkill[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedSkillIds, setSelectedSkillIds] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    skillIds: string[];
    skillNames: string[];
  }>({ isOpen: false, skillIds: [], skillNames: [] });

  const { remoteStoreEntries } = useSkillStoreRemoteSync({
    eagerRemoteSources: 'all',
  });

  const skillsWithStoreUpdates = useMemo(
    () => computeSkillIdsWithStoreUpdates(skills, remoteStoreEntries),
    [remoteStoreEntries, skills],
  );

  const selectedSkills = useMemo(
    () => filteredSkills.filter((skill) => selectedSkillIds.has(skill.id)),
    [filteredSkills, selectedSkillIds],
  );

  const allVisibleSelected = useMemo(
    () =>
      filteredSkills.length > 0 && filteredSkills.every((skill) => selectedSkillIds.has(skill.id)),
    [filteredSkills, selectedSkillIds],
  );

  const handleScanLocal = async (customPaths?: string[]) => {
    setIsScanning(true);
    try {
      const result = await scanLocalPreview(customPaths);
      setScannedSkills(result);
      setShowScanPreview(true);
    } catch (err) {
      console.error('Failed to scan local skills:', err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleRescan = async (customPaths: string[]) => {
    const result = await scanLocalPreview(customPaths);
    setScannedSkills(result);
  };

  const handleImportScanned = async (
    skillsToImport: IScannedSkill[],
    userTagsByPath?: Record<string, string[]>,
  ) => {
    const result = await importScannedSkills(skillsToImport, userTagsByPath);
    await loadDeployedStatus();
    return result.importedCount;
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode((prev) => !prev);
    setSelectedSkillIds((prev) => (prev.size === 0 ? prev : new Set()));
  };

  const toggleSkillSelection = (skillId: string) => {
    setSelectedSkillIds((prev) => {
      const next = new Set(prev);
      if (next.has(skillId)) {
        next.delete(skillId);
      } else {
        next.add(skillId);
      }
      return next;
    });
  };

  const handleSelectAllVisible = () => {
    if (allVisibleSelected) {
      setSelectedSkillIds(new Set());
      return;
    }
    setSelectedSkillIds(new Set(filteredSkills.map((skill) => skill.id)));
  };

  const handleBatchDelete = async () => {
    if (selectedSkills.length === 0) return;
    setDeleteConfirm({
      isOpen: true,
      skillIds: selectedSkills.map((s) => s.id),
      skillNames: selectedSkills.map((s) => s.name),
    });
  };

  const handleBatchDeploy = () => {
    if (selectedSkills.length === 0) return;
    setShowBatchDeployDialog(true);
  };

  const handleBatchTags = () => {
    if (selectedSkills.length === 0) return;
    setShowBatchTagDialog(true);
  };

  const handleBatchTagSubmit = async (tag: string, mode: ESkillBatchTagMode) => {
    const results = await Promise.allSettled(
      selectedSkills.map(async (skill) => {
        const nextTags = updateSkillTags(skill.tags, tag, mode);
        const previousTags = skill.tags || [];

        if (JSON.stringify(nextTags) === JSON.stringify(previousTags)) {
          return { updated: false, name: skill.name };
        }

        await updateSkill(skill.id, { tags: nextTags });
        return { updated: true, name: skill.name };
      }),
    );

    const updatedCount = results.filter(
      (result) => result.status === 'fulfilled' && result.value.updated,
    ).length;
    const failedCount = results.filter((result) => result.status === 'rejected').length;

    showToast(
      failedCount > 0
        ? `标签批量更新完成，成功 ${updatedCount} 个，失败 ${failedCount} 个`
        : mode === 'add'
          ? `已为 ${updatedCount} 个 skill 添加标签`
          : `已从 ${updatedCount} 个 skill 移除标签`,
      failedCount > 0 ? 'error' : 'success',
    );
    setSelectedSkillIds(new Set());
  };

  const confirmDelete = async () => {
    for (const id of deleteConfirm.skillIds) {
      await deleteSkill(id);
    }
    setDeleteConfirm({ isOpen: false, skillIds: [], skillNames: [] });
    setSelectedSkillIds(new Set());
    setIsSelectionMode(false);
  };

  const headerTitle = isDistributionView
    ? '分发'
    : effectiveFilterType === 'installed'
      ? '已导入'
      : effectiveFilterType === 'deployed'
        ? '已分发'
        : effectiveFilterType === 'pending'
          ? '待分发'
          : '我的 Skills';

  const emptyStateTitle = isDistributionView
    ? '暂无技能'
    : effectiveFilterType === 'installed'
      ? '还没有已导入的技能'
      : effectiveFilterType === 'deployed'
        ? '还没有已分发的技能'
        : effectiveFilterType === 'pending'
          ? '还没有待分发的技能'
          : '暂无技能';

  const emptyStateHint = isDistributionView
    ? '先导入 skill，再在这里安装、同步或卸载到 Claude、Cursor 等平台。'
    : effectiveFilterType === 'installed'
      ? '从 Skill 商店、本地扫描、GitHub 或手动创建导入后，它们会出现在这里。'
      : effectiveFilterType === 'deployed'
        ? '将技能分发到 Claude、Cursor 等平台后，这里会显示已分发项目。'
        : effectiveFilterType === 'pending'
          ? '尚未分发到任何平台的 skill 会显示在这里。'
          : '创建、导入或从商店安装你的第一个技能';

  const headerSubtitle = isDistributionView
    ? '集中管理 skill 在各个平台上的安装、同步与卸载。'
    : '统一管理所有已导入的 skills，不区分来源渠道。';
  const distributionStatsLabel = isDistributionView
    ? `已分发 ${deployedSkillNames.size} / 全部 ${skills.length}`
    : null;

  return (
    <div className='app-wallpaper-section relative flex h-full flex-1 flex-row overflow-hidden'>
      {isLoading && skills.length === 0 ? <CenteredLoading label='加载技能…' /> : null}
      <div className='flex min-w-0 flex-1 flex-col'>
        <div className='border-border app-wallpaper-panel-strong z-10 border-b px-4 py-4 sm:px-6'>
          <div className='flex flex-col gap-4'>
            <div className='flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between'>
              <div className='min-w-0 flex-1'>
                <div className='flex flex-wrap items-center gap-3'>
                  <div className='flex items-center gap-2'>
                    <CuboidIcon className='text-primary h-5 w-5' />
                    <h2 className='text-lg font-semibold'>{headerTitle}</h2>
                  </div>
                  <span className='bg-accent/50 text-muted-foreground inline-flex items-center rounded-full border border-white/5 px-2.5 py-1 text-[11px] font-medium'>
                    {isDistributionView
                      ? distributionStatsLabel
                      : `${filteredSkills.length}${effectiveFilterType !== 'all' ? ` / ${skills.length}` : ''}`}
                  </span>
                  {isChunkRendering && (
                    <span className='text-muted-foreground text-[11px]'>
                      {`正在分批渲染 ${visibleSkills.length}/${filteredSkills.length}`}
                    </span>
                  )}
                </div>
                <p className='text-muted-foreground mt-1.5 text-xs'>{headerSubtitle}</p>
              </div>

              <div className='flex items-center gap-2 self-start lg:justify-end lg:self-center'>
                {!isSelectionMode ? (
                  <Button
                    onClick={toggleSelectionMode}
                    icon={<CheckSquareIcon className='h-4 w-4' />}
                    className='border-border app-wallpaper-surface text-foreground hover:border-primary/25 hover:bg-accent inline-flex h-auto items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium'
                    title={'批量管理'}>
                    {'批量管理'}
                  </Button>
                ) : null}
                <div className='bg-muted flex items-center rounded-lg p-0.5'>
                  <Button
                    type='text'
                    onClick={() => setViewMode('gallery')}
                    className={`rounded-md p-2 ${
                      viewMode === 'gallery'
                        ? 'app-wallpaper-surface text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    title={'画廊视图'}
                    icon={<LayoutGridIcon className='h-4 w-4' />}
                  />
                  <Button
                    type='text'
                    onClick={() => setViewMode('list')}
                    className={`rounded-md p-2 ${
                      viewMode === 'list'
                        ? 'app-wallpaper-surface text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    title={'列表视图'}
                    icon={<ListIcon className='h-4 w-4' />}
                  />
                </div>
                <>
                  <div className='bg-border h-4 w-px' />
                  <Button
                    type='text'
                    onClick={() => handleScanLocal(customSkillScanPaths)}
                    disabled={isScanning}
                    className='text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg p-2'
                    title={'扫描本地'}
                    icon={
                      <FolderInputIcon className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
                    }
                  />
                </>
              </div>
            </div>

            {isSelectionMode ? (
              <div className='border-primary/15 bg-primary/[0.06] flex flex-wrap items-center gap-2 rounded-2xl border p-2'>
                <div className='px-3 py-2'>
                  <div className='text-primary/80 text-[11px] font-medium uppercase tracking-wide'>
                    {'批量模式'}
                  </div>
                  <div className='text-foreground mt-0.5 text-sm font-semibold'>
                    {`已选 ${selectedSkillIds.size} 项`}
                  </div>
                </div>
                <Button
                  onClick={handleSelectAllVisible}
                  icon={
                    allVisibleSelected ? (
                      <CheckSquareIcon className='text-primary h-4 w-4' />
                    ) : (
                      <SquareIcon className='text-muted-foreground h-4 w-4' />
                    )
                  }
                  className='border-border app-wallpaper-surface text-foreground hover:border-primary/25 hover:bg-accent inline-flex h-auto items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium'
                  title={allVisibleSelected ? '清空' : '全选'}>
                  {allVisibleSelected ? '清空' : '全选'}
                </Button>
                <Button
                  onClick={handleBatchTags}
                  disabled={selectedSkillIds.size === 0}
                  icon={<TagsIcon className='text-primary h-4 w-4' />}
                  className='border-border app-wallpaper-surface text-foreground hover:border-primary/25 hover:bg-accent inline-flex h-auto items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium'
                  title={'批量管理标签'}>
                  {'批量管理标签'}
                </Button>
                <Button
                  type='primary'
                  onClick={handleBatchDeploy}
                  disabled={selectedSkillIds.size === 0}
                  icon={<SendIcon className='h-4 w-4' />}
                  className='inline-flex h-auto items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium'
                  title={'批量同步到平台'}>
                  {'批量同步到平台'}
                </Button>
                <Button
                  danger
                  onClick={handleBatchDelete}
                  disabled={selectedSkillIds.size === 0}
                  icon={<TrashIcon className='h-4 w-4' />}
                  className='border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/15 inline-flex h-auto items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium'
                  title={'删除'}>
                  {'删除'}
                </Button>
                <Button
                  onClick={toggleSelectionMode}
                  icon={<XIcon className='h-4 w-4' />}
                  className='border-border app-wallpaper-surface text-muted-foreground hover:bg-accent hover:text-foreground inline-flex h-auto items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium'
                  title={'取消'}>
                  {'取消'}
                </Button>
              </div>
            ) : null}
          </div>
        </div>

        {showTagFilter ? (
          <SkillTagFilter
            activeTag={skillFilterTags[0] ?? null}
            onSelectAll={() => clearSkillFilterTags()}
            onSelectTag={toggleSkillFilterTag}
            tags={availableTags}
          />
        ) : null}

        <div className='scrollbar-hide relative flex-1 overflow-y-auto'>
          {viewMode === 'list' ? (
            <Suspense fallback={<CenteredLoading label='加载中…' />}>
              <SkillListView
                skills={visibleSkills}
                skillsWithStoreUpdates={skillsWithStoreUpdates}
                onQuickInstall={setQuickInstallSkill}
                onOpenSkillAiChat={setSkillAiChatSkillId}
                onRequestDelete={(id, name) =>
                  setDeleteConfirm({
                    isOpen: true,
                    skillIds: [id],
                    skillNames: [name],
                  })
                }
                selectionMode={isSelectionMode}
                selectedSkillIds={selectedSkillIds}
                onToggleSelection={toggleSkillSelection}
              />
            </Suspense>
          ) : (
            <div className='p-6'>
              {filteredSkills.length === 0 ? (
                <div className='text-muted-foreground animate-in fade-in zoom-in-95 flex h-full flex-col items-center justify-center py-20 duration-500'>
                  <div className='bg-accent/30 relative mb-6 rounded-full p-8'>
                    <CuboidIcon className='h-20 w-20 opacity-20' />
                    <div className='border-primary/10 absolute inset-0 animate-pulse rounded-full border-4' />
                  </div>
                  <h3 className='text-foreground mb-2 text-xl font-semibold'>{emptyStateTitle}</h3>
                  <p className='mb-8 max-w-sm text-center text-sm opacity-70'>{emptyStateHint}</p>
                </div>
              ) : (
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'>
                  {visibleSkills.map((skill, index) => {
                    const isSelected = selectedSkillIds.has(skill.id);

                    return (
                      <SkillGalleryCard
                        key={skill.id}
                        animationDelayMs={
                          isChunkRendering
                            ? 0
                            : Math.min(index, SKILL_GALLERY_STAGGER.maxCards) *
                              SKILL_GALLERY_STAGGER.delayMs
                        }
                        hasStoreUpdate={skillsWithStoreUpdates.has(skill.id)}
                        isSelected={isSelected}
                        isSelectionMode={isSelectionMode}
                        onDelete={(selectedSkill) =>
                          setDeleteConfirm({
                            isOpen: true,
                            skillIds: [selectedSkill.id],
                            skillNames: [selectedSkill.name],
                          })
                        }
                        onOpen={selectSkill}
                        onOpenSkillAiChat={(s) => setSkillAiChatSkillId(s.id)}
                        onQuickInstall={setQuickInstallSkill}
                        onToggleSelection={toggleSkillSelection}
                        skill={skill}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {quickInstallSkill && (
        <SkillQuickInstall skill={quickInstallSkill} onClose={() => setQuickInstallSkill(null)} />
      )}

      <SkillAiChatModal
        isOpen={skillAiChatSkillId !== null}
        skills={skills}
        initialSkillId={skillAiChatSkillId}
        onClose={() => setSkillAiChatSkillId(null)}
      />

      {showScanPreview && (
        <Suspense fallback={null}>
          <SkillScanPreview
            scannedSkills={scannedSkills}
            installedPaths={
              new Set(
                skills.flatMap((s) =>
                  [s.local_repo_path, s.source_url].filter(
                    (v): v is string => typeof v === 'string' && v.length > 0,
                  ),
                ),
              )
            }
            onImport={handleImportScanned}
            onRescan={handleRescan}
            onClose={() => setShowScanPreview(false)}
          />
        </Suspense>
      )}

      {showBatchDeployDialog && (
        <Suspense fallback={null}>
          <SkillBatchDeployDialog
            skills={selectedSkills}
            onClose={() => setShowBatchDeployDialog(false)}
            onComplete={async () => {
              await loadDeployedStatus();
            }}
          />
        </Suspense>
      )}

      {showBatchTagDialog && (
        <Suspense fallback={null}>
          <SkillBatchTagDialog
            skills={selectedSkills}
            onClose={() => setShowBatchTagDialog(false)}
            onSubmit={handleBatchTagSubmit}
          />
        </Suspense>
      )}

      <Modal
        open={deleteConfirm.isOpen}
        title={'确认删除'}
        onCancel={() => setDeleteConfirm({ isOpen: false, skillIds: [], skillNames: [] })}
        onOk={() => confirmDelete()}
        okText={'删除'}
        cancelText={'取消'}
        okButtonProps={{ danger: true }}
        cancelButtonProps={{ autoFocus: true }}
        destroyOnHidden>
        <div className='space-y-2'>
          <p>
            {deleteConfirm.skillNames.length === 1
              ? `确定要删除技能"${deleteConfirm.skillNames[0]}"吗？`
              : `确定要删除选中的 ${deleteConfirm.skillNames.length} 个技能吗？`}
          </p>
          <p className='text-muted-foreground/80 text-xs'>
            {`只会从 ${appName} 资料库中移除。源文件会保留，平台安装也会一并卸载。`}
          </p>
        </div>
      </Modal>
    </div>
  );
}
