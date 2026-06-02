import { useMemo, type ReactElement } from 'react';

import { MdPreviewThemeSelect } from '../components/MdPreviewThemeSelect';
import type { TMdPreviewThemeId } from '../preview-themes';
import {
  MD_TOOLBAR_SLOT_EMOJI,
  MD_TOOLBAR_SLOT_EXPORT,
  MD_TOOLBAR_SLOT_MARK,
  MD_TOOLBAR_SLOT_PREVIEW_THEME,
} from './build-toolbars';
import { defaultExportMarkdownDocx, defaultExportMarkdownPdf } from './export-handlers';
import ToolbarEmoji from './toolbar-emoji';
import type { IExportDocxHandler, IExportPdfHandler } from './toolbar-export';
import ToolbarExport from './toolbar-export';
import ToolbarMark from './toolbar-mark';

export interface IBuildMdEditorDefToolbarsOptions {
  previewTheme: TMdPreviewThemeId;
  onPreviewThemeChange: (theme: TMdPreviewThemeId) => void;
  content?: string;
  exportTitle?: string;
  onExportPdf?: IExportPdfHandler;
  onExportDocx?: IExportDocxHandler;
}

/** 构建 MdEditor defToolbars 数组（含预览主题、mark、emoji、导出） */
export function buildMdEditorDefToolbars(
  options: IBuildMdEditorDefToolbarsOptions,
): ReactElement[] {
  const slots: ReactElement[] = [];
  slots[MD_TOOLBAR_SLOT_PREVIEW_THEME] = (
    <MdPreviewThemeSelect
      key='md-preview-theme'
      value={options.previewTheme}
      onChange={options.onPreviewThemeChange}
    />
  );
  slots[MD_TOOLBAR_SLOT_MARK] = <ToolbarMark key='md-toolbar-mark' title='标记' />;
  slots[MD_TOOLBAR_SLOT_EMOJI] = <ToolbarEmoji key='md-toolbar-emoji' title='表情' />;
  slots[MD_TOOLBAR_SLOT_EXPORT] = (
    <ToolbarExport
      key='md-toolbar-export'
      exportTitle={options.exportTitle}
      modelValue={options.content}
      onExportDocx={options.onExportDocx ?? defaultExportMarkdownDocx}
      onExportPdf={options.onExportPdf ?? defaultExportMarkdownPdf}
      title='导出'
    />
  );
  return slots;
}

/** Hook：随内容/主题变化生成 defToolbars */
export function useMdEditorDefToolbars(options: IBuildMdEditorDefToolbarsOptions) {
  return useMemo(
    () => buildMdEditorDefToolbars(options),
    [
      options.previewTheme,
      options.onPreviewThemeChange,
      options.content,
      options.exportTitle,
      options.onExportPdf,
      options.onExportDocx,
    ],
  );
}
