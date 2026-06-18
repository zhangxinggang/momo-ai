import { Document, Packer, convertMillimetersToTwip } from 'docx';

import { EXPORT_A4_PADDING_MM } from '../export-constants';
import { buildDocxChildrenFromPreview } from './blocks';

export { buildDocxChildrenFromPreview } from './blocks';

/** 将预览 DOM 打包为 DOCX Blob（浏览器端） */
export async function buildDocxBlobFromPreview(root: HTMLElement): Promise<Blob> {
  const children = await buildDocxChildrenFromPreview(root);
  const pageMargin = convertMillimetersToTwip(EXPORT_A4_PADDING_MM);
  const document = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: pageMargin,
              right: pageMargin,
              bottom: pageMargin,
              left: pageMargin,
            },
          },
        },
        children,
      },
    ],
  });
  return Packer.toBlob(document);
}
