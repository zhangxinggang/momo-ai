import type { IChatMessage } from '@momo/aichat';
import { Button, Input, Select } from 'antd';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  FileCode2Icon,
  FolderOpenIcon,
  Globe2Icon,
  HouseIcon,
  PlusIcon,
  RotateCwIcon,
  SearchCodeIcon,
  XIcon,
} from 'lucide-react';
import { createElement, useEffect, useRef, useState, type ReactNode } from 'react';

import { SkillFileEditor } from '@renderer/components/Skill/SkillFileEditor';
import type { WorkspacePanelRequest } from '@renderer/services/chat/workspace-panel';
import { ReviewPanel } from '../ChatFileChanges/ReviewPanel';

import styles from './index.module.less';

export type EWorkspacePanelTab = 'review' | 'browser' | 'files' | 'new';

export interface IWorkspacePanelTab {
  id: Exclude<EWorkspacePanelTab, 'new'>;
  label: string;
}

const PANEL_ITEMS: Array<{
  id: Exclude<EWorkspacePanelTab, 'new'>;
  label: string;
  description: string;
  icon: typeof FileCode2Icon;
}> = [
  {
    id: 'review',
    label: '审阅',
    description: '查看并校正 AI 修改过的文件',
    icon: FileCode2Icon,
  },
  {
    id: 'browser',
    label: '浏览器',
    description: '在工作区旁查询资料',
    icon: Globe2Icon,
  },
  {
    id: 'files',
    label: '文件管理器',
    description: '浏览和编辑当前工作区文件',
    icon: FolderOpenIcon,
  },
];

function iconForTab(tab: Exclude<EWorkspacePanelTab, 'new'>) {
  if (tab === 'review') return FileCode2Icon;
  if (tab === 'browser') return Globe2Icon;
  return FolderOpenIcon;
}

