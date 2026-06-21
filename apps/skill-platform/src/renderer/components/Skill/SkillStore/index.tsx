import type { IRegistrySkill, ISkillStoreSource } from '@/types/modules';
import { useToast } from '@renderer/components/ui/Toast';
import { useOnlineStoreSources } from '@renderer/hooks/useOnlineStoreSources';
import { useSkillStoreRemoteSync } from '@renderer/hooks/useSkillStoreRemoteSync';
import { scanSkillSafety } from '@renderer/services/skill/api';
import { getSafetyScanAIConfig } from '@renderer/services/skill/detail-utils';
import {
  isPagedRemoteStoreType,
  isSearchRemoteStoreType,
} from '@renderer/services/skill/online-store-sources';
import {
  SKILLS_SH_FILTERS,
  normalizeSkillsShFilterKey,
} from '@renderer/services/skill/skills-sh-store';
import { sortSkillsByName } from '@renderer/services/skill/store-mapper-utils';
import { findInstalledRegistrySkill } from '@renderer/services/skill/store-update';
import { useSettingsStore, useSkillStore } from '@renderer/store';
import { Button, Input } from 'antd';
import {
  DatabaseIcon,
  FolderIcon,
  GlobeIcon,
  Loader2Icon,
  RefreshCwIcon,
  SearchIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SkillStoreCard } from '../SkillStoreCard';
import { SkillStoreCustomSources } from '../SkillStoreCustomSources';
import { SkillStoreDetail } from '../SkillStoreDetail';
import { SkillStoreSourceForm } from '../SkillStoreSourceForm';

