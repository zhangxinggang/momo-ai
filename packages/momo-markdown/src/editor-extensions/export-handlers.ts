import { buildDocxBlobFromPreview } from './export-docx';
import { buildExportProgress, resolveExportBasename, type IExportProgress } from './export-utils';
import {
  getMarkdownExportPreviewElement,
  getMarkdownExportShellElement,
  prepareExportShellForPrint,
  withMarkdownExportPreview,
} from './preview-export';
import type { IExportDocxHandler, IExportPdfHandler } from './toolbar-export';

async function saveBlob(blob: Blob, filename: string): Promise<void> {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

async function exportPreviewToPdf(
  _preview: HTMLElement,
  _filename: string,
  reportProgress?: (progress: IExportProgress) => void,
): Promise<void> {
  const shell = getMarkdownExportShellElement();
  if (!shell) {
    throw new Error('导出容器不存在');
  }

  reportProgress?.(buildExportProgress('converting', '正在打开打印对话框...'));
  prepareExportShellForPrint();
  await new Promise<void>((resolve, reject) => {
    window.onafterprint = () => {
      window.onafterprint = null;
      reportProgress?.(buildExportProgress('saving', '正在完成导出...'));
      resolve();
    };

    try {
      window.print();
    } catch (error) {
      window.onafterprint = null;
      reject(error);
    }
  });
}

/** 浏览器端 PDF 导出（A4 宽 + 默认页边距） */
export const defaultExportMarkdownPdf: IExportPdfHandler = async (params) => {
  const basename = resolveExportBasename(params.defaultName || params.title || 'document');
  params.onProgress?.(buildExportProgress('preparing', '正在准备导出...'));

  return withMarkdownExportPreview(
    {
      markdown: params.content,
      theme: params.theme,
      previewTheme: params.previewTheme,
      codeTheme: params.codeTheme,
      language: params.language,
      onProgress: params.onProgress,
    },
    async () => {
      const preview = getMarkdownExportPreviewElement();
      if (!preview) {
        return { success: false };
      }
      try {
        await exportPreviewToPdf(preview, basename, params.onProgress);
        return { success: true };
      } catch {
        return { success: false };
      }
    },
  );
};

/** 浏览器端 DOCX 导出（docx 包，避免 html-to-docx 在 Vite 下动态加载失败） */
export const defaultExportMarkdownDocx: IExportDocxHandler = async (params) => {
  const basename = resolveExportBasename(params.defaultName || params.title || 'document');
  params.onProgress?.(buildExportProgress('preparing', '正在准备导出...'));

  await withMarkdownExportPreview(
    {
      markdown: params.content,
      theme: params.theme,
      previewTheme: params.previewTheme,
      codeTheme: params.codeTheme,
      language: params.language,
      onProgress: params.onProgress,
    },
    async () => {
      const preview = getMarkdownExportPreviewElement();
      if (!preview) {
        throw new Error('预览渲染失败');
      }
      params.onProgress?.(buildExportProgress('converting', '正在生成 DOCX...'));
      const blob = await buildDocxBlobFromPreview(preview);
      params.onProgress?.(buildExportProgress('saving', '正在保存 DOCX...'));
      await saveBlob(blob, `${basename}.docx`);
    },
  );
};
