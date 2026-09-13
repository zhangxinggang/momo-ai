import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

import {
  ElementType,
  ExtractInputKind,
  OutputFormat,
  ResultFormat,
  extract,
  type ExtractedDocument,
  type ProcessingWarning,
} from '@xberg-io/xberg';

import { KnowledgeError, toKnowledgeError } from './error';

export type ECanonicalElementType = 'heading' | 'paragraph' | 'list' | 'table' | 'code' | 'page';

export interface ICanonicalElement {
  id: string;
  type: ECanonicalElementType;
  text: string;
  headingPath: string[];
  page?: number;
  pageEnd?: number;
  sheet?: string;
  cellRange?: string;
  startLine?: number;
  endLine?: number;
}

export interface ICanonicalDocument {
  parserId: 'momo-text-v2' | 'xberg-v1';
  parserVersion: string;
  mime: string;
  title: string;
  content: string;
  contentHash: string;
  qualityScore: number;
  notices: string[];
  counts: { pages: number; tables: number; images: number; elements: number };
  elements: ICanonicalElement[];
}

const TEXT_EXTENSIONS = new Set([
  '.txt',
  '.md',
  '.markdown',
  '.csv',
  '.json',
  '.jsonl',
  '.yaml',
  '.yml',
  '.xml',
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.py',
  '.java',
  '.go',
  '.rs',
  '.c',
  '.h',
  '.cpp',
  '.hpp',
  '.cs',
  '.sql',
  '.sh',
  '.ps1',
  '.toml',
  '.ini',
  '.properties',
]);

const XBERG_EXTENSIONS = new Set([
  '.pdf',
  '.doc',
  '.docx',
  '.docm',
  '.ppt',
  '.pptx',
  '.xls',
  '.xlsx',
  '.odt',
  '.ods',
  '.odp',
  '.html',
  '.htm',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.tif',
  '.tiff',
  '.bmp',
]);

export function isSupportedKnowledgeFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return TEXT_EXTENSIONS.has(ext) || XBERG_EXTENSIONS.has(ext);
}

function normalizeText(value: string): string {
  return value
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?|\u2028|\u2029/g, '\n')
    .replace(/[\t\u00a0]+/g, ' ')
    .replace(/[ ]+\n/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
}

function hash(value: string | Buffer): string {
  return createHash('sha256').update(value).digest('hex');
}

export function inferMime(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const byExt: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.csv': 'text/csv',
    '.html': 'text/html',
    '.htm': 'text/html',
    '.json': 'application/json',
    '.yaml': 'application/yaml',
    '.yml': 'application/yaml',
    '.xml': 'application/xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.tif': 'image/tiff',
    '.tiff': 'image/tiff',
  };
  return byExt[ext] || (TEXT_EXTENSIONS.has(ext) ? 'text/plain' : 'application/octet-stream');
}

function markdownElements(content: string): ICanonicalElement[] {
  const lines = content.split('\n');
  const headingPath: string[] = [];
  const elements: ICanonicalElement[] = [];
  let buffer: string[] = [];
  let startLine = 1;
  let inCode = false;

  const flush = (endLine: number, type: ECanonicalElementType = inCode ? 'code' : 'paragraph') => {
    const text = buffer.join('\n').trim();
    if (text) {
      elements.push({
        id: hash(`${elements.length}:${text}`).slice(0, 24),
        type,
        text,
        headingPath: [...headingPath],
        startLine,
        endLine,
      });
    }
    buffer = [];
  };

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const heading = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
    if (!inCode && heading) {
      flush(lineNumber - 1);
      const level = heading[1].length;
      headingPath.splice(level - 1);
      headingPath[level - 1] = heading[2].trim();
      elements.push({
        id: hash(`${elements.length}:${line}`).slice(0, 24),
        type: 'heading',
        text: heading[2].trim(),
        headingPath: [...headingPath],
        startLine: lineNumber,
        endLine: lineNumber,
      });
      startLine = lineNumber + 1;
      return;
    }
    if (/^```/.test(line.trim())) {
      if (!inCode) {
        flush(lineNumber - 1);
        inCode = true;
        startLine = lineNumber;
      }
      buffer.push(line);
      if (inCode && buffer.length > 1 && /^```/.test(line.trim())) {
        flush(lineNumber, 'code');
        inCode = false;
        startLine = lineNumber + 1;
      }
      return;
    }
    if (!inCode && !line.trim()) {
      flush(lineNumber - 1);
      startLine = lineNumber + 1;
      return;
    }
    if (!buffer.length) startLine = lineNumber;
    buffer.push(line);
  });
  flush(lines.length);
  return elements;
}

