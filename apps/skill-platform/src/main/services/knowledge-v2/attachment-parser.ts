import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { KnowledgeError } from './error';
import { parseKnowledgeFile } from './parser';

export interface IAttachmentParseInput {
  base64?: string;
  ext?: string;
  mime?: string;
}

const MIME_EXTENSIONS: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-word.document.macroenabled.12': '.docm',
  'application/vnd.ms-powerpoint': '.ppt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.oasis.opendocument.text': '.odt',
  'application/vnd.oasis.opendocument.spreadsheet': '.ods',
  'application/vnd.oasis.opendocument.presentation': '.odp',
  'text/plain': '.txt',
  'text/markdown': '.md',
  'text/csv': '.csv',
  'text/html': '.html',
  'application/json': '.json',
};

function attachmentExtension(input: IAttachmentParseInput): string {
  // Native and legacy callers use both "docx" and ".docx". Never read Office ZIP bytes as UTF-8.
  const ext = (input.ext || '').trim().toLowerCase();
  if (/^\.?[a-z0-9]+$/.test(ext)) return ext.startsWith('.') ? ext : '.' + ext;
  const mime = (input.mime || '').split(';')[0].trim().toLowerCase();
  return MIME_EXTENSIONS[mime] || '.txt';
}

export async function parseChatAttachment(
  input: IAttachmentParseInput,
): Promise<{ text: string; snippet: string }> {
  if (!input.base64?.trim()) {
    throw new KnowledgeError({
      code: 'ATTACHMENT_CONTENT_REQUIRED',
      stage: 'source',
      message: '附件缺少文件内容。',
      allowedManualActions: ['reimport'],
    });
  }
  const bytes = Buffer.from(input.base64, 'base64');
  if (!bytes.length || bytes.length > 100 * 1024 * 1024) {
    throw new KnowledgeError({
      code: bytes.length ? 'SOURCE_FILE_TOO_LARGE' : 'SOURCE_EMPTY',
      stage: 'source',
      message: bytes.length ? '附件超过 100MB 限制。' : '附件内容为空。',
      details: { size: bytes.length },
      allowedManualActions: ['reimport'],
    });
  }
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'aim-attachment-'));
  const filePath = path.join(directory, 'attachment' + attachmentExtension(input));
  try {
    await fs.writeFile(filePath, bytes);
    const document = await parseKnowledgeFile(filePath);
    return { text: document.content, snippet: document.content.slice(0, 1_000) };
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
}
