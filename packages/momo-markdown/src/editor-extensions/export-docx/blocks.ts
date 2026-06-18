import {
  AlignmentType,
  ImageRun,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  type FileChild,
} from 'docx';

import { buildPlantumlPngUrl } from '../../components/MdEditor/utils/plantuml-encoder';
import {
  blobToUint8Array,
  canvasElementToPngData,
  fetchUrlAsBlob,
  getMermaidSvg,
  imgElementToPngData,
  scaleImageSize,
  svgElementToPngData,
} from '../export-dom-image';
import {
  ECHARTS_CLASS,
  MERMAID_CLASS,
  PLANTUML_IMAGE_CLASS,
  PLANTUML_RENDERED_CLASS,
} from './constants';
import {
  buildInlineRuns,
  buildParagraphFromElement,
  createParagraph,
  createTextRun,
  headingLevelFromTag,
} from './inline';

async function buildImageParagraph(
  imagePromise: Promise<{ data: Uint8Array; width: number; height: number }>,
): Promise<Paragraph | null> {
  try {
    const image = await imagePromise;
    const size = scaleImageSize(image.width, image.height);
    return createParagraph({
      children: [
        new ImageRun({
          data: image.data,
          type: 'png',
          transformation: { width: size.width, height: size.height },
        }),
      ],
      spacing: { after: 120 },
    });
  } catch {
    return null;
  }
}

async function convertMermaidBlock(element: HTMLElement): Promise<Paragraph | null> {
  const svg = getMermaidSvg(element);
  if (!svg) {
    return null;
  }
  return buildImageParagraph(svgElementToPngData(svg));
}

async function convertEchartsBlock(element: HTMLElement): Promise<Paragraph | null> {
  const canvas = element.querySelector('canvas');
  if (!canvas) {
    return null;
  }
  return buildImageParagraph(canvasElementToPngData(canvas));
}

async function convertPlantumlBlock(element: HTMLElement): Promise<Paragraph | null> {
  const img = element.querySelector<HTMLImageElement>(`.${PLANTUML_IMAGE_CLASS}`);
  if (!img) {
    return null;
  }

  const encoded = element.dataset.encoded;
  if (encoded) {
    try {
      const blob = await fetchUrlAsBlob(buildPlantumlPngUrl(encoded));
      const data = await blobToUint8Array(blob);
      const width = img.naturalWidth || img.clientWidth || 800;
      const height = img.naturalHeight || img.clientHeight || 600;
      const size = scaleImageSize(width, height);
      return createParagraph({
        children: [
          new ImageRun({
            data,
            type: 'png',
            transformation: { width: size.width, height: size.height },
          }),
        ],
        spacing: { after: 120 },
      });
    } catch {
      // 远程 PNG 拉取失败时回退 img 元素导出
    }
  }

  return convertImageElement(img);
}

async function convertImageElement(img: HTMLImageElement): Promise<Paragraph | null> {
  if (!img.src) {
    return null;
  }
  return buildImageParagraph(imgElementToPngData(img));
}

async function convertFigure(element: HTMLElement): Promise<FileChild[]> {
  const img = element.querySelector('img');
  const caption = element.querySelector('figcaption');
  const blocks: FileChild[] = [];

  if (img) {
    const imageParagraph = await convertImageElement(img);
    if (imageParagraph) {
      blocks.push(imageParagraph);
    }
  }

  if (caption?.textContent?.trim()) {
    blocks.push(
      createParagraph({
        children: [new TextRun({ text: caption.textContent.trim(), italics: true })],
      }),
    );
  }

  return blocks;
}

async function convertTable(table: HTMLTableElement): Promise<Table> {
  const rows: TableRow[] = [];

  table.querySelectorAll('tr').forEach((tr) => {
    const cells: TableCell[] = [];
    tr.querySelectorAll('th, td').forEach((cell) => {
      const isHeader = cell.tagName === 'TH';
      const runs = Array.from(cell.childNodes).flatMap((child) =>
        buildInlineRuns(child, isHeader ? { bold: true } : {}),
      );
      cells.push(
        new TableCell({
          children: [
            createParagraph({
              children: runs.length > 0 ? runs : [new TextRun('')],
            }),
          ],
        }),
      );
    });
    if (cells.length > 0) {
      rows.push(new TableRow({ children: cells }));
    }
  });

  return new Table({ rows });
}

async function convertList(list: HTMLElement, level = 0): Promise<Paragraph[]> {
  const paragraphs: Paragraph[] = [];
  const isOrdered = list.tagName === 'OL';
  const listItems = list.querySelectorAll(':scope > li');
  let orderIndex = 0;

  for (const li of listItems) {
    const liElement = li as HTMLElement;
    const nestedLists = liElement.querySelectorAll(':scope > ul, :scope > ol');
    const clone = liElement.cloneNode(true) as HTMLElement;
    nestedLists.forEach((nested) => nested.remove());

    const runs = Array.from(clone.childNodes).flatMap((child) => buildInlineRuns(child));
    const prefix = isOrdered ? `${++orderIndex}. ` : undefined;
    paragraphs.push(
      createParagraph({
        children: [
          ...(prefix ? [createTextRun(prefix)] : []),
          ...(runs.length > 0 ? runs : [new TextRun('')]),
        ],
        bullet: isOrdered ? undefined : { level },
        indent: isOrdered ? { left: level * 360 } : undefined,
      }),
    );

    for (const nested of nestedLists) {
      paragraphs.push(...(await convertList(nested as HTMLElement, level + 1)));
    }
  }

  return paragraphs;
}