function canonicalElementType(type: ElementType): ECanonicalElementType {
  if (type === ElementType.Heading || type === ElementType.Title) return 'heading';
  if (type === ElementType.ListItem) return 'list';
  if (type === ElementType.Table) return 'table';
  if (type === ElementType.CodeBlock) return 'code';
  if (type === ElementType.PageBreak) return 'page';
  return 'paragraph';
}

function xbergElements(result: ExtractedDocument, content: string): ICanonicalElement[] {
  const sheetByPage = new Map(
    (result.pages || [])
      .filter((page) => page.sheetName)
      .map((page) => [page.pageNumber, page.sheetName] as const),
  );
  if (result.elements?.length) {
    let headingPath: string[] = [];
    return result.elements.flatMap((element, index) => {
      const text = normalizeText(element.text || '');
      if (!text) return [];
      const type = canonicalElementType(element.elementType);
      if (type === 'heading') headingPath = [text];
      const page = element.metadata.pageNumber;
      return [
        {
          id: hash(String(element.metadata.elementIndex ?? index) + ':' + text).slice(0, 24),
          type,
          text,
          headingPath: [...headingPath],
          page,
          pageEnd: page,
          sheet: page ? sheetByPage.get(page) : undefined,
        } satisfies ICanonicalElement,
      ];
    });
  }

  if (result.pages?.length) {
    return result.pages.flatMap((page) =>
      markdownElements(normalizeText(page.content || '')).map((element) => ({
        ...element,
        id: hash(String(page.pageNumber) + ':' + element.id).slice(0, 24),
        page: page.pageNumber,
        pageEnd: page.pageNumber,
        sheet: page.sheetName,
      })),
    );
  }
  return markdownElements(content);
}

function warningText(warning: ProcessingWarning): string {
  if (typeof warning === 'string') return warning;
  try {
    return JSON.stringify(warning);
  } catch {
    return String(warning);
  }
}

function assertQuality(content: string, pages: number, forceOcr: boolean): number {
  if (!content.trim()) {
    throw new KnowledgeError({
      code: pages > 0 && !forceOcr ? 'OCR_REQUIRED' : 'PARSE_EMPTY',
      stage: 'parse',
      message:
        pages > 0 && !forceOcr
          ? '文档没有可用文本，请安装并启用 OCR 后手动重试'
          : '解析器未提取到可用文本，请检查文件后手动重试',
      allowedManualActions: ['install_component', 'reconfigure', 'reimport', 'open_logs'],
    });
  }
  const replacementRatio = (content.match(/\uFFFD/g) || []).length / Math.max(1, content.length);
  if (replacementRatio > 0.02) {
    throw new KnowledgeError({
      code: 'PARSE_QUALITY_TOO_LOW',
      stage: 'parse',
      message: '解析结果乱码比例过高，请更换源文件或调整解析配置后手动重试',
      details: { replacementRatio },
      allowedManualActions: ['reconfigure', 'reimport', 'open_logs'],
    });
  }
  return Math.max(0, 1 - replacementRatio * 10);
}

