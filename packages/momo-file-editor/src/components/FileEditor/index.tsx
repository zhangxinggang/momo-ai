import {
  buildMdPreviewThemeOptions,
  MdEditor,
  useMarkdownEditorTheme,
  useMdPreviewTheme,
} from '@momo/markdown';
import '@momo/markdown-styles';
import type { MenuProps, TreeDataNode } from 'antd';
import { Button, Dropdown, Input, Modal, Select, Tree } from 'antd';
import {
  EllipsisVerticalIcon,
  FileIcon,
  FilePlusIcon,
  FileTextIcon,
  FolderIcon,
  FolderPlusIcon,
  Loader2Icon,
  SaveIcon,
  UploadIcon,
} from 'lucide-react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentType,
} from 'react';

import type {
  IFileEditorAdapter,
  IFileEditorNotifyPayload,
  IFileTreeEntry,
} from '../../types/adapter';
import { isCodeEditorPath } from '../../utils/code-editor-language';
import { DEFAULT_CODE_EDITOR_THEME, type ECodeEditorTheme } from '../../utils/code-editor-theme';
import { cloneArrayBuffer } from '../../utils/file-content';
import { isMarkdownPath } from '../../utils/markdown-config';
import { MARKDOWN_TOOLBARS } from '../../utils/markdown-toolbars';
import {
  buildFileTree,
  ensurePathWithExtension,
  getBaseName,
  getParentPath,
  joinRelativePath,
  normalizeRelativePath,
  type IFileTreeNode,
} from '../../utils/path';
import { BinaryFilePreview } from '../BinaryFilePreview';
import { CodeFileEditor } from '../CodeFileEditor';

const MomoMdEditor = MdEditor as ComponentType<Record<string, unknown>>;

export interface IFileEditorHandle {
  /** 保存当前文件（若有未保存更改） */
  saveCurrentFile: () => Promise<boolean>;
  /** 放弃当前未保存更改 */
  discardChanges: () => void;
  /** 是否存在未保存更改 */
  hasUnsavedChanges: () => boolean;
}

export interface IProps {
  adapter: IFileEditorAdapter;
  refreshToken?: number;
  onFilesChange?: () => void;
  onUnsavedChange?: (hasUnsaved: boolean) => void;
  /** 左侧树标题 */
  treeTitle?: string;
  /** 新建文件无后缀时的默认扩展名，默认 md */
  defaultNewFileExtension?: string;
  className?: string;
  /** 操作反馈（由宿主注入 toast 等） */
  onNotify?: (payload: IFileEditorNotifyPayload) => void;
  /** 代码编辑器主题，默认浅色；宿主可用 useSyncedCodeEditorTheme 跟随系统亮暗 */
  codeEditorTheme?: ECodeEditorTheme;
  /** 二进制预览 Worker/WASM 等静态资源根 URL，由宿主注入 */
  filePreviewBaseUrl?: string;
  /** 二进制预览不可用时回调（如使用系统默认应用打开） */
  onUnSupport?: (relativePath: string) => void;
}

interface IPathTarget {
  path: string;
  isDirectory: boolean;
}

function toAntTreeData(
  nodes: IFileTreeNode[],
  renderTitle: (node: IFileTreeNode) => React.ReactNode,
): TreeDataNode[] {
  return nodes.map((node) => ({
    key: node.path,
    title: renderTitle(node),
    isLeaf: !node.isDirectory,
    selectable: true,
    children: node.children.length > 0 ? toAntTreeData(node.children, renderTitle) : undefined,
  }));
}

function collectDirectoryPaths(entries: IFileTreeEntry[]): string[] {
  const dirs = new Set<string>(['']);
  for (const entry of entries) {
    if (entry.isDirectory) {
      dirs.add(entry.relativePath);
    }
    const parts = entry.relativePath.split('/');
    for (let i = 1; i < parts.length; i++) {
      dirs.add(parts.slice(0, i).join('/'));
    }
  }
  return Array.from(dirs).sort((a, b) => a.localeCompare(b));
}

/**
 * 通用树形文件编辑器：左树 + 右编辑（Markdown 分屏 / 纯文本）
 */
