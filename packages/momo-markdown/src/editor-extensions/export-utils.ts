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
