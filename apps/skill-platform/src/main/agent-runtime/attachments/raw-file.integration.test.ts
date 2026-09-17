import { HarnessProcess } from '@momo/harness-adapter';
import { strToU8, zipSync } from 'fflate';
import { createHash, randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

// A valid Office archive with XML nesting above the host parser's limit must still upload.
function nestedDocx() {
  const mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml';
  return Buffer.from(
    zipSync({
      '[Content_Types].xml': strToU8(`<?xml version="1.0" encoding="UTF-8"?>
      <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
        <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
        <Default Extension="xml" ContentType="application/xml"/>
        <Override PartName="/word/document.xml" ContentType="${mime}"/>
      </Types>`),
      '_rels/.rels': strToU8(`<?xml version="1.0" encoding="UTF-8"?>
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
      </Relationships>`),
      'word/document.xml': strToU8(`<?xml version="1.0" encoding="UTF-8"?>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>
        ${'<w:customXml>'.repeat(1100)}<w:p><w:r><w:t>保留原文件，不进行上传解析。</w:t></w:r></w:p>${'</w:customXml>'.repeat(1100)}
      </w:body></w:document>`),
    }),
  );
}

describe('official Harness raw file admission', () => {
  it('stores a deeply nested DOCX byte for byte without parsing it', async () => {
    const bundle = path.resolve('../../packages/momo-harness-runner/dist');
    const home = path.resolve('../../temp/harness-raw-file-' + randomUUID());
    const profile = path.join(home, 'profiles/momo');
    await fs.mkdir(profile, { recursive: true });
    await fs.cp(path.join(bundle, 'profile'), profile, { recursive: true });
    const patch = path.join(profile, 'cordis.patch.yml');
    await fs.writeFile(
      patch,
      (await fs.readFile(patch, 'utf8'))
        .replace(
          "'__MOMO_BRIDGE_PLUGIN__'",
          JSON.stringify(path.join(bundle, 'plugins/momo-host-bridge/index.mjs')),
        )
        .replace(
          "'__MOMO_CREDENTIAL_PLUGIN__'",
          JSON.stringify(path.join(bundle, 'plugins/momo-model-credentials/index.mjs')),
        ),
    );
    const runtime = new HarnessProcess(
      path.join(bundle, process.platform === 'win32' ? 'node.exe' : 'node'),
      path.join(bundle, 'node_modules/@deepseek-ai/dsh/lib/bin.js'),
      {
        cwd: bundle,
        env: {
          DSH_HOME: home,
          MOMO_SESSION_ROOT: path.join(home, 'sessions'),
          MOMO_PRESET_ROOT: path.join(bundle, 'profile/agent-presets'),
          MOMO_BUNDLE_ID: 'raw-file-contract',
          MOMO_CORE_VERSION: '0.1.6-alpha.2',
        },
      },
    );
    try {
      await runtime.describe();
      const bytes = nestedDocx();
      const digest = createHash('sha256').update(bytes).digest('hex');
      const receipt = await runtime.request('prepareAttachment', {
        name: '嵌套文档.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        data: bytes.toString('base64'),
      });
      expect(receipt).toEqual({
        type: 'file',
        attachment: {
          attachmentId: 'sha256:' + digest,
          name: '嵌套文档.docx',
          bytes: bytes.length,
        },
      });
      const stored = path.join(
        home,
        'attachments/v1/files',
        digest.slice(0, 2),
        digest,
        '嵌套文档.docx',
      );
      expect(await fs.readFile(stored)).toEqual(bytes);
      // Keep the isolated native home alongside other contract reports for inspection.
      await fs.writeFile(
        path.join(home, 'upload-report.json'),
        JSON.stringify(
          { name: receipt.attachment.name, digest, size: bytes.length, parsed: false },
          null,
          2,
        ),
      );
    } finally {
      await runtime.dispose();
    }
  }, 60_000);
});
