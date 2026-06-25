export {
  blobToUint8Array,
  canvasElementToPngData,
  fetchUrlAsBlob,
  imgElementToPngData,
  type IExportImageData,
} from '../components/MdEditor/utils/chart/dom-to-png';
export {
  getMermaidSvg,
  svgElementToPngBlob,
  svgElementToPngData,
} from '../components/MdEditor/utils/chart/svg-to-image';
/** A4 内容区最大宽度（像素，96dpi） */
export declare const DOCX_CONTENT_MAX_WIDTH_PX: number;
export declare function scaleImageSize(
  width: number,
  height: number,
  maxWidth?: number,
): {
  width: number;
  height: number;
};
