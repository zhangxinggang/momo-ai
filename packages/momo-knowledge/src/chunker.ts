import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

import { preprocessText } from './text-preprocess';
import type { ISegmentSettings } from './types';

export interface ITextChunkPiece {
  idx: number;
  content: string;
  tokens: number;
  start_pos: number;
  end_pos: number;
}

function resolveSeparators(separator: string): string[] {
  const normalized = separator === '\\n\\n' ? '\n\n' : separator;
  if (!normalized) {
    return ['\n\n', '\n', ' ', ''];
  }
  if (normalized === '\n\n') {
    return ['\n\n', '\n', ' ', ''];
  }
  return [normalized, '\n\n', '\n', ' ', ''];
}

function attachPositions(cleaned: string, chunks: string[]): ITextChunkPiece[] {
  let cursor = 0;
  return chunks.map((content, index) => {
    const found = cleaned.indexOf(content, cursor);
    const start_pos = found >= 0 ? found : cursor;
    const end_pos = start_pos + content.length;
    cursor = end_pos;
    return {
      idx: index + 1,
      content,
      tokens: Math.ceil(content.length / 4),
      start_pos,
      end_pos,
    };
  });
}

/** 按分段设置切分文本（RecursiveCharacterTextSplitter，参考 RAG-ChatBot-main） */
export async function chunkTextWithSettings(
  text: string,
  settings: ISegmentSettings,
): Promise<ITextChunkPiece[]> {
  const cleaned = preprocessText(text, settings.preprocess);
  const chunkSize = Math.max(200, settings.maxChunkLength);
  const chunkOverlap = Math.min(settings.chunkOverlap, Math.floor(chunkSize / 2));

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
    separators: resolveSeparators(settings.separator),
  });

  const chunks = await splitter.splitText(cleaned);
  return attachPositions(cleaned, chunks.filter(Boolean));
}

/** 预览前若干块 */
export async function previewChunks(
  text: string,
  settings: ISegmentSettings,
  limit = 5,
): Promise<ITextChunkPiece[]> {
  const pieces = await chunkTextWithSettings(text, settings);
  return pieces.slice(0, limit);
}
