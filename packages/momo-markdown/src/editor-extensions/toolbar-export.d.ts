import { type IExportProgress } from './export-utils';
export interface IMarkdownExportContext {
    title: string;
    content: string;
    defaultName: string;
    theme: 'light' | 'dark';
    previewTheme: string;
    codeTheme: string;
    language: string;
    onProgress?: (progress: IExportProgress) => void;
}
export interface IExportPdfHandler {
    (params: IMarkdownExportContext): Promise<{
        canceled?: boolean;
        success?: boolean;
    }>;
}
export interface IExportDocxHandler {
    (params: IMarkdownExportContext): Promise<void>;
}
interface IProps {
    title?: string;
    disabled?: boolean;
    showToolbarName?: boolean;
    modelValue?: string;
    exportTitle?: string;
    onExportPdf?: IExportPdfHandler;
    onExportDocx?: IExportDocxHandler;
}
/** 导出下拉工具栏：Markdown / PDF / DOCX（鼠标移入展开） */
declare function ToolbarExport({ title, disabled, showToolbarName, modelValue, exportTitle, onExportPdf, onExportDocx, }: IProps): import("react/jsx-runtime").JSX.Element;
declare const _default: import("react").MemoExoticComponent<typeof ToolbarExport>;
export default _default;
