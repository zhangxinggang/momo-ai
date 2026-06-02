import copy2Clipboard from '@vavt/copy2clipboard';
import StrIcon from '~/components/Icon/Str';
import { prefix } from '~/config';
import { ICustomIcon } from '~/type';
import {
  canvasElementToPngData,
  fetchUrlAsBlob,
  imgElementToPngData,
} from '../../../../editor-extensions/export-dom-image';
import { buildPlantumlPngUrl } from '../plantuml-encoder';
import { svgElementToPngBlob } from './svg-to-image';

interface IDiagramMetrics {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

export interface IDiagramPanZoomHandle {
  cleanup: () => void;
  centerFit: () => void;
}

const diagramFullscreenCloseMap = new WeakMap<HTMLElement, () => void>();
const diagramActionBarCleanupMap = new WeakMap<HTMLElement, () => void>();
const diagramCopyTimers = new WeakMap<HTMLElement, number>();

const setDiagramFullscreenIcon = (
  span: HTMLElement | null,
  iconName: 'fullscreen' | 'fullscreen-exit',
  customIcon: ICustomIcon,
) => {
  if (!span) {
    return;
  }
  span.innerHTML = StrIcon(iconName, customIcon);
  span.title = iconName === 'fullscreen-exit' ? '退出全屏' : '全屏';
};

const ensureDiagramActionButton = (
  actionDiv: Element,
  className: string,
  iconName: keyof ICustomIcon,
  customIcon: ICustomIcon,
) => {
  let span = actionDiv.querySelector<HTMLElement>(`.${className}`);
  if (!span) {
    actionDiv.insertAdjacentHTML(
      'beforeend',
      `<span class="${className}">${StrIcon(iconName as any, customIcon)}</span>`,
    );
    span = actionDiv.querySelector<HTMLElement>(`.${className}`)!;
  }
  return span;
};

const handleDiagramCopy = (
  container: HTMLElement,
  copySpan: HTMLElement,
  customIcon: ICustomIcon,
) => {
  const previousTimer = diagramCopyTimers.get(container);
  if (previousTimer !== undefined) {
    window.clearTimeout(previousTimer);
  }
  void copy2Clipboard(container.dataset.content || '')
    .then(() => {
      copySpan.innerHTML = StrIcon('check', customIcon);
    })
    .catch(() => {
      copySpan.innerHTML = StrIcon('copy', customIcon);
    })
    .finally(() => {
      const timer = window.setTimeout(() => {
        copySpan.innerHTML = StrIcon('copy', customIcon);
      }, 1500);
      diagramCopyTimers.set(container, timer);
    });
};

const bindDiagramActionBarEvents = (
  container: HTMLElement,
  actionDiv: HTMLElement,
  options: { customIcon: ICustomIcon },
) => {
  diagramActionBarCleanupMap.get(actionDiv)?.();

  const copySpan = ensureDiagramActionButton(
    actionDiv,
    `${prefix}-mermaid-copy`,
    'copy',
    options.customIcon,
  );
  const fullscreenSpan = ensureDiagramActionButton(
    actionDiv,
    `${prefix}-mermaid-fullscreen`,
    'fullscreen',
    options.customIcon,
  );
  fullscreenSpan.title = '全屏';
  const downloadSpan = ensureDiagramActionButton(
    actionDiv,
    `${prefix}-mermaid-download`,
    'download',
    options.customIcon,
  );

  const onCopyClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    handleDiagramCopy(container, copySpan, options.customIcon);
  };

  const onFullscreenClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    toggleDiagramFullscreen(container, options);
  };

  const onDownloadClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    void downloadDiagramAsPng(container);
  };

  copySpan.addEventListener('click', onCopyClick);
  fullscreenSpan.addEventListener('click', onFullscreenClick);
  downloadSpan.addEventListener('click', onDownloadClick);

  const cleanup = () => {
    copySpan.removeEventListener('click', onCopyClick);
    fullscreenSpan.removeEventListener('click', onFullscreenClick);
    downloadSpan.removeEventListener('click', onDownloadClick);
  };
  diagramActionBarCleanupMap.set(actionDiv, cleanup);
};

