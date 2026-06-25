import { allRenderers } from '@file-viewer/preset-all';
import type { ViewerOptions } from '@file-viewer/react';

/** 从 preset-all 的 renderer definitions 收集可预览扩展名 */
function collectFileViewerSupportedExtensions(): ReadonlySet<string> {
  const extensions = new Set<string>();
  for (const renderer of allRenderers.renderers ?? []) {
    for (const definition of renderer.definitions ?? []) {
      for (const ext of definition.extensions ?? []) {
        extensions.add(ext.toLowerCase());
      }
    }
  }
  return extensions;
}

export const FILE_VIEWER_SUPPORTED_EXTENSIONS = collectFileViewerSupportedExtensions();

/** 从文件名提取小写扩展名（无点） */
export function getFileExtension(fileName: string): string {
  const baseName = fileName.split(/[/\\]/).pop() ?? fileName;
  const dotIndex = baseName.lastIndexOf('.');
  if (dotIndex <= 0) {
    return '';
  }
  return baseName.slice(dotIndex + 1).toLowerCase();
}

/** 判断文件是否在 @file-viewer/preset-all 支持矩阵内 */
export function isFileViewerSupportedFile(fileName: string): boolean {
  const extension = getFileExtension(fileName);
  if (!extension) {
    return false;
  }
  return FILE_VIEWER_SUPPORTED_EXTENSIONS.has(extension);
}

/** 拼接静态资源路径，base 由宿主通过 filePreviewBaseUrl 注入 */
function resolvePublicAsset(relativePath: string, base = ''): string {
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  return `${normalizedBase}${relativePath.replace(/^\//, '')}`;
}

/** 根据可选 baseUrl 生成文件预览器完整配置 */
export function buildFileViewerPreviewOptions(filePreviewBaseUrl = ''): ViewerOptions {
  const resolveAsset = (relativePath: string) =>
    resolvePublicAsset(relativePath, filePreviewBaseUrl);

  return {
    builtinRenderers: 'none',
    renderers: allRenderers,
    rendererMode: 'replace',
    theme: 'light',
    toolbar: {
      position: 'bottom-right',
      download: true,
      print: true,
      exportHtml: true,
      zoom: true,
    },
    archive: {
      cache: true,
      workerTimeoutMs: 30000,
      workerUrl: resolveAsset('vendor/libarchive/worker-bundle.js'),
      wasmUrl: resolveAsset('vendor/libarchive/libarchive.wasm'),
    },
    pdf: {
      workerUrl: resolveAsset('vendor/pdf/pdf.worker.mjs'),
      cMapUrl: resolveAsset('vendor/pdf/cmaps/'),
      wasmUrl: resolveAsset('vendor/pdf/wasm/'),
      standardFontDataUrl: resolveAsset('vendor/pdf/standard_fonts/'),
    },
    docx: {
      worker: true,
      workerUrl: resolveAsset('vendor/docx/docx.worker.js'),
      workerJsZipUrl: resolveAsset('vendor/docx/jszip.min.js'),
    },
    spreadsheet: {
      workerUrl: resolveAsset('vendor/xlsx/sheet.worker.js'),
    },
    typst: {
      compilerWasmUrl: resolveAsset('wasm/typst/typst_ts_web_compiler_bg.wasm'),
      rendererWasmUrl: resolveAsset('wasm/typst/typst_ts_renderer_bg.wasm'),
      fontAssetsUrl: resolveAsset('wasm/typst/fonts/'),
    },
    cad: {
      wasmPath: resolveAsset('wasm/cad/'),
      workerUrl: resolveAsset('wasm/cad/dwg-worker.js'),
      dwfWasmUrl: resolveAsset('wasm/cad/dwfv-render.wasm'),
    },
    data: {
      sqlWasmUrl: resolveAsset('wasm/data/sql-wasm.wasm'),
    },
    drawing: {
      viewerScriptUrl: resolveAsset('vendor/drawio/viewer-static.min.js'),
    },
  };
}

/** 默认预览配置（未指定 filePreviewBaseUrl 时使用相对路径） */
export const FILE_VIEWER_PREVIEW_OPTIONS = buildFileViewerPreviewOptions();
