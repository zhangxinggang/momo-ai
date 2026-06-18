import type { IChatAttachment } from '@momo/aichat';

const MAX_COUNT = 10;
const MAX_SINGLE = 10 * 1024 * 1024;

function getFileExtension(fileName: string): string {
  return (fileName.split('.').pop() || '').toLowerCase();
}

function buildUnsupportedAttachmentText(file: File): string {
  return `[附件 ${file.name}，大小 ${file.size} 字节，当前环境无法提取文本内容]`;
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

async function readFileText(
  file: File,
): Promise<{ text: string; snippet: string; imageBase64?: string }> {
  const ext = getFileExtension(file.name);
  const isImage = file.type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp'].includes(ext);

  if (isImage) {
    try {
      const imageBase64 = await fileToBase64(file);
      const snippet = `[图片附件 ${file.name}]`;
      return {
        text: snippet,
        snippet,
        imageBase64,
      };
    } catch {
      // 继续走占位提示
    }
  }

  if (typeof window !== 'undefined' && window.api?.aichat?.parseAttachment) {
    try {
      const base64 = await fileToBase64(file);
      const parsed = await window.api.aichat.parseAttachment({ base64, ext, mime: file.type });
      if (parsed?.text) {
        return { text: parsed.text, snippet: parsed.snippet || parsed.text.slice(0, 800) };
      }
    } catch {
      // 解析失败时继续走文本读取或占位提示
    }
  }

  if (
    file.type.startsWith('text/') ||
    ['txt', 'md', 'markdown', 'css', 'html', 'js', 'py', 'json', 'xml', 'csv'].includes(ext)
  ) {
    try {
      const text = await readTextFile(file);
      const snippet = text.length > 800 ? text.slice(0, 800) : text;
      return { text, snippet };
    } catch {
      // 继续走占位提示
    }
  }

  const placeholder = buildUnsupportedAttachmentText(file);
  return { text: placeholder, snippet: placeholder };
}

/** 校验本地附件大小与数量 */
export function validateChatAttachmentFiles(files: File[]) {
  if (files.length > MAX_COUNT) {
    return { ok: false, message: `单次最多上传 ${MAX_COUNT} 个文件` };
  }

  for (const file of files) {
    if (file.size > MAX_SINGLE) {
      return { ok: false, message: `${file.name} 超过 10MB 限制` };
    }
  }

  return { ok: true };
}

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
    const { text, snippet, imageBase64 } = await readFileText(file);
    onProgress?.(index, 100);

    results.push({
      id: createAttachmentId(),
      name: file.name,
      size: file.size,
      mime: file.type || '',
      ext,
      text,
      snippet,
      imageBase64,
    });
  }

  return results;
}