const ensureDiagramActionBar = (container: HTMLElement, options: { customIcon: ICustomIcon }) => {
  let actionDiv = container.querySelector<HTMLElement>(`.${prefix}-mermaid-action`);
  if (!actionDiv) {
    container.insertAdjacentHTML('beforeend', `<div class="${prefix}-mermaid-action"></div>`);
    actionDiv = container.querySelector<HTMLElement>(`.${prefix}-mermaid-action`)!;
  }
  bindDiagramActionBarEvents(container, actionDiv, options);
  return actionDiv;
};

const DIAGRAM_CONTAINER_SELECTOR = `p.${prefix}-mermaid, .${prefix}-plantuml-rendered, div.${prefix}-echarts`;

const getDiagramVisualNode = (
  container: HTMLElement,
): HTMLElement | SVGSVGElement | HTMLCanvasElement | null => {
  const plantumlImg = container.querySelector<HTMLImageElement>(`img.${prefix}-plantuml-image`);
  if (plantumlImg) {
    return plantumlImg;
  }

  const echartsCanvas = container.querySelector<HTMLCanvasElement>('canvas');
  if (echartsCanvas && container.classList.contains(`${prefix}-echarts`)) {
    return echartsCanvas;
  }

  // 排除工具栏内嵌的 lucide 图标 svg，只取图表本体
  for (const svg of container.querySelectorAll<SVGSVGElement>('svg')) {
    if (!svg.closest(`.${prefix}-mermaid-action`)) {
      return svg;
    }
  }

  return null;
};

const findDiagramContainer = (target: EventTarget | null): HTMLElement | null => {
  if (!(target instanceof HTMLElement)) {
    return null;
  }
  return target.closest<HTMLElement>(DIAGRAM_CONTAINER_SELECTOR);
};

const findDiagramActionButton = (target: EventTarget | null): HTMLElement | null => {
  if (!(target instanceof HTMLElement)) {
    return null;
  }
  const actionSpan = target.closest<HTMLElement>(`.${prefix}-mermaid-action span`);
  if (!actionSpan) {
    return null;
  }
  const container = findDiagramContainer(actionSpan);
  if (!container) {
    return null;
  }
  return actionSpan;
};

/** 全屏 SVG 裁剪留白 */
const FULLSCREEN_SVG_PADDING = 16;

interface ISvgContentBBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

const tryReadSvgGraphicsBBox = (node: SVGGraphicsElement): ISvgContentBBox | null => {
  try {
    const bbox = node.getBBox();
    if (bbox.width > 0 && bbox.height > 0) {
      return { x: bbox.x, y: bbox.y, width: bbox.width, height: bbox.height };
    }
  } catch {
    // getBBox 在部分节点上不可用
  }
  return null;
};

/** 跳过与 viewBox 等大的背景矩形，避免全屏缩放按整块画布计算 */
const isSvgBackgroundRect = (rect: SVGRectElement, svg: SVGSVGElement): boolean => {
  const viewBox = svg.viewBox?.baseVal;
  if (!viewBox || viewBox.width <= 0 || viewBox.height <= 0) {
    return false;
  }

  const bbox = tryReadSvgGraphicsBBox(rect);
  if (!bbox) {
    return false;
  }

  const tolerance = 2;
  return (
    Math.abs(bbox.x - viewBox.x) <= tolerance &&
    Math.abs(bbox.y - viewBox.y) <= tolerance &&
    Math.abs(bbox.width - viewBox.width) <= tolerance &&
    Math.abs(bbox.height - viewBox.height) <= tolerance
  );
};

