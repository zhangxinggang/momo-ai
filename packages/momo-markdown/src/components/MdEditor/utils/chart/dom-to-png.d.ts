export interface IExportImageData {
    data: Uint8Array;
    width: number;
    height: number;
}
export declare function blobToUint8Array(blob: Blob): Promise<Uint8Array>;
/** toBlob 在画布被跨域污染时会同步抛出 SecurityError */
export declare function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob>;
/** 拉取远程图片为 Blob（跨域需服务端允许 CORS） */
export declare function fetchUrlAsBlob(url: string): Promise<Blob>;
export declare function canvasElementToPngData(canvas: HTMLCanvasElement): Promise<IExportImageData>;
export declare function imgElementToPngData(img: HTMLImageElement): Promise<IExportImageData>;
