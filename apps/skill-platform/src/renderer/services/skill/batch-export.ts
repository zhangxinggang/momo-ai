import { unzipSync, zipSync } from 'fflate';

import { exportSkillZip } from './api';
import { downloadSkillZipExport } from './detail/export';

interface ISkillZipExport {
  fileName: string;
  base64: string;
}

function decodeBase64(base64: string): Uint8Array {
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function sanitizePathPart(value: string): string {
  const sanitized = value
    .trim()
    .replace(/\.zip$/i, '')
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')
    .replace(/[. ]+$/g, '')
    .slice(0, 120);
  return sanitized || 'skill';
}

function uniqueDirectoryName(baseName: string, usedNames: Set<string>): string {
  let candidate = baseName;
  let suffix = 2;
  while (usedNames.has(candidate.toLowerCase())) {
    candidate = `${baseName}-${suffix}`;
    suffix += 1;
  }
  usedNames.add(candidate.toLowerCase());
  return candidate;
}

/** 将多个单技能 zip 展开到独立目录后，重新打包为一个合集 zip。 */
export function buildSkillsBundleZip(exports: ISkillZipExport[]): Uint8Array {
  const files: Record<string, Uint8Array> = {};
  const usedNames = new Set<string>();

  for (const item of exports) {
    const directory = uniqueDirectoryName(sanitizePathPart(item.fileName), usedNames);
    const entries = unzipSync(decodeBase64(item.base64));
    for (const [rawPath, data] of Object.entries(entries)) {
      const normalizedPath = rawPath.replace(/\\/g, '/').replace(/^\/+/, '');
      const safeSegments = normalizedPath
        .split('/')
        .filter((segment) => segment && segment !== '.' && segment !== '..');
      if (safeSegments.length === 0) continue;
      files[`${directory}/${safeSegments.join('/')}`] = data;
    }
  }

  return zipSync(files, { level: 1 });
}

export async function downloadSkillsBundle(skillIds: string[]): Promise<void> {
  const exports = await Promise.all(skillIds.map((id) => exportSkillZip(id)));
  const bytes = buildSkillsBundleZip(exports);
  const date = new Date().toISOString().slice(0, 10);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  downloadSkillZipExport({
    fileName: `skills-${date}.zip`,
    base64: btoa(binary),
  });
}