const mergeSvgContentBBox = (base: ISvgContentBBox, next: ISvgContentBBox): ISvgContentBBox => {
  const minX = Math.min(base.x, next.x);
  const minY = Math.min(base.y, next.y);
  const maxX = Math.max(base.x + base.width, next.x + next.width);
  const maxY = Math.max(base.y + base.height, next.y + next.height);
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

/** 读取 SVG 实际内容包围盒；mermaid 流程图克隆后 getBBox 常失败，优先量已渲染源节点 */
const readSvgContentBBox = (svg: SVGSVGElement): ISvgContentBBox | null => {
  const groupSelectors = ['g[id^="mermaid-"]', 'g.root', 'g.flowchart'];
  for (const selector of groupSelectors) {
    for (const group of svg.querySelectorAll<SVGGElement>(selector)) {
      if (group.closest('defs')) {
        continue;
      }
      const bbox = tryReadSvgGraphicsBBox(group);
      if (bbox) {
        return bbox;
      }
    }
  }

  let merged: ISvgContentBBox | null = null;
  const graphics = svg.querySelectorAll<SVGGraphicsElement>(
    'path, rect, circle, ellipse, line, polyline, polygon, text, foreignObject',
  );
  for (const element of graphics) {
    if (element.closest('defs')) {
      continue;
    }
    if (element instanceof SVGRectElement && isSvgBackgroundRect(element, svg)) {
      continue;
    }
    const bbox = tryReadSvgGraphicsBBox(element);
    if (!bbox) {
      continue;
    }
    merged = merged ? mergeSvgContentBBox(merged, bbox) : bbox;
  }
  if (merged) {
    return merged;
  }

  return tryReadSvgGraphicsBBox(svg);
};

/** 按实际内容收紧 viewBox，便于全屏居中与缩放 */
const prepareSvgForFullscreen = (svg: SVGSVGElement, sourceSvg?: SVGSVGElement): void => {
  svg.style.display = 'block';
  svg.style.maxWidth = 'none';
  svg.style.width = '';
  svg.style.height = '';
  svg.removeAttribute('preserveAspectRatio');

  const measureSource = sourceSvg ?? svg;
  const bbox = readSvgContentBBox(measureSource);
  if (bbox) {
    const pad = FULLSCREEN_SVG_PADDING;
    const x = bbox.x - pad;
    const y = bbox.y - pad;
    const width = bbox.width + pad * 2;
    const height = bbox.height + pad * 2;

    svg.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
    svg.setAttribute('width', String(width));
    svg.setAttribute('height', String(height));
    return;
  }

  const viewBox = measureSource.viewBox?.baseVal;
  if (viewBox && viewBox.width > 0 && viewBox.height > 0) {
    svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
    svg.setAttribute('width', String(viewBox.width));
    svg.setAttribute('height', String(viewBox.height));
  }
};

const readSvgLayoutSize = (svg: SVGSVGElement): { width: number; height: number } | null => {
  const attrWidth = Number(svg.getAttribute('width'));
  const attrHeight = Number(svg.getAttribute('height'));
  if (attrWidth > 0 && attrHeight > 0) {
    return { width: attrWidth, height: attrHeight };
  }

  const viewBox = svg.viewBox?.baseVal;
  if (viewBox && viewBox.width > 0 && viewBox.height > 0) {
    return { width: viewBox.width, height: viewBox.height };
  }

  const layoutWidth = svg.clientWidth || svg.getBoundingClientRect().width;
  const layoutHeight = svg.clientHeight || svg.getBoundingClientRect().height;
  if (layoutWidth > 0 && layoutHeight > 0) {
    return { width: layoutWidth, height: layoutHeight };
  }

  return null;
};

/** 克隆 PlantUML 图片并等待加载，避免全屏时 naturalWidth 为 0 */
const cloneDiagramImage = (source: HTMLImageElement): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.className = source.className;
    img.alt = source.alt || 'diagram';
    img.draggable = false;
    img.style.display = 'block';
    img.style.maxWidth = 'none';

    const applyLoadedImage = () => {
      const width = img.naturalWidth || source.naturalWidth;
      const height = img.naturalHeight || source.naturalHeight;
      if (width > 0) {
        img.width = width;
      }
      if (height > 0) {
        img.height = height;
      }
      resolve(img);
    };

    img.onload = applyLoadedImage;
    img.onerror = () => reject(new Error('图表图片加载失败'));
    img.src = source.currentSrc || source.src;

    if (img.complete) {
      applyLoadedImage();
    }
  });
};