function isBlockElement(element: HTMLElement): boolean {
  const tag = element.tagName;
  return (
    tag === 'P' ||
    tag === 'H1' ||
    tag === 'H2' ||
    tag === 'H3' ||
    tag === 'H4' ||
    tag === 'H5' ||
    tag === 'H6' ||
    tag === 'PRE' ||
    tag === 'BLOCKQUOTE' ||
    tag === 'UL' ||
    tag === 'OL' ||
    tag === 'TABLE' ||
    tag === 'FIGURE' ||
    tag === 'HR' ||
    tag === 'DIV' ||
    element.classList.contains(MERMAID_CLASS) ||
    element.classList.contains(ECHARTS_CLASS) ||
    element.classList.contains(PLANTUML_RENDERED_CLASS)
  );
}

function hasBlockElementChild(element: HTMLElement): boolean {
  return Array.from(element.children).some(
    (child) => child.nodeType === Node.ELEMENT_NODE && isBlockElement(child as HTMLElement),
  );
}

function hasVisibleText(element: HTMLElement): boolean {
  return (element.textContent?.trim() ?? '') !== '';
}

/** 从 div 行内 style 解析段落缩进与对齐 */
function readDivParagraphOptions(element: HTMLElement): {
  indent?: number;
  alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
} {
  const style = element.getAttribute('style') ?? '';
  const options: {
    indent?: number;
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
  } = {};

  const indentMatch = style.match(/text-indent:\s*(\d+(?:\.\d+)?)\s*pt/i);
  if (indentMatch) {
    options.indent = Math.round(Number.parseFloat(indentMatch[1]) * 20);
  }

  if (/text-align:\s*right/i.test(style)) {
    options.alignment = AlignmentType.RIGHT;
  } else if (/text-align:\s*center/i.test(style)) {
    options.alignment = AlignmentType.CENTER;
  }

  return options;
}

async function convertBlock(element: HTMLElement): Promise<FileChild[]> {
  if (element.classList.contains(MERMAID_CLASS)) {
    const imageParagraph = await convertMermaidBlock(element);
    return imageParagraph ? [imageParagraph] : [];
  }

  if (element.classList.contains(ECHARTS_CLASS)) {
    const imageParagraph = await convertEchartsBlock(element);
    return imageParagraph ? [imageParagraph] : [];
  }

  if (element.classList.contains(PLANTUML_RENDERED_CLASS)) {
    const imageParagraph = await convertPlantumlBlock(element);
    return imageParagraph ? [imageParagraph] : [];
  }

  const tag = element.tagName;

  if (tag === 'FIGURE') {
    return convertFigure(element);
  }

  if (tag === 'TABLE') {
    return [await convertTable(element as HTMLTableElement)];
  }

  if (tag === 'UL' || tag === 'OL') {
    return convertList(element);
  }

  if (tag === 'PRE') {
    const code = element.textContent ?? '';
    return [
      createParagraph({
        children: [new TextRun({ text: code, font: 'Consolas', size: 20 })],
        spacing: { before: 120, after: 120 },
      }),
    ];
  }

  if (tag === 'BLOCKQUOTE') {
    const blocks: FileChild[] = [];
    element.querySelectorAll('p').forEach((p) => {
      blocks.push(buildParagraphFromElement(p, { indent: 720 }));
    });
    if (blocks.length === 0) {
      blocks.push(buildParagraphFromElement(element, { indent: 720 }));
    }
    return blocks;
  }

  if (tag === 'HR') {
    return [createParagraph({ children: [new TextRun('')] })];
  }

  if (tag === 'P' || tag.startsWith('H')) {
    const plantumlImg = element.querySelector<HTMLImageElement>(`.${PLANTUML_IMAGE_CLASS}`);
    if (plantumlImg) {
      const imageParagraph = await convertImageElement(plantumlImg);
      return imageParagraph ? [imageParagraph] : [];
    }

    const inlineImg = element.querySelector(':scope > img');
    if (inlineImg instanceof HTMLImageElement) {
      const imageParagraph = await convertImageElement(inlineImg);
      return imageParagraph ? [imageParagraph] : [];
    }

    return [
      buildParagraphFromElement(element, {
        heading: headingLevelFromTag(tag),
      }),
    ];
  }

  if (tag === 'DIV') {
    if (!hasBlockElementChild(element)) {
      const inlineImg = element.querySelector(':scope > img');
      if (inlineImg instanceof HTMLImageElement) {
        const imageParagraph = await convertImageElement(inlineImg);
        return imageParagraph ? [imageParagraph] : [];
      }
      if (!hasVisibleText(element)) {
        return [];
      }
      const divOptions = readDivParagraphOptions(element);
      return [
        buildParagraphFromElement(element, {
          indent: divOptions.indent,
          alignment: divOptions.alignment,
        }),
      ];
    }

    const blocks: FileChild[] = [];
    for (const child of Array.from(element.children)) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        blocks.push(...(await convertBlock(child as HTMLElement)));
      }
    }
    return blocks;
  }

  return [];
}

/** 将预览 DOM 转为 docx 段落与表格（浏览器端） */
export async function buildDocxChildrenFromPreview(root: HTMLElement): Promise<FileChild[]> {
  const children: FileChild[] = [];

  const nodes = root.children.length > 0 ? Array.from(root.children) : [root];

  for (const node of nodes) {
    if (node.nodeType !== Node.ELEMENT_NODE) {
      continue;
    }
    const element = node as HTMLElement;
    if (isBlockElement(element)) {
      children.push(...(await convertBlock(element)));
    } else {
      for (const child of Array.from(element.children)) {
        children.push(...(await convertBlock(child as HTMLElement)));
      }
    }
  }

  return children.length > 0 ? children : [createParagraph({ children: [new TextRun('')] })];
}
