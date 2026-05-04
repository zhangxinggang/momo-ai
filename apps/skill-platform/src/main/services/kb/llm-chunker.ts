/**
 * 大语言模型语义切分
 */

import type { IKbLlmConfig } from '@/types/modules/kb';
import type { ISafetyScanAiConfig } from '@/types/modules/skill';
import {
  chunkTextWithSettings,
  preprocessText,
  type ISegmentSettings,
  type ITextChunkPiece,
} from '@momo/knowledge';

import { chatCompletion } from '../ai/client';

const LLM_WINDOW_CHARS = 8000;

function toChatConfig(config: IKbLlmConfig): ISafetyScanAiConfig {
  return {
    apiKey: config.apiKey,
    apiUrl: config.apiUrl,
    model: config.model,
    provider: config.provider ?? '',
    apiProtocol: config.apiProtocol ?? 'openai',
  };
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

function splitIntoWindows(text: string, maxWindow: number): string[] {
  if (text.length <= maxWindow) {
    return [text];
  }

  const windows: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = Math.min(start + maxWindow, text.length);
    if (end < text.length) {
      const slice = text.slice(start, end);
      const lastParagraph = slice.lastIndexOf('\n\n');
      if (lastParagraph > maxWindow * 0.5) {
        end = start + lastParagraph + 2;
      }
    }
    windows.push(text.slice(start, end));
    start = end;
  }
  return windows;
}

function buildSplitPrompt(text: string, maxChunkLength: number): string {
  return `你是文档分段专家。请将下面文本按语义完整性切分为若干块，用于知识库检索。

要求：
1. 每块长度不超过 ${maxChunkLength} 个字符
2. 优先在段落、句子边界切分，保持语义完整
3. 不要改写、不要摘要，必须保留原文内容
4. 严格返回 JSON 对象，格式为 {"chunks": ["块1", "块2", ...]}，不要输出其它内容

待切分文本：
"""
${text}
"""`;
}

function parseChunksFromResponse(content: string): string[] {
  const trimmed = content.trim();
  const jsonText = trimmed.match(/\{[\s\S]*\}/)?.[0];
  if (!jsonText) {
    throw new Error('LLM 返回格式无效');
  }

  const parsed = JSON.parse(jsonText) as { chunks?: unknown };
  if (!Array.isArray(parsed.chunks)) {
    throw new Error('LLM 返回缺少 chunks 数组');
  }

  return parsed.chunks
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
}

async function splitWindowWithLlm(
  windowText: string,
  settings: ISegmentSettings,
  llmConfig: IKbLlmConfig,
): Promise<string[]> {
  const result = await chatCompletion(
    toChatConfig(llmConfig),
    [
      {
        role: 'system',
        content: '你是文档分段助手，只输出合法 JSON，键名为 chunks，值为字符串数组。',
      },
      {
        role: 'user',
        content: buildSplitPrompt(windowText, settings.maxChunkLength),
      },
    ],
    {
      temperature: 0.2,
      maxTokens: 8192,
      responseFormat: { type: 'json_object' },
    },
  );

  return parseChunksFromResponse(result.content);
}

async function enforceMaxChunkLength(
  chunks: string[],
  settings: ISegmentSettings,
): Promise<string[]> {
  const normalized: string[] = [];
  for (const chunk of chunks) {
    if (chunk.length <= settings.maxChunkLength) {
      normalized.push(chunk);
      continue;
    }
    const fallback = await chunkTextWithSettings(chunk, { ...settings, splitMode: 'code' });
    normalized.push(...fallback.map((piece) => piece.content));
  }
  return normalized;
}

function applyChunkOverlap(chunks: string[], overlap: number): string[] {
  if (overlap <= 0 || chunks.length <= 1) {
    return chunks;
  }

  const merged: string[] = [chunks[0]];
  for (let i = 1; i < chunks.length; i += 1) {
    const prev = merged[merged.length - 1];
    const prefix = prev.slice(Math.max(0, prev.length - overlap));
    merged.push(prefix ? `${prefix}\n${chunks[i]}` : chunks[i]);
  }
  return merged;
}

/** 使用大语言模型按语义切分文本 */
export async function chunkTextWithLlm(
  text: string,
  settings: ISegmentSettings,
  llmConfig: IKbLlmConfig,
): Promise<ITextChunkPiece[]> {
  const cleaned = preprocessText(text, settings.preprocess);
  if (!cleaned.trim()) {
    return [];
  }

  const windows = splitIntoWindows(cleaned, LLM_WINDOW_CHARS);
  const rawChunks: string[] = [];

  for (const window of windows) {
    try {
      const windowChunks = await splitWindowWithLlm(window, settings, llmConfig);
      rawChunks.push(...windowChunks);
    } catch (err) {
      console.warn('LLM 切分失败，窗口回退代码切分:', err instanceof Error ? err.message : err);
      const fallback = await chunkTextWithSettings(window, { ...settings, splitMode: 'code' });
      rawChunks.push(...fallback.map((piece) => piece.content));
    }
  }

  if (!rawChunks.length) {
    return chunkTextWithSettings(cleaned, { ...settings, splitMode: 'code' });
  }

  let normalized = await enforceMaxChunkLength(rawChunks, settings);
  normalized = applyChunkOverlap(normalized, settings.chunkOverlap);
  normalized = await enforceMaxChunkLength(normalized, settings);

  return attachPositions(cleaned, normalized);
}