const CUSTOM_SOURCE_TYPE_OPTIONS: Array<{
  value: Extract<ISkillStoreSource['type'], 'marketplace-json' | 'git-repo' | 'local-dir'>;
  icon: React.ReactNode;
}> = [
  {
    value: 'marketplace-json',
    icon: <DatabaseIcon className='h-4 w-4' />,
  },
  {
    value: 'git-repo',
    icon: <GlobeIcon className='h-4 w-4' />,
  },
  {
    value: 'local-dir',
    icon: <FolderIcon className='h-4 w-4' />,
  },
];

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function SkillStore() {
  const storeSearchQuery = useSkillStore((state) => state.storeSearchQuery) ?? '';
  const setStoreSearchQuery = useSkillStore((state) => state.setStoreSearchQuery);
  const storeCategory = useSkillStore((state) => state.storeCategory) ?? 'all';
  const setStoreCategory = useSkillStore((state) => state.setStoreCategory);
  const installRegistrySkill = useSkillStore((state) => state.installRegistrySkill);
  const skills = useSkillStore((state) => state.skills);
  const selectRegistrySkill = useSkillStore((state) => state.selectRegistrySkill);
  const selectedRegistrySlug = useSkillStore((state) => state.selectedRegistrySlug);
  const selectedStoreSourceId = useSkillStore((state) => state.selectedStoreSourceId) ?? '';
  const selectStoreSource = useSkillStore((state) => state.selectStoreSource);
  const customStoreSources = useSkillStore((state) => state.customStoreSources) ?? [];
  const addCustomStoreSource = useSkillStore((state) => state.addCustomStoreSource);
  const removeCustomStoreSource = useSkillStore((state) => state.removeCustomStoreSource);
  const toggleCustomStoreSource = useSkillStore((state) => state.toggleCustomStoreSource);
  const onlineStoreSources = useOnlineStoreSources();
  const selectedOnlineSource = useMemo(
    () => onlineStoreSources.find((source) => source.id === selectedStoreSourceId) ?? null,
    [onlineStoreSources, selectedStoreSourceId],
  );
  const skillhubKeyword =
    selectedOnlineSource?.type === 'skillhub' ? storeSearchQuery.trim() : undefined;
  const skillsShFilterKey =
    selectedOnlineSource?.type === 'skills-sh'
      ? normalizeSkillsShFilterKey(storeCategory)
      : undefined;
  const skillsShSearchQuery =
    selectedOnlineSource?.type === 'skills-sh' ? storeSearchQuery.trim() : undefined;

  const {
    loadingSourceId,
    loadStoreSource,
    loadMoreSkillHub,
    loadMoreClawHub,
    loadMoreSkillsSh,
    remoteStoreEntries,
  } = useSkillStoreRemoteSync({
    eagerRemoteSources: 'selected',
    selectedStoreSourceId,
    skillhubKeyword,
    skillsShFilterKey,
    skillsShSearchQuery,
  });

  const [installingSlug, setInstallingSlug] = useState<string | null>(null);
  const [sourceType, setSourceType] =
    useState<Extract<ISkillStoreSource['type'], 'marketplace-json' | 'git-repo' | 'local-dir'>>(
      'git-repo',
    );
  const [sourceName, setSourceName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const { showToast } = useToast();
  const autoScanBeforeInstall = useSettingsStore((state) => state.autoScanStoreSkillsBeforeInstall);
  const aiModels = useSettingsStore((state) => state.aiModels);

  const installedSlugs = useMemo(() => {
    return skills.filter((skill) => skill.registry_slug).map((skill) => skill.registry_slug!);
  }, [skills]);

  const installedNamesLower = useMemo(() => {
    return new Set(skills.map((skill) => skill.name.toLowerCase()));
  }, [skills]);

  const selectedCustomSource = useMemo(
    () => customStoreSources.find((source) => source.id === selectedStoreSourceId) || null,
    [customStoreSources, selectedStoreSourceId],
  );

  const selectedRemoteEntry = remoteStoreEntries[selectedStoreSourceId];
  const isSelectedSourceRemote = Boolean(selectedOnlineSource) || Boolean(selectedCustomSource);

  useEffect(() => {
    if (!isSelectedSourceRemote) return;
    void loadStoreSource(selectedStoreSourceId, false);
  }, [
    isSelectedSourceRemote,
    loadStoreSource,
    selectedStoreSourceId,
    skillhubKeyword,
    skillsShFilterKey,
    skillsShSearchQuery,
  ]);

  useEffect(() => {
    const pagedSourceType = selectedOnlineSource?.type;
    const pagedSourceId =
      pagedSourceType && isPagedRemoteStoreType(pagedSourceType) ? selectedStoreSourceId : null;
    if (!pagedSourceId) {
      return;
    }
    const target = loadMoreRef.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry?.isIntersecting) {
          return;
        }
        if (loadingSourceId === pagedSourceId) {
          return;
        }
        if (!selectedRemoteEntry?.pagination?.hasMore) {
          return;
        }
        if (pagedSourceId === 'skillhub' || selectedOnlineSource?.type === 'skillhub') {
          void loadMoreSkillHub();
          return;
        }
        if (pagedSourceId === 'skills-sh' || selectedOnlineSource?.type === 'skills-sh') {
          void loadMoreSkillsSh();
          return;
        }
        void loadMoreClawHub();
      },
      { rootMargin: '120px' },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [
    loadMoreClawHub,
    loadMoreSkillsSh,
    loadMoreSkillHub,
    loadingSourceId,
    selectedRemoteEntry?.pagination?.hasMore,
    selectedStoreSourceId,
  ]);

  const sourceRegistrySkills = useMemo(() => {
    let baseSkills = selectedRemoteEntry?.skills || [];

    if (
      storeSearchQuery.trim() &&
      (!selectedOnlineSource || !isSearchRemoteStoreType(selectedOnlineSource.type))
    ) {
      const query = storeSearchQuery.toLowerCase();
      baseSkills = baseSkills.filter(
        (skill) =>
          skill.name.toLowerCase().includes(query) ||
          skill.description.toLowerCase().includes(query) ||
          skill.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    }

    return baseSkills;
  }, [selectedRemoteEntry?.skills, selectedStoreSourceId, storeSearchQuery]);

  const selectedDetailSkill = useMemo(() => {
    if (!selectedRegistrySlug) return null;
    return sourceRegistrySkills.find((skill) => skill.slug === selectedRegistrySlug) || null;
  }, [selectedRegistrySlug, sourceRegistrySkills]);

  const isSkillInstalled = useCallback(
    (regSkill: IRegistrySkill): boolean => {
      if (installedSlugs.includes(regSkill.slug)) return true;
      const installName = (regSkill.install_name || regSkill.slug).toLowerCase();
      return installedNamesLower.has(installName);
    },
    [installedSlugs, installedNamesLower],
  );

  const hasPotentialUpdate = useCallback(
    (regSkill: IRegistrySkill): boolean => {
      const installedSkill = findInstalledRegistrySkill(skills, regSkill);
      if (!installedSkill) return false;
      if (installedSkill.installed_content_hash) {
        return installedSkill.installed_version !== regSkill.version;
      }
      const installedVersion = installedSkill.installed_version ?? installedSkill.version;
      return Boolean(installedVersion && installedVersion !== regSkill.version);
    },
    [skills],
  );

  const allStoreSkills = useMemo(
    () => sortSkillsByName(sourceRegistrySkills),
    [sourceRegistrySkills],
  );

  const handleQuickInstall = async (skill: IRegistrySkill, e: React.MouseEvent) => {
    e.stopPropagation();
    setInstallingSlug(skill.slug);
    try {
      if (autoScanBeforeInstall) {
        const report = await scanSkillSafety({
          name: skill.name,
          content: skill.content,
          sourceUrl: skill.source_url,
          contentUrl: skill.content_url,
          securityAudits: skill.security_audits,
          aiConfig: getSafetyScanAIConfig(aiModels),
        });
        const shouldBlockInstall =
          report.scanMethod === 'ai' &&
          (report.level === 'blocked' || report.level === 'high-risk');
        if (shouldBlockInstall) {
          showToast('因安全风险已阻止安装。', 'error');
          return;
        }
        if (
          report.scanMethod === 'static' &&
          (report.level === 'blocked' || report.level === 'high-risk')
        ) {
          showToast(
            '静态扫描发现了潜在风险模式。安装前请先查看安全报告，但在没有 AI 确认前不会直接阻止安装。',
            'warning',
          );
        }
      }
      const result = await installRegistrySkill(skill);
      if (result) {
        showToast(`已导入: ${skill.name}`, 'success');
      }
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      if (message.includes('ISkill 已存在') || message.includes('ISkill already exists')) {
        showToast('ISkill 已存在', 'warning');
        return;
      }
      showToast(message || '导入失败', 'error');
    } finally {
      setTimeout(() => setInstallingSlug(null), 500);
    }
  };

  const handleAddSource = async () => {
    if (!sourceName.trim() || !sourceUrl.trim()) {
      showToast('请填写商店名称和地址', 'error');
      return;
    }

    try {
      addCustomStoreSource(sourceName, sourceUrl, sourceType);
      const createdId = useSkillStore.getState().selectedStoreSourceId;
      setSourceName('');
      setSourceUrl('');
      setSourceType('git-repo');
      showToast('商店已添加', 'success');
      if (createdId) {
        void loadStoreSource(createdId, true);
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error && error.message === 'STORE_SOURCE_HTTPS_REQUIRED'
          ? 'Store URL must use HTTPS'
          : 'Invalid store URL format';
      showToast(message, 'error');
    }
  };

  const sourceMeta = useMemo(() => {
    if (selectedStoreSourceId === 'new-custom') {
      return {
        title: '添加商店',
        hint: '选择 Git 仓库、Marketplace JSON 或本地目录接入自定义 skill 来源。',
        count: customStoreSources.length,
        showCatalog: false,
        canRefresh: false,
      };
    }

    if (selectedOnlineSource) {
      return {
        title: selectedOnlineSource.name,
        hint: selectedOnlineSource.description || selectedOnlineSource.url,
        count:
          selectedOnlineSource.type === 'skills-sh'
            ? (selectedRemoteEntry?.pagination?.total ?? sourceRegistrySkills.length)
            : sourceRegistrySkills.length,
        showCatalog: true,
        canRefresh: true,
      };
    }

    if (selectedCustomSource) {
      return {
        title: selectedCustomSource.name,
        hint: selectedCustomSource.url,
        count: sourceRegistrySkills.length,
        showCatalog: true,
        canRefresh: true,
      };
    }

    return {
      title: 'Skill 商店',
      hint: '浏览并导入远程技能。',
      count: sourceRegistrySkills.length,
      showCatalog: true,
      canRefresh: false,
    };
  }, [
    customStoreSources.length,
    selectedCustomSource,
    selectedOnlineSource,
    selectedStoreSourceId,
    sourceRegistrySkills.length,
    selectedRemoteEntry?.pagination?.total,
  ]);

  const currentRemoteError = selectedRemoteEntry?.error || null;
  const shouldShowInitialLoading =
    isSelectedSourceRemote &&
    loadingSourceId === selectedStoreSourceId &&
    (!selectedRemoteEntry || selectedRemoteEntry.skills.length === 0);
  const isRefreshingCachedSource =
    isSelectedSourceRemote &&
    loadingSourceId === selectedStoreSourceId &&
    Boolean(selectedRemoteEntry?.skills.length);

  const loadingMessage = useMemo(() => {
    if (selectedOnlineSource) {
      return `正在加载 ${selectedOnlineSource.name}...`;
    }
    return '正在加载自定义商店内容...';
  }, [selectedOnlineSource]);

  return (
    <div className='app-wallpaper-section flex h-full flex-1 flex-col overflow-hidden'>
      <div className='border-border app-wallpaper-panel-strong z-10 flex shrink-0 items-start justify-between gap-4 border-b px-6 py-4'>
        <div className='flex items-center gap-3'>
          <div>
            <h2 className='text-lg font-semibold'>{sourceMeta.title}</h2>
            <p className='text-muted-foreground mt-0.5 text-xs'>{sourceMeta.hint}</p>
          </div>
          <span className='text-muted-foreground bg-accent/50 rounded-full border border-white/5 px-2 py-0.5 text-[11px] font-medium'>
            {sourceMeta.count} {'个技能'}
          </span>
          {isRefreshingCachedSource && (
            <span className='text-muted-foreground bg-muted border-border inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium'>
              <Loader2Icon className='h-3 w-3 animate-spin' />
              {'刷新中'}
            </span>
          )}
        </div>

        <div className='flex items-center gap-2'>
          {sourceMeta.canRefresh && (
            <Button
              type='text'
              onClick={() => void loadStoreSource(selectedStoreSourceId, true)}
              disabled={loadingSourceId === selectedStoreSourceId}
              className='text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg p-2'
              title={'刷新'}
              icon={
                <RefreshCwIcon
                  className={`h-4 w-4 ${loadingSourceId === selectedStoreSourceId ? 'animate-spin' : ''}`}
                />
              }
            />
          )}
          {sourceMeta.showCatalog && (
            <Input
              value={storeSearchQuery}
              onChange={(e) => setStoreSearchQuery(e.target.value)}
              placeholder={'搜索技能...'}
              prefix={<SearchIcon className='text-muted-foreground h-4 w-4 shrink-0' />}
              className='bg-accent/50 border-border w-64 rounded-lg text-sm'
            />
          )}
        </div>
      </div>

      {selectedOnlineSource?.type === 'skills-sh' && (
        <div className='border-border app-wallpaper-section border-b px-6 py-3'>
          <div className='scrollbar-hide flex gap-2 overflow-x-auto pb-1'>
            {SKILLS_SH_FILTERS.map((filter) => {
              const isActive = normalizeSkillsShFilterKey(storeCategory) === filter.key;
              return (
                <button
                  key={filter.key}
                  type='button'
                  onClick={() => setStoreCategory(filter.key)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-accent/50 text-muted-foreground hover:bg-accent'
                  }`}>
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selectedStoreSourceId === 'new-custom' && (
        <div className='border-border app-wallpaper-section border-b px-6 py-3'>
          <SkillStoreSourceForm
            handleAddSource={handleAddSource}
            setSourceName={setSourceName}
            setSourceType={setSourceType}
            setSourceUrl={setSourceUrl}
            sourceName={sourceName}
            sourceType={sourceType}
            sourceUrl={sourceUrl}
            typeOptions={CUSTOM_SOURCE_TYPE_OPTIONS}
          />
        </div>
      )}

      <div className='scrollbar-hide flex-1 space-y-8 overflow-y-auto p-6'>
        {shouldShowInitialLoading && (
          <div className='border-border app-wallpaper-panel text-muted-foreground inline-flex items-center gap-2 rounded-2xl border p-4 text-sm'>
            <Loader2Icon className='h-4 w-4 animate-spin' />
            {loadingMessage}
          </div>
        )}

        {currentRemoteError && !shouldShowInitialLoading && (
          <div className='border-destructive/25 bg-destructive/[0.04] rounded-2xl border px-4 py-3.5'>
            <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
              <div className='min-w-0 space-y-1.5'>
                <p className='text-destructive text-sm font-medium'>{'拉取远程商店失败'}</p>
                <p className='text-destructive/90 break-words text-sm leading-6'>
                  {currentRemoteError}
                </p>
              </div>
              <Button
                size='small'
                onClick={() => void loadStoreSource(selectedStoreSourceId, true)}
                disabled={loadingSourceId === selectedStoreSourceId}
                className='bg-destructive/10 text-destructive hover:bg-destructive/20 shrink-0 self-start rounded-lg px-3'>
                {'重试'}
              </Button>
            </div>
          </div>
        )}

        {sourceMeta.showCatalog && (
          <>
            {allStoreSkills.length > 0 && (
              <section>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                  {allStoreSkills.map((skill, index) => {
                    const installed = isSkillInstalled(skill);
                    return (
                      <SkillStoreCard
                        key={skill.slug}
                        skill={skill}
                        isInstalled={installed}
                        hasUpdate={installed ? hasPotentialUpdate(skill) : false}
                        index={index}
                        installingSlug={installingSlug}
                        onQuickInstall={installed ? undefined : handleQuickInstall}
                        onClick={() => selectRegistrySkill(skill.slug)}
                      />
                    );
                  })}
                </div>
              </section>
            )}

            {allStoreSkills.length === 0 && !shouldShowInitialLoading && (
              <div className='text-muted-foreground flex flex-col items-center justify-center py-20'>
                <SearchIcon className='mb-4 h-12 w-12 opacity-20' />
                <h3 className='text-foreground mb-1 text-lg font-semibold'>{'未找到技能'}</h3>
                <p className='text-sm opacity-70'>{'尝试不同的搜索关键词'}</p>
              </div>
            )}

            {selectedOnlineSource &&
              isPagedRemoteStoreType(selectedOnlineSource.type) &&
              selectedRemoteEntry?.pagination?.hasMore && (
                <div
                  ref={loadMoreRef}
                  className='text-muted-foreground flex items-center justify-center py-6 text-sm'>
                  {loadingSourceId === selectedStoreSourceId ? (
                    <span className='inline-flex items-center gap-2'>
                      <Loader2Icon className='h-4 w-4 animate-spin' />
                      {'加载更多技能...'}
                    </span>
                  ) : (
                    '向下滚动加载更多'
                  )}
                </div>
              )}
          </>
        )}

        {(selectedStoreSourceId === 'new-custom' || selectedCustomSource) && (
          <section className='space-y-4'>
            <SkillStoreCustomSources
              customStoreSources={customStoreSources}
              loadStoreSource={loadStoreSource}
              loadingSourceId={loadingSourceId}
              remoteStoreEntries={remoteStoreEntries}
              removeCustomStoreSource={removeCustomStoreSource}
              selectStoreSource={selectStoreSource}
              selectedCustomSource={selectedCustomSource}
              selectedStoreSourceId={selectedStoreSourceId}
              toggleCustomStoreSource={toggleCustomStoreSource}
            />
          </section>
        )}
      </div>

      {selectedDetailSkill && (
        <SkillStoreDetail
          skill={selectedDetailSkill}
          isInstalled={isSkillInstalled(selectedDetailSkill)}
          onClose={() => selectRegistrySkill(null)}
        />
      )}
    </div>
  );
}
