import { prefix } from '~/config';

import { blobToUint8Array, canvasToPngBlob, type IExportImageData } from './dom-to-png';

export type { IExportImageData };

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('读取图片失败'));
    reader.readAsDataURL(blob);
  });
}

function getSvgImageHref(image: SVGImageElement): string | null {
  return image.getAttribute('href') || image.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
}

function setSvgImageHref(image: SVGImageElement, href: string): void {
  image.setAttribute('href', href);
  image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', href);
}

/** 将 SVG 内外部图片内联为 data URL，避免导出时画布被污染 */
async function inlineSvgExternalImages(svg: SVGSVGElement): Promise<void> {
  const tasks = Array.from(svg.querySelectorAll('image')).map(async (image) => {
    const href = getSvgImageHref(image);
    if (!href || href.startsWith('data:') || href.startsWith('blob:')) {
      return;
    }

    try {
      const response = await fetch(href, { mode: 'cors' });
      if (!response.ok) {
        image.remove();
        return;
      }
      const dataUrl = await blobToDataUrl(await response.blob());
      setSvgImageHref(image, dataUrl);
    } catch {
      image.remove();
    }
  });

  await Promise.all(tasks);
}

/** 提取 foreignObject 内文本，保留段落换行 */
function extractForeignObjectText(foreignObject: Element): string {
  const fragment = foreignObject.cloneNode(true) as Element;
  fragment.querySelectorAll('br').forEach((br) => {
    br.replaceWith(document.createTextNode('\n'));
  });

  const paragraphs = fragment.querySelectorAll('p');
  if (paragraphs.length > 0) {
    return Array.from(paragraphs)
      .map((paragraph) => paragraph.textContent?.trim() ?? '')
      .filter(Boolean)
      .join('\n');
  }

  return fragment.textContent?.trim() ?? '';
}

/** 读取 Mermaid 标签样式（优先 nodeLabel / edgeLabel） */
function readForeignObjectLabelStyle(sourceForeignObject: SVGForeignObjectElement | null): {
  fontSize: string;
  fill: string;
  fontFamily: string;
  fontWeight: string;
} {
  const fallback = {
    fontSize: '14px',
    fill: '#333333',
    fontFamily: 'sans-serif',
    fontWeight: 'normal',
  };

  if (!sourceForeignObject) {
    return fallback;
  }

  const labelElement =
    sourceForeignObject.querySelector('.nodeLabel, .edgeLabel, .label, span, p') ??
    sourceForeignObject;

  const computed = window.getComputedStyle(labelElement);
  return {
    fontSize: computed.fontSize || fallback.fontSize,
    fill: computed.color || computed.fill || fallback.fill,
    fontFamily: computed.fontFamily || fallback.fontFamily,
    fontWeight: computed.fontWeight || fallback.fontWeight,
  };
}

/**
 * Mermaid 流程图标签使用 foreignObject 承载 HTML，Image 栅格化时无法渲染。
 * 导出前将其替换为原生 SVG text，避免文字丢失。
 */
function replaceForeignObjectsWithSvgText(sourceSvg: SVGSVGElement, cloneSvg: SVGSVGElement): void {
  const sourceObjects = sourceSvg.querySelectorAll('foreignObject');
  const cloneObjects = Array.from(cloneSvg.querySelectorAll('foreignObject'));

  cloneObjects.forEach((cloneForeignObject, index) => {
    const sourceForeignObject = sourceObjects[index] ?? null;
    const text = extractForeignObjectText(cloneForeignObject);
    const parent = cloneForeignObject.parentNode;

    if (!text || !parent) {
      cloneForeignObject.remove();
      return;
    }

    const x = Number(cloneForeignObject.getAttribute('x') ?? 0);
    const y = Number(cloneForeignObject.getAttribute('y') ?? 0);
    const width = Number(cloneForeignObject.getAttribute('width') ?? 0);
    const height = Number(cloneForeignObject.getAttribute('height') ?? 0);
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const style = readForeignObjectLabelStyle(sourceForeignObject);

    const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textElement.setAttribute('x', String(centerX));
    textElement.setAttribute('y', String(centerY));
    textElement.setAttribute('text-anchor', 'middle');
    textElement.setAttribute('dominant-baseline', 'middle');
    textElement.setAttribute('fill', style.fill);
    textElement.setAttribute('font-size', style.fontSize);
    textElement.setAttribute('font-family', style.fontFamily);
    textElement.setAttribute('font-weight', style.fontWeight);

    const lines = text.split('\n').filter(Boolean);
    const fontSizePx = Number.parseFloat(style.fontSize) || 14;
    const lineHeight = fontSizePx * 1.2;

    if (lines.length <= 1) {
      textElement.textContent = text;
    } else {
      const startY = centerY - ((lines.length - 1) * lineHeight) / 2;
      lines.forEach((line, lineIndex) => {
        const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        tspan.setAttribute('x', String(centerX));
        tspan.setAttribute('y', String(startY + lineIndex * lineHeight));
        tspan.textContent = line;
        textElement.appendChild(tspan);
      });
    }

    parent.insertBefore(textElement, cloneForeignObject);
    cloneForeignObject.remove();
  });
}

/** 从 Mermaid 容器中提取图表 SVG（排除工具栏图标） */
export function getMermaidSvg(container: HTMLElement): SVGSVGElement | null {
  for (const svg of container.querySelectorAll<SVGSVGElement>('svg')) {
    if (!svg.closest(`.${prefix}-mermaid-action`)) {
      return svg;
    }
  }
  return null;
}

/** SVG 序列化为 base64 data URL 后栅格化为 PNG */
export async function svgElementToPngData(svg: SVGSVGElement): Promise<IExportImageData> {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  let width = 0;
  let height = 0;
  let offsetX = 0;
  let offsetY = 0;

  try {
    const bbox = svg.getBBox();
    width = bbox.width;
    height = bbox.height;
    offsetX = bbox.x;
    offsetY = bbox.y;
  } catch {
    // getBBox 不可用时回退属性
  }

  if (!width || !height) {
    width =
      svg.viewBox?.baseVal?.width || Number(svg.getAttribute('width')) || svg.clientWidth || 800;
    height =
      svg.viewBox?.baseVal?.height || Number(svg.getAttribute('height')) || svg.clientHeight || 600;
  }

  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height));
  clone.setAttribute('viewBox', `${offsetX} ${offsetY} ${width} ${height}`);
  if (!clone.getAttribute('xmlns')) {
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }

  replaceForeignObjectsWithSvgText(svg, clone);

  await inlineSvgExternalImages(clone);

  const svgString = new XMLSerializer().serializeToString(clone);
  const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;

  const pngBlob = await new Promise<Blob>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('无法创建画布'));
        return;
      }
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);
      void canvasToPngBlob(canvas).then(resolve).catch(reject);
    };
    image.onerror = () => reject(new Error('SVG 加载失败'));
    image.src = svgDataUrl;
  });

  const data = await blobToUint8Array(pngBlob);
  return { data, width, height };
}

/** SVG 转 PNG Blob（供图表下载等场景复用） */
export async function svgElementToPngBlob(svg: SVGSVGElement): Promise<Blob> {
  const { data } = await svgElementToPngData(svg);
  return new Blob([Uint8Array.from(data)], { type: 'image/png' });
}
