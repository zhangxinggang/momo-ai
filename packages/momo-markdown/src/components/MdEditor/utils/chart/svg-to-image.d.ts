import { type IExportImageData } from './dom-to-png';
export type { IExportImageData };
/** 从 Mermaid 容器中提取图表 SVG（排除工具栏图标） */
export declare function getMermaidSvg(container: HTMLElement): SVGSVGElement | null;
/** SVG 序列化为 base64 data URL 后栅格化为 PNG */
export declare function svgElementToPngData(svg: SVGSVGElement): Promise<IExportImageData>;
/** SVG 转 PNG Blob（供图表下载等场景复用） */
export declare function svgElementToPngBlob(svg: SVGSVGElement): Promise<Blob>;
