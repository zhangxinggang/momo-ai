import { type ReactElement } from 'react';
import type { TMdPreviewThemeId } from '../preview-themes';
import type { IExportDocxHandler, IExportPdfHandler } from './toolbar-export';
export interface IBuildMdEditorDefToolbarsOptions {
    previewTheme: TMdPreviewThemeId;
    onPreviewThemeChange: (theme: TMdPreviewThemeId) => void;
    content?: string;
    exportTitle?: string;
    onExportPdf?: IExportPdfHandler;
    onExportDocx?: IExportDocxHandler;
}
/** 构建 MdEditor defToolbars 数组（含预览主题、mark、emoji、导出） */
export declare function buildMdEditorDefToolbars(options: IBuildMdEditorDefToolbarsOptions): ReactElement[];
/** Hook：随内容/主题变化生成 defToolbars */
export declare function useMdEditorDefToolbars(options: IBuildMdEditorDefToolbarsOptions): ReactElement<unknown, string | import("react").JSXElementConstructor<any>>[];
