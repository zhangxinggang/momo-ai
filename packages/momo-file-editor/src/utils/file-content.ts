/** 复制 ArrayBuffer，避免 PDF Worker transfer 后原 buffer 被 detach */
export function cloneArrayBuffer(source: ArrayBuffer): ArrayBuffer {
  return source.slice(0);
}

/**
 * 编辑器内部统一使用 LF。CodeMirror 会在初始化或受控同步时执行同样的换行符归一化，
 * 所以读取文件时就同步归一化当前值和已保存基线，避免将程序性同步误判为用户修改。
 */
export function normalizeEditableText(source: string): string {
  return source.replace(/\r\n?/g, '\n');
}

/** Recognize losslessly decodable UTF-8 text by content, regardless of its extension. */
export function decodeEditableFile(source: Uint8Array): string | null {
  try {
    const text = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(source);
    return isEditableText(text) ? text : null;
  } catch {
    return null;
  }
}

export function isEditableText(source: string): boolean {
  return !/[\u0000-\u0008\u000b\u000e-\u001f\u007f]/u.test(source);
}