const measureDiagramContent = (content: HTMLElement): IDiagramMetrics | null => {
  const svgNode =
    content instanceof SVGSVGElement
      ? content
      : content.firstElementChild instanceof SVGSVGElement
        ? content.firstElementChild
        : null;

  if (svgNode) {
    const layoutSize = readSvgLayoutSize(svgNode);
    if (layoutSize) {
      return {
        offsetX: 0,
        offsetY: 0,
        width: layoutSize.width,
        height: layoutSize.height,
      };
    }
  }

  const measureNode = svgNode ?? content.firstElementChild ?? content;

  if (measureNode instanceof HTMLImageElement) {
    const width = measureNode.naturalWidth || measureNode.width;
    const height = measureNode.naturalHeight || measureNode.height;
    if (width > 0 && height > 0) {
      return { offsetX: 0, offsetY: 0, width, height };
    }
  }

  const htmlChild = measureNode as HTMLElement;
  const width = htmlChild.offsetWidth || htmlChild.clientWidth;
  const height = htmlChild.offsetHeight || htmlChild.clientHeight;
  if (width > 0 && height > 0) {
    return { offsetX: 0, offsetY: 0, width, height };
  }

  const rect = htmlChild.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    return { offsetX: 0, offsetY: 0, width: rect.width, height: rect.height };
  }

  return null;
};

const scheduleDiagramCenterFit = (panZoom: IDiagramPanZoomHandle, prepare?: () => void) => {
  const runCenterFit = () => {
    prepare?.();
    panZoom.centerFit();
  };

  requestAnimationFrame(() => {
    runCenterFit();
    [50, 200, 500, 1000].forEach((delayMs) => {
      window.setTimeout(runCenterFit, delayMs);
    });
  });
};

const openDiagramFullscreen = (container: HTMLElement, options: { customIcon: ICustomIcon }) => {
  const visualNode = getDiagramVisualNode(container);
  if (!visualNode) {
    return;
  }

  const previewFullscreenSpan = container.querySelector<HTMLElement>(
    `.${prefix}-mermaid-fullscreen`,
  );

  const overlay = document.createElement('div');
  overlay.className = `${prefix}-chart-fullscreen-overlay`;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');

  const actionBar = document.createElement('div');
  actionBar.className = `${prefix}-mermaid-action ${prefix}-chart-fullscreen-action`;

  const copySpan = document.createElement('span');
  copySpan.className = `${prefix}-mermaid-copy`;
  copySpan.innerHTML = StrIcon('copy', options.customIcon);

  const exitSpan = document.createElement('span');
  exitSpan.className = `${prefix}-mermaid-fullscreen`;
  setDiagramFullscreenIcon(exitSpan, 'fullscreen-exit', options.customIcon);

  const downloadSpan = document.createElement('span');
  downloadSpan.className = `${prefix}-mermaid-download`;
  downloadSpan.innerHTML = StrIcon('download', options.customIcon);

  actionBar.append(copySpan, exitSpan, downloadSpan);

  const viewport = document.createElement('div');
  viewport.className = `${prefix}-chart-fullscreen-viewport`;

  const transformLayer = document.createElement('div');
  transformLayer.className = `${prefix}-chart-fullscreen-transform`;

  viewport.appendChild(transformLayer);
  overlay.append(actionBar, viewport);
  document.body.appendChild(overlay);

  const panZoom = bindDiagramPanZoom(viewport, transformLayer);

  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  container.dataset.chartFullscreen = 'true';
  setDiagramFullscreenIcon(previewFullscreenSpan, 'fullscreen-exit', options.customIcon);

  const closeOverlay = () => {
    panZoom.cleanup();
    overlay.remove();
    document.body.style.overflow = previousOverflow;
    document.removeEventListener('keydown', onKeydown);
    copySpan.removeEventListener('click', onCopyClick);
    exitSpan.removeEventListener('click', onExitClick);
    downloadSpan.removeEventListener('click', onDownloadClick);
    container.removeAttribute('data-chart-fullscreen');
    diagramFullscreenCloseMap.delete(container);
    setDiagramFullscreenIcon(previewFullscreenSpan, 'fullscreen', options.customIcon);
  };

  diagramFullscreenCloseMap.set(container, closeOverlay);

  const mountVisualNode = async () => {
    try {
      if (visualNode instanceof HTMLImageElement) {
        const img = await cloneDiagramImage(visualNode);
        transformLayer.appendChild(img);
      } else if (visualNode instanceof HTMLCanvasElement) {
        const img = document.createElement('img');
        img.src = visualNode.toDataURL('image/png');
        img.alt = 'chart';
        transformLayer.appendChild(img);
      } else {
        const clonedNode = visualNode.cloneNode(true) as SVGSVGElement;
        transformLayer.appendChild(clonedNode);
        const sourceSvg = visualNode as SVGSVGElement;
        scheduleDiagramCenterFit(panZoom, () => {
          prepareSvgForFullscreen(clonedNode, sourceSvg);
        });
        return;
      }
      scheduleDiagramCenterFit(panZoom);
    } catch {
      closeOverlay();
    }
  };

  const onCopyClick = (event: MouseEvent) => {
    event.stopPropagation();
    handleDiagramCopy(container, copySpan, options.customIcon);
  };

  const onExitClick = (event: MouseEvent) => {
    event.stopPropagation();
    closeOverlay();
  };

  const onDownloadClick = (event: MouseEvent) => {
    event.stopPropagation();
    void downloadDiagramAsPng(container);
  };

  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeOverlay();
    }
  };

  copySpan.addEventListener('click', onCopyClick);
  exitSpan.addEventListener('click', onExitClick);
  downloadSpan.addEventListener('click', onDownloadClick);
  document.addEventListener('keydown', onKeydown);

  void mountVisualNode();
};

