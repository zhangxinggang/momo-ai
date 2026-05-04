/**
 * 文件文本提取：参考 RAG-ChatBot-main，PDF 使用 LangChain WebPDFLoader
 */

import mammoth from 'mammoth';

function sanitizeText(input: string, maxLen = 200000): { text: string; snippet: string } {
  if (!input) {
    return { text: '', snippet: '' };
  }
  let text = String(input)
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?|\u2028|\u2029/g, '\n')
    .replace(/\t/g, '  ')
    .replace(/\n{3,}/g, '\n\n');
  if (text.length > maxLen) {
    text = text.slice(0, maxLen);
  }
  const snippet = text.length > 800 ? text.slice(0, 800) : text;
  return { text, snippet };
}

/** PDF 解析：与 RAG-ChatBot-main 一致，使用 WebPDFLoader 按页加载 */
async function extractPdfText(buffer: Buffer): Promise<string> {
  const { WebPDFLoader } = await import('@langchain/community/document_loaders/web/pdf');
  const blob = new Blob([new Uint8Array(buffer)], { type: 'application/pdf' });
  const loader = new WebPDFLoader(blob);
  const docs = await loader.load();
  return docs.map((doc) => doc.pageContent).join('\n\n');
}

async function extractExcelText(buffer: Buffer): Promise<string> {
  const XLSX = await import('xlsx');
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheets: string[] = [];
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(sheet, { blankrows: false });
    if (csv.trim()) {
      sheets.push(`# ${sheetName}\n${csv}`);
    }
  }
  return sheets.join('\n\n');
}

export async function extractText(options: {
  buffer: Buffer;
  mime?: string;
  ext?: string;
}): Promise<{ text: string; snippet: string }> {
  const lowerExt = (options.ext || '').toLowerCase();
  const mime = options.mime || '';
  const buffer = options.buffer;

  if (
    lowerExt === 'txt' ||
    lowerExt === 'md' ||
    lowerExt === 'markdown' ||
    lowerExt === 'css' ||
    lowerExt === 'html' ||
    lowerExt === 'js' ||
    lowerExt === 'py' ||
    mime === 'text/plain' ||
    mime.startsWith('text/') ||
    mime === 'application/javascript' ||
    mime === 'text/javascript'
  ) {
    return sanitizeText(buffer.toString('utf8'));
  }

  if (
    lowerExt === 'docx' ||
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const { value } = await mammoth.extractRawText({ buffer });
    return sanitizeText(value || '');
  }

  if (lowerExt === 'pdf' || mime === 'application/pdf') {
    const text = await extractPdfText(buffer);
    return sanitizeText(text);
  }

  if (
    lowerExt === 'xlsx' ||
    lowerExt === 'xls' ||
    mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    mime === 'application/vnd.ms-excel'
  ) {
    const text = await extractExcelText(buffer);
    return sanitizeText(text);
  }

  throw new Error('不支持的文件类型');
}
