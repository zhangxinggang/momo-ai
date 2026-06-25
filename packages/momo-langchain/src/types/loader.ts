import type { ELoaderKind } from '../constants';
import type { ILangchainDocument } from './document';

/** 文档加载器适配器 */
export interface ILoaderAdapter<TInput = unknown> {
  readonly kind: ELoaderKind;
  load(input: TInput): Promise<ILangchainDocument[]>;
}

/** PDF 加载输入 */
export interface IPdfLoaderInput {
  buffer: Buffer;
}
