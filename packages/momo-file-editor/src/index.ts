import editorCss from './components/FileEditor/index.module.less?inline';
import codeEditorCss from './components/CodeFileEditor/index.module.less?inline';
import binaryPreviewCss from './components/BinaryFilePreview/index.module.less?inline';

function injectPackageStyles(css: string): void {
  if (!css.trim()) {
    return;
  }
  const doc = globalThis.document;
  if (!doc) {
    return;
  }
  const styleElement = doc.createElement('style');
  styleElement.setAttribute('data-momo-file-editor', 'true');
  styleElement.textContent = css;
  doc.head.appendChild(styleElement);
}

injectPackageStyles(editorCss);
injectPackageStyles(codeEditorCss);
injectPackageStyles(binaryPreviewCss);

export { FileEditor } from './components/FileEditor';
export type { IFileEditorHandle, IProps } from './components/FileEditor';

export { CodeFileEditor } from './components/CodeFileEditor';
export type { IProps as ICodeFileEditorProps } from './components/CodeFileEditor';

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

export { BINARY_FILE_PLACEHOLDER, cloneArrayBuffer, isBinaryFilePlaceholder } from './utils/file-content';

export {
  buildFileViewerPreviewOptions,
  FILE_VIEWER_PREVIEW_OPTIONS,
} from './utils/file-viewer-config';

export {
  CODE_EDITOR_THEME_OPTIONS,
  DEFAULT_CODE_EDITOR_THEME,
  ECodeEditorTheme,
  getCodeEditorThemeExtension,
  isCodeEditorTheme,
  resolveCodeEditorThemeFromDocument,
  useSyncedCodeEditorTheme,
} from './utils/code-editor-theme';

export {
  DEFAULT_MD_PREVIEW_THEME,
  MD_PREVIEW_THEMES,
  MdPreviewThemeSelect,
  useMarkdownEditorTheme,
  useMdPreviewTheme,
} from '@momo/markdown';
export type { TMdPreviewThemeId } from '@momo/markdown';
