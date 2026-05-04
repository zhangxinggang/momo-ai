import { ChatModuleProvider } from '@renderer/components/Chat';
import { MainContent, Sidebar, TitleBar, TopBar } from '@renderer/components/Layout';
import { BackgroundImageBackdrop } from '@renderer/components/ui/BackgroundImageBackdrop';
import { CloseDialog } from '@renderer/components/ui/CloseDialog';
import { WorkflowModalsHost } from '@renderer/components/Workflow';
import { useConfirmLeaveEditors } from '@renderer/hooks/useConfirmLeaveEditors';
import { isWebRuntime } from '@renderer/runtime';
import { initDatabase, migrateLegacyIndexedDbToMainProcess } from '@renderer/services/database';
import { configureKbService } from '@renderer/services/kb';
import { useFolderStore, usePromptStore, useSettingsStore, useUIStore } from '@renderer/store';
import {
  getRenderedBackgroundImageBlur,
  getRenderedBackgroundImageOpacity,
} from '@renderer/utils/settings/appearance';
import { Flex, Spin } from 'antd';
import { lazy, Suspense, useCallback, useEffect, useState } from 'react';

// Lazy load heavy components for better initial load performance
// 懒加载大型组件以提升初始加载性能
const SettingsPage = lazy(() =>
  import('@renderer/components/Settings/SettingsPage').then((m) => ({
    default: m.SettingsPage,
  })),
);
const EditPromptModal = lazy(() =>
  import('@renderer/components/Prompt/EditPromptModal').then((m) => ({
    default: m.EditPromptModal,
  })),
);

// Page type
// 页面类型
type PageType = 'home' | 'settings';

configureKbService(() => useSettingsStore.getState().aiModels);

