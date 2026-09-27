import { strToU8, unzipSync, zipSync } from 'fflate';
import { describe, expect, it } from 'vitest';

import { buildSkillsBundleZip } from './batch-export';

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

describe('buildSkillsBundleZip', () => {
  it('puts every selected skill in its own directory', () => {
    const archive = buildSkillsBundleZip([
      {
        fileName: 'writer.zip',
        base64: toBase64(zipSync({ 'SKILL.md': strToU8('# Writer') })),
      },
      {
        fileName: 'reviewer.zip',
        base64: toBase64(
          zipSync({ 'SKILL.md': strToU8('# Reviewer'), 'scripts/check.js': strToU8('ok') }),
        ),
      },
    ]);

    const files = unzipSync(archive);
    expect(new TextDecoder().decode(files['writer/SKILL.md'])).toBe('# Writer');
    expect(new TextDecoder().decode(files['reviewer/SKILL.md'])).toBe('# Reviewer');
    expect(new TextDecoder().decode(files['reviewer/scripts/check.js'])).toBe('ok');
  });

  it('keeps duplicate skill names in distinct directories and drops traversal segments', () => {
    const archive = buildSkillsBundleZip([
      {
        fileName: 'same.zip',
        base64: toBase64(zipSync({ '../SKILL.md': strToU8('one') })),
      },
      {
        fileName: 'same.zip',
        base64: toBase64(zipSync({ 'SKILL.md': strToU8('two') })),
      },
    ]);

    const files = unzipSync(archive);
    expect(new TextDecoder().decode(files['same/SKILL.md'])).toBe('one');
    expect(new TextDecoder().decode(files['same-2/SKILL.md'])).toBe('two');
  });
});
