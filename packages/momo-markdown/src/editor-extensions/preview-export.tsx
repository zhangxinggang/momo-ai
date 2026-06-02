import { createRoot, type Root } from 'react-dom/client';

import MdPreview from '../components/MdPreview';
import { EXPORT_A4_PADDING_MM, EXPORT_EDITOR_PREFIX } from './export-constants';
import { buildExportProgress, type IExportProgress } from './export-utils';

/** 与 @vavt/v3-extension ExportPDF 一致的预览根节点 id */
export const EXPORT_PDF_PREVIEW_ID = 'export-pdf-preview';

const EXPORT_SHELL_ID = 'md-editor-export-shell';
const EXPORT_BODY_CLASS = 'md-editor-export-printing';
/** 离屏渲染时隐藏导出容器，打印前移除 */
export const EXPORT_SHELL_OFFSCREEN_CLASS = 'md-editor-export-shell--offscreen';

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

/** 创建 ExportPDF 打印所需的 DOM 结构 */
function createExportShell(): { shell: HTMLElement; mountHost: HTMLElement } {
  const shell = document.createElement('div');
  shell.id = EXPORT_SHELL_ID;
  shell.className = `md-editor-modal-container md-editor-export-shell ${EXPORT_SHELL_OFFSCREEN_CLASS}`;
  shell.innerHTML = `
    <div class="export-pdf-modal">
      <div class="md-editor-modal md-editor-export-modal">
        <div class="md-editor-modal-body">
          <div class="export-pdf-content"></div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(shell);
  const mountHost = shell.querySelector('.export-pdf-content') as HTMLElement;
  mountHost.style.padding = `${EXPORT_A4_PADDING_MM}mm`;
  return { shell, mountHost };
}

/** 打印前显示离屏导出容器（visibility:hidden 会导致打印空白） */
export function prepareExportShellForPrint(): void {
  const shell = getMarkdownExportShellElement();
  shell?.classList.remove(EXPORT_SHELL_OFFSCREEN_CLASS);
}

/** 挂载 MdPreview 用于导出（完整渲染公式、图表等） */
export function mountMarkdownExportPreview(
  options: IMarkdownPreviewExportOptions,
): IExportMountResult {
  const { shell, mountHost } = createExportShell();
  const reactRoot: Root = createRoot(mountHost);

  reactRoot.render(
    <MdPreview
      id={EXPORT_PDF_PREVIEW_ID}
      value={options.markdown}
      theme={options.theme}
      previewTheme={options.previewTheme}
      codeTheme={options.codeTheme}
      language={options.language ?? 'zh-CN'}
      codeFoldable={false}
      showCodeRowNumber={false}
      noImgZoomIn
    />,
  );

  return {
    cleanup: () => {
      reactRoot.unmount();
      shell.remove();
    },
  };
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/** 等待 Mermaid / PlantUML / ECharts / KaTeX / 图片等异步内容渲染完成 */
export async function waitForMarkdownExportReady(timeoutMs = 15000): Promise<void> {
  const preview = document.getElementById(EXPORT_PDF_PREVIEW_ID);
  if (!preview) {
    return;
  }

  const p = EXPORT_EDITOR_PREFIX;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const pendingMermaid = preview.querySelectorAll(`div.${p}-mermaid:not([data-processed])`);
    const pendingPlantuml = preview.querySelectorAll(
      `div.${p}-plantuml[data-plantuml-pending="true"]`,
    );
    const mermaidBlocks = preview.querySelectorAll(`p.${p}-mermaid`);
    const plantumlBlocks = preview.querySelectorAll(`.${p}-plantuml-rendered`);
    const echartsBlocks = preview.querySelectorAll(`div.${p}-echarts`);
    const katexBlocks = preview.querySelectorAll('.katex');
    const images = preview.querySelectorAll('img');

    const noPending = pendingMermaid.length === 0 && pendingPlantuml.length === 0;

    const mermaidReady =
      mermaidBlocks.length === 0 ||
      Array.from(mermaidBlocks).every((node) => node.querySelector('svg') !== null);

    const plantumlReady =
      plantumlBlocks.length === 0 ||
      Array.from(plantumlBlocks).every((node) => {
        const img = node.querySelector<HTMLImageElement>(`img.${p}-plantuml-image`);
        return Boolean(img && img.complete && img.naturalWidth > 0);
      });

    const echartsReady =
      echartsBlocks.length === 0 ||
      Array.from(echartsBlocks).every((node) => node.querySelector('canvas') !== null);

    const katexReady =
      katexBlocks.length === 0 ||
      Array.from(katexBlocks).every((node) => node.textContent?.trim() !== '');

    const imagesReady = Array.from(images).every((img) => {
      if (img.closest(`.${p}-mermaid-action`)) {
        return true;
      }
      if (!img.src) {
        return true;
      }
      return img.complete && (img.naturalWidth > 0 || img.clientWidth > 0);
    });

    if (noPending && mermaidReady && plantumlReady && echartsReady && katexReady && imagesReady) {
      await sleep(300);
      return;
    }
    await sleep(200);
  }
}

/** 获取已渲染的预览内容节点（.md-editor-preview） */
export function getMarkdownExportPreviewElement(): HTMLElement | null {
  const root = document.getElementById(EXPORT_PDF_PREVIEW_ID);
  if (!root) {
    return null;
  }
  return root.querySelector('.md-editor-preview') as HTMLElement | null;
}

/** 获取 ExportPDF 打印容器（含 modal 结构，供回退 PDF 使用） */
export function getMarkdownExportShellElement(): HTMLElement | null {
  return document.getElementById(EXPORT_SHELL_ID);
}

/** 挂载预览、等待渲染并执行回调 */
export async function withMarkdownExportPreview<T>(
  options: IMarkdownPreviewExportOptions,
  run: () => Promise<T>,
): Promise<T> {
  const { cleanup } = mountMarkdownExportPreview(options);
  document.body.classList.add(EXPORT_BODY_CLASS);
  try {
    options.onProgress?.(buildExportProgress('rendering', '正在渲染预览内容...'));
    await waitForMarkdownExportReady();
    return await run();
  } finally {
    document.body.classList.remove(EXPORT_BODY_CLASS);
    cleanup();
  }
}
