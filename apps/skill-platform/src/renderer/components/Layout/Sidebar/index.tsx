import type { IFolder } from '@/types/modules';
import { MomoTreeToolbar } from '@momo/tree';
import { AiNewsPanel } from '@renderer/components/AiNews';
import { ChatPanel } from '@renderer/components/Chat';
import { FolderModal } from '@renderer/components/Folder';
import { KnowledgePanel } from '@renderer/components/Knowledge';
import { NoteTreePanel } from '@renderer/components/Note/NoteTreePanel';
import { PromptTreePanel } from '@renderer/components/Prompt/PromptTreePanel';
import { useConfirmLeaveEditors } from '@renderer/hooks/useConfirmLeaveEditors';
import { useTreeRootCreate } from '@renderer/hooks/useTreeRootCreate';
import { getRuntimeCapabilities, isWebRuntime } from '@renderer/runtime';
import { buildPromptStats } from '@renderer/services/prompt/filter';
import { buildSkillStats } from '@renderer/services/skill/stats';
import {
  useFolderStore,
  useKbStore,
  useNoteStore,
  usePromptStore,
  useSettingsStore,
  useSkillStore,
  useUIStore,
} from '@renderer/store';
import { Button } from 'antd';
import {
  BookOpenIcon,
  BoxesIcon,
  Clock3Icon,
  CommandIcon,
  CuboidIcon,
  FolderPlusIcon,
  GitBranchIcon,
  GlobeIcon,
  LinkIcon,
  MessageSquareIcon,
  NewspaperIcon,
  NotebookIcon,
  PlusIcon,
  SettingsIcon,
  StarIcon,
  StoreIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { NavItem } from './components/NavItem';
type PageType = 'home' | 'settings';
type SidebarLayout = 'combined' | 'rail' | 'panel';

interface IProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  layout?: SidebarLayout;
}

