import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

import { ESplitterKind } from '../constants';
import type { ISplitterAdapter, ISplitterConfig } from '../types/splitter';

/** 递归字符切分器 */
export class RecursiveCharacterSplitter implements ISplitterAdapter {
  readonly kind = ESplitterKind.ERecursiveCharacter;

  async splitText(text: string, config: ISplitterConfig): Promise<string[]> {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: config.chunkSize,
      chunkOverlap: config.chunkOverlap,
      separators: config.separators,
    });
    const chunks = await splitter.splitText(text);
    return chunks.filter(Boolean);
  }
}

/** 递归字符切分便捷函数 */
export async function splitTextRecursive(
  text: string,
  config: ISplitterConfig,
): Promise<string[]> {
  const splitter = new RecursiveCharacterSplitter();
  return splitter.splitText(text, config);
}
