export { buildDocxChildrenFromPreview } from './blocks';
/** 将预览 DOM 打包为 DOCX Blob（浏览器端） */
export declare function buildDocxBlobFromPreview(root: HTMLElement): Promise<Blob>;