export function Sidebar({ currentPage, onNavigate, layout = 'combined' }: IProps) {
  const { confirmLeaveAllEditors } = useConfirmLeaveEditors();
  const folders = useFolderStore((state) => state.folders);
  const selectedFolderId = useFolderStore((state) => state.selectedFolderId);
  const selectFolder = useFolderStore((state) => state.selectFolder);
  const reorderFolders = useFolderStore((state) => state.reorderFolders);
  const expandedIds = useFolderStore((state) => state.expandedIds);
  const toggleExpand = useFolderStore((state) => state.toggleExpand);
  const updateFolder = useFolderStore((state) => state.updateFolder);
  const prompts = usePromptStore((state) => state.prompts);
  const [isMac, setIsMac] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<IFolder | null>(null);
  const [showAllTags, setShowAllTags] = useState(false);
  const filterTags = usePromptStore((state) => state.filterTags);
  const toggleFilterTag = usePromptStore((state) => state.toggleFilterTag);
  const clearFilterTags = usePromptStore((state) => state.clearFilterTags);
  const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
  const [isTagPopoverVisible, setIsTagPopoverVisible] = useState(false);
  const [tagPopoverPos, setTagPopoverPos] = useState<{
    top?: number;
    bottom?: number;
    left: number;
  }>({ top: 0, left: 0 });
  const tagButtonRef = useRef<HTMLButtonElement | null>(null);
  const tagPopoverRef = useRef<HTMLDivElement | null>(null);
  const tagPopoverCloseTimerRef = useRef<number | null>(null);

  // Resize state
  const tagsSectionHeight = useSettingsStore((state) => state.tagsSectionHeight);
  const setTagsSectionHeight = useSettingsStore((state) => state.setTagsSectionHeight);
  const isTagsCollapsed = useSettingsStore((state) => state.isTagsSectionCollapsed);
  const setIsTagsCollapsed = useSettingsStore((state) => state.setIsTagsSectionCollapsed);
  const viewMode = useUIStore((state) => state.viewMode);
  const setAppModule = useUIStore((state) => state.setAppModule);
  const isCollapsed = useUIStore((state) => state.isSidebarCollapsed);
  const skillProjects = useSettingsStore((state) => state.skillProjects);

  // Skill store
  const skills = useSkillStore((state) => state.skills);
  const skillFilterType = useSkillStore((state) => state.filterType);
  const setSkillFilterType = useSkillStore((state) => state.setFilterType);
  const deployedSkillNames = useSkillStore((state) => state.deployedSkillNames);
  const storeView = useSkillStore((state) => state.storeView);
  const setStoreView = useSkillStore((state) => state.setStoreView);
  const selectSkill = useSkillStore((state) => state.selectSkill);
  const selectedStoreSourceId = useSkillStore((state) => state.selectedStoreSourceId);
  const selectStoreSource = useSkillStore((state) => state.selectStoreSource);
  const customStoreSources = useSkillStore((state) => state.customStoreSources);
  const remoteStoreEntries = useSkillStore((state) => state.remoteStoreEntries);
  const communityStoreCount = useMemo(
    () => remoteStoreEntries.community?.skills.length || 0,
    [remoteStoreEntries],
  );
  const skillHubStoreCount = useMemo(
    () => remoteStoreEntries.skillhub?.skills.length || 0,
    [remoteStoreEntries],
  );
  const claudeCodeStoreCount = useMemo(
    () => remoteStoreEntries['claude-code']?.skills.length || 0,
    [remoteStoreEntries],
  );
  const openAiCodexStoreCount = useMemo(
    () => remoteStoreEntries['openai-codex']?.skills.length || 0,
    [remoteStoreEntries],
  );
  const promptStats = useMemo(() => buildPromptStats(prompts), [prompts]);
  const skillStats = useMemo(
    () => buildSkillStats(skills, deployedSkillNames),
    [skills, deployedSkillNames],
  );
  const favoriteCount = promptStats.favoriteCount;
  const uniqueTags = promptStats.uniqueTags;
  const runtimeCapabilities = getRuntimeCapabilities();
  const webRuntime = isWebRuntime();
  const showRail = layout !== 'panel';
  const railWidthClass = 'w-20';
  const combinedWidthClass = 'w-[23rem]';
  const asideClassName =
    layout === 'rail'
      ? `${railWidthClass} border-r border-sidebar-border/60 bg-sidebar-accent/25`
      : layout === 'panel'
        ? `border-r border-sidebar-border bg-sidebar-background/85 app-wallpaper-panel-strong w-72 min-w-0`
        : `border-r border-sidebar-border app-left-rail-glass app-wallpaper-panel-strong ${
            isCollapsed ? railWidthClass : combinedWidthClass
          }`;

  const createRootFolder = useNoteStore((state) => state.createRootFolder);
  const createNoteFile = useNoteStore((state) => state.createNote);
  const noteTreeData = useNoteStore((state) => state.treeData);
  const noteTreeSearchQuery = useNoteStore((state) => state.treeSearchQuery);
  const setNoteTreeSearchQuery = useNoteStore((state) => state.setTreeSearchQuery);
  const kbListSearchQuery = useKbStore((state) => state.listSearchQuery);
  const setKbListSearchQuery = useKbStore((state) => state.setListSearchQuery);
  const setKbCreateModalOpen = useKbStore((state) => state.setCreateModalOpen);
  const promptTreeData = usePromptStore((state) => state.treeData);
  const promptTreeSearchQuery = usePromptStore((state) => state.treeSearchQuery);
  const setPromptTreeSearchQuery = usePromptStore((state) => state.setTreeSearchQuery);
  const openEditEditor = usePromptStore((state) => state.openEditEditor);
  const createPrompt = usePromptStore((state) => state.createPrompt);
  const refreshPromptTree = usePromptStore((state) => state.refreshTree);
  const createPromptFolder = useFolderStore((state) => state.createFolder);

  const promptRootCreate = useTreeRootCreate({
    treeData: promptTreeData,
    labels: {
      createFolderTitle: '新建目录',
      createNoteTitle: '新建提示词',
      createNamePlaceholder: '请输入名称',
      duplicateNameError: '同级下已存在相同名称',
      emptyNameError: '名称不能为空',
      confirm: '确定',
      cancel: '取消',
    },
    onCreateFolder: async (name) => {
      await createPromptFolder({ name });
      refreshPromptTree();
      if (currentPage !== 'home') onNavigate('home');
    },
    onCreateItem: async (name) => {
      const created = await createPrompt({
        title: name,
        userPrompt: '',
        tags: [],
      });
      openEditEditor(created.id);
      refreshPromptTree();
      if (currentPage !== 'home') onNavigate('home');
    },
  });

  const noteRootCreate = useTreeRootCreate({
    treeData: noteTreeData,
    labels: {
      createFolderTitle: '新建文件夹',
      createNoteTitle: '新建笔记',
      createNamePlaceholder: '请输入名称',
      duplicateNameError: '同级下已存在相同名称',
      emptyNameError: '名称不能为空',
      confirm: '确定',
      cancel: '取消',
    },
    onCreateFolder: async (name) => {
      await createRootFolder(name);
    },
    onCreateItem: async (name) => {
      await createNoteFile(null, name);
    },
  });

  const railNavItems: Array<{
    key: 'prompt' | 'skill' | 'workflow' | 'kb' | 'note' | 'chat' | 'news';
    label: string;
    icon: React.ReactNode;
    active: boolean;
    onClick: () => void;
  }> = [
    {
      key: 'prompt',
      label: '提示词',
      icon: <CommandIcon className='h-5 w-5' />,
      active: viewMode === 'prompt',
      onClick: () => {
        void (async () => {
          const canLeave = await confirmLeaveAllEditors();
          if (!canLeave) {
            return;
          }
          setAppModule('prompt');
          closeTagPopover();
          if (currentPage !== 'home') onNavigate('home');
        })();
      },
    },
    {
      key: 'skill',
      label: '技能',
      icon: <CuboidIcon className='h-5 w-5' />,
      active: viewMode === 'skill',
      onClick: () => {
        void (async () => {
          const canLeave = await confirmLeaveAllEditors();
          if (!canLeave) {
            return;
          }
          setAppModule('skill');
          selectSkill(null);
          closeTagPopover();
          if (currentPage !== 'home') onNavigate('home');
        })();
      },
    },
    {
      key: 'workflow',
      label: '工作流',
      icon: <GitBranchIcon className='h-5 w-5' />,
      active: viewMode === 'workflow',
      onClick: () => {
        void (async () => {
          const canLeave = await confirmLeaveAllEditors();
          if (!canLeave) {
            return;
          }
          setAppModule('workflow');
          closeTagPopover();
          if (currentPage !== 'home') {
            onNavigate('home');
          }
        })();
      },
    },
    {
      key: 'kb',
      label: '知识库',
      icon: <BookOpenIcon className='h-5 w-5' />,
      active: viewMode === 'kb',
      onClick: () => {
        void (async () => {
          const canLeave = await confirmLeaveAllEditors();
          if (!canLeave) {
            return;
          }
          setAppModule('kb');
          closeTagPopover();
          if (currentPage !== 'home') {
            onNavigate('home');
          }
        })();
      },
    },
    {
      key: 'note',
      label: '笔记',
      icon: <NotebookIcon className='h-5 w-5' />,
      active: viewMode === 'note',
      onClick: () => {
        void (async () => {
          const canLeave = await confirmLeaveAllEditors();
          if (!canLeave) return;
          setAppModule('note');
          closeTagPopover();
          if (currentPage !== 'home') onNavigate('home');
        })();
      },
    },
    {
      key: 'chat',
      label: 'AI对话',
      icon: <MessageSquareIcon className='h-5 w-5' />,
      active: viewMode === 'chat',
      onClick: () => {
        void (async () => {
          const canLeave = await confirmLeaveAllEditors();
          if (!canLeave) {
            return;
          }
          setAppModule('chat');
          closeTagPopover();
          if (currentPage !== 'home') {
            onNavigate('home');
          }
        })();
      },
    },
    {
      key: 'news',
      label: 'AI资讯',
      icon: <NewspaperIcon className='h-5 w-5' />,
      active: viewMode === 'news',
      onClick: () => {
        void (async () => {
          const canLeave = await confirmLeaveAllEditors();
          if (!canLeave) {
            return;
          }
          setAppModule('news');
          closeTagPopover();
          if (currentPage !== 'home') {
            onNavigate('home');
          }
        })();
      },
    },
  ];

  // Skill tags section settings (mirrors prompt tags behavior)
  const skillTagsSectionHeight = useSettingsStore((state) => state.skillTagsSectionHeight);
  const setSkillTagsSectionHeight = useSettingsStore((state) => state.setSkillTagsSectionHeight);
  const isSkillTagsCollapsed = useSettingsStore((state) => state.isSkillTagsSectionCollapsed);
  const setIsSkillTagsCollapsed = useSettingsStore((state) => state.setIsSkillTagsSectionCollapsed);

  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

  useEffect(() => {
    const platform = navigator.userAgent.toLowerCase();
    setIsMac(platform.includes('mac'));

    const checkFullscreen = async () => {
      if (window.electron?.isFullscreen) {
        const full = await window.electron.isFullscreen();
        setIsFullscreen(full);
      }
    };

    checkFullscreen();
    window.addEventListener('resize', checkFullscreen);
    return () => window.removeEventListener('resize', checkFullscreen);
  }, []);

  useEffect(() => {
    return () => {
      if (tagPopoverCloseTimerRef.current !== null) {
        window.clearTimeout(tagPopoverCloseTimerRef.current);
        tagPopoverCloseTimerRef.current = null;
      }
    };
  }, []);

  const closeTagPopover = useCallback(() => {
    setIsTagPopoverVisible(false);
    if (tagPopoverCloseTimerRef.current !== null) {
      window.clearTimeout(tagPopoverCloseTimerRef.current);
      tagPopoverCloseTimerRef.current = null;
    }
    tagPopoverCloseTimerRef.current = window.setTimeout(() => {
      setIsTagPopoverOpen(false);
      tagPopoverCloseTimerRef.current = null;
    }, 160);
  }, []);

  useEffect(() => {
    if (!isTagPopoverOpen) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (tagPopoverRef.current?.contains(target)) return;
      if (tagButtonRef.current?.contains(target)) return;
      closeTagPopover();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeTagPopover();
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeTagPopover, isTagPopoverOpen]);

  const openTagPopover = () => {
    const el = tagButtonRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();

    const width = 320;
    const maxHeight = Math.min(420, Math.max(240, window.innerHeight - 24));

    let left = rect.right + 12;
    if (left + width > window.innerWidth - 12) {
      left = Math.max(12, rect.left - width - 12);
    }

    // 彻底修复定位：根据按钮所在屏幕位置，决定是用 top 还是 bottom 定位
    // Fix positioning: use top or bottom depending on button's screen position
    const isInBottomHalf = rect.top > window.innerHeight / 2;
    const newPos: { top?: number; bottom?: number; left: number } = { left };

    if (isInBottomHalf) {
      // 底部对齐逻辑：设置 bottom 距离，让弹窗向上生长
      // Bottom alignment: set bottom distance, let popover grow upwards
      newPos.bottom = window.innerHeight - rect.bottom + 8;
    } else {
      // 顶部对齐逻辑：设置 top 距离
      // Top alignment: set top distance
      newPos.top = rect.top - 8;
      if (newPos.top + maxHeight > window.innerHeight - 12) {
        newPos.top = Math.max(12, window.innerHeight - 12 - maxHeight);
      }
    }

    if (tagPopoverCloseTimerRef.current !== null) {
      window.clearTimeout(tagPopoverCloseTimerRef.current);
      tagPopoverCloseTimerRef.current = null;
    }

    setTagPopoverPos(newPos);
    setIsTagPopoverOpen(true);
    setIsTagPopoverVisible(false);
    requestAnimationFrame(() => {
      setIsTagPopoverVisible(true);
    });
  };

  // Resize handler (shared for prompt and skill tags sections)
  const resizeTarget = useRef<'prompt' | 'skill'>('prompt');

  const handleResizeStart = (e: React.MouseEvent, target: 'prompt' | 'skill' = 'prompt') => {
    e.preventDefault();
    setIsResizing(true);
    resizeTarget.current = target;
    dragStartY.current = e.clientY;
    dragStartHeight.current = target === 'prompt' ? tagsSectionHeight : skillTagsSectionHeight;
    document.body.style.cursor = 'ns-resize';
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = dragStartY.current - e.clientY;
      const newHeight = dragStartHeight.current + deltaY;
      const minHeight = 140;
      const maxHeight = window.innerHeight - 300;
      const clampedHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
      if (resizeTarget.current === 'prompt') {
        setTagsSectionHeight(clampedHeight);
      } else {
        setSkillTagsSectionHeight(clampedHeight);
      }
    };
    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, setTagsSectionHeight, setSkillTagsSectionHeight]);
  return (
    <aside
      ref={sidebarRef}
      className={`relative z-20 shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${
        layout === 'panel' && isCollapsed ? 'hidden' : 'flex'
      } ${asideClassName}`}>
      {showRail && (
        <div
          className={`flex ${railWidthClass} bg-sidebar-accent/25 shrink-0 flex-col ${layout === 'combined' && !isCollapsed ? 'border-sidebar-border/60 border-r' : ''}`}>
          {!webRuntime && isMac && !isFullscreen && <div className='titlebar-drag h-14 shrink-0' />}

          <div className='flex flex-1 flex-col px-2 py-3'>
            <div className='flex flex-1 flex-col gap-2'>
              {railNavItems.map((item) => (
                <Button
                  key={item.key}
                  type={item.active ? 'primary' : 'text'}
                  onClick={item.onClick}
                  title={item.label}
                  className={`titlebar-no-drag flex h-auto flex-col items-center justify-center gap-1.5 rounded-2xl px-2 py-3 text-[11px] font-medium transition-colors ${
                    item.active
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  }`}>
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-2xl ${item.active ? 'bg-white/10' : 'bg-transparent'}`}>
                    {item.icon}
                  </span>
                  <span className='text-center text-[10px] leading-none'>{item.label}</span>
                </Button>
              ))}
            </div>

            <div className='mt-auto pt-4'>
              <div className='titlebar-no-drag flex items-center justify-center'>
                <Button
                  type='text'
                  title={'设置'}
                  onClick={async () => {
                    if (!(await confirmLeaveAllEditors())) {
                      return;
                    }
                    onNavigate('settings');
                  }}
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-colors ${
                    currentPage === 'settings'
                      ? 'bg-sidebar-accent text-sidebar-foreground'
                      : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  }`}
                  icon={<SettingsIcon className='h-5 w-5' />}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {layout !== 'rail' ? (
        <div className='bg-sidebar-background/85 relative flex min-w-0 flex-1 flex-col'>
          {viewMode === 'prompt' ? (
            <>
              <div className='mt-2 flex min-h-0 flex-1 flex-col overflow-hidden'>
                <MomoTreeToolbar
                  visible={!isCollapsed}
                  sectionLabel={'目录'}
                  searchPlaceholder={'搜索提示词或目录...'}
                  searchQuery={promptTreeSearchQuery}
                  onSearchQueryChange={setPromptTreeSearchQuery}
                  clearSearchLabel={'清除搜索'}
                  createDirectoryTitle={'新增目录'}
                  onCreateDirectory={promptRootCreate.openCreateFolder}
                  createItemTitle={'新建提示词'}
                  onCreateItem={promptRootCreate.openCreateItem}
                />
                {promptRootCreate.createModal}

                <div className='scrollbar-hide flex-1 overflow-y-auto overflow-x-hidden px-3 pb-4'>
                  <PromptTreePanel />
                </div>
              </div>
            </>
          ) : viewMode === 'kb' ? (
            <>
              <div className='mt-2 flex min-h-0 flex-1 flex-col overflow-hidden'>
                <MomoTreeToolbar
                  visible={!isCollapsed}
                  sectionLabel={'知识库'}
                  searchPlaceholder={'搜索知识库...'}
                  searchQuery={kbListSearchQuery}
                  onSearchQueryChange={setKbListSearchQuery}
                  clearSearchLabel={'清除搜索'}
                  createItemTitle={'新建知识库'}
                  onCreateItem={() => setKbCreateModalOpen(true)}
                />
                <div className='scrollbar-hide flex-1 overflow-y-auto overflow-x-hidden px-3 pb-4'>
                  {!isCollapsed && (
                    <KnowledgePanel layout='module' collapsed={isCollapsed} hideHeader />
                  )}
                </div>
              </div>
            </>
          ) : viewMode === 'chat' ? (
            <>
              <div className='mt-2 flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-4'>
                {!isCollapsed &&
                  (isWebRuntime() ? (
                    <div className='text-muted-foreground px-1 text-sm'>
                      {'AI 对话仅在桌面客户端可用'}
                    </div>
                  ) : (
                    <ChatPanel collapsed={isCollapsed} />
                  ))}
              </div>
            </>
          ) : viewMode === 'news' ? (
            <>
              <div className='mt-2 flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-4'>
                {!isCollapsed && <AiNewsPanel />}
              </div>
            </>
          ) : viewMode === 'note' ? (
            <>
              <div className='mt-2 flex min-h-0 flex-1 flex-col overflow-hidden'>
                <MomoTreeToolbar
                  visible={!isCollapsed}
                  sectionLabel={'目录'}
                  searchPlaceholder={'搜索文件或目录...'}
                  searchQuery={noteTreeSearchQuery}
                  onSearchQueryChange={setNoteTreeSearchQuery}
                  clearSearchLabel={'清除搜索'}
                  createDirectoryTitle={'新增目录'}
                  onCreateDirectory={noteRootCreate.openCreateFolder}
                  createItemTitle={'新增笔记'}
                  onCreateItem={noteRootCreate.openCreateItem}
                />
                {noteRootCreate.createModal}

                <div className='scrollbar-hide flex-1 overflow-y-auto overflow-x-hidden px-3 pb-4'>
                  <NoteTreePanel />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* ISkill Navigation */}
              <div className='flex flex-shrink-0 flex-col px-3 py-2'>
                <div className='shrink-0 space-y-1'>
                  <NavItem
                    icon={<CuboidIcon className='h-5 w-5' />}
                    label={'我的 Skills'}
                    count={skills.length}
                    active={
                      skillFilterType === 'all' &&
                      storeView === 'my-skills' &&
                      currentPage === 'home'
                    }
                    collapsed={isCollapsed}
                    onClick={async () => {
                      if (!(await confirmLeaveAllEditors())) return;
                      selectSkill(null);
                      setSkillFilterType('all');
                      setStoreView('my-skills');
                      if (currentPage !== 'home') onNavigate('home');
                    }}
                  />
                  {runtimeCapabilities.skillLocalScan && (
                    <NavItem
                      icon={<FolderPlusIcon className='h-5 w-5' />}
                      label={'项目'}
                      count={skillProjects.length}
                      active={storeView === 'projects' && currentPage === 'home'}
                      collapsed={isCollapsed}
                      onClick={async () => {
                        if (!(await confirmLeaveAllEditors())) return;
                        selectSkill(null);
                        setStoreView('projects');
                        if (currentPage !== 'home') onNavigate('home');
                      }}
                    />
                  )}
                  <NavItem
                    icon={<StarIcon className='h-5 w-5' />}
                    label={'收藏'}
                    count={skillStats.favoriteCount}
                    active={
                      skillFilterType === 'favorites' &&
                      storeView === 'my-skills' &&
                      currentPage === 'home'
                    }
                    collapsed={isCollapsed}
                    onClick={async () => {
                      if (!(await confirmLeaveAllEditors())) return;
                      selectSkill(null);
                      setSkillFilterType('favorites');
                      setStoreView('my-skills');
                      if (currentPage !== 'home') onNavigate('home');
                    }}
                  />
                  {runtimeCapabilities.skillDistribution && (
                    <>
                      <NavItem
                        icon={<GlobeIcon className='h-5 w-5' />}
                        label={'已分发'}
                        count={skillStats.deployedCount}
                        active={storeView === 'distribution' && currentPage === 'home'}
                        collapsed={isCollapsed}
                        onClick={async () => {
                          if (!(await confirmLeaveAllEditors())) return;
                          selectSkill(null);
                          setStoreView('distribution');
                          if (currentPage !== 'home') onNavigate('home');
                        }}
                      />
                      <NavItem
                        icon={<Clock3Icon className='h-5 w-5' />}
                        label={'待分发'}
                        count={skillStats.pendingCount}
                        active={
                          skillFilterType === 'pending' &&
                          storeView === 'my-skills' &&
                          currentPage === 'home'
                        }
                        collapsed={isCollapsed}
                        onClick={async () => {
                          if (!(await confirmLeaveAllEditors())) return;
                          selectSkill(null);
                          setSkillFilterType('pending');
                          setStoreView('my-skills');
                          if (currentPage !== 'home') onNavigate('home');
                        }}
                      />
                    </>
                  )}
                  {runtimeCapabilities.skillStore && (
                    <>
                      <div className='app-wallpaper-panel-strong-border/50 my-2 h-px' />
                      <NavItem
                        icon={<StoreIcon className='h-5 w-5' />}
                        label={'ISkill 商店'}
                        active={storeView === 'store' && currentPage === 'home'}
                        collapsed={isCollapsed}
                        onClick={async () => {
                          if (!(await confirmLeaveAllEditors())) return;
                          selectSkill(null);
                          setStoreView('store');
                          selectStoreSource(selectedStoreSourceId || 'claude-code');
                          if (currentPage !== 'home') onNavigate('home');
                        }}
                      />
                    </>
                  )}
                  {runtimeCapabilities.skillStore && storeView === 'store' && !isCollapsed && (
                    <div className='border-sidebar-border/50 ml-4 mt-1 space-y-1 border-l pl-3'>
                      <Button
                        type={selectedStoreSourceId === 'claude-code' ? 'primary' : 'text'}
                        onClick={() => {
                          selectStoreSource('claude-code');
                          if (currentPage !== 'home') onNavigate('home');
                        }}
                        className={`flex h-auto w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                          selectedStoreSourceId === 'claude-code'
                            ? 'bg-sidebar-accent text-sidebar-foreground'
                            : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground'
                        }`}>
                        <GlobeIcon className='h-4 w-4' />
                        <span className='flex-1 truncate text-left'>{'Claude Code 商店'}</span>
                        <span className='bg-sidebar-accent/80 text-sidebar-foreground/50 rounded-full border border-white/5 px-1.5 py-0.5 text-[10px]'>
                          {claudeCodeStoreCount}
                        </span>
                      </Button>
                      <Button
                        type={selectedStoreSourceId === 'openai-codex' ? 'primary' : 'text'}
                        onClick={() => {
                          selectStoreSource('openai-codex');
                          if (currentPage !== 'home') onNavigate('home');
                        }}
                        className={`flex h-auto w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                          selectedStoreSourceId === 'openai-codex'
                            ? 'bg-sidebar-accent text-sidebar-foreground'
                            : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground'
                        }`}>
                        <GlobeIcon className='h-4 w-4' />
                        <span className='flex-1 truncate text-left'>{'OpenAI Codex 商店'}</span>
                        <span className='bg-sidebar-accent/80 text-sidebar-foreground/50 rounded-full border border-white/5 px-1.5 py-0.5 text-[10px]'>
                          {openAiCodexStoreCount}
                        </span>
                      </Button>
                      <Button
                        type={selectedStoreSourceId === 'community' ? 'primary' : 'text'}
                        onClick={() => {
                          selectStoreSource('community');
                          if (currentPage !== 'home') onNavigate('home');
                        }}
                        className={`flex h-auto w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                          selectedStoreSourceId === 'community'
                            ? 'bg-sidebar-accent text-sidebar-foreground'
                            : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground'
                        }`}>
                        <BoxesIcon className='h-4 w-4' />
                        <span className='flex-1 truncate text-left'>{'社区商店'}</span>
                        <span className='bg-sidebar-accent/80 text-sidebar-foreground/50 rounded-full border border-white/5 px-1.5 py-0.5 text-[10px]'>
                          {communityStoreCount}
                        </span>
                      </Button>
                      <Button
                        type={selectedStoreSourceId === 'skillhub' ? 'primary' : 'text'}
                        onClick={() => {
                          selectStoreSource('skillhub');
                          if (currentPage !== 'home') onNavigate('home');
                        }}
                        className={`flex h-auto w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                          selectedStoreSourceId === 'skillhub'
                            ? 'bg-sidebar-accent text-sidebar-foreground'
                            : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground'
                        }`}>
                        <GlobeIcon className='h-4 w-4' />
                        <span className='flex-1 truncate text-left'>{'SkillHub 商店'}</span>
                        <span className='bg-sidebar-accent/80 text-sidebar-foreground/50 rounded-full border border-white/5 px-1.5 py-0.5 text-[10px]'>
                          {skillHubStoreCount}
                        </span>
                      </Button>
                      {customStoreSources.map((source) => (
                        <Button
                          key={source.id}
                          type={selectedStoreSourceId === source.id ? 'primary' : 'text'}
                          onClick={() => {
                            selectStoreSource(source.id);
                            if (currentPage !== 'home') onNavigate('home');
                          }}
                          className={`flex h-auto w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                            selectedStoreSourceId === source.id
                              ? 'bg-sidebar-accent text-sidebar-foreground'
                              : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground'
                          }`}>
                          <LinkIcon className='h-4 w-4' />
                          <span className='flex-1 truncate text-left'>{source.name}</span>
                          {remoteStoreEntries[source.id]?.skills.length ? (
                            <span className='bg-sidebar-accent/80 text-sidebar-foreground/50 rounded-full border border-white/5 px-1.5 py-0.5 text-[10px]'>
                              {remoteStoreEntries[source.id]?.skills.length}
                            </span>
                          ) : null}
                          {!source.enabled && (
                            <span className='text-sidebar-foreground/40 text-[10px]'>
                              {'已停用'}
                            </span>
                          )}
                        </Button>
                      ))}
                      <Button
                        type={selectedStoreSourceId === 'new-custom' ? 'primary' : 'text'}
                        onClick={() => {
                          selectStoreSource('new-custom');
                          if (currentPage !== 'home') onNavigate('home');
                        }}
                        className={`flex h-auto w-full items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-sm transition-colors ${
                          selectedStoreSourceId === 'new-custom'
                            ? 'border-primary text-primary bg-primary/5'
                            : 'border-sidebar-border/70 text-sidebar-foreground/50 hover:border-primary/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/20'
                        }`}
                        icon={<PlusIcon className='h-4 w-4' />}>
                        <span className='truncate'>{'添加商店'}</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <FolderModal
            isOpen={isFolderModalOpen}
            onClose={() => {
              setIsFolderModalOpen(false);
              setEditingFolder(null);
            }}
            folder={editingFolder}
          />
        </div>
      ) : null}
    </aside>
  );
}
