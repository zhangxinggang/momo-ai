/** 导出进度阶段 */
export type EExportStage = 'preparing' | 'rendering' | 'converting' | 'saving';

export interface IExportProgress {
  stage: EExportStage;
  message: string;
  percent: number;
}

export const EXPORT_STAGE_PROGRESS: Record<EExportStage, number> = {
  preparing: 15,
  rendering: 45,
  converting: 75,
  saving: 95,
};

/** 去掉 .md 后缀，避免导出成 xxx.md.pdf / xxx.md.docx */
export function resolveExportBasename(name: string, fallback = 'document'): string {
  const trimmed = name.trim() || fallback;
  return trimmed.replace(/\.md$/i, '');
}

export function buildExportProgress(stage: EExportStage, message: string): IExportProgress {
  return {
    stage,
    message,
    percent: EXPORT_STAGE_PROGRESS[stage],
  };
}

/** 触发浏览器下载 Blob 文件 */
export function downloadBlob(blob: Blob, filename: string): void {
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
