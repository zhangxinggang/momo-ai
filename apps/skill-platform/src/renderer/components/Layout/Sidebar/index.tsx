import { compareVersions } from '@/utils/version';
import { MomoTreeToolbar } from '@momo/tree';
import { ChatPanel } from '@renderer/components/Chat';
import { KnowledgePanel } from '@renderer/components/Knowledge';
import { NoteTreePanel } from '@renderer/components/Note/NoteTreePanel';
import { PromptTreePanel } from '@renderer/components/Prompt/PromptTreePanel';
import badgeStyles from '@renderer/components/Settings/SettingBadge/index.module.less';
import { ToolboxPanel, useHasToolboxModule } from '@renderer/components/Toolbox';
import { useToast } from '@renderer/components/ui/Toast';
import WorkflowImportConflictModal from '@renderer/components/Workflow/WorkflowImportConflictModal';
import { WorkflowTreePanel } from '@renderer/components/Workflow/WorkflowTreePanel';
import { useConfirmLeaveEditors } from '@renderer/hooks/useConfirmLeaveEditors';
import {
  useOnlineStoreSources,
  useSyncDefaultOnlineStoreSource,
} from '@renderer/hooks/useOnlineStoreSources';
import { usePromptBackup } from '@renderer/hooks/usePromptBackup';
import { useTreeRootCreate } from '@renderer/hooks/useTreeRootCreate';
import { useWorkflowBackup } from '@renderer/hooks/useWorkflowBackup';
import { isWindowFullscreen } from '@renderer/services/desktop';
import { buildSkillStats } from '@renderer/services/skill/stats';
import {
  useFolderStore,
  useKbStore,
  useNoteStore,
  useOnlineConfStore,
  usePromptStore,
  useSettingsStore,
  useSkillStore,
  useUIStore,
  useWorkflowStore,
} from '@renderer/store';
import { Button } from 'antd';
import {
  BookOpenIcon,
  Clock3Icon,
  CommandIcon,
  CuboidIcon,
  DownloadIcon,
  FolderPlusIcon,
  GitBranchIcon,
  GlobeIcon,
  MessageSquareIcon,
  NotebookIcon,
  PlusIcon,
  SettingsIcon,
  StoreIcon,
  UploadIcon,
  WrenchIcon,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

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
  useSyncDefaultOnlineStoreSource();
  const [isMac, setIsMac] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewMode = useUIStore((state) => state.viewMode);
  const workflowScreen = useUIStore((state) => state.workflowScreen);
  const setAppModule = useUIStore((state) => state.setAppModule);
  const isCollapsed = useUIStore((state) => state.isSidebarCollapsed);
  const skillProjects = useSettingsStore((state) => state.skillProjects);
  const hasNewVersion = useOnlineConfStore((state) => {
    const remoteVersion = state.config?.update?.version?.trim();
    if (!remoteVersion) {
      return false;
    }
    return compareVersions(remoteVersion, state.localVersion) > 0;
  });
  const hasToolboxModule = useHasToolboxModule();

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
  const onlineStoreSources = useOnlineStoreSources();
  const remoteStoreEntries = useSkillStore((state) => state.remoteStoreEntries);
  const skillStats = useMemo(
    () => buildSkillStats(skills, deployedSkillNames),
    [skills, deployedSkillNames],
  );
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
  const workflowTreeData = useWorkflowStore((state) => state.treeData);
  const workflowTreeSearchQuery = useWorkflowStore((state) => state.treeSearchQuery);
  const setWorkflowTreeSearchQuery = useWorkflowStore((state) => state.setTreeSearchQuery);
  const selectWorkflow = useWorkflowStore((state) => state.selectWorkflow);
  const createWorkflowFolder = useWorkflowStore((state) => state.createFolder);
  const createWorkflowAndOpenStudio = useWorkflowStore(
    (state) => state.createWorkflowAndOpenStudio,
  );
  const refreshWorkflowTree = useWorkflowStore((state) => state.refreshTree);

  const workflowRootCreate = useTreeRootCreate({
    treeData: workflowTreeData,
    labels: {
      createFolderTitle: '新建目录',
      createNoteTitle: '新建工作流',
      createNamePlaceholder: '请输入名称',
      duplicateNameError: '同级下已存在相同名称',
      emptyNameError: '名称不能为空',
      confirm: '确定',
      cancel: '取消',
    },
    onCreateFolder: async (name) => {
      await createWorkflowFolder({ name });
      refreshWorkflowTree();
      if (currentPage !== 'home') onNavigate('home');
    },
    onCreateItem: async (name) => {
      await createWorkflowAndOpenStudio(name);
      refreshWorkflowTree();
      if (currentPage !== 'home') onNavigate('home');
    },
  });
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

  const { showToast } = useToast();
  const {
    exportAllPrompts,
    importPromptBackup: importPromptBackupFile,
    isExporting: isExportingPrompts,
    isImporting: isImportingPrompts,
  } = usePromptBackup();

  const {
    importWorkflow,
    isImporting: isImportingWorkflow,
    conflictModalProps: workflowConflictModalProps,
  } = useWorkflowBackup();

  const handleExportPrompts = useCallback(async () => {
    try {
      const result = await exportAllPrompts();
      if (result.canceled) {
        return;
      }
      showToast(`已导出 ${result.promptCount ?? 0} 个提示词`, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : '导出失败';
      showToast(message, 'error');
    }
  }, [exportAllPrompts, showToast]);

  const handleImportPrompts = useCallback(async () => {
    try {
      const result = await importPromptBackupFile();
      if (result.canceled) {
        return;
      }
      showToast(
        `已导入 ${result.promptCount ?? 0} 个提示词、${result.folderCount ?? 0} 个目录`,
        'success',
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : '导入失败';
      showToast(message, 'error');
    }
  }, [importPromptBackupFile, showToast]);

  const handleImportWorkflow = useCallback(async () => {
    try {
      await importWorkflow();
    } catch (error) {
      const message = error instanceof Error ? error.message : '导入失败';
      showToast(message, 'error');
    }
  }, [importWorkflow, showToast]);

  const workflowImportActions = (
    <button
      type='button'
      className='text-muted-foreground hover:text-foreground rounded p-1 transition-colors disabled:opacity-50'
      title='导入工作流'
      aria-label='导入工作流'
      disabled={isImportingWorkflow}
      onClick={() => void handleImportWorkflow()}>
      <UploadIcon className='h-4 w-4' />
    </button>
  );

  const promptBackupActions = (
    <>
      <button
        type='button'
        className='text-muted-foreground hover:text-foreground rounded p-1 transition-colors disabled:opacity-50'
        title='导出提示词'
        aria-label='导出提示词'
        disabled={isExportingPrompts}
        onClick={() => void handleExportPrompts()}>
        <DownloadIcon className='h-4 w-4' />
      </button>
      <button
        type='button'
        className='text-muted-foreground hover:text-foreground rounded p-1 transition-colors disabled:opacity-50'
        title='导入提示词'
        aria-label='导入提示词'
        disabled={isImportingPrompts}
        onClick={() => void handleImportPrompts()}>
        <UploadIcon className='h-4 w-4' />
      </button>
    </>
  );

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

  const railNavItems = useMemo(() => {
    const items: Array<{
      key: 'prompt' | 'skill' | 'workflow' | 'kb' | 'note' | 'chat' | 'toolbox';
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
            const canLeave = await confirmLeaveAllEditors({
              checkAiChat: currentPage === 'home' && viewMode !== 'prompt',
            });
            if (!canLeave) {
              return;
            }
            setAppModule('prompt');
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
            const canLeave = await confirmLeaveAllEditors({
              checkAiChat: currentPage === 'home' && viewMode !== 'skill',
            });
            if (!canLeave) {
              return;
            }
            setAppModule('skill');
            selectSkill(null);
            if (currentPage !== 'home') onNavigate('home');
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
            const canLeave = await confirmLeaveAllEditors({
              checkAiChat: currentPage === 'home' && viewMode !== 'kb',
            });
            if (!canLeave) {
              return;
            }
            setAppModule('kb');
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
            const canLeave = await confirmLeaveAllEditors({
              checkAiChat: currentPage === 'home' && viewMode !== 'note',
            });
            if (!canLeave) return;
            setAppModule('note');
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
            const canLeave = await confirmLeaveAllEditors({
              checkAiChat:
                currentPage === 'home' &&
                (viewMode !== 'workflow' || workflowScreen === 'business-work'),
            });
            if (!canLeave) {
              return;
            }
            setAppModule('workflow');
            selectWorkflow(null);
            if (currentPage !== 'home') {
              onNavigate('home');
            }
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
            const canLeave = await confirmLeaveAllEditors({
              checkAiChat: currentPage === 'home' && viewMode !== 'chat',
            });
            if (!canLeave) {
              return;
            }
            setAppModule('chat');
            if (currentPage !== 'home') {
              onNavigate('home');
            }
          })();
        },
      },
      {
        key: 'toolbox',
        label: '工具箱',
        icon: <WrenchIcon className='h-5 w-5' />,
        active: viewMode === 'toolbox',
        onClick: () => {
          void (async () => {
            const canLeave = await confirmLeaveAllEditors({
              checkAiChat: currentPage === 'home' && viewMode !== 'toolbox',
            });
            if (!canLeave) {
              return;
            }
            setAppModule('toolbox');
            if (currentPage !== 'home') {
              onNavigate('home');
            }
          })();
        },
      },
    ];
    return hasToolboxModule ? items : items.filter((item) => item.key !== 'toolbox');
  }, [
    viewMode,
    workflowScreen,
    hasToolboxModule,
    confirmLeaveAllEditors,
    setAppModule,
    currentPage,
    onNavigate,
    selectSkill,
    selectWorkflow,
  ]);

  useEffect(() => {
    const platform = navigator.userAgent.toLowerCase();
    setIsMac(platform.includes('mac'));

    const checkFullscreen = async () => {
      const full = await isWindowFullscreen();
      setIsFullscreen(full);
    };

    checkFullscreen();
    window.addEventListener('resize', checkFullscreen);
    return () => window.removeEventListener('resize', checkFullscreen);
  }, []);

  return (
    <aside
      className={`relative z-20 shrink-0 overflow-hidden transition-all duration-300 ease-in-out ${
        layout === 'panel' && isCollapsed ? 'hidden' : 'flex'
      } ${asideClassName}`}>
      {showRail && (
        <div
          className={`flex ${railWidthClass} bg-sidebar-accent/25 shrink-0 flex-col ${layout === 'combined' && !isCollapsed ? 'border-sidebar-border/60 border-r' : ''}`}>
          {isMac && !isFullscreen && <div className='titlebar-drag h-14 shrink-0' />}

          <div className='flex flex-1 flex-col px-2 py-3'>
            <div className='flex flex-1 flex-col'>
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
                <span className='relative inline-flex'>
                  <Button
                    type='text'
                    title={'设置'}
                    onClick={async () => {
                      if (
                        !(await confirmLeaveAllEditors({ checkAiChat: currentPage === 'home' }))
                      ) {
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
                  {hasNewVersion ? <span className={badgeStyles['settings-badge-dot']} /> : null}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {layout !== 'rail' ? (
        <div className='bg-sidebar-background/85 relative flex min-w-0 flex-1 flex-col'>
          {viewMode === 'prompt' ? (
            <>
              <div className='mt-2 flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-4'>
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
                  extraActions={promptBackupActions}
                />
                {promptRootCreate.createModal}

                <div className='scrollbar-hide flex-1 overflow-y-auto overflow-x-hidden'>
                  <PromptTreePanel />
                </div>
              </div>
            </>
          ) : viewMode === 'kb' ? (
            <>
              <div className='mt-2 flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-4'>
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
                <div className='scrollbar-hide flex-1 overflow-y-auto overflow-x-hidden'>
                  {!isCollapsed && (
                    <KnowledgePanel layout='module' collapsed={isCollapsed} hideHeader />
                  )}
                </div>
              </div>
            </>
          ) : viewMode === 'chat' ? (
            <>
              <div className='mt-2 flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-4'>
                {!isCollapsed && <ChatPanel collapsed={isCollapsed} />}
              </div>
            </>
          ) : viewMode === 'toolbox' ? (
            <>
              <div className='flex min-h-0 flex-1 flex-col overflow-hidden px-3 py-2'>
                <div className='scrollbar-hide min-h-0 flex-1 overflow-y-auto overflow-x-hidden'>
                  {!isCollapsed && <ToolboxPanel />}
                </div>
              </div>
            </>
          ) : viewMode === 'workflow' ? (
            <>
              <div className='mt-2 flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-4'>
                <MomoTreeToolbar
                  visible={!isCollapsed}
                  sectionLabel={'工作流'}
                  searchPlaceholder={'搜索工作流或目录...'}
                  searchQuery={workflowTreeSearchQuery}
                  onSearchQueryChange={setWorkflowTreeSearchQuery}
                  clearSearchLabel={'清除搜索'}
                  createDirectoryTitle={'新建目录'}
                  onCreateDirectory={workflowRootCreate.openCreateFolder}
                  createItemTitle={'新建工作流'}
                  onCreateItem={workflowRootCreate.openCreateItem}
                  extraActions={workflowImportActions}
                />
                {workflowRootCreate.createModal}
                <WorkflowImportConflictModal {...workflowConflictModalProps} />

                <div className='scrollbar-hide flex-1 overflow-y-auto overflow-x-hidden'>
                  <WorkflowTreePanel />
                </div>
              </div>
            </>
          ) : viewMode === 'note' ? (
            <>
              <div className='mt-2 flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-4'>
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

                <div className='scrollbar-hide flex-1 overflow-y-auto overflow-x-hidden'>
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
                  <>
                    <div className='app-wallpaper-panel-strong-border/50 my-2 h-px' />
                    <NavItem
                      icon={<StoreIcon className='h-5 w-5' />}
                      label={'Skill 商店'}
                      active={storeView === 'store' && currentPage === 'home'}
                      collapsed={isCollapsed}
                      onClick={async () => {
                        if (!(await confirmLeaveAllEditors())) return;
                        selectSkill(null);
                        setStoreView('store');
                        selectStoreSource(
                          selectedStoreSourceId || onlineStoreSources[0]?.id || 'new-custom',
                        );
                        if (currentPage !== 'home') onNavigate('home');
                      }}
                    />
                  </>
                  {storeView === 'store' && !isCollapsed && (
                    <div className='border-sidebar-border/50 ml-4 mt-1 space-y-1 border-l pl-3'>
                      {onlineStoreSources.map((source) => {
                        const storeCount = remoteStoreEntries[source.id]?.skills.length || 0;
                        return (
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
                            <span className='flex-1 truncate text-left'>{source.name}</span>
                            <span className='bg-sidebar-accent/80 text-sidebar-foreground/50 rounded-full border border-white/5 px-1.5 py-0.5 text-[10px]'>
                              {storeCount}
                            </span>
                          </Button>
                        );
                      })}
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
        </div>
      ) : null}
    </aside>
  );
}
