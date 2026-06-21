import { AlignmentType, HeadingLevel, Paragraph, TextRun, type IParagraphOptions, type ParagraphChild } from 'docx';
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
export declare function createParagraph(options?: IParagraphOptions): Paragraph;
export declare function headingLevelFromTag(tagName: string): (typeof HeadingLevel)[keyof typeof HeadingLevel] | undefined;
export declare function createTextRun(text: string, style?: IInlineStyle): TextRun;
export declare function buildInlineRuns(node: Node, style?: IInlineStyle): ParagraphChild[];
export declare function buildParagraphFromElement(element: HTMLElement, options?: {
    heading?: (typeof HeadingLevel)[keyof typeof HeadingLevel];
    bullet?: boolean;
    indent?: number;
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
}): Paragraph;
export {};
