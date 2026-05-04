import './components/FileEditor/index.module.less';

export { FileEditor } from './components/FileEditor';
export type { IFileEditorHandle, IProps } from './components/FileEditor';

export type {
  EFileEditorNotifyType,
  IFileEditorAdapter,
  IFileEditorNotifyPayload,
  IFileTreeEntry,
} from './types/adapter';

export {
  buildFileTree,
  ensurePathWithExtension,
  getBaseName,
  getParentPath,
  joinRelativePath,
  normalizeRelativePath,
} from './utils/path';
export type { IFileTreeNode } from './utils/path';

export { MARKDOWN_TOOLBARS, buildMarkdownToolbars, isMarkdownPath } from './utils/markdown-config';

export {
  DEFAULT_MD_PREVIEW_THEME,
  MD_PREVIEW_THEMES,
  MdPreviewThemeSelect,
  useMarkdownEditorTheme,
  useMdPreviewTheme,
} from '@momo/markdown';
export type { TMdPreviewThemeId } from '@momo/markdown';
