import { allToolbar } from '@momo/markdown';

/** 内置工具栏配置 */
export function buildMarkdownToolbars() {
  const skip = new Set<string>(['prettier', 'github', 'save']);
  const filtered = allToolbar.filter((item) => !skip.has(String(item)));
  const eqIndex = filtered.indexOf('=');
  if (eqIndex === -1) {
    return [...filtered, '-', 0];
  }
  return [...filtered.slice(0, eqIndex + 1), '-', 0, ...filtered.slice(eqIndex + 1)];
}

export const MARKDOWN_TOOLBARS = buildMarkdownToolbars() as typeof allToolbar;

/** 是否为 Markdown 文件路径 */
export function isMarkdownPath(path: string): boolean {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  return ext === 'md' || ext === 'mdx';
}
