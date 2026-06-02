export interface DMarkdownImageUploadResponse {
  url: string;
}

interface DUploadApiFilePayload {
  fileurl?: string;
  newFilename?: string;
  originalFilename?: string;
}

interface DUploadApiResponse {
  data: Record<string, DUploadApiFilePayload>;
}

let cachedUploadBaseUrl: string | null = null;

/**
 * 通过主进程 IPC 获取内置 HTTP 上传基址（@momo/electron getUploadUrl）
 */
async function getUploadBaseUrl(): Promise<string> {
  if (cachedUploadBaseUrl) {
    return cachedUploadBaseUrl;
  }

  if (typeof window === 'undefined' || !window.api?.system?.getUploadUrl) {
    throw new Error('当前环境不支持图片上传');
  }

  cachedUploadBaseUrl = await window.api.system.getUploadUrl();
  return cachedUploadBaseUrl;
}
/**
 * 上传 Markdown 编辑器图片
 */
export async function uploadMarkdownImage(file: File): Promise<DMarkdownImageUploadResponse> {
  const uploadBaseUrl = await getUploadBaseUrl();
  const form = new FormData();
  form.append('file', file);

  const response = await fetch(uploadBaseUrl, {
    method: 'POST',
    body: form,
  });
  if (!response.ok) {
    throw new Error(`图片上传失败 (${response.status})`);
  }

  const { data } = (await response.json()) as DUploadApiResponse;
  const uploadedFile = data.file;
  if (!uploadedFile?.fileurl) {
    throw new Error('上传响应缺少图片地址');
  }
  return { url: uploadedFile.fileurl };
}