const toggleDiagramFullscreen = (container: HTMLElement, options: { customIcon: ICustomIcon }) => {
  const closeHandler = diagramFullscreenCloseMap.get(container);
  if (closeHandler) {
    closeHandler();
    return;
  }
  openDiagramFullscreen(container, options);
};

/**
 * 为图表容器绑定拖拽移动与滚轮缩放
 */
export const bindDiagramPanZoom = (
  viewport: HTMLElement,
  content: HTMLElement,
): IDiagramPanZoomHandle => {
  let scale = 1;
  let posX = 0;
  let posY = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let initialDistance = 0;
  let initialScale = 1;

  const updateTransform = () => {
    content.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
  };

  const centerFit = () => {
    const metrics = measureDiagramContent(content);
    if (!metrics) {
      return;
    }

    const { width, height } = metrics;
    const viewportWidth = viewport.clientWidth;
    const viewportHeight = viewport.clientHeight;
    if (viewportWidth <= 0 || viewportHeight <= 0) {
      return;
    }

    const fitScale = Math.min((viewportWidth * 0.92) / width, (viewportHeight * 0.92) / height);

    scale = fitScale;
    posX = (viewportWidth - width * scale) / 2;
    posY = (viewportHeight - height * scale) / 2;
    updateTransform();
  };

  const onTouchStart = (event: TouchEvent) => {
    if (event.touches.length === 1) {
      isDragging = true;
      startX = event.touches[0].clientX - posX;
      startY = event.touches[0].clientY - posY;
    } else if (event.touches.length === 2) {
      initialDistance = Math.hypot(
        event.touches[0].clientX - event.touches[1].clientX,
        event.touches[0].clientY - event.touches[1].clientY,
      );
      initialScale = scale;
    }
  };

  const onTouchMove = (event: TouchEvent) => {
    event.preventDefault();

    if (isDragging && event.touches.length === 1) {
      posX = event.touches[0].clientX - startX;
      posY = event.touches[0].clientY - startY;
      updateTransform();
    } else if (event.touches.length === 2) {
      const newDistance = Math.hypot(
        event.touches[0].clientX - event.touches[1].clientX,
        event.touches[0].clientY - event.touches[1].clientY,
      );
      const scaleChange = newDistance / initialDistance;
      const previousScale = scale;
      scale = initialScale * (1 + (scaleChange - 1));

      const centerX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
      const centerY = (event.touches[0].clientY + event.touches[1].clientY) / 2;
      const rect = content.getBoundingClientRect();
      const relativeX = (centerX - rect.left) / previousScale;
      const relativeY = (centerY - rect.top) / previousScale;

      posX -= relativeX * (scale - previousScale);
      posY -= relativeY * (scale - previousScale);
      updateTransform();
    }
  };

  const onTouchEnd = () => {
    isDragging = false;
  };

  const onWheel = (event: WheelEvent) => {
    event.preventDefault();
    const scaleAmount = 0.08;
    const previousScale = scale;

    if (event.deltaY < 0) {
      scale += scaleAmount;
    } else {
      scale = Math.max(0.1, scale - scaleAmount);
    }

    const rect = content.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    posX -= (mouseX / previousScale) * (scale - previousScale);
    posY -= (mouseY / previousScale) * (scale - previousScale);
    updateTransform();
  };

  const onMouseDown = (event: MouseEvent) => {
    if (event.button !== 0) {
      return;
    }
    isDragging = true;
    viewport.style.cursor = 'grabbing';
    startX = event.clientX - posX;
    startY = event.clientY - posY;
  };

  const onMouseMove = (event: MouseEvent) => {
    if (isDragging) {
      posX = event.clientX - startX;
      posY = event.clientY - startY;
      updateTransform();
    }
  };

  const onMouseUp = () => {
    isDragging = false;
    viewport.style.cursor = 'grab';
  };

  viewport.style.cursor = 'grab';
  viewport.addEventListener('touchstart', onTouchStart, { passive: false });
  viewport.addEventListener('touchmove', onTouchMove, { passive: false });
  viewport.addEventListener('touchend', onTouchEnd);
  viewport.addEventListener('wheel', onWheel, { passive: false, capture: true });
  viewport.addEventListener('mousedown', onMouseDown);
  viewport.addEventListener('mousemove', onMouseMove);
  viewport.addEventListener('mouseup', onMouseUp);
  viewport.addEventListener('mouseleave', onMouseUp);
  content.addEventListener('wheel', onWheel, { passive: false, capture: true });

  return {
    cleanup: () => {
      viewport.removeEventListener('touchstart', onTouchStart);
      viewport.removeEventListener('touchmove', onTouchMove);
      viewport.removeEventListener('touchend', onTouchEnd);
      viewport.removeEventListener('wheel', onWheel, true);
      viewport.removeEventListener('mousedown', onMouseDown);
      viewport.removeEventListener('mousemove', onMouseMove);
      viewport.removeEventListener('mouseup', onMouseUp);
      viewport.removeEventListener('mouseleave', onMouseUp);
      content.removeEventListener('wheel', onWheel, true);
      viewport.style.cursor = '';
      content.style.transform = '';
    },
    centerFit,
  };
};

