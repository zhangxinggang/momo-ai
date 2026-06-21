import type { IExportDocxHandler, IExportPdfHandler } from './toolbar-export';
/** 浏览器端 PDF 导出（A4 宽 + 默认页边距） */
export declare const defaultExportMarkdownPdf: IExportPdfHandler;
/** 浏览器端 DOCX 导出（docx 包，避免 html-to-docx 在 Vite 下动态加载失败） */
export declare const defaultExportMarkdownDocx: IExportDocxHandler;
