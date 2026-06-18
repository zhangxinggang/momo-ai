export interface IExportImageData {
  data: Uint8Array;
  width: number;
  height: number;
}

export async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  const buffer = await blob.arrayBuffer();
  return new Uint8Array(buffer);
}

/** toBlob 在画布被跨域污染时会同步抛出 SecurityError */
export function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('PNG 转换失败'));
        }
      }, 'image/png');
    } catch (error) {
      reject(error instanceof Error ? error : new Error('PNG 转换失败'));
    }
  });
}

/** 拉取远程图片为 Blob（跨域需服务端允许 CORS） */
export async function fetchUrlAsBlob(url: string): Promise<Blob> {
  const response = await fetch(url, { mode: 'cors' });
  if (!response.ok) {
    throw new Error(`下载失败: ${response.status}`);
  }
  return response.blob();
}

/** 优先使用预览中的显示尺寸，避免按原始分辨率导出过大 */
function resolveImageExportSize(
  naturalWidth: number,
  naturalHeight: number,
  element: HTMLImageElement,
): { width: number; height: number } {
  const cssWidth = element.clientWidth;
  const cssHeight = element.clientHeight;
  if (cssWidth > 0 && cssHeight > 0 && naturalWidth > 0 && naturalHeight > 0) {
    if (cssWidth < naturalWidth) {
      return {
        width: cssWidth,
        height: Math.max(Math.round((naturalHeight * cssWidth) / naturalWidth), 1),
      };
    }
    return { width: cssWidth, height: cssHeight };
  }
  return {
    width: Math.max(naturalWidth, 1),
    height: Math.max(naturalHeight, 1),
  };
}

export async function canvasElementToPngData(canvas: HTMLCanvasElement): Promise<IExportImageData> {
  const cssWidth = Math.max(Math.round(canvas.clientWidth || 0), 1);
  const cssHeight = Math.max(Math.round(canvas.clientHeight || 0), 1);

  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = cssWidth;
  exportCanvas.height = cssHeight;
  const context = exportCanvas.getContext('2d');
  if (!context) {
    throw new Error('无法创建画布');
  }
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, cssWidth, cssHeight);
  context.drawImage(canvas, 0, 0, cssWidth, cssHeight);

  const blob = await canvasToPngBlob(exportCanvas);
  const data = await blobToUint8Array(blob);
  return { data, width: cssWidth, height: cssHeight };
}

export async function imgElementToPngData(img: HTMLImageElement): Promise<IExportImageData> {
  const naturalWidth = img.naturalWidth || img.width;
  const naturalHeight = img.naturalHeight || img.height;
  const exportSize = resolveImageExportSize(naturalWidth, naturalHeight, img);

  if (img.src.startsWith('data:') || img.src.startsWith('blob:')) {
    const response = await fetch(img.src);
    const blob = await response.blob();
    const data = await blobToUint8Array(blob);
    return { data, ...exportSize };
  }

  if (img.src.startsWith('http://') || img.src.startsWith('https://')) {
    try {
      const response = await fetch(img.src, { mode: 'cors' });
      if (response.ok) {
        const blob = await response.blob();
        const data = await blobToUint8Array(blob);
        return { data, ...exportSize };
      }
    } catch {
      // 回退到画布绘制
    }
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = naturalWidth;
      exportCanvas.height = naturalHeight;
      const context = exportCanvas.getContext('2d');
      if (!context) {
        reject(new Error('无法创建画布'));
        return;
      }
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, naturalWidth, naturalHeight);
      context.drawImage(image, 0, 0, naturalWidth, naturalHeight);
      void canvasToPngBlob(exportCanvas).then(resolve).catch(reject);
    };
    image.onerror = () => reject(new Error('图片加载失败'));
    image.src = img.src;
  });
  const data = await blobToUint8Array(blob);
  return { data, ...exportSize };
}
