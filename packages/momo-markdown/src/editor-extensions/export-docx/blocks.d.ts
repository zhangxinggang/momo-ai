import { type FileChild } from 'docx';
/** 将预览 DOM 转为 docx 段落与表格（浏览器端） */
export declare function buildDocxChildrenFromPreview(root: HTMLElement): Promise<FileChild[]>;
