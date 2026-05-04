import { getWebContext, isWebRuntime, logoutWebSession } from '@renderer/runtime';
import { filterVisibleScannedSkills, filterVisibleSkills } from '@renderer/services/skill/filter';
import {
  useFolderStore,
  usePromptStore,
  useSettingsStore,
  useSkillStore,
  useUIStore,
} from '@renderer/store';
import type { InputRef } from 'antd';
import { Button, Input } from 'antd';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  FolderPlusIcon,
  GlobeIcon,
  LogOutIcon,
  MoonIcon,
  PanelLeftIcon,
  PlusIcon,
  SearchIcon,
  SunIcon,
  XIcon,
} from 'lucide-react';
import {
  lazy,
  Suspense,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const QuickAddModal = lazy(() =>
  import('@renderer/components/Prompt/QuickAddModal').then((module) => ({
    default: module.QuickAddModal,
  })),
);
const CreateSkillModal = lazy(() =>
  import('@renderer/components/Skill/CreateSkillModal').then((module) => ({
    default: module.CreateSkillModal,
  })),
);

const OPEN_CREATE_SKILL_PROJECT_MODAL_EVENT = 'open-create-skill-project-modal';
interface IProps {
  onOpenSettings: () => void;
}

export function TopBar({ onOpenSettings }: IProps) {
  // Prompt store
  const promptSearchQuery = usePromptStore((state) => state.searchQuery);
  const setPromptSearchQuery = usePromptStore((state) => state.setSearchQuery);
  const prompts = usePromptStore((state) => state.prompts);
  const selectPrompt = usePromptStore((state) => state.selectPrompt);
  const createPrompt = usePromptStore((state) => state.createPrompt);

  // Skill store
  const skillSearchQuery = useSkillStore((state) => state.searchQuery);
  const setSkillSearchQuery = useSkillStore((state) => state.setSearchQuery);
  const skills = useSkillStore((state) => state.skills);
  const skillFilterType = useSkillStore((state) => state.filterType);
  const skillFilterTags = useSkillStore((state) => state.filterTags);
  const deployedSkillNames = useSkillStore((state) => state.deployedSkillNames);
  const skillStoreView = useSkillStore((state) => state.storeView);
  const selectedProjectId = useSkillStore((state) => state.selectedProjectId);
  const projectScanState = useSkillStore((state) => state.projectScanState);
  const selectSkill = useSkillStore((state) => state.selectSkill);

  const isDarkMode = useSettingsStore((state) => state.isDarkMode);
  const setDarkMode = useSettingsStore((state) => state.setDarkMode);
  const aiModels = useSettingsStore((state) => state.aiModels);
  const aiApiKey = useSettingsStore((state) => state.aiApiKey);
  const creationMode = useSettingsStore((state) => state.creationMode);
  const selectedFolderId = useFolderStore((state) => state.selectedFolderId);
  const folders = useFolderStore((state) => state.folders);
  const appModule = useUIStore((state) => state.appModule);
  const workflowScreen = useUIStore((state) => state.workflowScreen);
  const workflowListQuery = useUIStore((state) => state.workflowListQuery);
  const setWorkflowListQuery = useUIStore((state) => state.setWorkflowListQuery);
  const isSidebarCollapsed = useUIStore((state) => state.isSidebarCollapsed);
  const setSidebarCollapsed = useUIStore((state) => state.setSidebarCollapsed);
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);
  const [isCreateSkillModalOpen, setIsCreateSkillModalOpen] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const searchInputRef = useRef<InputRef>(null);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const createMenuDropdownRef = useRef<HTMLDivElement>(null);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  const [createMenuPosition, setCreateMenuPosition] = useState({
    top: 0,
    right: 0,
  });
  const [webContext, setWebContext] = useState<PromptHubWebContext | undefined>(() =>
    getWebContext(),
  );
  const webRuntime = isWebRuntime();
  const isProjectSkillView = appModule === 'skill' && skillStoreView === 'projects';
  const isSkillView = appModule === 'skill';
  const isPromptView = appModule === 'prompt';
  const isNoteView = appModule === 'note';
  const isKbView = appModule === 'kb';
  const isChatView = appModule === 'chat';
  const isNewsView = appModule === 'news';
  const isWorkflowView = appModule === 'workflow';
  const isWorkflowFullscreen =
    isWorkflowView && (workflowScreen === 'studio' || workflowScreen === 'work');
  const setTreeSearchQuery = usePromptStore((state) => state.setTreeSearchQuery);
  const treeSearchQuery = usePromptStore((state) => state.treeSearchQuery);
  const openCreateEditor = usePromptStore((state) => state.openCreateEditor);

  const searchQuery = isSkillView
    ? skillSearchQuery
    : isWorkflowView
      ? workflowListQuery
      : isPromptView
        ? treeSearchQuery
        : promptSearchQuery;
  const deferredSkillSearchQuery = useDeferredValue(skillSearchQuery);
  const setSearchQuery = isSkillView
    ? setSkillSearchQuery
    : isWorkflowView
      ? setWorkflowListQuery
      : isPromptView
        ? setTreeSearchQuery
        : setPromptSearchQuery;

  // Check if AI is configured
  const hasAiConfig = aiModels.length > 0 || (aiApiKey && aiApiKey.trim() !== '');

  // 计算 IPrompt 搜索结果（与 MainContent 保持一致的逻辑）
  const promptSearchResults = useMemo(() => {
    if (!isPromptView || !treeSearchQuery.trim()) return [];

    const queryLower = treeSearchQuery.toLowerCase();
    const queryCompact = queryLower.replace(/\s+/g, '');
    const keywords = queryLower.split(/\s+/).filter((k) => k.length > 0);

    let filtered = prompts;

    // 如果在特定文件夹中，只搜索该文件夹
    if (selectedFolderId === 'favorites') {
      filtered = filtered.filter((p) => p.isFavorite);
    } else if (selectedFolderId) {
      filtered = filtered.filter((p) => p.folderId === selectedFolderId);
    }

    const isSubsequence = (needle: string, haystack: string) => {
      if (!needle) return true;
      if (needle.length > haystack.length) return false;
      let i = 0;
      for (let j = 0; j < haystack.length && i < needle.length; j++) {
        if (haystack[j] === needle[i]) i++;
      }
      return i === needle.length;
    };

    // 使用与 MainContent 相同的评分逻辑
    return filtered
      .map((p) => {
        let score = 0;
        const titleLower = p.title.toLowerCase();
        const descLower = (p.description || '').toLowerCase();

        // 标题精确匹配
        if (titleLower === queryLower) score += 100;
        // 标题包含查询
        else if (titleLower.includes(queryLower)) score += 50;
        // 子序列匹配
        else if (
          queryCompact.length >= 2 &&
          isSubsequence(queryCompact, titleLower.replace(/\s+/g, ''))
        )
          score += 30;

        // 描述包含查询
        if (descLower.includes(queryLower)) score += 20;

        // 所有关键词匹配
        const searchableText = [p.title, p.description || '', p.userPrompt, p.systemPrompt || '']
          .join(' ')
          .toLowerCase();

        if (keywords.every((k) => searchableText.includes(k))) {
          score += 10;
        }

        return { prompt: p, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.prompt);
  }, [folders, isPromptView, treeSearchQuery, prompts, selectedFolderId]);

  // 计算 ISkill 搜索结果
  const skillSearchResults = useMemo(() => {
    if (!isSkillView) return [];

    return filterVisibleSkills({
      deployedSkillNames,
      filterTags: skillFilterTags,
      filterType: skillFilterType,
      searchQuery: deferredSkillSearchQuery,
      skills,
      storeView: skillStoreView,
    });
  }, [
    deferredSkillSearchQuery,
    deployedSkillNames,
    skillFilterTags,
    skillFilterType,
    skillStoreView,
    skills,
    isSkillView,
  ]);

  const projectSearchResults = useMemo(() => {
    if (!isProjectSkillView) return [];

    const scannedSkills = selectedProjectId
      ? projectScanState[selectedProjectId]?.scannedSkills || []
      : [];

    return filterVisibleScannedSkills(scannedSkills, deferredSkillSearchQuery);
  }, [deferredSkillSearchQuery, isProjectSkillView, projectScanState, selectedProjectId]);

  // 根据模式选择搜索结果
  const searchResults = isSkillView
    ? isProjectSkillView
      ? projectSearchResults
      : skillSearchResults
    : isWorkflowView
      ? []
      : promptSearchResults;
  const searchResultCount = searchResults.length;
  const showSearchNavigation = !isProjectSkillView && isPromptView && !isWorkflowView;

  const updateCreateMenuPosition = useCallback(() => {
    if (!createMenuRef.current) {
      return;
    }

    const rect = createMenuRef.current.getBoundingClientRect();
    setCreateMenuPosition({
      top: rect.bottom + 4,
      right: Math.max(window.innerWidth - rect.right, 8),
    });
  }, []);

  // 导航到上一个/下一个结果
  const navigateResult = useCallback(
    (direction: 'prev' | 'next') => {
      if (searchResultCount === 0) return;

      let newIndex = currentResultIndex;
      if (direction === 'next') {
        newIndex = (currentResultIndex + 1) % searchResultCount;
      } else {
        newIndex = (currentResultIndex - 1 + searchResultCount) % searchResultCount;
      }
      setCurrentResultIndex(newIndex);

      if (isSkillView) {
        if (isProjectSkillView) {
          return;
        }
        const skillResults = skillSearchResults;
        if (skillResults[newIndex]) {
          selectSkill(skillResults[newIndex].id);
        }
      } else {
        const promptResults = promptSearchResults;
        if (promptResults[newIndex]) {
          selectPrompt(promptResults[newIndex].id);
        }
      }
    },
    [
      searchResultCount,
      currentResultIndex,
      isProjectSkillView,
      isSkillView,
      selectPrompt,
      selectSkill,
      skillSearchResults,
      promptSearchResults,
    ],
  );

  // 搜索变化时重置索引；IPrompt 下仍自动选中首个匹配项；Skills 不自动进详情
  useEffect(() => {
    setCurrentResultIndex(0);
    if (isSkillView || isWorkflowView) {
      return;
    }
    if (promptSearchResults.length > 0) {
      selectPrompt(promptSearchResults[0].id);
    }
  }, [isSkillView, isWorkflowView, promptSearchResults, searchQuery, selectPrompt]);

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && searchQuery && searchResultCount > 0) {
      if (!showSearchNavigation) {
        return;
      }
      e.preventDefault();
      navigateResult(e.shiftKey ? 'prev' : 'next');
    } else if (e.key === 'Escape') {
      setSearchQuery('');
      searchInputRef.current?.blur();
    } else if (e.key === 'Enter' && searchResultCount > 0) {
      if (isProjectSkillView) {
        searchInputRef.current?.blur();
        return;
      }
      // Enter 确认选择当前结果
      if (isSkillView) {
        if (skillSearchResults[currentResultIndex]) {
          selectSkill(skillSearchResults[currentResultIndex].id);
        }
      } else {
        if (promptSearchResults[currentResultIndex]) {
          selectPrompt(promptSearchResults[currentResultIndex].id);
        }
      }
      searchInputRef.current?.blur();
    }
  };

  // Listen for shortcut events
  useEffect(() => {
    const handleNewPrompt = () => {
      openCreateEditor();
    };
    const handleSearch = () => {
      searchInputRef.current?.focus();
    };

    window.addEventListener('shortcut:newPrompt', handleNewPrompt);
    window.addEventListener('shortcut:search', handleSearch);

    return () => {
      window.removeEventListener('shortcut:newPrompt', handleNewPrompt);
      window.removeEventListener('shortcut:search', handleSearch);
    };
  }, []);

  // Click outside to close create menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const clickedTrigger = createMenuRef.current?.contains(target) ?? false;
      const clickedDropdown = createMenuDropdownRef.current?.contains(target) ?? false;

      if (!clickedTrigger && !clickedDropdown) {
        setIsCreateMenuOpen(false);
      }
    }

    // Listen for open-create-skill-modal event
    function handleOpenSkillModal() {
      setIsCreateSkillModalOpen(true);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('open-create-skill-modal', handleOpenSkillModal);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('open-create-skill-modal', handleOpenSkillModal);
    };
  }, []);

  useEffect(() => {
    if (!isCreateMenuOpen) {
      return;
    }

    updateCreateMenuPosition();

    const handleLayoutChange = () => {
      updateCreateMenuPosition();
    };

    window.addEventListener('resize', handleLayoutChange);
    window.addEventListener('scroll', handleLayoutChange, true);

    return () => {
      window.removeEventListener('resize', handleLayoutChange);
      window.removeEventListener('scroll', handleLayoutChange, true);
    };
  }, [isCreateMenuOpen, updateCreateMenuPosition]);

  useEffect(() => {
    if (!webRuntime) {
      return;
    }

    const syncContext = () => {
      setWebContext(getWebContext());
    };

    window.addEventListener('prompthub:web-context-changed', syncContext);
    return () => {
      window.removeEventListener('prompthub:web-context-changed', syncContext);
    };
  }, [webRuntime]);

  const handleCreatePrompt = async (data: {
    title: string;
    systemPrompt?: string;
    userPrompt: string;
    tags?: string[];
    folderId?: string;
    source?: string;
  }) => {
    try {
      const prompt = await createPrompt({
        title: data.title,
        systemPrompt: data.systemPrompt,
        userPrompt: data.userPrompt,
        tags: data.tags || [],
        variables: [],
        folderId: data.folderId,
        source: data.source,
      });
      return prompt;
    } catch (error) {
      console.error('Failed to create prompt:', error);
      return null;
    }
  };

  const toggleTheme = () => {
    setDarkMode(!isDarkMode);
  };

  return (
    <>
      {!isWorkflowFullscreen ? (
        <header
          className='app-wallpaper-toolbar border-border flex h-12 shrink-0 items-center border-b px-4'
          style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}>
          <div
            className={`shrink-0 ${webRuntime ? 'w-52' : 'w-8'}`}
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
            {webRuntime ? (
              <div className='text-foreground flex items-center gap-2 text-sm font-medium'>
                <span className='bg-primary/10 text-primary inline-flex h-7 w-7 items-center justify-center rounded-lg'>
                  <GlobeIcon className='h-4 w-4' />
                </span>
                <div className='min-w-0'>
                  <div className='truncate'>{'PromptHub 网页版'}</div>
                </div>
              </div>
            ) : isWorkflowView ? (
              <div className='w-8 shrink-0' />
            ) : (
              <Button
                type='text'
                onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
                className='text-muted-foreground hover:bg-accent/60 hover:text-foreground inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors'
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                title={isSidebarCollapsed ? '展开' : '收起'}
                aria-label={isSidebarCollapsed ? '展开' : '收起'}
                icon={<PanelLeftIcon className='h-4 w-4' />}
              />
            )}
          </div>

          {/* 搜索框；工作流列表时在搜索旁显示新建 */}
          <div className='flex flex-1 items-center justify-center gap-2 px-3'>
            {isNoteView ||
            isPromptView ||
            isKbView ||
            isChatView ||
            isNewsView ||
            isWorkflowView ? null : (
              <div className='relative flex w-full max-w-lg flex-1 items-center'>
                <div className='app-wallpaper-search pointer-events-none absolute inset-0 rounded-lg border' />
                <Input
                  ref={searchInputRef}
                  variant='borderless'
                  placeholder={
                    isWorkflowView
                      ? '按名称搜索工作流'
                      : appModule === 'skill'
                        ? isProjectSkillView
                          ? '搜索项目 Skills...'
                          : '搜索 Skills...'
                        : isPromptView
                          ? '搜索提示词或目录...'
                          : '搜索 IPrompt...'
                  }
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                  onKeyDown={handleKeyDown}
                  className='relative z-10 h-9 border-0 bg-transparent text-sm shadow-none focus-within:shadow-none'
                  styles={{
                    input: {
                      WebkitAppRegion: 'no-drag',
                    } as React.CSSProperties,
                  }}
                  prefix={<SearchIcon className='text-muted-foreground h-4 w-4' />}
                  suffix={
                    searchQuery ? (
                      <div
                        className='flex items-center gap-0.5'
                        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
                        {!isWorkflowView ? (
                          <span className='text-muted-foreground px-1 text-xs tabular-nums'>
                            {searchResultCount > 0
                              ? showSearchNavigation
                                ? `${currentResultIndex + 1}/${searchResultCount}`
                                : `${searchResultCount} 条结果`
                              : '无结果'}
                          </span>
                        ) : null}
                        {showSearchNavigation && searchResultCount > 1 && (
                          <>
                            <Button
                              type='text'
                              size='small'
                              onClick={() => navigateResult('prev')}
                              title={'上一个 (Shift+Tab)'}
                              icon={<ChevronUpIcon className='text-muted-foreground h-3.5 w-3.5' />}
                            />
                            <Button
                              type='text'
                              size='small'
                              onClick={() => navigateResult('next')}
                              title={'下一个 (Tab)'}
                              icon={
                                <ChevronDownIcon className='text-muted-foreground h-3.5 w-3.5' />
                              }
                            />
                          </>
                        )}
                        <Button
                          type='text'
                          size='small'
                          onClick={() => setSearchQuery('')}
                          title={'清除搜索'}
                          icon={<XIcon className='text-muted-foreground h-3.5 w-3.5' />}
                        />
                      </div>
                    ) : null
                  }
                />
              </div>
            )}
          </div>

          {/* 右侧操作按钮 - 只有按钮本身不可拖动 */}
          <div className='ml-4 flex items-center gap-1'>
            {!isNoteView &&
              !isPromptView &&
              !isKbView &&
              !isChatView &&
              !isNewsView &&
              !isWorkflowView && (
                <div
                  ref={createMenuRef}
                  className='bg-primary text-primary-foreground hover:bg-primary/90 relative ml-4 flex h-8 items-center rounded-lg shadow-sm transition-all'
                  style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
                  <Button
                    type='primary'
                    onClick={async () => {
                      if (isProjectSkillView) {
                        document.dispatchEvent(
                          new CustomEvent(OPEN_CREATE_SKILL_PROJECT_MODAL_EVENT),
                        );
                      } else {
                        setIsCreateSkillModalOpen(true);
                      }
                    }}
                    className='flex h-full items-center gap-1.5 px-3 text-sm font-medium transition-transform active:scale-95'
                    icon={
                      isProjectSkillView ? (
                        <FolderPlusIcon className='h-4 w-4' />
                      ) : (
                        <PlusIcon className='h-4 w-4' />
                      )
                    }>
                    <span>{isProjectSkillView ? '添加项目' : '新建'}</span>
                  </Button>
                </div>
              )}

            {/* 主题切换 */}
            <Button
              type='text'
              onClick={toggleTheme}
              className='text-muted-foreground hover:text-foreground hover:bg-accent/60 rounded-lg p-2 transition-colors'
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
              icon={isDarkMode ? <SunIcon className='h-4 w-4' /> : <MoonIcon className='h-4 w-4' />}
            />

            {webRuntime && (
              <Button
                type='text'
                onClick={() => void logoutWebSession()}
                className='text-muted-foreground hover:bg-accent/60 hover:text-foreground inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm transition-colors'
                style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
                title={'退出登录'}
                icon={<LogOutIcon className='h-4 w-4' />}>
                <span className='hidden sm:inline'>{'退出登录'}</span>
              </Button>
            )}
          </div>
        </header>
      ) : null}

      <Suspense fallback={null}>
        {/* 快速添加弹窗 */}
        <QuickAddModal
          isOpen={isQuickAddModalOpen}
          onClose={() => setIsQuickAddModalOpen(false)}
          onCreate={handleCreatePrompt}
        />

        {/* 新建 ISkill 弹窗 */}
        <CreateSkillModal
          isOpen={isCreateSkillModalOpen}
          onClose={() => setIsCreateSkillModalOpen(false)}
        />
      </Suspense>
    </>
  );
}
