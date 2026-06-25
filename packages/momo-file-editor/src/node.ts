/** 主进程 / Node 侧可安全引用的纯工具导出（无 React、无 @momo/markdown） */
export { CODE_EDITOR_EXTENSIONS, isCodeEditorPath } from './utils/code-editor-language';
export { isMarkdownPath } from './utils/markdown-config';
export {
  buildFileTree,
  ensurePathWithExtension,
  getBaseName,
  getParentPath,
  joinRelativePath,
  normalizeRelativePath,
} from './utils/path';
export type { IFileTreeNode } from './utils/path';
