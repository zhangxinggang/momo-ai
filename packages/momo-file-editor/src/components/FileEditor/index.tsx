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
  RefreshCwIcon,
  SaveIcon,
  SearchIcon,
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
import { DEFAULT_CODE_EDITOR_THEME, type ECodeEditorTheme } from '../../utils/code-editor-theme';
import {
  cloneArrayBuffer,
  decodeEditableFile,
  isEditableText,
  normalizeEditableText,
} from '../../utils/file-content';
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
  /** Open a workspace file requested by the host, including nested files. */
  requestedPath?: { path: string; requestId: number };
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
  emptyDirectoryPaths: ReadonlySet<string>,
): TreeDataNode[] {
  return nodes.map((node) => ({
    key: node.path,
    title: renderTitle(node),
    isLeaf: !node.isDirectory || emptyDirectoryPaths.has(node.path),
    selectable: true,
    children:
      node.children.length > 0
        ? toAntTreeData(node.children, renderTitle, emptyDirectoryPaths)
        : undefined,
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

function normalizeEntries(
  adapter: IFileEditorAdapter,
  entries: IFileTreeEntry[],
): IFileTreeEntry[] {
  return entries
    .map((entry) => ({
      ...entry,
      relativePath: normalizeRelativePath(entry.relativePath),
    }))
    .filter(
      (entry) =>
        Boolean(entry.relativePath) && (adapter.filterEntry ? adapter.filterEntry(entry) : true),
    );
}

function buildSearchEntries(entries: IFileTreeEntry[], query: string): IFileTreeEntry[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) {
    return [];
  }

  const result = new Map<string, IFileTreeEntry>();
  for (const entry of entries) {
    if (!entry.relativePath.toLocaleLowerCase().includes(normalizedQuery)) {
      continue;
    }
    result.set(entry.relativePath, entry);
    const parts = entry.relativePath.split('/');
    for (let index = 1; index < parts.length; index += 1) {
      const ancestorPath = parts.slice(0, index).join('/');
      if (!result.has(ancestorPath)) {
        result.set(ancestorPath, { relativePath: ancestorPath, isDirectory: true });
      }
    }
  }
  return Array.from(result.values());
}

/**
 * 通用树形文件编辑器：左树 + 右编辑（Markdown 分屏 / 纯文本）
 */
export const FileEditor = forwardRef<IFileEditorHandle, IProps>(function FileEditor(
  {
    adapter,
    requestedPath,
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
  const [loadedFile, setLoadedFile] = useState<{
    path: string;
    kind: 'text' | 'binary' | 'error';
  } | null>(null);
  const fileReadRequestRef = useRef(0);
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchEntries, setSearchEntries] = useState<IFileTreeEntry[]>([]);
  const [searchExpandedKeys, setSearchExpandedKeys] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [emptyDirectoryPaths, setEmptyDirectoryPaths] = useState<string[]>([]);
  const loadedDirectoryPathsRef = useRef(new Set<string>());
  const loadingDirectoryPathsRef = useRef(new Map<string, Promise<void>>());
  const searchRequestRef = useRef(0);

  const notify = useCallback(
    (message: string, type: IFileEditorNotifyPayload['type']) => {
      onNotify?.({ message, type });
    },
    [onNotify],
  );

  const reloadTree = useCallback(
    async (reset = false) => {
      setIsLoading(true);
      try {
        if (reset) {
          loadedDirectoryPathsRef.current.clear();
          loadingDirectoryPathsRef.current.clear();
          setExpandedKeys([]);
          setEmptyDirectoryPaths([]);
        }

        const loadedDirectories = reset ? [] : Array.from(loadedDirectoryPathsRef.current);
        const lists = adapter.listDirectory
          ? await Promise.all([
              adapter.listDirectory(''),
              ...loadedDirectories.map((directory) => adapter.listDirectory!(directory)),
            ])
          : [await adapter.listTree()];
        const visible = normalizeEntries(adapter, lists.flat());
        setEntries(visible);

        if (adapter.listDirectory && !reset) {
          setEmptyDirectoryPaths(
            loadedDirectories.filter(
              (directory) =>
                !visible.some((entry) => getParentPath(entry.relativePath) === directory),
            ),
          );
        }

        setSelectedPath((current) => {
          if (
            current &&
            (Boolean(adapter.listDirectory) ||
              visible.some((e) => e.relativePath === current && !e.isDirectory))
          ) {
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
    },
    [adapter, notify],
  );

  useEffect(() => {
    setSearchQuery('');
    setSearchEntries([]);
    setSearchExpandedKeys([]);
    void reloadTree(true);
  }, [reloadTree, refreshToken]);

  const ensureDirectoryLoaded = useCallback(
    (directory: string): Promise<void> => {
      if (!adapter.listDirectory || loadedDirectoryPathsRef.current.has(directory)) {
        return Promise.resolve();
      }
      const existingRequest = loadingDirectoryPathsRef.current.get(directory);
      if (existingRequest) {
        return existingRequest;
      }

      const request = adapter
        .listDirectory(directory)
        .then((list) => {
          const children = normalizeEntries(adapter, list);
          setEntries((current) => [
            ...current.filter((entry) => getParentPath(entry.relativePath) !== directory),
            ...children,
          ]);
          setEmptyDirectoryPaths((current) => {
            const next = new Set(current);
            if (children.length === 0) {
              next.add(directory);
            } else {
              next.delete(directory);
            }
            return Array.from(next);
          });
          loadedDirectoryPathsRef.current.add(directory);
        })
        .catch((error) => {
          console.error(error);
          notify('加载目录失败', 'error');
        })
        .finally(() => {
          loadingDirectoryPathsRef.current.delete(directory);
        });
      loadingDirectoryPathsRef.current.set(directory, request);
      return request;
    },
    [adapter, notify],
  );

  useEffect(() => {
    const query = searchQuery.trim();
    const requestId = searchRequestRef.current + 1;
    searchRequestRef.current = requestId;
    if (!query) {
      setSearchEntries([]);
      setSearchExpandedKeys([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = window.setTimeout(() => {
      const runSearch = async () => {
        try {
          const list = adapter.searchTree
            ? await adapter.searchTree(query)
            : await adapter.listTree();
          if (searchRequestRef.current !== requestId) {
            return;
          }
          const result = buildSearchEntries(normalizeEntries(adapter, list), query);
          setSearchEntries(result);
          setSearchExpandedKeys(collectDirectoryPaths(result).filter(Boolean));
        } catch (error) {
          console.error(error);
          if (searchRequestRef.current === requestId) {
            setSearchEntries([]);
            notify('搜索文件失败', 'error');
          }
        } finally {
          if (searchRequestRef.current === requestId) {
            setIsSearching(false);
          }
        }
      };
      void runSearch();
    }, 220);

    return () => window.clearTimeout(timer);
  }, [adapter, notify, searchQuery]);

  const isSearchMode = Boolean(searchQuery.trim());
  const visibleEntries = isSearchMode ? searchEntries : entries;
  const treeNodes = useMemo(() => buildFileTree(visibleEntries), [visibleEntries]);
  const directoryOptions = useMemo(() => collectDirectoryPaths(entries), [entries]);
  const activeExpandedKeys = isSearchMode ? searchExpandedKeys : expandedKeys;

  const toggleDirectoryExpanded = useCallback(
    (dirPath: string) => {
      if (isSearchMode) {
        setSearchExpandedKeys((current) =>
          current.includes(dirPath)
            ? current.filter((key) => key !== dirPath)
            : [...current, dirPath],
        );
        return;
      }
      const isExpanding = !expandedKeys.includes(dirPath);
      setExpandedKeys((current) =>
        isExpanding ? [...current, dirPath] : current.filter((key) => key !== dirPath),
      );
      if (isExpanding) {
        void ensureDirectoryLoaded(dirPath);
      }
    },
    [ensureDirectoryLoaded, expandedKeys, isSearchMode],
  );

  const isTextActive = loadedFile?.path === selectedPath && loadedFile?.kind === 'text';
  const isMarkdownActive = Boolean(isTextActive && selectedPath && isMarkdownPath(selectedPath));
  const isCodeEditorActive = isTextActive && !isMarkdownActive;
  const isBinaryPreviewActive = loadedFile?.path === selectedPath && loadedFile?.kind === 'binary';
  const isFileLoading = Boolean(selectedPath && loadedFile?.path !== selectedPath);
  const hasUnsaved = isTextActive && fileContent !== savedContent;

  useEffect(() => {
    onUnsavedChange?.(hasUnsaved);
  }, [hasUnsaved, onUnsavedChange]);

  const loadFile = useCallback(
    async (relativePath: string) => {
      const request = ++fileReadRequestRef.current;
      setLoadedFile(null);
      setIsPreviewLoading(true);
      try {
        const buffer = adapter.readFileBuffer ? await adapter.readFileBuffer(relativePath) : null;
        let text: string | null;
        if (buffer) {
          text = decodeEditableFile(new Uint8Array(buffer));
        } else {
          const source = await adapter.readFile(relativePath);
          text =
            source === '[binary file]' || source === '[file too large]' || !isEditableText(source)
              ? null
              : source;
        }
        if (request !== fileReadRequestRef.current) return;
        const content = text === null ? '' : normalizeEditableText(text);
        setFileContent(content);
        setSavedContent(content);
        setPreviewBuffer(text === null && buffer ? cloneArrayBuffer(buffer) : null);
        setLoadedFile({ path: relativePath, kind: text === null ? 'binary' : 'text' });
      } catch (error) {
        if (request !== fileReadRequestRef.current) return;
        console.error(error);
        setLoadedFile({ path: relativePath, kind: 'error' });
        notify('加载文件失败', 'error');
      } finally {
        if (request === fileReadRequestRef.current) setIsPreviewLoading(false);
      }
    },
    [adapter, notify],
  );

  const handleRefresh = useCallback(() => {
    const refresh = async () => {
      await reloadTree();
      if (selectedPath) {
        await loadFile(selectedPath);
      }
    };

    if (!hasUnsaved) {
      void refresh();
      return;
    }

    Modal.confirm({
      title: '刷新文件内容',
      content: '刷新会放弃当前尚未保存的修改，是否继续？',
      okText: '刷新',
      cancelText: '取消',
      onOk: refresh,
    });
  }, [hasUnsaved, loadFile, reloadTree, selectedPath]);

  useEffect(() => {
    if (!selectedPath) {
      setLoadedFile(null);
      setFileContent('');
      setSavedContent('');
      setPreviewBuffer(null);
      return;
    }
    const entry = [...entries, ...searchEntries].find((e) => e.relativePath === selectedPath);
    if (!entry || entry.isDirectory) {
      return;
    }
    void loadFile(selectedPath);
    return () => {
      fileReadRequestRef.current += 1;
    };
    // 仅在切换文件时加载内容，避免保存后刷新树覆盖未保存编辑
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPath]);

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

  useEffect(() => {
    if (!requestedPath?.path) return;
    let cancelled = false;
    const open = async () => {
      if (hasUnsaved && !(await handleSave())) return;
      if (cancelled) return;
      const target = normalizeRelativePath(requestedPath.path);
      const parents = target
        .split('/')
        .slice(0, -1)
        .map((_, i, segments) => segments.slice(0, i + 1).join('/'));
      if (adapter.listDirectory) {
        const lists = await Promise.all(
          parents.map((directory) => adapter.listDirectory!(directory)),
        );
        if (cancelled) return;
        parents.forEach((directory) => loadedDirectoryPathsRef.current.add(directory));
        setEntries((current) => normalizeEntries(adapter, [...current, ...lists.flat()]));
      }
      setExpandedKeys((current) => [...new Set([...current, ...parents])]);
      setSelectedPath(target);
      if (selectedPath === target) await loadFile(target);
    };
    void open().catch(() => notify('无法打开工作区文件', 'error'));
    return () => {
      cancelled = true;
    };
    // Each host request opens once; changes to the current draft must not reopen it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedPath?.requestId, adapter]);

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

  const emptyDirectoryPathSet = useMemo(() => new Set(emptyDirectoryPaths), [emptyDirectoryPaths]);
  const treeData = useMemo(
    () => toAntTreeData(treeNodes, renderTreeTitle, emptyDirectoryPathSet),
    [emptyDirectoryPathSet, renderTreeTitle, treeNodes],
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
                aria-label='刷新文件内容'
                className='momo-file-editor__tree-btn'
                onClick={handleRefresh}
                title='刷新文件内容'
                type='button'>
                <RefreshCwIcon style={{ width: '0.875rem', height: '0.875rem' }} />
              </button>
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

          <div className='momo-file-editor__tree-search'>
            <Input
              allowClear
              aria-label='搜索文件'
              placeholder='搜索全部文件'
              prefix={<SearchIcon aria-hidden style={{ width: '0.875rem', height: '0.875rem' }} />}
              size='small'
              suffix={
                isSearching ? (
                  <Loader2Icon
                    aria-label='正在搜索全部文件'
                    className='momo-file-editor__search-spinner'
                  />
                ) : undefined
              }
              title='搜索全部文件；自动忽略依赖、构建与缓存目录'
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <div className='momo-file-editor__tree-list'>
            {isLoading || (isSearching && searchEntries.length === 0) ? (
              <div className='momo-file-editor__loading'>
                <Loader2Icon style={{ width: '1rem', height: '1rem' }} />
              </div>
            ) : treeData.length === 0 ? (
              <div className='momo-file-editor__tree-empty'>
                <FileIcon style={{ width: '1.5rem', height: '1.5rem', opacity: 0.4 }} />
                <span>{isSearchMode ? '未找到匹配文件' : '暂无文件'}</span>
              </div>
            ) : (
              <Tree
                blockNode
                showLine={{ showLeafIcon: false }}
                className='momo-file-editor__antd-tree'
                expandedKeys={activeExpandedKeys}
                loadData={
                  isSearchMode ? undefined : (node) => ensureDirectoryLoaded(String(node.key ?? ''))
                }
                onExpand={(keys, info) => {
                  const nextKeys = keys.map(String);
                  if (isSearchMode) {
                    setSearchExpandedKeys(nextKeys);
                    return;
                  }
                  setExpandedKeys(nextKeys);
                  if (info.expanded) {
                    void ensureDirectoryLoaded(String(info.node.key ?? ''));
                  }
                }}
                onSelect={(keys) => {
                  const key = String(keys[0] ?? '');
                  if (!key) {
                    return;
                  }
                  const entry = visibleEntries.find((e) => e.relativePath === key);
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
                  {isTextActive ? (
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
                {isFileLoading ? (
                  <div className='momo-file-editor__loading'>
                    <Loader2Icon aria-label='正在读取文件' />
                  </div>
                ) : loadedFile?.kind === 'error' ? (
                  <div className='momo-file-editor__editor-empty'>加载文件失败，请刷新重试</div>
                ) : isMarkdownActive ? (
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
