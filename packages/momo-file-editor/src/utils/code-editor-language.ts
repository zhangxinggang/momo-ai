import { languages } from '@codemirror/language-data';
import { getPathExtension } from '@momo/utils';

/** 额外视为代码编辑器的后缀（language-data 未收录） */
const EXTRA_CODE_EDITOR_EXTENSIONS = ['txt', 'env'] as const;

/** @codemirror/language-data 汇总的后缀集合（小写），含 txt、env */
export const CODE_EDITOR_EXTENSIONS = new Set([
  ...languages.flatMap((item) => item.extensions.map((ext) => ext.toLowerCase())),
  ...EXTRA_CODE_EDITOR_EXTENSIONS,
]);
/** 是否应使用 CodeFileEditor（无后缀、或后缀在支持列表中） */
export function isCodeEditorPath(relativePath: string): boolean {
  const extension = getPathExtension(relativePath);
  if (!extension) {
    return true;
  }
  return CODE_EDITOR_EXTENSIONS.has(extension);
}
