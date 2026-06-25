import { ELoaderKind } from '../constants';
import type { ILangchainDocument } from '../types/document';
import type { ILoaderAdapter, IPdfLoaderInput } from '../types/loader';

/** PDF 加载器（WebPDFLoader，按页加载） */
export class PdfLoader implements ILoaderAdapter<IPdfLoaderInput> {
  readonly kind = ELoaderKind.EPdf;

  async load(input: IPdfLoaderInput): Promise<ILangchainDocument[]> {
    const { WebPDFLoader } = await import('@langchain/community/document_loaders/web/pdf');
    const blob = new Blob([new Uint8Array(input.buffer)], { type: 'application/pdf' });
    const loader = new WebPDFLoader(blob);
    const docs = await loader.load();
    return docs.map((doc) => ({
      pageContent: doc.pageContent,
      metadata: doc.metadata as Record<string, unknown> | undefined,
    }));
  }
}

/** 从 PDF Buffer 提取纯文本 */
export async function loadPdfText(buffer: Buffer): Promise<string> {
  const loader = new PdfLoader();
  const docs = await loader.load({ buffer });
  return docs.map((doc) => doc.pageContent).join('\n\n');
}
