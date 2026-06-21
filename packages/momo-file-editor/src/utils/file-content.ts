/** 主进程判定为二进制文件时的占位内容 */
export const BINARY_FILE_PLACEHOLDER = '[binary file]';

export function isBinaryFilePlaceholder(content: string): boolean {
  return content === BINARY_FILE_PLACEHOLDER;
}

/** 复制 ArrayBuffer，避免 PDF Worker transfer 后原 buffer 被 detach */
export function cloneArrayBuffer(source: ArrayBuffer): ArrayBuffer {
  return source.slice(0);
}
