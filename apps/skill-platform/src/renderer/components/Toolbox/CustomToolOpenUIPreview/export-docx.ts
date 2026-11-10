import {
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
  type FileChild,
} from 'docx';

function nodeText(node: Element): string {
  const value = (node as HTMLElement).innerText || node.textContent || '';
  return value.replace(/\r\n?/g, '\n').trim();
}

function paragraph(
  text: string,
  heading?: (typeof HeadingLevel)[keyof typeof HeadingLevel],
  bold = false,
) {
  const lines = text.split('\n');
  return new Paragraph({
    ...(heading ? { heading } : {}),
    spacing: { after: 120 },
    ...(heading ? { keepNext: true } : {}),
    children: lines.map(
      (line, index) =>
        new TextRun({
          text: line,
          bold: bold || Boolean(heading),
          ...(index > 0 ? { break: 1 } : {}),
        }),
    ),
  });
}

function tableBlock(element: HTMLTableElement): Table | null {
  const columnCount = Math.max(1, ...Array.from(element.rows).map((row) => row.cells.length));
  const columnWidth = Math.floor(9638 / columnCount);
  const rows = Array.from(element.rows)
    .map((row) => {
      const cells = Array.from(row.cells);
      if (!cells.length) return null;
      return new TableRow({
        ...(row.parentElement?.tagName === 'THEAD' ? { tableHeader: true } : {}),
        children: cells.map(
          (cell) =>
            new TableCell({
              width: { size: columnWidth, type: WidthType.DXA },
              verticalAlign: VerticalAlign.TOP,
              margins: { top: 100, bottom: 100, left: 120, right: 120 },
              shading: row.parentElement?.tagName === 'THEAD' ? { fill: 'F1F5F9' } : undefined,
              children: [
                paragraph(nodeText(cell), undefined, row.parentElement?.tagName === 'THEAD'),
              ],
            }),
        ),
      });
    })
    .filter((row): row is TableRow => row !== null);
  if (!rows.length) return null;
  const border = { style: BorderStyle.SINGLE, size: 1, color: 'D9DEE7' };
  return new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    columnWidths: Array(columnCount).fill(columnWidth),
    borders: {
      top: border,
      bottom: border,
      left: border,
      right: border,
      insideHorizontal: border,
      insideVertical: border,
    },
  });
}

function appendContent(element: Element, children: FileChild[]): void {
  const style = window.getComputedStyle(element);
  if (
    element.hasAttribute('hidden') ||
    element.getAttribute('aria-hidden') === 'true' ||
    style.display === 'none' ||
    style.visibility === 'hidden'
  ) {
    return;
  }
  if (
    element.matches(
      '[data-export-ignore], [aria-label^="文件："], [role="tablist"], button, input, textarea, select',
    )
  ) {
    return;
  }
  if (element.tagName === 'TABLE') {
    const table = tableBlock(element as HTMLTableElement);
    if (table) children.push(table);
    return;
  }
  if (/^(P|H[1-6]|LI)$/.test(element.tagName) || element.hasAttribute('data-emphasis')) {
    const text = nodeText(element);
    if (text) {
      const heading =
        element.hasAttribute('data-emphasis') && element.getAttribute('data-emphasis') === 'heading'
          ? HeadingLevel.HEADING_2
          : element.tagName === 'H1'
            ? HeadingLevel.HEADING_1
            : element.tagName === 'H2'
              ? HeadingLevel.HEADING_2
              : element.tagName === 'H3'
                ? HeadingLevel.HEADING_3
                : undefined;
      children.push(paragraph(text, heading));
    }
    return;
  }

  const directText = Array.from(element.childNodes)
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent ?? '')
    .join(' ')
    .trim();
  if (directText) children.push(paragraph(directText));
  for (const child of Array.from(element.children)) appendContent(child, children);
}

function safeDocxName(value: string): string {
  const base = value
    .trim()
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\.docx$/i, '');
  return `${base || '界面内容'}.docx`;
}

/** Build a consistently formatted Word document from a semantic export surface. */
export function createInterfaceDocx(surface: HTMLElement, fileName: string): Document {
  const children: FileChild[] = [];
  const heading = safeDocxName(fileName).replace(/\.docx$/i, '');
  children.push(paragraph(heading, HeadingLevel.TITLE));
  for (const child of Array.from(surface.children)) appendContent(child, children);
  if (children.length === 1) children.push(paragraph('当前界面没有可导出的文字或表格内容。'));

  return new Document({
    title: heading,
    styles: {
      default: {
        document: {
          run: {
            font: { ascii: 'Calibri', hAnsi: 'Calibri', eastAsia: 'Microsoft YaHei' },
            size: 21,
          },
          paragraph: { spacing: { after: 120, line: 300 } },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 },
          },
        },
        children,
      },
    ],
  });
}

export async function exportInterfaceToDocx(surface: HTMLElement, fileName: string): Promise<void> {
  const blob = await Packer.toBlob(createInterfaceDocx(surface, fileName));
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = safeDocxName(fileName);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
