import {
  AlignmentType,
  ExternalHyperlink,
  HeadingLevel,
  Paragraph,
  TextRun,
  type IParagraphOptions,
  type ParagraphChild,
} from 'docx';

import { HEADING_TAG_LEVEL } from './constants';

interface IInlineStyle {
  bold?: boolean;
  italics?: boolean;
  strike?: boolean;
  code?: boolean;
  underline?: boolean;
  highlight?: boolean;
  link?: boolean;
}

/** 段落默认左对齐，避免中英文混排时被均分拉伸 */
export function createParagraph(options: IParagraphOptions = {}): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    ...options,
  });
}

export function headingLevelFromTag(
  tagName: string,
): (typeof HeadingLevel)[keyof typeof HeadingLevel] | undefined {
  return HEADING_TAG_LEVEL[tagName];
}

function mergeInlineStyle(base: IInlineStyle, patch: Partial<IInlineStyle>): IInlineStyle {
  return { ...base, ...patch };
}

export function createTextRun(text: string, style: IInlineStyle = {}): TextRun {
  return new TextRun({
    text,
    bold: style.bold,
    italics: style.italics,
    strike: style.strike,
    underline: style.underline || style.link ? {} : undefined,
    highlight: style.highlight ? 'yellow' : undefined,
    color: style.link ? '0563C1' : undefined,
    font: style.code ? 'Consolas' : undefined,
    size: style.code ? 20 : undefined,
  });
}

export function buildInlineRuns(node: Node, style: IInlineStyle = {}): ParagraphChild[] {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? '';
    if (!text) {
      return [];
    }
    return [createTextRun(text, style)];
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return [];
  }

  const element = node as HTMLElement;
  const tag = element.tagName;

  if (tag === 'BR') {
    return [new TextRun({ break: 1 })];
  }

  if (tag === 'STRONG' || tag === 'B') {
    return Array.from(element.childNodes).flatMap((child) =>
      buildInlineRuns(child, mergeInlineStyle(style, { bold: true })),
    );
  }

  if (tag === 'EM' || tag === 'I') {
    return Array.from(element.childNodes).flatMap((child) =>
      buildInlineRuns(child, mergeInlineStyle(style, { italics: true })),
    );
  }

  if (tag === 'DEL' || tag === 'S' || tag === 'STRIKE') {
    return Array.from(element.childNodes).flatMap((child) =>
      buildInlineRuns(child, mergeInlineStyle(style, { strike: true })),
    );
  }

  if (tag === 'U') {
    return Array.from(element.childNodes).flatMap((child) =>
      buildInlineRuns(child, mergeInlineStyle(style, { underline: true })),
    );
  }

  if (tag === 'MARK') {
    return Array.from(element.childNodes).flatMap((child) =>
      buildInlineRuns(child, mergeInlineStyle(style, { highlight: true })),
    );
  }

  if (tag === 'CODE' && element.closest('pre') === null) {
    return Array.from(element.childNodes).flatMap((child) =>
      buildInlineRuns(child, mergeInlineStyle(style, { code: true })),
    );
  }

  if (tag === 'A') {
    const href = element.getAttribute('href') ?? '';
    const linkStyle = mergeInlineStyle(style, { link: true, underline: true });
    const linkRuns = Array.from(element.childNodes).flatMap((child) =>
      buildInlineRuns(child, linkStyle),
    );
    if (!href) {
      return linkRuns;
    }
    return [
      new ExternalHyperlink({
        link: href,
        children: linkRuns.length > 0 ? (linkRuns as TextRun[]) : [createTextRun(href, linkStyle)],
      }),
    ];
  }

  if (tag === 'IMG') {
    return [];
  }

  if (tag === 'INPUT' && element.getAttribute('type') === 'checkbox') {
    const checked = element.hasAttribute('checked');
    return [createTextRun(checked ? '☑ ' : '☐ ', style)];
  }

  if (tag === 'LABEL') {
    return [];
  }

  if (tag === 'SUP' || tag === 'SUB') {
    const content = element.textContent ?? '';
    return content ? [createTextRun(content, style)] : [];
  }

  return Array.from(element.childNodes).flatMap((child) => buildInlineRuns(child, style));
}

export function buildParagraphFromElement(
  element: HTMLElement,
  options: {
    heading?: (typeof HeadingLevel)[keyof typeof HeadingLevel];
    bullet?: boolean;
    indent?: number;
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
  } = {},
): Paragraph {
  const runs = Array.from(element.childNodes).flatMap((child) => buildInlineRuns(child));
  const children = runs.length > 0 ? runs : [new TextRun('')];

  return createParagraph({
    children,
    heading: options.heading,
    bullet: options.bullet ? { level: 0 } : undefined,
    indent: options.indent ? { left: options.indent } : undefined,
    alignment: options.alignment,
  });
}
