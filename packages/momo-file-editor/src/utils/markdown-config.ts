import { buildExtendedMarkdownToolbars } from '@momo/markdown';

export const MARKDOWN_TOOLBARS = buildExtendedMarkdownToolbars() as ReturnType<
  typeof buildExtendedMarkdownToolbars
>;

/** 内置工具栏配置 */
export function buildMarkdownToolbars() {
  return MARKDOWN_TOOLBARS;
}

/** 是否为 Markdown 文件路径 */
export function isMarkdownPath(path: string): boolean {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  return ext === 'md' || ext === 'mdx';
}