async function parseTextFile(filePath: string): Promise<ICanonicalDocument> {
  const content = normalizeText(await fs.readFile(filePath, 'utf8'));
  const qualityScore = assertQuality(content, 0, false);
  const elements = markdownElements(content);
  return {
    parserId: 'momo-text-v2',
    parserVersion: '2.0.0',
    mime: inferMime(filePath),
    title: path.basename(filePath),
    content,
    contentHash: hash(content),
    qualityScore,
    notices: [],
    counts: { pages: 0, tables: 0, images: 0, elements: elements.length },
    elements,
  };
}

async function parseWithXberg(filePath: string, forceOcr: boolean): Promise<ICanonicalDocument> {
  try {
    const output = await extract(
      {
        kind: ExtractInputKind.Uri,
        uri: filePath,
        filename: path.basename(filePath),
        mimeType: inferMime(filePath),
      },
      {
        outputFormat: OutputFormat.Markdown,
        resultFormat: ResultFormat.ElementBased,
        pages: { extractPages: true, insertPageMarkers: false },
        includeDocumentStructure: true,
        tableAnchors: true,
        escapeMarkdown: false,
        forceOcr,
        enableQualityProcessing: true,
        extractionTimeoutSecs: 180,
      },
    );
    const result = output.results?.[0];
    if (!result) {
      throw new Error('Xberg 未返回解析结果');
    }
    const content = normalizeText(result.content || '');
    const counts = result.counts || { pages: 0, tables: 0, images: 0 };
    const pages = Number(counts.pages || 0);
    const calculatedQuality = assertQuality(content, pages, forceOcr);
    const reportedQuality = Number(result.qualityScore);
    const qualityScore = Number.isFinite(reportedQuality)
      ? Math.min(calculatedQuality, reportedQuality)
      : calculatedQuality;
    const elements = xbergElements(result, content).map((element) => ({
      ...element,
      page: pages === 1 ? 1 : element.page,
      pageEnd: pages === 1 ? 1 : element.pageEnd,
    }));
    if (!elements.length) {
      throw new KnowledgeError({
        code: 'PARSE_ELEMENTS_EMPTY',
        stage: 'parse',
        message: '解析器返回了正文，但没有生成可定位的文档元素。',
        allowedManualActions: ['reconfigure', 'reimport', 'open_logs'],
      });
    }
    const warnings = result.processingWarnings || [];
    return {
      parserId: 'xberg-v1',
      parserVersion: '1',
      mime: result.mimeType || inferMime(filePath),
      title:
        String((result.metadata as Record<string, unknown> | undefined)?.title || '').trim() ||
        path.basename(filePath),
      content,
      contentHash: hash(content),
      qualityScore,
      notices: warnings.map(warningText),
      counts: {
        pages,
        tables: Number(counts.tables || 0),
        images: Number(counts.images || 0),
        elements: elements.length,
      },
      elements,
    };
  } catch (error) {
    throw toKnowledgeError(error, {
      code: 'XBERG_PARSE_FAILED',
      stage: 'parse',
      details: { filePath },
      allowedManualActions: ['install_component', 'reconfigure', 'reimport', 'open_logs'],
    });
  }
}

export async function parseKnowledgeFile(
  filePath: string,
  options: { forceOcr?: boolean } = {},
): Promise<ICanonicalDocument> {
  const ext = path.extname(filePath).toLowerCase();
  if (TEXT_EXTENSIONS.has(ext)) {
    return parseTextFile(filePath);
  }
  if (XBERG_EXTENSIONS.has(ext)) {
    return parseWithXberg(filePath, options.forceOcr === true);
  }
  throw new KnowledgeError({
    code: 'UNSUPPORTED_DOCUMENT_TYPE',
    stage: 'parse',
    message: `不支持的文档类型：${ext || '(无扩展名)'}`,
    details: { filePath, extension: ext },
    allowedManualActions: ['reimport', 'open_logs'],
  });
}

export function sha256FileBuffer(buffer: Buffer): string {
  return hash(buffer);
}
