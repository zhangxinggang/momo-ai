import axios from 'axios';
import type { TUploadFilesFn, TValidateLocalFilesFn } from '../adapters/types';
import type { IChatAttachment } from '../types/chat';

export function createUploadFiles(apiBaseUrl: string): TUploadFilesFn {
  return async function uploadFiles(files, onProgress) {
    const results: IChatAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const form = new FormData();
      form.append('files', file);

      const resp = await axios.post(`${apiBaseUrl}/api/files/upload`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (!onProgress) return;
          const total = evt.total || 0;
          const loaded = evt.loaded || 0;
          const percent = total > 0 ? Math.round((loaded / total) * 100) : 0;
          onProgress(i, percent);
        },
      });

      const data = resp.data as {
        success?: boolean;
        files?: Array<IChatAttachment & { error?: string }>;
        message?: string;
      };

      if (data?.success && Array.isArray(data.files) && data.files.length > 0) {
        const one = data.files[0];
        if (one.error) {
          throw new Error(one.error);
        }
        results.push(one as IChatAttachment);
      } else {
        throw new Error(data?.message || '上传失败');
      }

      if (onProgress) onProgress(i, 100);
    }

    return results;
  };
}

export const validateLocalFiles: TValidateLocalFilesFn = (files) => {
  const MAX_COUNT = 10;
  const MAX_SINGLE = 10 * 1024 * 1024;
  const allowed = ['txt', 'md', 'docx', 'css', 'html', 'js', 'py'];

  if (files.length > MAX_COUNT) {
    return { ok: false, message: `单次最多上传 ${MAX_COUNT} 个文件` };
  }

  for (const f of files) {
    const name = f.name || '';
    const ext = (name.split('.').pop() || '').toLowerCase();
    if (!allowed.includes(ext)) {
      return { ok: false, message: `不支持的文件类型: ${name}` };
    }
    if (f.size > MAX_SINGLE) {
      return { ok: false, message: `${name} 超过 10MB 限制` };
    }
  }
  return { ok: true };
};