function NewPanel({ onOpen }: { onOpen: (tab: Exclude<EWorkspacePanelTab, 'new'>) => void }) {
  return (
    <div className={styles['new-panel']}>
      <div className={styles['new-panel-label']}>新建</div>
      <div className={styles['new-panel-list']}>
        {PANEL_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className={styles['new-panel-item']}
              key={item.id}
              onClick={() => onOpen(item.id)}
              type='button'>
              <span className={styles['new-panel-item-icon']}>
                <Icon aria-hidden size={17} />
              </span>
              <span>
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface IBrowserTab {
  id: string;
  title: string;
  address: string;
  frameAddress: string;
  history: string[];
  historyIndex: number;
  frameKey: number;
}

const BROWSER_HOME = 'https://www.baidu.com';

function normalizeBrowserAddress(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return BROWSER_HOME;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[\w-]+(?:\.[\w-]+)+(?:[/:?#].*)?$/i.test(trimmed)) return `https://${trimmed}`;
  return `https://www.baidu.com/s?wd=${encodeURIComponent(trimmed)}`;
}

function createBrowserTab(): IBrowserTab {
  const id = `browser-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  return {
    id,
    title: '新标签页',
    address: BROWSER_HOME,
    frameAddress: BROWSER_HOME,
    history: [BROWSER_HOME],
    historyIndex: 0,
    frameKey: 0,
  };
}

function browserTitle(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '') || '新标签页';
  } catch {
    return '新标签页';
  }
}

function BrowserPanel({ request }: { request?: WorkspacePanelRequest | null }) {
  const [tabs, setTabs] = useState<IBrowserTab[]>(() => [createBrowserTab()]);
  const [activeId, setActiveId] = useState(() => tabs[0].id);
  const activeTab = tabs.find((tab) => tab.id === activeId) ?? tabs[0];
  const guestRef = useRef<Electron.WebviewTag | null>(null);
  const [browserError, setBrowserError] = useState('');
  useEffect(() => {
    setBrowserError('');
    const guest = guestRef.current;
    if (!guest) return;
    const navigate = () => {
      const url = guest.getURL();
      if (!/^https?:\/\//i.test(url)) return;
      setTabs((current) =>
        current.map((tab) =>
          tab.id !== activeId || tab.address === url
            ? tab
            : {
                ...tab,
                address: url,
                title: guest.getTitle() || browserTitle(url),
                history: [...tab.history.slice(0, tab.historyIndex + 1), url],
                historyIndex: tab.historyIndex + 1,
              },
        ),
      );
    };
    const fail = (event: Electron.DidFailLoadEvent) => {
      if (event.errorCode !== -3 && event.isMainFrame) setBrowserError(event.errorDescription);
    };
    guest.addEventListener('did-navigate', navigate);
    guest.addEventListener('did-navigate-in-page', navigate);
    guest.addEventListener('did-fail-load', fail);
    return () => {
      guest.removeEventListener('did-navigate', navigate);
      guest.removeEventListener('did-navigate-in-page', navigate);
      guest.removeEventListener('did-fail-load', fail);
    };
  }, [activeId, activeTab.frameKey]);
  useEffect(() => {
    if (request?.tab !== 'browser') return;
    const tab = createBrowserTab();
    tab.address = request.url;
    tab.frameAddress = request.url;
    tab.history = [request.url];
    tab.title = browserTitle(request.url);
    setTabs((current) => [...current, tab]);
    setActiveId(tab.id);
  }, [request?.id]);

  const updateActive = (updater: (tab: IBrowserTab) => IBrowserTab) => {
    setTabs((current) => current.map((tab) => (tab.id === activeId ? updater(tab) : tab)));
  };

  const navigate = (rawAddress: string) => {
    const url = normalizeBrowserAddress(rawAddress);
    updateActive((tab) => ({
      ...tab,
      address: url,
      frameAddress: url,
      title: browserTitle(url),
      history: [...tab.history.slice(0, tab.historyIndex + 1), url],
      historyIndex: tab.historyIndex + 1,
      frameKey: tab.frameKey + 1,
    }));
  };

  const moveHistory = (offset: number) => {
    updateActive((tab) => {
      const nextIndex = Math.max(0, Math.min(tab.history.length - 1, tab.historyIndex + offset));
      const address = tab.history[nextIndex];
      return {
        ...tab,
        address,
        frameAddress: address,
        title: browserTitle(address),
        historyIndex: nextIndex,
        frameKey: tab.frameKey + 1,
      };
    });
  };

  const addTab = () => {
    const tab = createBrowserTab();
    setTabs((current) => [...current, tab]);
    setActiveId(tab.id);
  };
  const selectTab = (id: string) => {
    if (id === activeId) return;
    setTabs((current) =>
      current.map((tab) =>
        tab.id === id ? { ...tab, frameAddress: tab.address, frameKey: tab.frameKey + 1 } : tab,
      ),
    );
    setActiveId(id);
  };

  const closeTab = (id: string) => {
    setTabs((current) => {
      if (current.length === 1) {
        const replacement = createBrowserTab();
        setActiveId(replacement.id);
        return [replacement];
      }
      const index = current.findIndex((tab) => tab.id === id);
      const next = current.filter((tab) => tab.id !== id);
      if (id === activeId) {
        const nextId = next[Math.max(0, index - 1)]?.id ?? next[0].id;
        setActiveId(nextId);
        return next.map((tab) => (tab.id === nextId ? { ...tab, frameAddress: tab.address } : tab));
      }
      return next;
    });
  };

  return (
    <div className={styles['browser']}>
      <div className={styles['browser-tabs']}>
        <div className={styles['browser-tab-list']}>
          {tabs.map((tab) => (
            <button
              className={`${styles['browser-tab']} ${tab.id === activeId ? styles['browser-tab--active'] : ''}`}
              key={tab.id}
              onClick={() => selectTab(tab.id)}
              title={tab.address}
              type='button'>
              <Globe2Icon aria-hidden size={13} />
              <span>{tab.title}</span>
              <XIcon
                aria-label='关闭浏览器标签页'
                className={styles['browser-tab-close']}
                role='button'
                size={13}
                onClick={(event) => {
                  event.stopPropagation();
                  closeTab(tab.id);
                }}
              />
            </button>
          ))}
        </div>
        <button className={styles['browser-add']} onClick={addTab} title='新建标签页' type='button'>
          <PlusIcon aria-hidden size={15} />
        </button>
      </div>

      <div className={styles['browser-toolbar']}>
        <Button
          aria-label='后退'
          disabled={activeTab.historyIndex <= 0}
          icon={<ArrowLeftIcon size={15} />}
          onClick={() => moveHistory(-1)}
          size='small'
          type='text'
        />
        <Button
          aria-label='前进'
          disabled={activeTab.historyIndex >= activeTab.history.length - 1}
          icon={<ArrowRightIcon size={15} />}
          onClick={() => moveHistory(1)}
          size='small'
          type='text'
        />
        <Button
          aria-label='刷新'
          icon={<RotateCwIcon size={15} />}
          onClick={() =>
            updateActive((tab) => ({
              ...tab,
              frameAddress: tab.address,
              frameKey: tab.frameKey + 1,
            }))
          }
          size='small'
          type='text'
        />
        <Button
          aria-label='主页'
          icon={<HouseIcon size={15} />}
          onClick={() => navigate(BROWSER_HOME)}
          size='small'
          type='text'
        />
        <Input
          aria-label='网址或搜索内容'
          className={styles['browser-address']}
          key={`${activeTab.id}-${activeTab.frameKey}-${activeTab.address}`}
          defaultValue={activeTab.address}
          onPressEnter={(event) => navigate(event.currentTarget.value)}
          placeholder='输入网址或搜索内容'
          prefix={<SearchCodeIcon aria-hidden size={14} />}
          size='small'
        />
      </div>

      {browserError ? (
        <div className={styles['browser-error']} role='alert'>
          页面加载失败：{browserError}，可刷新重试。
        </div>
      ) : null}
      {createElement('webview', {
        className: styles['browser-frame'],
        key: `${activeTab.id}-${activeTab.frameKey}`,
        ref: (element: Electron.WebviewTag | null) => {
          guestRef.current = element;
        },
        src: activeTab.frameAddress,
        partition: 'persist:momo-chat-browser',
        title: activeTab.title,
      })}
    </div>
  );
}

function FileManagerPanel({
  roots,
  request,
}: {
  roots: string[];
  request?: WorkspacePanelRequest | null;
}) {
  const [activeRoot, setActiveRoot] = useState(roots[0] ?? '');
  useEffect(() => {
    if (request?.tab === 'files' && roots.includes(request.root)) setActiveRoot(request.root);
  }, [request?.id, roots]);

  useEffect(() => {
    if (!roots.includes(activeRoot)) {
      setActiveRoot(roots[0] ?? '');
    }
  }, [activeRoot, roots]);

  if (!activeRoot) {
    return (
      <div className={styles['panel-empty']}>
        <FolderOpenIcon aria-hidden size={32} />
        <strong>尚未选择工作区</strong>
        <span>请先在左侧对话项目中添加文件夹。</span>
      </div>
    );
  }

  return (
    <div className={styles['file-manager']}>
      {roots.length > 1 ? (
        <div className={styles['file-manager-root']}>
          <Select
            aria-label='选择工作区目录'
            options={roots.map((root) => ({ label: root, value: root }))}
            value={activeRoot}
            onChange={setActiveRoot}
          />
        </div>
      ) : null}
      <div className={styles['file-manager-editor']}>
        <SkillFileEditor
          isOpen
          key={activeRoot}
          localPath={activeRoot}
          requestedPath={
            request?.tab === 'files' && request.root === activeRoot
              ? { path: request.relativePath, requestId: request.id }
              : undefined
          }
          mode='inline'
          skillId='chat-workspace'
        />
      </div>
    </div>
  );
}

interface IProps {
  activeTab: EWorkspacePanelTab;
  messages: IChatMessage[];
  request?: WorkspacePanelRequest | null;
  roots: string[];
  tabs: IWorkspacePanelTab[];
  onActiveTabChange: (tab: EWorkspacePanelTab) => void;
  onCloseTab: (tab: IWorkspacePanelTab['id']) => void;
  onOpenTab: (tab: IWorkspacePanelTab['id']) => void;
  toolbarActions?: ReactNode;
}

export function ChatWorkspacePanel({
  activeTab,
  messages,
  request,
  roots,
  tabs,
  onActiveTabChange,
  onCloseTab,
  onOpenTab,
  toolbarActions,
}: IProps) {
  const latestReply = messages
    .slice()
    .reverse()
    .find((item) => item.role === 'assistant');
  const reviewRunId =
    request?.tab === 'review' && messages.some((reply) => reply.runId === request.runId)
      ? request.runId
      : latestReply?.runId;
  const busy = messages.some((item) => item.isLoading);
  return (
    <div className={styles['workspace-panel']}>
      <div className={styles['workspace-tabs']}>
        <div className={styles['workspace-tab-list']}>
          {tabs.map((tab) => {
            const Icon = iconForTab(tab.id);
            return (
              <button
                className={`${styles['workspace-tab']} ${activeTab === tab.id ? styles['workspace-tab--active'] : ''}`}
                key={tab.id}
                onClick={() => onActiveTabChange(tab.id)}
                type='button'>
                <Icon aria-hidden size={14} />
                <span>{tab.label}</span>
                <XIcon
                  aria-label={`关闭${tab.label}`}
                  role='button'
                  size={13}
                  onClick={(event) => {
                    event.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                />
              </button>
            );
          })}
          <button
            className={`${styles['workspace-tab']} ${styles['workspace-tab-new']} ${activeTab === 'new' ? styles['workspace-tab--active'] : ''}`}
            onClick={() => onActiveTabChange('new')}
            type='button'>
            <PlusIcon aria-hidden size={14} />
            <span>新建</span>
          </button>
        </div>
        {toolbarActions ? (
          <div className={styles['workspace-tab-actions']}>{toolbarActions}</div>
        ) : null}
      </div>

      <div className={styles['workspace-panel-content']}>
        {activeTab === 'new' ? <NewPanel onOpen={onOpenTab} /> : null}
        {tabs.some((tab) => tab.id === 'review') ? (
          <div className={styles['panel-pane']} hidden={activeTab !== 'review'}>
            <ReviewPanel
              runId={reviewRunId}
              selectedPath={request?.tab === 'review' ? request.path : undefined}
              busy={busy}
            />
          </div>
        ) : null}
        {tabs.some((tab) => tab.id === 'browser') ? (
          <div className={styles['panel-pane']} hidden={activeTab !== 'browser'}>
            <BrowserPanel request={request} />
          </div>
        ) : null}
        {tabs.some((tab) => tab.id === 'files') ? (
          <div className={styles['panel-pane']} hidden={activeTab !== 'files'}>
            <FileManagerPanel roots={roots} request={request} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
