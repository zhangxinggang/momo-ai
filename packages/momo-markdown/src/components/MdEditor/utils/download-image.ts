/** 从 URL 推断下载文件名 */
export function resolveImageFileName(url: string): string {
  try {
    const pathname = new URL(url, window.location.href).pathname;
    const baseName = decodeURIComponent(pathname.split('/').pop() || '');

    if (baseName && /\.\w+$/.test(baseName)) {
      return baseName;
    }
  } catch {
    // 忽略无效 URL
  }

  const extMatch = url.match(/\.(png|jpe?g|gif|webp|svg|bmp|ico)(?:\?|#|$)/i);
  const ext = extMatch ? extMatch[1].toLowerCase() : 'png';

  return `image-${Date.now()}.${ext}`;
}

function triggerAnchorDownload(url: string, filename: string): void {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  const objectUrl = URL.createObjectURL(blob);
  triggerAnchorDownload(objectUrl, filename);
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
}

/** 下载图片到本地 */
export async function downloadImageFromUrl(url: string, filename?: string): Promise<void> {
  if (!url) {
    return;
  }

  const resolvedFilename = filename || resolveImageFileName(url);

  if (url.startsWith('blob:') || url.startsWith('data:')) {
    triggerAnchorDownload(url, resolvedFilename);
    return;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const blob = await response.blob();
    triggerBlobDownload(blob, resolvedFilename);
  } catch {
    triggerAnchorDownload(url, resolvedFilename);
  }
}
