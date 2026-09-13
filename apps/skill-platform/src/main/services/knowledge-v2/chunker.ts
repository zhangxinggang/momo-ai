import { createHash, randomUUID } from 'node:crypto';

import type { DKbSegmentSettings } from '@/types/modules/kb';

import { KnowledgeError } from './error';
import type { ICanonicalDocument, ICanonicalElement } from './parser';

export interface IChunkDraft {
  id: string;
  parentChunkId?: string;
  stableKey: string;
  idx: number;
  kind: 'parent' | 'child';
  content: string;
  embeddingText: string;
  contentHash: string;
  tokenCount: number;
  headingPath: string[];
  page?: number;
  pageEnd?: number;
  sheet?: string;
  cellRange?: string;
  metadata: Record<string, unknown>;
}

const DEFAULT_SETTINGS: DKbSegmentSettings = {
  separator: '\n\n',
  maxChunkLength: 320,
  chunkOverlap: 40,
  preprocess: {
    normalizeWhitespace: true,
    removeUrlsAndEmails: false,
  },
  splitMode: 'code',
};

export function estimateTokens(value: string): number {
  const cjk = (value.match(/[\u3400-\u9fff\uf900-\ufaff]/g) || []).length;
  const nonCjk = Math.max(0, value.length - cjk);
  return Math.max(1, cjk + Math.ceil(nonCjk / 4));
}

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function resolveSettings(settings?: DKbSegmentSettings): DKbSegmentSettings {
  const resolved: DKbSegmentSettings = settings
    ? {
        ...settings,
        preprocess: {
          ...DEFAULT_SETTINGS.preprocess,
          ...settings.preprocess,
        },
      }
    : {
        ...DEFAULT_SETTINGS,
        preprocess: { ...DEFAULT_SETTINGS.preprocess },
      };

  if (resolved.splitMode === 'llm') {
    throw new KnowledgeError({
      code: 'LLM_CHUNKING_NOT_SUPPORTED',
      message: '当前知识库不支持 LLM 分块，请改用结构化分块。',
      stage: 'chunk',
      allowedManualActions: ['reconfigure', 'retry', 'open_logs'],
    });
  }

  if (!resolved.separator || resolved.separator.length > 32) {
    throw new KnowledgeError({
      code: 'INVALID_CHUNK_SEPARATOR',
      message: '分块分隔符不能为空且长度不能超过 32 个字符。',
      stage: 'chunk',
      allowedManualActions: ['reconfigure', 'retry', 'open_logs'],
    });
  }

  if (
    !Number.isInteger(resolved.maxChunkLength) ||
    resolved.maxChunkLength < 80 ||
    resolved.maxChunkLength > 800
  ) {
    throw new KnowledgeError({
      code: 'INVALID_CHUNK_LENGTH',
      message: '分块最大长度必须是 80 到 800 之间的整数。',
      stage: 'chunk',
      allowedManualActions: ['reconfigure', 'retry', 'open_logs'],
    });
  }

  if (
    !Number.isInteger(resolved.chunkOverlap) ||
    resolved.chunkOverlap < 0 ||
    resolved.chunkOverlap >= resolved.maxChunkLength / 2
  ) {
    throw new KnowledgeError({
      code: 'INVALID_CHUNK_OVERLAP',
      message: '分块重叠长度必须是非负整数且小于最大长度的一半。',
      stage: 'chunk',
      allowedManualActions: ['reconfigure', 'retry', 'open_logs'],
    });
  }

  return resolved;
}

function preprocessText(value: string, settings: DKbSegmentSettings): string {
  let result = value;
  if (settings.preprocess?.removeUrlsAndEmails) {
    result = result
      .replace(/https?:\/\/[^\s)\]}>,]+/giu, ' ')
      .replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/giu, ' ');
  }
  if (settings.preprocess?.normalizeWhitespace) {
    result = result
      .replace(/\r\n?/gu, '\n')
      .replace(/[\t\u00a0 ]+/gu, ' ')
      .replace(/ *\n */gu, '\n')
      .replace(/\n{3,}/gu, '\n\n');
  }
  return result.trim();
}

function takeTail(value: string, maxTokens: number): string {
  if (maxTokens <= 0) return '';
  const characters = Array.from(value);
  let tail = '';
  for (let index = characters.length - 1; index >= 0; index -= 1) {
    const candidate = characters[index] + tail;
    if (estimateTokens(candidate) > maxTokens) break;
    tail = candidate;
  }
  return tail.trim();
}

function splitOversized(value: string, maxTokens: number, overlapTokens: number): string[] {
  const characters = Array.from(value.trim());
  const chunks: string[] = [];
  let start = 0;

  while (start < characters.length) {
    let end = start;
    while (end < characters.length) {
      const candidate = characters.slice(start, end + 1).join('');
      if (estimateTokens(candidate) > maxTokens) break;
      end += 1;
    }
    if (end === start) end += 1;

    const content = characters.slice(start, end).join('').trim();
    if (content) chunks.push(content);
    if (end >= characters.length) break;

    const tail = takeTail(characters.slice(start, end).join(''), overlapTokens);
    start = Math.max(start + 1, end - Array.from(tail).length);
  }

  return chunks;
}

