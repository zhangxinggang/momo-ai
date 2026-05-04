import type { IChatAttachment } from '@momo/aichat';

const MAX_COUNT = 10;
const MAX_SINGLE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['txt', 'md', 'docx', 'css', 'html', 'js', 'py'];

function getFileExtension(fileName: string): string {
  return (fileName.split('.').pop() || '').toLowerCase();
}

function createAttachmentId(): string {
  return `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error(`${file.name} 读取失败`));
    reader.readAsText(file);
  });
}

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

async function readFileText(file: File): Promise<{ text: string; snippet: string }> {
  const ext = getFileExtension(file.name);
  if (ext === 'docx') {
    const base64 = await fileToBase64(file);
    const parsed = await window.api.aichat.parseAttachment({ base64, ext, mime: file.type });
    if (!parsed?.text) {
      throw new Error(`${file.name} 解析失败`);
    }
    return { text: parsed.text, snippet: parsed.snippet || parsed.text.slice(0, 800) };
  }

  const text = await readTextFile(file);
  const snippet = text.length > 800 ? text.slice(0, 800) : text;
  return { text, snippet };
}

/** 校验本地附件类型与大小 */
export function validateChatAttachmentFiles(files: File[]) {
  if (files.length > MAX_COUNT) {
    return { ok: false, message: `单次最多上传 ${MAX_COUNT} 个文件` };
  }

  for (const file of files) {
    const ext = getFileExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return { ok: false, message: `不支持的文件类型: ${file.name}` };
    }
    if (file.size > MAX_SINGLE) {
      return { ok: false, message: `${file.name} 超过 10MB 限制` };
    }
  }

  return { ok: true };
};

/** 本地读取附件内容，无需 HTTP 上传服务 */
export async function uploadChatAttachmentFiles(
  files: File[],
  onProgress?: (index: number, percent: number) => void,
): Promise<IChatAttachment[]> {
  const results: IChatAttachment[] = [];

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    onProgress?.(index, 10);
    const ext = getFileExtension(file.name);
    const { text, snippet } = await readFileText(file);
    onProgress?.(index, 100);

    results.push({
      id: createAttachmentId(),
      name: file.name,
      size: file.size,
      mime: file.type || '',
      ext,
      text,
      snippet,
    });
  }

  return results;
};