const downloadBlobAsFile = (blob: Blob, filename: string) => {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
};

/** 下载远程或本地 URL 对应文件，优先 fetch 为 Blob 再触发保存，避免打开新窗口 */
const downloadUrlAsFile = async (url: string, filename: string) => {
  if (url.startsWith('blob:') || url.startsWith('data:')) {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = 'noopener';
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    return;
  }

  try {
    const blob = await fetchUrlAsBlob(url);
    downloadBlobAsFile(blob, filename);
  } catch {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = 'noopener';
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }
};

const downloadDiagramAsPng = async (container: HTMLElement) => {
  const encoded = container.dataset.encoded;
  if (encoded) {
    await downloadUrlAsFile(buildPlantumlPngUrl(encoded), 'plantuml-chart.png');
    return;
  }

  const visualNode = getDiagramVisualNode(container);
  if (!visualNode) {
    return;
  }

  try {
    let blob: Blob;
    if (visualNode instanceof SVGSVGElement) {
      blob = await svgElementToPngBlob(visualNode);
    } else if (visualNode instanceof HTMLCanvasElement) {
      const pngData = await canvasElementToPngData(visualNode);
      blob = new Blob([Uint8Array.from(pngData.data)], { type: 'image/png' });
    } else if (visualNode instanceof HTMLImageElement) {
      const pngData = await imgElementToPngData(visualNode);
      blob = new Blob([Uint8Array.from(pngData.data)], { type: 'image/png' });
    } else {
      return;
    }
    downloadBlobAsFile(blob, 'diagram.png');
  } catch {
    if (visualNode instanceof HTMLImageElement && visualNode.src) {
      const pngUrl = visualNode.src.replace('/svg/', '/png/');
      await downloadUrlAsFile(pngUrl, 'plantuml-chart.png');
    }
  }
};

