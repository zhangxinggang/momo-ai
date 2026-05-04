/**
 * 文档切分入口：代码切分 / 大语言模型切分
 */

import type { IKbLlmConfig } from '@/types/modules/kb';
import {
  chunkTextWithSettings,
  type ISegmentSettings,
  type ITextChunkPiece,
} from '@momo/knowledge';

import { chunkTextWithLlm } from './llm-chunker';

export async function splitDocumentText(
  text: string,
  settings: ISegmentSettings,
  llmConfig?: IKbLlmConfig,
): Promise<ITextChunkPiece[]> {
  if (settings.splitMode === 'llm') {
    if (!llmConfig?.apiKey?.trim() || !llmConfig.apiUrl?.trim() || !llmConfig.model?.trim()) {
      throw new Error('大语言模型切分需要配置对话模型（API Key、地址与模型名）');
    }
    return chunkTextWithLlm(text, settings, llmConfig);
  }

  return chunkTextWithSettings(text, settings);
}
