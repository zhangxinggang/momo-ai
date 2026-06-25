import { ELoaderKind } from '../constants';
import { registerLoader } from '../core/factory';
import { PdfLoader } from './pdf';

registerLoader(ELoaderKind.EPdf, () => new PdfLoader());

export { loadPdfText, PdfLoader } from './pdf';