function splitText(value: string, settings: DKbSegmentSettings): string[] {
  const maxTokens = settings.maxChunkLength;
  const overlapTokens = settings.chunkOverlap;
  const trimmed = value.trim();
  if (!trimmed) return [];
  if (estimateTokens(trimmed) <= maxTokens) return [trimmed];

  const units = trimmed
    .split(settings.separator)
    .map((unit) => unit.trim())
    .filter(Boolean);
  const chunks: string[] = [];
  let current = '';

  const flush = () => {
    if (!current) return;
    chunks.push(...splitOversized(current, maxTokens, overlapTokens));
    current = '';
  };

  for (const unit of units) {
    if (estimateTokens(unit) > maxTokens) {
      flush();
      chunks.push(...splitOversized(unit, maxTokens, overlapTokens));
      continue;
    }

    const candidate = current ? current + settings.separator + unit : unit;
    if (estimateTokens(candidate) <= maxTokens) {
      current = candidate;
      continue;
    }

    const previous = current;
    flush();
    const overlap = takeTail(previous, overlapTokens);
    current = overlap ? overlap + settings.separator + unit : unit;
    if (estimateTokens(current) > maxTokens) flush();
  }

  flush();
  return chunks.filter((chunk) => chunk && estimateTokens(chunk) <= maxTokens);
}

function groupElements(elements: ICanonicalElement[]): ICanonicalElement[][] {
  const groups: ICanonicalElement[][] = [];
  let current: ICanonicalElement[] = [];
  let currentHeading = '';

  for (const element of elements) {
    const heading = element.headingPath.join('\u0000');
    if (current.length && heading !== currentHeading) {
      groups.push(current);
      current = [];
    }
    currentHeading = heading;
    current.push(element);
  }
  if (current.length) groups.push(current);
  return groups;
}

export function createChunks(
  document: ICanonicalDocument,
  settings?: DKbSegmentSettings,
): IChunkDraft[] {
  const resolved = resolveSettings(settings);
  const elements = document.elements
    .map((element) => ({ ...element, text: preprocessText(element.text, resolved) }))
    .filter((element) => element.text.length > 0);
  const chunks: IChunkDraft[] = [];
  let childIndex = 0;

  for (const group of groupElements(elements)) {
    const content = group
      .map((element) => element.text)
      .join(resolved.separator)
      .trim();
    if (!content) continue;

    const headingPath = group[0]?.headingPath || [];
    const parentId = randomUUID();
    const parentStableKey = hash(
      'parent:' + headingPath.join('/') + ':' + String(group[0]?.id ?? chunks.length),
    );
    const pageValues = group
      .map((element) => element.page)
      .filter((page): page is number => typeof page === 'number');
    const page = pageValues.length ? Math.min(...pageValues) : undefined;
    const pageEnd = pageValues.length ? Math.max(...pageValues) : undefined;

    chunks.push({
      id: parentId,
      stableKey: parentStableKey,
      idx: chunks.length,
      kind: 'parent',
      content,
      embeddingText: content,
      contentHash: hash(content),
      tokenCount: estimateTokens(content),
      headingPath,
      page,
      pageEnd,
      sheet: group[0]?.sheet,
      cellRange: group[0]?.cellRange,
      metadata: {
        elementStart: group[0]?.id,
        elementEnd: group[group.length - 1]?.id,
      },
    });

    for (const childContent of splitText(content, resolved)) {
      const embeddingText = headingPath.length
        ? headingPath.join(' / ') + '\n' + childContent
        : childContent;
      chunks.push({
        id: randomUUID(),
        parentChunkId: parentId,
        stableKey: hash('child:' + parentStableKey + ':' + String(childIndex)),
        idx: childIndex,
        kind: 'child',
        content: childContent,
        embeddingText,
        contentHash: hash(childContent),
        tokenCount: estimateTokens(childContent),
        headingPath,
        page,
        pageEnd,
        sheet: group[0]?.sheet,
        cellRange: group[0]?.cellRange,
        metadata: {
          parentStableKey,
          elementStart: group[0]?.id,
          elementEnd: group[group.length - 1]?.id,
        },
      });
      childIndex += 1;
    }
  }

  if (!chunks.some((chunk) => chunk.kind === 'child')) {
    throw new KnowledgeError({
      code: 'CHUNKING_EMPTY',
      message: '文档没有生成任何可检索分块。',
      stage: 'chunk',
      allowedManualActions: ['reconfigure', 'reimport', 'open_logs'],
    });
  }

  return chunks;
}
