import type { IChatMessage } from '@momo/aichat';
import { Button, Input, Select, Spin, message } from 'antd';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  FileCode2Icon,
  FilesIcon,
  FolderOpenIcon,
  Globe2Icon,
  HouseIcon,
  PencilLineIcon,
  PlusIcon,
  RefreshCwIcon,
  RotateCwIcon,
  SaveIcon,
  SearchCodeIcon,
  XIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { SkillFileEditor } from '@renderer/components/Skill/SkillFileEditor';
import { generateTextDiff } from '@renderer/services/rules/text-diff';
import { writeSkillLocalFileByPath } from '@renderer/services/skill/api';

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

function BrowserPanel() {
  const [tabs, setTabs] = useState<IBrowserTab[]>(() => [createBrowserTab()]);
  const [activeId, setActiveId] = useState(() => tabs[0].id);
  const activeTab = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  const updateActive = (updater: (tab: IBrowserTab) => IBrowserTab) => {
    setTabs((current) => current.map((tab) => (tab.id === activeId ? updater(tab) : tab)));
  };

  const navigate = (rawAddress: string) => {
    const url = normalizeBrowserAddress(rawAddress);
    updateActive((tab) => ({
      ...tab,
      address: url,
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
        setActiveId(next[Math.max(0, index - 1)]?.id ?? next[0].id);
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
              onClick={() => setActiveId(tab.id)}
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
          onClick={() => updateActive((tab) => ({ ...tab, frameKey: tab.frameKey + 1 }))}
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
          key={`${activeTab.id}-${activeTab.frameKey}`}
          defaultValue={activeTab.address}
          onPressEnter={(event) => navigate(event.currentTarget.value)}
          placeholder='输入网址或搜索内容'
          prefix={<SearchCodeIcon aria-hidden size={14} />}
          size='small'
        />
      </div>

      <iframe
        className={styles['browser-frame']}
        key={`${activeTab.id}-${activeTab.frameKey}`}
        sandbox='allow-downloads allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts'
        src={activeTab.address}
        title={activeTab.title}
      />
    </div>
  );
}

function FileManagerPanel({ roots }: { roots: string[] }) {
  const [activeRoot, setActiveRoot] = useState(roots[0] ?? '');

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
          mode='inline'
          skillId='chat-workspace'
        />
      </div>
    </div>
  );
}

interface IReviewTarget {
  root: string;
  path: string;
  key: string;
}

interface IReviewFileResult {
  success: boolean;
  error?: string;
  relativePath?: string;
  currentContent?: string;
  baseContent?: string;
  hasBase?: boolean;
}

function isAbsolutePath(value: string): boolean {
  return /^[a-zA-Z]:[\\/]/.test(value) || value.startsWith('/');
}

function collectReviewTargets(messages: IChatMessage[], roots: string[]): IReviewTarget[] {
  const targets = new Map<string, IReviewTarget>();
  for (const chatMessage of messages) {
    const events = chatMessage.runtimeEvents ?? [];
    const completedCalls = new Set(
      events
        .filter((event) => event.type === 'tool.completed')
        .map((event) => String(event.payload.callId ?? '')),
    );
    for (const event of events) {
      if (event.type !== 'tool.started' || event.payload.toolId !== 'workspace.write') continue;
      if (!completedCalls.has(String(event.payload.callId ?? ''))) continue;
      const args = event.payload.arguments;
      if (!args || typeof args !== 'object' || Array.isArray(args)) continue;
      const candidate = (args as Record<string, unknown>).path;
      if (typeof candidate !== 'string' || !candidate.trim()) continue;
      const pathValue = candidate.trim();
      let root = roots[0] ?? '';
      if (isAbsolutePath(pathValue)) {
        const lowerPath = pathValue.toLocaleLowerCase();
        root =
          roots.find((item) =>
            lowerPath.startsWith(item.toLocaleLowerCase().replace(/[\\/]+$/, '')),
          ) ?? root;
      }
      if (!root) continue;
      const key = `${root}\0${pathValue}`;
      targets.set(key, { root, path: pathValue, key });
    }
  }
  return Array.from(targets.values());
}

function ReviewPanel({ messages, roots }: { messages: IChatMessage[]; roots: string[] }) {
  const targets = useMemo(() => collectReviewTargets(messages, roots), [messages, roots]);
  const [selectedKey, setSelectedKey] = useState('');
  const [review, setReview] = useState<IReviewFileResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const selected = targets.find((target) => target.key === selectedKey) ?? targets[0];

  useEffect(() => {
    if (selected && selected.key !== selectedKey) {
      setSelectedKey(selected.key);
    }
  }, [selected, selectedKey]);

  const loadReview = async (target: IReviewTarget | undefined) => {
    if (!target) {
      setReview(null);
      return;
    }
    setIsLoading(true);
    setIsEditing(false);
    try {
      const result = (await window.api.workspace.reviewFile(
        target.root,
        target.path,
      )) as IReviewFileResult;
      setReview(result);
      setDraft(result.currentContent ?? '');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadReview(selected);
    // The selected key is the stable identity of the review target.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.key]);

  const diffLines = useMemo(() => {
    if (!review?.success) return [];
    const before = review.baseContent ?? '';
    const after = review.currentContent ?? '';
    const totalLines = before.split('\n').length + after.split('\n').length;
    if (totalLines > 2400) {
      return after.split('\n').map((content, index) => ({
        type: 'add' as const,
        content,
        newLineNum: index + 1,
      }));
    }
    return generateTextDiff(before, after);
  }, [review]);

  const saveCorrection = async () => {
    if (!selected || !review?.relativePath) return;
    await writeSkillLocalFileByPath(selected.root, review.relativePath, draft);
    message.success('校正内容已保存');
    await loadReview(selected);
  };

  if (targets.length === 0) {
    return (
      <div className={styles['panel-empty']}>
        <FilesIcon aria-hidden size={32} />
        <strong>还没有可审阅的文件</strong>
        <span>AI 在当前对话中修改工作区文件后，会在这里集中显示。</span>
      </div>
    );
  }

  return (
    <div className={styles['review']}>
      <aside className={styles['review-list']}>
        <div className={styles['review-list-title']}>本次对话修改</div>
        {targets.map((target) => (
          <button
            className={`${styles['review-file']} ${target.key === selected?.key ? styles['review-file--active'] : ''}`}
            key={target.key}
            onClick={() => setSelectedKey(target.key)}
            title={target.path}
            type='button'>
            <FileCode2Icon aria-hidden size={15} />
            <span>{target.path.replace(/\\/g, '/').split('/').pop()}</span>
          </button>
        ))}
      </aside>

      <section className={styles['review-main']}>
        <header className={styles['review-header']}>
          <div>
            <strong>{review?.relativePath ?? selected?.path}</strong>
            <span>{review?.hasBase ? '与当前 Git 基线比较' : '新文件或无可用 Git 基线'}</span>
          </div>
          <div className={styles['review-actions']}>
            <Button
              icon={<RefreshCwIcon size={14} />}
              onClick={() => void loadReview(selected)}
              size='small'
              type='text'>
              刷新
            </Button>
            {isEditing ? (
              <Button
                icon={<SaveIcon size={14} />}
                onClick={() => void saveCorrection()}
                size='small'>
                保存校正
              </Button>
            ) : (
              <Button
                icon={<PencilLineIcon size={14} />}
                onClick={() => setIsEditing(true)}
                size='small'>
                校正代码
              </Button>
            )}
          </div>
        </header>

        {isLoading ? (
          <div className={styles['review-loading']}>
            <Spin size='small' />
          </div>
        ) : !review?.success ? (
          <div className={styles['panel-empty']}>
            <strong>无法加载文件</strong>
            <span>{review?.error ?? '请刷新后重试'}</span>
          </div>
        ) : isEditing ? (
          <Input.TextArea
            autoFocus
            className={styles['review-editor']}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
        ) : (
          <div className={styles['review-diff']}>
            {diffLines.map((line, index) => (
              <div
                className={`${styles['diff-line']} ${styles[`diff-line--${line.type}`]}`}
                key={`${line.type}-${line.oldLineNum ?? ''}-${line.newLineNum ?? ''}-${index}`}>
                <span>{line.oldLineNum ?? ''}</span>
                <span>{line.newLineNum ?? ''}</span>
                <b>{line.type === 'add' ? '+' : line.type === 'remove' ? '−' : ' '}</b>
                <code>{line.content || ' '}</code>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

interface IProps {
  activeTab: EWorkspacePanelTab;
  messages: IChatMessage[];
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
  roots,
  tabs,
  onActiveTabChange,
  onCloseTab,
  onOpenTab,
  toolbarActions,
}: IProps) {
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
        {activeTab === 'new' ? (
          <NewPanel onOpen={onOpenTab} />
        ) : activeTab === 'review' ? (
          <ReviewPanel messages={messages} roots={roots} />
        ) : activeTab === 'browser' ? (
          <BrowserPanel />
        ) : (
          <FileManagerPanel roots={roots} />
        )}
      </div>
    </div>
  );
}
