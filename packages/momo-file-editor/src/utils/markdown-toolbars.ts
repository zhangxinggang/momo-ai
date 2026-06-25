import { buildExtendedMarkdownToolbars } from '@momo/markdown';

export const MARKDOWN_TOOLBARS = buildExtendedMarkdownToolbars() as ReturnType<
  typeof buildExtendedMarkdownToolbars
>;

/** 内置工具栏配置 */
export function buildMarkdownToolbars() {
  return MARKDOWN_TOOLBARS;
}
