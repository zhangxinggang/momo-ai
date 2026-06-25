import type { ESplitterKind } from '../constants';

/** 文本切分配置 */
export interface ISplitterConfig {
  chunkSize: number;
  chunkOverlap: number;
  separators?: string[];
}

/** 文本切分器适配器 */
export interface ISplitterAdapter {
  readonly kind: ESplitterKind;
  splitText(text: string, config: ISplitterConfig): Promise<string[]>;
}
