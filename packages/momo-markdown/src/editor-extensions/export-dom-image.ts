import { EXPORT_A4_PADDING_MM, EXPORT_A4_WIDTH_MM } from './export-constants';

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
export const DOCX_CONTENT_MAX_WIDTH_PX = Math.round(
  ((EXPORT_A4_WIDTH_MM - EXPORT_A4_PADDING_MM * 2) / 25.4) * 96,
);

/** 内容区宽度留 5% 余量，避免贴边溢出 */
const DOCX_IMAGE_MAX_WIDTH_PX = Math.round(DOCX_CONTENT_MAX_WIDTH_PX * 0.95);

export function scaleImageSize(
  width: number,
  height: number,
  maxWidth = DOCX_IMAGE_MAX_WIDTH_PX,
): { width: number; height: number } {
  if (width <= maxWidth || width <= 0 || height <= 0) {
    return { width: Math.max(width, 1), height: Math.max(height, 1) };
  }
  const ratio = maxWidth / width;
  return {
    width: maxWidth,
    height: Math.max(Math.round(height * ratio), 1),
  };
}
