import { strToU8, zipSync } from 'fflate';
import { describe, expect, it } from 'vitest';

import { parseChatAttachment } from './attachment-parser';
import { KnowledgeError } from './error';

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const title = '自动上传附件测试';
const body = '这是一份中文 DOCX 文档，正文包含产品需求、计划与验收标准。';
const documentXml = `<?xml version="1.0" encoding="UTF-8"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body><w:p><w:r><w:t>${title}</w:t></w:r></w:p>
  ${Array.from({ length: 40 }, () => `<w:p><w:r><w:t>${body}</w:t></w:r></w:p>`).join('')}
  <w:sectPr/></w:body>
</w:document>`;
const docx = Buffer.from(
  zipSync({
    '[Content_Types].xml': strToU8(`<?xml version="1.0" encoding="UTF-8"?>
    <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
      <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
      <Default Extension="xml" ContentType="application/xml"/>
      <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
    </Types>`),
    '_rels/.rels': strToU8(`<?xml version="1.0" encoding="UTF-8"?>
    <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
      <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
    </Relationships>`),
    'word/document.xml': strToU8(documentXml),
  }),
).toString('base64');

describe('chat attachment parsing', () => {
  it.each(['docx', '.docx', ' DOCX '])(
    'extracts Chinese DOCX with extension %s',
    async (ext) => {
      const parsed = await parseChatAttachment({ base64: docx, ext, mime: DOCX_MIME });
      expect(parsed.text).toContain(title);
      expect(parsed.text).toContain(body);
      expect(parsed.text).not.toContain('�');
      expect(parsed.text.length).toBeGreaterThan(1_000);
      expect(parsed.snippet).toBe(parsed.text.slice(0, 1_000));
    },
    15_000,
  );

  it('uses the MIME type when the filename has no extension', async () => {
    const parsed = await parseChatAttachment({
      base64: docx,
      mime: DOCX_MIME.toUpperCase() + '; charset=UTF-8',
    });
    expect(parsed.text).toContain(body);
  });

  it('preserves text attachment parsing', async () => {
    const text = '# 中文标题\n\n拖入文件即可上传。';
    await expect(
      parseChatAttachment({ base64: Buffer.from(text).toString('base64'), ext: 'md' }),
    ).resolves.toEqual({ text, snippet: text });
  });

  it('keeps the quality guard for genuinely garbled text', async () => {
    await expect(
      parseChatAttachment({ base64: Buffer.from('正文�乱码�内容').toString('base64'), ext: 'txt' }),
    ).rejects.toMatchObject({ code: 'PARSE_QUALITY_TOO_LOW' });
  });

  it('rejects a damaged DOCX rather than accepting its bytes as text', async () => {
    await expect(
      parseChatAttachment({
        base64: Buffer.from('invalid Office archive').toString('base64'),
        ext: 'docx',
      }),
    ).rejects.toBeInstanceOf(KnowledgeError);
  });

  it('rejects unsupported file extensions', async () => {
    await expect(parseChatAttachment({ base64: docx, ext: 'exe' })).rejects.toMatchObject({
      code: 'UNSUPPORTED_DOCUMENT_TYPE',
    });
  });

  it('rejects missing content before parsing', async () => {
    await expect(parseChatAttachment({ ext: 'docx' })).rejects.toMatchObject({
      code: 'ATTACHMENT_CONTENT_REQUIRED',
    });
  });
});
