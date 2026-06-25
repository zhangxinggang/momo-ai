import { type IExportProgress } from './export-utils';
/** 与 @vavt/v3-extension ExportPDF 一致的预览根节点 id */
export declare const EXPORT_PDF_PREVIEW_ID = 'export-pdf-preview';
/** 离屏渲染时隐藏导出容器，打印前移除 */
export declare const EXPORT_SHELL_OFFSCREEN_CLASS = 'md-editor-export-shell--offscreen';
export interface IMarkdownPreviewExportOptions {
  markdown: string;
  theme: 'light' | 'dark';
  previewTheme: string;
  codeTheme: string;
  language?: string;
  onProgress?: (progress: IExportProgress) => void;
}
interface IExportMountResult {
  cleanup: () => void;
}
/** 打印前显示离屏导出容器（visibility:hidden 会导致打印空白） */
export declare function prepareExportShellForPrint(): void;
/** 挂载 MdPreview 用于导出（完整渲染公式、图表等） */
export declare function mountMarkdownExportPreview(
  options: IMarkdownPreviewExportOptions,
): IExportMountResult;
/** 等待 Mermaid / PlantUML / ECharts / KaTeX / 图片等异步内容渲染完成 */
export declare function waitForMarkdownExportReady(timeoutMs?: number): Promise<void>;
/** 获取已渲染的预览内容节点（.md-editor-preview） */
export declare function getMarkdownExportPreviewElement(): HTMLElement | null;
/** 获取 ExportPDF 打印容器（含 modal 结构，供回退 PDF 使用） */
export declare function getMarkdownExportShellElement(): HTMLElement | null;
/** 挂载预览、等待渲染并执行回调 */
export declare function withMarkdownExportPreview<T>(
  options: IMarkdownPreviewExportOptions,
  run: () => Promise<T>,
): Promise<T>;
export {};
