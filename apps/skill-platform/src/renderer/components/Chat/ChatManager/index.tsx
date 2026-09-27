import { AiChatView, useChatContext, type IChatMessage } from '@momo/aichat';
import { Button } from 'antd';
import {
  ExpandIcon,
  Minimize2Icon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
  PlusIcon,
  SparklesIcon,
} from 'lucide-react';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useAiChatViewTheme } from '@renderer/hooks/useAiChatViewTheme';
import { useAutoSessionTitle } from '@renderer/hooks/useAutoSessionTitle';

import { useChatProjectStore, useUIStore } from '@renderer/store';

import { ChatErrorBoundary } from '../ChatErrorBoundary';
import {
  ChatWorkspacePanel,
  type EWorkspacePanelTab,
  type IWorkspacePanelTab,
} from '../ChatWorkspacePanel';
import { SaveToNoteAction } from '../SaveToNoteAction';

import styles from './index.module.less';

const PANEL_LABELS: Record<IWorkspacePanelTab['id'], string> = {
  review: '审阅',
  browser: '浏览器',
  files: '文件管理器',
};

interface IPanelRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** AI 对话主内容区及其可切换工作面板。 */
export function ChatManager() {
  const viewMode = useUIStore((state) => state.viewMode);
  const { currentSession } = useChatContext();
  const projects = useChatProjectStore((state) => state.projects);
  const activeFolderPaths = useChatProjectStore((state) => state.activeFolderPaths);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isPanelMaximized, setIsPanelMaximized] = useState(false);
  const [panelWidth, setPanelWidth] = useState(620);
  const [panelRect, setPanelRect] = useState<IPanelRect | null>(null);
  const [panelTabs, setPanelTabs] = useState<IWorkspacePanelTab[]>([]);
  const [activePanelTab, setActivePanelTab] = useState<EWorkspacePanelTab>('new');
  const layoutRef = useRef<HTMLDivElement>(null);
  const panelSlotRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<{ startX: number; startWidth: number } | null>(null);

  useAutoSessionTitle();
  const chatTheme = useAiChatViewTheme();

  const activeProject = useMemo(
    () => projects.find((project) => project.id === currentSession?.projectId),
    [currentSession?.projectId, projects],
  );
  const projectName = activeProject?.name?.trim() || '';

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const resize = resizeRef.current;
      const layout = layoutRef.current;
      if (!resize || !layout) return;
      const maxWidth = Math.max(340, layout.getBoundingClientRect().width - 400);
      const nextWidth = resize.startWidth + resize.startX - event.clientX;
      setPanelWidth(Math.max(340, Math.min(maxWidth, nextWidth)));
    };
    const handlePointerUp = () => {
      resizeRef.current = null;
      document.body.style.removeProperty('cursor');
      document.body.style.removeProperty('user-select');
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  useEffect(() => {
    if (!isPanelMaximized) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsPanelMaximized(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPanelMaximized]);

  useLayoutEffect(() => {
    if (!isPanelOpen || viewMode !== 'chat') {
      setPanelRect(null);
      return;
    }

    const updatePanelRect = () => {
      const slot = panelSlotRef.current;
      const layout = layoutRef.current;
      if (!slot || !layout) return;
      const rect = slot.getBoundingClientRect();
      const layoutRect = layout.getBoundingClientRect();
      const rightBoundary = Math.min(layoutRect.right, document.documentElement.clientWidth);
      const bottomBoundary = Math.min(layoutRect.bottom, document.documentElement.clientHeight);
      const next = {
        top: rect.top,
        left: rect.left,
        width: Math.max(0, Math.min(rect.width, rightBoundary - rect.left)),
        height: Math.max(0, Math.min(rect.height, bottomBoundary - rect.top)),
      };
      setPanelRect((current) =>
        current &&
        current.top === next.top &&
        current.left === next.left &&
        current.width === next.width &&
        current.height === next.height
          ? current
          : next,
      );
    };

    updatePanelRect();
    const animationFrame = window.requestAnimationFrame(updatePanelRect);
    const resizeObserver =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updatePanelRect);
    if (panelSlotRef.current) resizeObserver?.observe(panelSlotRef.current);
    if (layoutRef.current) resizeObserver?.observe(layoutRef.current);
    window.addEventListener('resize', updatePanelRect);
    window.addEventListener('scroll', updatePanelRect, true);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updatePanelRect);
      window.removeEventListener('scroll', updatePanelRect, true);
    };
  }, [isPanelOpen, viewMode]);

  if (viewMode !== 'chat') {
    return null;
  }

  const openPanelTab = (tab: IWorkspacePanelTab['id']) => {
    setPanelTabs((current) =>
      current.some((item) => item.id === tab)
        ? current
        : [...current, { id: tab, label: PANEL_LABELS[tab] }],
    );
    setActivePanelTab(tab);
    setIsPanelOpen(true);
  };

  const closePanelTab = (tab: IWorkspacePanelTab['id']) => {
    setPanelTabs((current) => {
      const index = current.findIndex((item) => item.id === tab);
      const next = current.filter((item) => item.id !== tab);
      if (activePanelTab === tab) {
        setActivePanelTab(next[Math.max(0, index - 1)]?.id ?? next[0]?.id ?? 'new');
      }
      return next;
    });
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setIsPanelMaximized(false);
  };

  const panelPortal = isPanelOpen
    ? createPortal(
        <>
          {isPanelMaximized ? (
            <div
              aria-hidden
              className={styles['panel-modal-backdrop']}
              key='panel-backdrop'
              onClick={() => setIsPanelMaximized(false)}
            />
          ) : null}
          <aside
            aria-label='右侧工作面板'
            aria-modal={isPanelMaximized || undefined}
            className={`titlebar-no-drag ${styles['side-panel']} ${
              isPanelMaximized ? styles['side-panel--maximized'] : styles['side-panel--docked']
            }`}
            key='side-panel'
            role={isPanelMaximized ? 'dialog' : undefined}
            style={
              isPanelMaximized
                ? undefined
                : {
                    top: panelRect?.top ?? 0,
                    left: panelRect?.left ?? 0,
                    width: panelRect?.width ?? panelWidth,
                    height: panelRect?.height ?? 0,
                    visibility: panelRect ? 'visible' : 'hidden',
                  }
            }>
            <ChatWorkspacePanel
              activeTab={activePanelTab}
              messages={currentSession?.messages ?? []}
              roots={activeFolderPaths}
              tabs={panelTabs}
              onActiveTabChange={setActivePanelTab}
              onCloseTab={closePanelTab}
              onOpenTab={openPanelTab}
              toolbarActions={
                <>
                  <Button
                    aria-label='新建面板标签'
                    className='titlebar-no-drag'
                    icon={<PlusIcon size={15} />}
                    onClick={() => setActivePanelTab('new')}
                    size='small'
                    title='新建'
                    type='text'
                  />
                  <Button
                    aria-label={isPanelMaximized ? '还原面板' : '放大面板'}
                    className='titlebar-no-drag'
                    icon={isPanelMaximized ? <Minimize2Icon size={15} /> : <ExpandIcon size={15} />}
                    onClick={() => setIsPanelMaximized((current) => !current)}
                    size='small'
                    title={isPanelMaximized ? '还原面板' : '放大面板'}
                    type='text'
                  />
                  <Button
                    aria-label='收起面板'
                    className='titlebar-no-drag'
                    icon={<PanelRightCloseIcon size={15} />}
                    onClick={closePanel}
                    size='small'
                    title='收起面板'
                    type='text'
                  />
                </>
              }
            />
          </aside>
        </>,
        document.body,
        'chat-workspace-panel',
      )
    : null;

  const emptyState = (
    <div className={styles['chat-empty']}>
      <div className={styles['chat-empty-mark']} aria-hidden>
        <span />
        <SparklesIcon size={26} />
      </div>
      <h2>
        {projectName && projectName !== '自由对话' ? (
          <>
            今天想在 <strong>{projectName}</strong> 里做点什么？
          </>
        ) : (
          '今天想做点什么？'
        )}
      </h2>
    </div>
  );

  const panelToggle = (
    <button
      aria-label={isPanelOpen ? '收起右侧面板' : '打开右侧面板'}
      className={`${styles['panel-toggle']} ${isPanelOpen ? styles['panel-toggle--active'] : ''}`}
      onClick={() => (isPanelOpen ? closePanel() : setIsPanelOpen(true))}
      title={isPanelOpen ? '收起右侧面板' : '打开右侧面板'}
      type='button'>
      {isPanelOpen ? <PanelRightCloseIcon size={15} /> : <PanelRightOpenIcon size={15} />}
    </button>
  );

  return (
    <ChatErrorBoundary>
      <>
        <div className={styles['chat-main']} ref={layoutRef}>
          <div className={styles['chat-main-body']}>
            <AiChatView
              {...chatTheme}
              emptyState={emptyState}
              headerActions={panelToggle}
              hideWelcome
              renderAssistantMessageActions={(chatMessage: IChatMessage) => (
                <SaveToNoteAction message={chatMessage} />
              )}
            />
          </div>

          {isPanelOpen ? (
            <>
              {!isPanelMaximized ? (
                <div
                  aria-label='调整右侧面板宽度'
                  className={styles['panel-resizer']}
                  onPointerDown={(event) => {
                    resizeRef.current = {
                      startX: event.clientX,
                      startWidth: panelRect?.width ?? panelWidth,
                    };
                    document.body.style.cursor = 'col-resize';
                    document.body.style.userSelect = 'none';
                  }}
                  role='separator'
                />
              ) : null}
              <div
                aria-hidden
                className={styles['panel-slot']}
                ref={panelSlotRef}
                style={{ width: panelWidth }}
              />
            </>
          ) : null}
        </div>
        {panelPortal}
      </>
    </ChatErrorBoundary>
  );
}
