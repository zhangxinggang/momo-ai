import { allToolbar } from '../components/MdEditor/config';

/** defToolbars 槽位：预览主题选择 */
export const MD_TOOLBAR_SLOT_PREVIEW_THEME = 0;
/** defToolbars 槽位：文本标记 */
export const MD_TOOLBAR_SLOT_MARK = 1;
/** defToolbars 槽位：表情 */
export const MD_TOOLBAR_SLOT_EMOJI = 2;
/** defToolbars 槽位：导出 */
export const MD_TOOLBAR_SLOT_EXPORT = 3;

const SKIP_TOOLBARS = new Set(['prettier', 'github', 'save', 'previewStyle']);

/** 构建含扩展槽位的 Markdown 工具栏配置 */
export function buildExtendedMarkdownToolbars() {
  const filtered = allToolbar.filter((item) => !SKIP_TOOLBARS.has(String(item)));
  const katexIndex = filtered.indexOf('katex');
  const withExtensions =
    katexIndex === -1
      ? filtered
      : [
          ...filtered.slice(0, katexIndex + 1),
          MD_TOOLBAR_SLOT_MARK,
          MD_TOOLBAR_SLOT_EMOJI,
          MD_TOOLBAR_SLOT_EXPORT,
          ...filtered.slice(katexIndex + 1),
        ];

  const eqIndex = withExtensions.indexOf('=');
  if (eqIndex === -1) {
    return [...withExtensions, '-', MD_TOOLBAR_SLOT_PREVIEW_THEME];
  }

  return [
    ...withExtensions.slice(0, eqIndex + 1),
    '-',
    MD_TOOLBAR_SLOT_PREVIEW_THEME,
    ...withExtensions.slice(eqIndex + 1),
  ];
}
