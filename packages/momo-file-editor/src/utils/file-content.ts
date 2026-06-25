/** 复制 ArrayBuffer，避免 PDF Worker transfer 后原 buffer 被 detach */
export function cloneArrayBuffer(source: ArrayBuffer): ArrayBuffer {
  return source.slice(0);
}
