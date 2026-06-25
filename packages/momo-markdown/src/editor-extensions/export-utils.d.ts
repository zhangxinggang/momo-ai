/** 导出进度阶段 */
export type EExportStage = 'preparing' | 'rendering' | 'converting' | 'saving';
export interface IExportProgress {
  stage: EExportStage;
  message: string;
  percent: number;
}
export declare const EXPORT_STAGE_PROGRESS: Record<EExportStage, number>;
/** 去掉 .md 后缀，避免导出成 xxx.md.pdf / xxx.md.docx */
export declare function resolveExportBasename(name: string, fallback?: string): string;
export declare function buildExportProgress(stage: EExportStage, message: string): IExportProgress;
/** 触发浏览器下载 Blob 文件 */
export declare function downloadBlob(blob: Blob, filename: string): void;
