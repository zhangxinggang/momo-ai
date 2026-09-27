import { describe, expect, it } from 'vitest';
import {
  decodeEditableFile,
  normalizeEditableText,
} from '../../../../../../packages/momo-file-editor/src/utils/file-content';

describe('editable file content detection', () => {
  it('recognizes logs, unfamiliar extensions, Chinese text and empty files as text', () => {
    const source = '2026-10-07 INFO 正常启动\r\nrequest\tcompleted\n';
    expect(decodeEditableFile(new TextEncoder().encode(source))).toBe(source);
    expect(decodeEditableFile(new Uint8Array())).toBe('');
    expect(normalizeEditableText(source)).toBe(source.replace(/\r\n/g, '\n'));
  });

  it('rejects binary control bytes and invalid UTF-8 without replacement characters', () => {
    expect(decodeEditableFile(new Uint8Array([65, 0, 66]))).toBeNull();
    expect(decodeEditableFile(new Uint8Array([0xff, 0xfe, 65]))).toBeNull();
    expect(decodeEditableFile(new Uint8Array([0xc3, 0x28]))).toBeNull();
  });

  it('preserves a UTF-8 BOM when the editor saves the decoded text', () => {
    const bytes = new Uint8Array([0xef, 0xbb, 0xbf, 65]);
    expect(new TextEncoder().encode(decodeEditableFile(bytes)!)).toEqual(bytes);
  });
});