function App() {
  const fetchPrompts = usePromptStore((state) => state.fetchPrompts);
  const fetchFolders = useFolderStore((state) => state.fetchFolders);
  const applyTheme = useSettingsStore((state) => state.applyTheme);
  const backgroundImageFileName = useSettingsStore((state) => state.backgroundImageFileName);
  const backgroundImageOpacity = useSettingsStore((state) => state.backgroundImageOpacity);
  const backgroundImageBlur = useSettingsStore((state) => state.backgroundImageBlur);
  const debugMode = useSettingsStore((state) => state.debugMode);
  const viewMode = useUIStore((state) => state.viewMode);
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [isLoading, setIsLoading] = useState(true);
  const { confirmLeaveAllEditors } = useConfirmLeaveEditors();

  /** 打开设置页；若技能/工作流编辑器有未保存更改则先确认 */
  const openSettingsPage = useCallback(() => {
    void (async () => {
      const canLeave = await confirmLeaveAllEditors();
      if (canLeave) {
        setCurrentPage('settings');
      }
    })();
  }, [confirmLeaveAllEditors]);

  // OS-level fullscreen state (synced from main process events)
  // OS 级全屏状态（通过主进程事件同步）
  const [isOsFullscreen, setIsOsFullscreen] = useState(false);

  // Close dialog state (Windows)
  // 关闭对话框状态（Windows）
  const [showCloseDialog, setShowCloseDialog] = useState(false);

  const normalizedBackgroundImageFileName = backgroundImageFileName?.trim();
  const hasBackgroundImage =
    !isWebRuntime() && typeof normalizedBackgroundImageFileName === 'string';
  const renderedBackgroundBlur = getRenderedBackgroundImageBlur(backgroundImageBlur);
  const renderedBackgroundImageOpacity = getRenderedBackgroundImageOpacity(backgroundImageOpacity);

  // Global Escape key: exit OS fullscreen regardless of which component entered it
  // 全局 Escape 键：无论哪个组件进入了 OS 全屏，都可以退出
  useEffect(() => {
    if (!isOsFullscreen) return;
    const handleEscapeFullscreen = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.electron?.exitFullscreen?.();
      }
    };
    window.addEventListener('keydown', handleEscapeFullscreen);
    return () => window.removeEventListener('keydown', handleEscapeFullscreen);
  }, [isOsFullscreen]);

  useEffect(() => {
    if (isWebRuntime()) {
      return;
    }

    // Listen for OS fullscreen state changes from main process
    // 监听主进程发送的 OS 全屏状态变化事件
    const handleFullscreenChanged = (isFullscreen: boolean) => {
      setIsOsFullscreen(isFullscreen);
    };
    window.api?.on?.('window:fullscreen-changed', handleFullscreenChanged);

    // Listen for close dialog trigger (Windows)
    // 监听关闭对话框触发（Windows）
    const handleShowCloseDialog = () => setShowCloseDialog(true);
    const offShowCloseDialog = window.electron?.onShowCloseDialog?.(handleShowCloseDialog);

    return () => {
      // Cleanup Electron/IPC listeners to prevent leaks on unmount/remount
      // 清理 Electron/IPC 监听，避免卸载/重挂载导致重复触发
      window.api?.off?.('window:fullscreen-changed', handleFullscreenChanged);
      if (typeof offShowCloseDialog === 'function') {
        offShowCloseDialog();
      }
    };
  }, []);

  // Sync debug mode
  useEffect(() => {
    window.electron?.setDebugMode?.(debugMode);
  }, [debugMode]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const syncSystemTheme = () => {
      const settings = useSettingsStore.getState();
      if (settings.themeMode !== 'system') {
        return;
      }

      const prefersDark = mediaQuery.matches;
      document.documentElement.classList.toggle('dark', prefersDark);

      if (settings.isDarkMode !== prefersDark) {
        useSettingsStore.setState({ isDarkMode: prefersDark });
      }
    };

    syncSystemTheme();
    mediaQuery.addEventListener('change', syncSystemTheme);
    return () => mediaQuery.removeEventListener('change', syncSystemTheme);
  }, []);

  useEffect(() => {
    // Apply persisted theme settings
    // 应用保存的主题设置
    applyTheme();

    // Initialize database, then load data
    let disposed = false;

    interface PersistController {
      hasHydrated?: () => boolean;
      onFinishHydration?: (callback: () => void) => () => void;
    }

    const waitForSettingsHydration = async (): Promise<void> => {
      const persistController = (
        useSettingsStore as typeof useSettingsStore & {
          persist?: PersistController;
        }
      ).persist;

      if (!persistController || persistController.hasHydrated?.()) {
        return;
      }

      await new Promise<void>((resolve) => {
        let finished = false;
        let unsubscribe: (() => void) | undefined;

        const finish = () => {
          if (finished) {
            return;
          }
          finished = true;
          unsubscribe?.();
          clearTimeout(timeoutId);
          resolve();
        };

        unsubscribe = persistController.onFinishHydration?.(finish);
        const timeoutId = setTimeout(finish, 500);
      });
    };

    const init = async (retryCount = 0) => {
      // Set max loading time to avoid waiting forever
      // 设置最大加载时间，防止无限等待
      const maxLoadingTime = setTimeout(() => {
        console.warn('⚠️ Loading timeout, showing UI anyway');
        setIsLoading(false);
      }, 5000);

      try {
        await initDatabase();
        if (!isWebRuntime()) {
          const migration = await migrateLegacyIndexedDbToMainProcess();
          if (migration.migrated) {
            console.log(
              `Migrated legacy IndexedDB data to SQLite (${migration.promptCount} prompts, ${migration.folderCount} folders, ${migration.versionCount} versions)`,
            );
          }
        }
        await fetchPrompts();
        await fetchFolders();
        console.log('✅ App initialized');
      } catch (error) {
        console.error('❌ Init failed:', error);
        // Retry once for timeout errors
        // 如果是超时错误，尝试重试一次
        if (retryCount < 1 && error instanceof Error && error.message.includes('timeout')) {
          console.log('🔄 Retrying database initialization...');
          await new Promise((resolve) => setTimeout(resolve, 500));
          clearTimeout(maxLoadingTime);
          return init(retryCount + 1);
        }
      } finally {
        clearTimeout(maxLoadingTime);
        setIsLoading(false);
      }
    };
    void (async () => {
      await waitForSettingsHydration();
      if (disposed) {
        return;
      }

      await init();
    })();

    return () => {
      disposed = true;
    };
  }, [applyTheme]);

  if (isLoading) {
    return (
      <Flex
        align='center'
        justify='center'
        vertical
        gap='middle'
        className='bg-background h-screen'>
        <Spin size='large' />
        <span className='text-muted-foreground text-sm'>Loading...</span>
      </Flex>
    );
  }

  return (
    <>
      <div
        className={`bg-background text-foreground relative flex h-screen flex-col overflow-hidden ${
          hasBackgroundImage ? 'app-background-mode-image' : ''
        }`}>
        {hasBackgroundImage ? (
          <BackgroundImageBackdrop
            src={normalizedBackgroundImageFileName!}
            alt='App background'
            opacity={renderedBackgroundImageOpacity}
            blur={renderedBackgroundBlur}
          />
        ) : null}

        <div
          className={`relative z-10 flex h-screen flex-col overflow-hidden ${
            hasBackgroundImage ? 'app-wallpaper-shell' : ''
          }`}>
          {/* Windows title bar */}
          {/* Windows 标题栏 */}
          {!isWebRuntime() && <TitleBar />}

          <div className='flex flex-1 overflow-y-hidden overflow-x-visible'>
            <ChatModuleProvider>
              <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} layout='rail' />

              <div className='relative flex min-w-0 flex-1 flex-col overflow-hidden'>
                <WorkflowModalsHost />
                <TopBar onOpenSettings={openSettingsPage} />

                <div className='flex min-h-0 flex-1 overflow-hidden'>
                  {currentPage === 'home' && viewMode !== 'workflow' ? (
                    <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} layout='panel' />
                  ) : null}

                  <div className='relative flex min-w-0 flex-1 flex-col overflow-hidden'>
                    <div
                      className={
                        currentPage === 'home'
                          ? 'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden'
                          : 'hidden'
                      }
                      aria-hidden={currentPage !== 'home'}>
                      <MainContent />
                    </div>
                    {currentPage === 'settings' ? (
                      <Suspense
                        fallback={
                          <Flex align='center' justify='center' className='min-h-[200px] flex-1'>
                            <Spin />
                          </Flex>
                        }>
                        <SettingsPage onBack={() => setCurrentPage('home')} />
                      </Suspense>
                    ) : null}
                  </div>
                </div>
              </div>
            </ChatModuleProvider>
          </div>

          {/* Windows close dialog */}
          {/* Windows 关闭对话框 */}
          <CloseDialog isOpen={showCloseDialog} onClose={() => setShowCloseDialog(false)} />
        </div>
      </div>
    </>
  );
}

export default App;