export const FileEditor = forwardRef<IFileEditorHandle, IProps>(function FileEditor(
  {
    adapter,
    refreshToken = 0,
    onFilesChange,
    onUnsavedChange,
    treeTitle = '文件',
    defaultNewFileExtension = 'md',
    className,
    onNotify,
    codeEditorTheme = DEFAULT_CODE_EDITOR_THEME,
    filePreviewBaseUrl,
    onUnSupport,
  },
  ref,
) {
  const mdTheme = useMarkdownEditorTheme();
  const markdownEditorDomId = useId();
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [mdPreviewTheme, setMdPreviewTheme] = useMdPreviewTheme();
  const previewThemeOptions = useMemo(() => buildMdPreviewThemeOptions(), []);
  const [entries, setEntries] = useState<IFileTreeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [savedContent, setSavedContent] = useState('');
  const [isNewFileOpen, setIsNewFileOpen] = useState(false);
  const [newFileParentDir, setNewFileParentDir] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderPath, setNewFolderPath] = useState('');
  const [renameTarget, setRenameTarget] = useState<IPathTarget | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [moveTarget, setMoveTarget] = useState<IPathTarget | null>(null);
  const [moveTargetDir, setMoveTargetDir] = useState('');
  const [uploadTargetDir, setUploadTargetDir] = useState<string | null>(null);
  const [previewBuffer, setPreviewBuffer] = useState<ArrayBuffer | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  const notify = useCallback(
    (message: string, type: IFileEditorNotifyPayload['type']) => {
      onNotify?.({ message, type });
    },
    [onNotify],
  );

  const reloadTree = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await adapter.listTree();
      const visible = list
        .map((entry) => ({
          ...entry,
          relativePath: normalizeRelativePath(entry.relativePath),
        }))
        .filter((entry) => (adapter.filterEntry ? adapter.filterEntry(entry) : true));
      setEntries(visible);

      setSelectedPath((current) => {
        if (current && visible.some((e) => e.relativePath === current && !e.isDirectory)) {
          return current;
        }
        const initial = adapter.selectInitialPath?.(visible) ?? null;
        if (initial) {
          return initial;
        }
        const firstFile = visible.find((e) => !e.isDirectory)?.relativePath ?? null;
        return firstFile;
      });
    } catch (error) {
      console.error(error);
      notify('加载文件列表失败', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [adapter, notify]);

  useEffect(() => {
    void reloadTree();
  }, [reloadTree, refreshToken]);

  const treeNodes = useMemo(() => buildFileTree(entries), [entries]);
  const directoryOptions = useMemo(() => collectDirectoryPaths(entries), [entries]);

  useEffect(() => {
    const allDirs = collectDirectoryPaths(entries);
    setExpandedKeys((prev) => {
      const merged = new Set([...prev, ...allDirs]);
      return Array.from(merged);
    });
  }, [entries]);

  const toggleDirectoryExpanded = useCallback((dirPath: string) => {
    setExpandedKeys((prev) =>
      prev.includes(dirPath) ? prev.filter((key) => key !== dirPath) : [...prev, dirPath],
    );
  }, []);

  const isMarkdownActive = selectedPath ? isMarkdownPath(selectedPath) : false;
  const isCodeEditorActive = Boolean(
    selectedPath && !isMarkdownActive && isCodeEditorPath(selectedPath),
  );
  const isBinaryPreviewActive = Boolean(selectedPath && !isMarkdownActive && !isCodeEditorActive);
  const hasUnsaved =
    selectedPath !== null && !isBinaryPreviewActive && fileContent !== savedContent;

  useEffect(() => {
    onUnsavedChange?.(hasUnsaved);
  }, [hasUnsaved, onUnsavedChange]);

  const loadFile = useCallback(
    async (relativePath: string) => {
      try {
        const content = await adapter.readFile(relativePath);
        setSelectedPath(relativePath);
        setFileContent(content);
        setSavedContent(content);
      } catch (error) {
        console.error(error);
        notify('加载文件失败', 'error');
      }
    },
    [adapter, notify],
  );

  useEffect(() => {
    if (!selectedPath) {
      setFileContent('');
      setSavedContent('');
      return;
    }
    const entry = entries.find((e) => e.relativePath === selectedPath);
    if (!entry || entry.isDirectory) {
      return;
    }
    void loadFile(selectedPath);
    // 仅在切换文件时加载内容，避免保存后刷新树覆盖未保存编辑
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPath]);

  useEffect(() => {
    if (!selectedPath || !isBinaryPreviewActive || !adapter.readFileBuffer) {
      setPreviewBuffer(null);
      setIsPreviewLoading(false);
      return;
    }

    let cancelled = false;
    setIsPreviewLoading(true);
    setPreviewBuffer(null);

    void adapter
      .readFileBuffer(selectedPath)
      .then((buffer) => {
        if (!cancelled && buffer) {
          setPreviewBuffer(cloneArrayBuffer(buffer));
        }
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) {
          notify('加载文件预览失败', 'error');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsPreviewLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [adapter, isBinaryPreviewActive, notify, selectedPath]);

  const handleSave = useCallback(async (): Promise<boolean> => {
    if (!selectedPath || !hasUnsaved) {
      return true;
    }
    const ok = await adapter.writeFile(selectedPath, fileContent);
    if (ok) {
      setSavedContent(fileContent);
      notify('文件已保存', 'success');
      await reloadTree();
      onFilesChange?.();
      return true;
    }
    notify('保存失败', 'error');
    return false;
  }, [adapter, fileContent, hasUnsaved, notify, onFilesChange, reloadTree, selectedPath]);

  const handleEditorSave = useCallback(() => {
    void handleSave();
  }, [handleSave]);

  const discardChanges = useCallback(() => {
    setFileContent(savedContent);
  }, [savedContent]);

  useImperativeHandle(
    ref,
    () => ({
      saveCurrentFile: handleSave,
      discardChanges,
      hasUnsavedChanges: () => hasUnsaved,
    }),
    [discardChanges, handleSave, hasUnsaved],
  );

  const movePath = useCallback(
    async (fromRelativePath: string, toRelativePath: string): Promise<boolean> => {
      const from = normalizeRelativePath(fromRelativePath);
      const to = normalizeRelativePath(toRelativePath);
      if (!from || !to || from === to) {
        return false;
      }
      if (adapter.movePath) {
        return adapter.movePath(from, to);
      }
      const entry = entries.find((e) => e.relativePath === from);
      if (entry?.isDirectory) {
        notify('当前环境不支持移动文件夹', 'error');
        return false;
      }
      try {
        const content = await adapter.readFile(from);
        const written = await adapter.writeFile(to, content);
        if (!written) {
          return false;
        }
        return adapter.deletePath(from);
      } catch (error) {
        console.error(error);
        return false;
      }
    },
    [adapter, entries, notify],
  );

  const handleDeletePath = useCallback(
    async (targetPath: string) => {
      const normalized = normalizeRelativePath(targetPath);
      if (!normalized) {
        return;
      }
      const ok = await adapter.deletePath(normalized);
      if (ok) {
        if (selectedPath === normalized || selectedPath?.startsWith(`${normalized}/`)) {
          setSelectedPath(null);
          setFileContent('');
          setSavedContent('');
        }
        notify('已删除', 'success');
        await reloadTree();
        onFilesChange?.();
      } else {
        notify('删除失败', 'error');
      }
    },
    [adapter, notify, onFilesChange, reloadTree, selectedPath],
  );

  const confirmDelete = useCallback(
    (target: IPathTarget) => {
      Modal.confirm({
        title: target.isDirectory ? '删除文件夹' : '删除文件',
        content: `确定删除「${getBaseName(target.path)}」？此操作不可恢复。`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk: () => handleDeletePath(target.path),
      });
    },
    [handleDeletePath],
  );

  const openRename = useCallback((target: IPathTarget) => {
    setRenameTarget(target);
    setRenameValue(getBaseName(target.path));
  }, []);

  const handleRenameConfirm = useCallback(async () => {
    if (!renameTarget) {
      return;
    }
    const nextName = renameValue.trim();
    if (!nextName || nextName.includes('/')) {
      notify('名称不能为空且不能包含路径分隔符', 'error');
      return;
    }
    const parent = getParentPath(renameTarget.path);
    const nextPath = joinRelativePath(parent, nextName);
    if (nextPath === renameTarget.path) {
      setRenameTarget(null);
      return;
    }
    const ok = await movePath(renameTarget.path, nextPath);
    if (ok) {
      if (selectedPath === renameTarget.path) {
        setSelectedPath(nextPath);
      } else if (selectedPath?.startsWith(`${renameTarget.path}/`)) {
        setSelectedPath(selectedPath.replace(renameTarget.path, nextPath));
      }
      setRenameTarget(null);
      notify('重命名成功', 'success');
      await reloadTree();
      onFilesChange?.();
      return;
    }
    notify('重命名失败', 'error');
  }, [movePath, notify, onFilesChange, reloadTree, renameTarget, renameValue, selectedPath]);

  const openMove = useCallback((target: IPathTarget) => {
    setMoveTarget(target);
    setMoveTargetDir(getParentPath(target.path));
  }, []);

  const handleMoveConfirm = useCallback(async () => {
    if (!moveTarget) {
      return;
    }
    const destDir = normalizeRelativePath(moveTargetDir);
    const nextPath = joinRelativePath(destDir, getBaseName(moveTarget.path));
    if (nextPath === moveTarget.path) {
      setMoveTarget(null);
      return;
    }
    if (
      moveTarget.isDirectory &&
      (nextPath === moveTarget.path || nextPath.startsWith(`${moveTarget.path}/`))
    ) {
      notify('不能将文件夹移动到自身或其子目录', 'error');
      return;
    }
    const ok = await movePath(moveTarget.path, nextPath);
    if (ok) {
      if (selectedPath === moveTarget.path) {
        setSelectedPath(nextPath);
      } else if (selectedPath?.startsWith(`${moveTarget.path}/`)) {
        setSelectedPath(selectedPath.replace(moveTarget.path, nextPath));
      }
      setMoveTarget(null);
      notify('移动成功', 'success');
      await reloadTree();
      onFilesChange?.();
      return;
    }
    notify('移动失败', 'error');
  }, [movePath, moveTarget, moveTargetDir, notify, onFilesChange, reloadTree, selectedPath]);

  const handleCreateFile = useCallback(async () => {
    const raw = newFileName.trim();
    if (!raw) {
      return;
    }
    if (newFileParentDir && raw.includes('/')) {
      notify('文件名不能包含路径分隔符', 'error');
      return;
    }
    const relativePath = joinRelativePath(newFileParentDir, raw);
    const path = ensurePathWithExtension(relativePath, defaultNewFileExtension);
    const ok = await adapter.writeFile(path, '');
    if (ok) {
      setIsNewFileOpen(false);
      setNewFileParentDir('');
      setNewFileName('');
      await reloadTree();
      setSelectedPath(path);
      notify('文件已创建', 'success');
      onFilesChange?.();
    } else {
      notify('创建失败', 'error');
    }
  }, [
    adapter,
    defaultNewFileExtension,
    newFileName,
    newFileParentDir,
    notify,
    onFilesChange,
    reloadTree,
  ]);

  const closeNewFileModal = useCallback(() => {
    setIsNewFileOpen(false);
    setNewFileParentDir('');
    setNewFileName('');
  }, []);

  const handleCreateFolder = useCallback(async () => {
    const path = normalizeRelativePath(newFolderPath.trim());
    if (!path) {
      return;
    }
    const ok = await adapter.createDirectory(path);
    if (ok) {
      setIsNewFolderOpen(false);
      setNewFolderPath('');
      await reloadTree();
      notify('文件夹已创建', 'success');
      onFilesChange?.();
    } else {
      notify('创建失败', 'error');
    }
  }, [adapter, newFolderPath, notify, onFilesChange, reloadTree]);

  const openNewFileInDir = useCallback((dirPath: string) => {
    setNewFileParentDir(normalizeRelativePath(dirPath));
    setNewFileName('');
    setIsNewFileOpen(true);
  }, []);

  const triggerUpload = useCallback((dirPath: string) => {
    setUploadTargetDir(dirPath);
    uploadInputRef.current?.click();
  }, []);

  const handleUploadChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const fileList = event.target.files;
      event.target.value = '';
      if (!fileList || fileList.length === 0) {
        setUploadTargetDir(null);
        return;
      }
      const dir = uploadTargetDir ?? '';
      let successCount = 0;
      for (const file of Array.from(fileList)) {
        const text = await file.text();
        const targetPath = joinRelativePath(dir, file.name);
        const ok = await adapter.writeFile(targetPath, text);
        if (ok) {
          successCount += 1;
        }
      }
      setUploadTargetDir(null);
      if (successCount > 0) {
        notify(`已上传 ${successCount} 个文件`, 'success');
        await reloadTree();
        onFilesChange?.();
      } else {
        notify('上传失败', 'error');
      }
    },
    [adapter, notify, onFilesChange, reloadTree, uploadTargetDir],
  );

  const buildNodeMenu = useCallback((node: IFileTreeNode): MenuProps['items'] => {
    if (node.isDirectory) {
      return [
        { key: 'move', label: '移动' },
        { key: 'rename', label: '重命名' },
        { key: 'new-file', label: '新建文件' },
        { key: 'upload', label: '上传文件' },
        { type: 'divider' },
        { key: 'delete', label: '删除', danger: true },
      ];
    }
    return [
      { key: 'move', label: '移动' },
      { key: 'rename', label: '重命名' },
      { type: 'divider' },
      { key: 'delete', label: '删除', danger: true },
    ];
  }, []);

  const handleNodeMenuClick = useCallback(
    (node: IFileTreeNode, key: string) => {
      const target: IPathTarget = { path: node.path, isDirectory: node.isDirectory };
      if (key === 'move') {
        openMove(target);
        return;
      }
      if (key === 'rename') {
        openRename(target);
        return;
      }
      if (key === 'delete') {
        confirmDelete(target);
        return;
      }
      if (key === 'new-file') {
        openNewFileInDir(node.path);
        return;
      }
      if (key === 'upload') {
        triggerUpload(node.path);
      }
    },
    [confirmDelete, openMove, openNewFileInDir, openRename, triggerUpload],
  );

  const renderTreeTitle = useCallback(
    (node: IFileTreeNode) => {
      const isActive = selectedPath === node.path;
      const rowClass = node.isDirectory
        ? 'momo-file-editor__tree-title-row momo-file-editor__tree-title-row--dir'
        : `momo-file-editor__tree-title-row momo-file-editor__tree-title-row--file${
            isActive ? ' momo-file-editor__tree-title-row--active' : ''
          }`;

      return (
        <div className={rowClass}>
          <span
            className={
              node.isDirectory
                ? 'momo-file-editor__tree-dir-label'
                : 'momo-file-editor__tree-file-label'
            }>
            {node.isDirectory ? (
              <FolderIcon className='momo-file-editor__tree-item-icon' />
            ) : (
              <FileIcon className='momo-file-editor__tree-item-icon' />
            )}
            <span className='momo-file-editor__tree-item-name'>{node.name}</span>
          </span>
          <span
            className={
              node.isDirectory
                ? 'momo-file-editor__tree-dir-more'
                : 'momo-file-editor__tree-file-more'
            }
            onClick={(event) => event.stopPropagation()}>
            <Dropdown
              menu={{
                items: buildNodeMenu(node),
                onClick: ({ key, domEvent }) => {
                  domEvent.stopPropagation();
                  handleNodeMenuClick(node, key);
                },
              }}
              overlayClassName='momo-file-editor__tree-more-dropdown'
              trigger={['click']}>
              <button
                className='momo-file-editor__tree-dir-more-trigger'
                title={'更多操作'}
                type='button'>
                <EllipsisVerticalIcon className='momo-file-editor__tree-more-menu-icon' />
              </button>
            </Dropdown>
          </span>
        </div>
      );
    },
    [buildNodeMenu, handleNodeMenuClick, selectedPath],
  );

  const treeData = useMemo(
    () => toAntTreeData(treeNodes, renderTreeTitle),
    [renderTreeTitle, treeNodes],
  );

  const rootClassName = className
    ? `momo-file-editor momo-file-editor--inline ${className}`
    : 'momo-file-editor momo-file-editor--inline';

  const moveDirSelectOptions = useMemo(
    () =>
      directoryOptions
        .filter((dirPath) => {
          if (!moveTarget?.isDirectory) {
            return true;
          }
          return dirPath !== moveTarget.path && !dirPath.startsWith(`${moveTarget.path}/`);
        })
        .map((dirPath) => ({
          label: dirPath ? dirPath : '根目录',
          value: dirPath,
        })),
    [directoryOptions, moveTarget],
  );

  return (
    <div className={rootClassName}>
      <input
        ref={uploadInputRef}
        hidden
        multiple
        onChange={(event) => void handleUploadChange(event)}
        type='file'
      />

      <div className='momo-file-editor__body'>
        <div className='momo-file-editor__tree'>
          <div className='momo-file-editor__tree-header'>
            <span className='momo-file-editor__tree-title'>{treeTitle}</span>
            <div className='momo-file-editor__tree-actions'>
              <button
                className='momo-file-editor__tree-btn'
                onClick={() => openNewFileInDir('')}
                title={'新建文件'}
                type='button'>
                <FilePlusIcon style={{ width: '0.875rem', height: '0.875rem' }} />
              </button>
              <button
                className='momo-file-editor__tree-btn'
                onClick={() => setIsNewFolderOpen(true)}
                title={'新建文件夹'}
                type='button'>
                <FolderPlusIcon style={{ width: '0.875rem', height: '0.875rem' }} />
              </button>
              <button
                className='momo-file-editor__tree-btn'
                onClick={() => triggerUpload('')}
                title={'上传文件'}
                type='button'>
                <UploadIcon style={{ width: '0.875rem', height: '0.875rem' }} />
              </button>
            </div>
          </div>

          <div className='momo-file-editor__tree-list'>
            {isLoading ? (
              <div className='momo-file-editor__loading'>
                <Loader2Icon style={{ width: '1rem', height: '1rem' }} />
              </div>
            ) : treeData.length === 0 ? (
              <div className='momo-file-editor__tree-empty'>
                <FileIcon style={{ width: '1.5rem', height: '1.5rem', opacity: 0.4 }} />
                <span>{'暂无文件'}</span>
              </div>
            ) : (
              <Tree
                blockNode
                showLine
                className='momo-file-editor__antd-tree'
                expandedKeys={expandedKeys}
                onExpand={(keys) => setExpandedKeys(keys.map(String))}
                onSelect={(keys) => {
                  const key = String(keys[0] ?? '');
                  if (!key) {
                    return;
                  }
                  const entry = entries.find((e) => e.relativePath === key);
                  if (!entry) {
                    return;
                  }
                  if (entry.isDirectory) {
                    toggleDirectoryExpanded(key);
                    return;
                  }
                  setSelectedPath(key);
                }}
                selectedKeys={selectedPath ? [selectedPath] : []}
                treeData={treeData}
              />
            )}
          </div>
        </div>

        <div className='momo-file-editor__editor'>
          {!selectedPath ? (
            <div className='momo-file-editor__editor-empty'>
              <FileTextIcon style={{ width: '2rem', height: '2rem', opacity: 0.3 }} />
              <span>{'选择左侧文件进行编辑'}</span>
            </div>
          ) : (
            <>
              <div className='momo-file-editor__editor-header'>
                <div className='momo-file-editor__editor-file-name' title={selectedPath}>
                  <FileTextIcon className='momo-file-editor__tree-item-icon' />
                  {selectedPath.split('/').pop()}
                  {hasUnsaved ? <span className='momo-file-editor__tree-item-dot' /> : null}
                </div>
                <div className='momo-file-editor__editor-tabs'>
                  {!isBinaryPreviewActive && isMarkdownActive ? (
                    <div className='momo-file-editor__theme-select'>
                      <span className='momo-file-editor__theme-select-label'>{'预览样式'}</span>
                      <Select
                        className='momo-file-editor__theme-select-control'
                        options={previewThemeOptions}
                        size='small'
                        value={mdPreviewTheme}
                        onChange={setMdPreviewTheme}
                      />
                    </div>
                  ) : null}
                  {isBinaryPreviewActive ? (
                    <span className='momo-file-editor__editor-tab momo-file-editor__editor-tab--active momo-file-editor__editor-tab--readonly-label'>
                      {'预览'}
                    </span>
                  ) : isMarkdownActive ? (
                    <span className='momo-file-editor__editor-tab momo-file-editor__editor-tab--active momo-file-editor__editor-tab--readonly-label'>
                      {'Markdown'}
                    </span>
                  ) : (
                    <span className='momo-file-editor__editor-tab momo-file-editor__editor-tab--active momo-file-editor__editor-tab--readonly-label'>
                      {'编辑'}
                    </span>
                  )}
                  {!isBinaryPreviewActive ? (
                    <Button
                      type='text'
                      className='momo-file-editor__editor-tab'
                      disabled={!hasUnsaved}
                      onClick={() => void handleSave()}
                      title='保存 (Ctrl+S)'
                      icon={<SaveIcon style={{ width: '0.875rem', height: '0.875rem' }} />}
                    />
                  ) : null}
                </div>
              </div>

              <div className='momo-file-editor__editor-content'>
                {isMarkdownActive ? (
                  <div className='momo-file-editor__md-editor-root'>
                    <MomoMdEditor
                      key={selectedPath}
                      id={markdownEditorDomId}
                      value={fileContent}
                      onChange={setFileContent}
                      onSave={handleEditorSave}
                      theme={mdTheme}
                      preview
                      previewTheme={mdPreviewTheme}
                      onPreviewThemeChange={setMdPreviewTheme}
                      noPrettier
                      inputBoxWidth='50%'
                      footers={[]}
                      noUploadImg
                      toolbars={MARKDOWN_TOOLBARS}
                      style={{ height: '100%' }}
                    />
                  </div>
                ) : isCodeEditorActive ? (
                  <CodeFileEditor
                    onChange={setFileContent}
                    onSave={handleEditorSave}
                    relativePath={selectedPath}
                    themeId={codeEditorTheme}
                    value={fileContent}
                  />
                ) : (
                  <BinaryFilePreview
                    buffer={previewBuffer}
                    filePreviewBaseUrl={filePreviewBaseUrl}
                    isLoading={isPreviewLoading}
                    onUnSupport={onUnSupport}
                    relativePath={selectedPath}
                  />
                )}
              </div>

              <div className='momo-file-editor__status-bar'>
                <div className='momo-file-editor__status-left'>
                  <span className='momo-file-editor__status-path'>{selectedPath}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Modal
        destroyOnHidden
        key={isNewFileOpen ? `new-file-${newFileParentDir}` : 'new-file-closed'}
        onCancel={closeNewFileModal}
        onOk={() => void handleCreateFile()}
        open={isNewFileOpen}
        title={'新建文件'}>
        {newFileParentDir ? (
          <p className='momo-file-editor__dialog-context'>{`创建位置：${newFileParentDir}/`}</p>
        ) : null}
        <Input
          autoFocus
          onChange={(e) => setNewFileName(e.target.value)}
          placeholder={newFileParentDir ? '例如 report.md' : '例如 output/report 或 notes.md'}
          value={newFileName}
        />
        <p className='momo-file-editor__dialog-hint'>
          {`未填写后缀时将默认创建 .${defaultNewFileExtension} 文件`}
        </p>
      </Modal>

      <Modal
        destroyOnHidden
        onCancel={() => setIsNewFolderOpen(false)}
        onOk={() => void handleCreateFolder()}
        open={isNewFolderOpen}
        title={'新建文件夹'}>
        <Input
          onChange={(e) => setNewFolderPath(e.target.value)}
          placeholder={'例如 output'}
          value={newFolderPath}
        />
      </Modal>

      <Modal
        destroyOnHidden
        okText='确定'
        onCancel={() => setRenameTarget(null)}
        onOk={() => void handleRenameConfirm()}
        open={renameTarget !== null}
        title={'重命名'}>
        <Input
          onChange={(e) => setRenameValue(e.target.value)}
          placeholder={'请输入新名称'}
          value={renameValue}
        />
      </Modal>

      <Modal
        destroyOnHidden
        okText='移动'
        onCancel={() => setMoveTarget(null)}
        onOk={() => void handleMoveConfirm()}
        open={moveTarget !== null}
        title={'移动到'}>
        <Select
          options={moveDirSelectOptions}
          placeholder={'选择目标文件夹'}
          style={{ width: '100%' }}
          value={moveTargetDir}
          onChange={(value) => setMoveTargetDir(value)}
        />
      </Modal>
    </div>
  );
});