/** 为图表容器挂载操作栏（复制 / 全屏 / 下载） */
export const prepareDiagramActionBars = (
  containers: NodeListOf<HTMLElement> | undefined,
  options: { customIcon: ICustomIcon },
) => {
  containers?.forEach((container) => {
    ensureDiagramActionBar(container, options);
  });
};

/**
 * 在预览根节点上委托图表操作事件（兼容旧逻辑；主要交互由操作栏直接绑定）
 */
export const bindDiagramActionsDelegation = (
  root: HTMLElement | null | undefined,
  options: { customIcon: ICustomIcon },
) => {
  if (!root) {
    return () => {};
  }

  const onClick = (event: MouseEvent) => {
    const actionSpan = findDiagramActionButton(event.target);
    if (!actionSpan || !root.contains(actionSpan)) {
      return;
    }

    const container = findDiagramContainer(actionSpan);
    if (!container) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (actionSpan.classList.contains(`${prefix}-mermaid-copy`)) {
      handleDiagramCopy(container, actionSpan, options.customIcon);
      return;
    }

    if (actionSpan.classList.contains(`${prefix}-mermaid-fullscreen`)) {
      toggleDiagramFullscreen(container, options);
      return;
    }

    if (actionSpan.classList.contains(`${prefix}-mermaid-download`)) {
      void downloadDiagramAsPng(container);
    }
  };

  root.addEventListener('click', onClick, true);
  return () => {
    root.removeEventListener('click', onClick, true);
  };
};

/**
 * mermaid / plantuml / echarts 操作栏挂载（事件由 bindDiagramActionsDelegation 统一处理）
 */
export const copyMermaid = (
  containers: NodeListOf<HTMLElement> | undefined,
  options: { customIcon: ICustomIcon },
) => {
  prepareDiagramActionBars(containers, options);
  return () => {
    containers?.forEach((container) => {
      const closeHandler = diagramFullscreenCloseMap.get(container);
      closeHandler?.();
    });
  };
};

/**
 * 缩放、拖拽 mermaid 模块
 */
export const zoomMermaid = (() => {
  const handler = (
    containers: NodeListOf<HTMLElement> | undefined,
    options: { customIcon: ICustomIcon },
  ) => {
    const removeEventsMap = new Map<
      HTMLElement,
      { removeEvent?: () => void; removeClick?: () => void }
    >();

    containers?.forEach((mm) => {
      const actionDiv = ensureDiagramActionBar(mm, options);
      ensureDiagramActionButton(actionDiv, `${prefix}-mermaid-zoom`, 'pin-off', options.customIcon);
      const zoomSpan = actionDiv.querySelector<HTMLElement>(`.${prefix}-mermaid-zoom`)!;

      const onClick = () => {
        const current = removeEventsMap.get(mm);
        const visualNode = getDiagramVisualNode(mm);

        if (!visualNode) {
          return;
        }

        if (current?.removeEvent) {
          current.removeEvent();
          mm.removeAttribute('data-grab');
          removeEventsMap.set(mm, { removeClick: current.removeClick });
          zoomSpan.innerHTML = StrIcon('pin-off', options.customIcon);
        } else {
          const { cleanup } = bindDiagramPanZoom(mm, visualNode as HTMLElement);
          mm.setAttribute('data-grab', '');
          removeEventsMap.set(mm, { removeEvent: cleanup, removeClick: current?.removeClick });
          zoomSpan.innerHTML = StrIcon('pin', options.customIcon);
        }
      };

      zoomSpan.addEventListener('click', onClick);
      removeEventsMap.set(mm, {
        removeClick: () => zoomSpan.removeEventListener('click', onClick),
      });
    });

    return () => {
      removeEventsMap.forEach(({ removeEvent, removeClick }) => {
        removeEvent?.();
        removeClick?.();
      });
      removeEventsMap.clear();
    };
  };

  return handler;
})();
