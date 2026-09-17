import { constants } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { safeExistingPath } from '../supervisor/bundles';

export async function writeWorkspaceFile(roots: string[], filename: string, content: string) {
  if (
    typeof filename !== 'string' ||
    !filename ||
    filename.includes('\0') ||
    typeof content !== 'string' ||
    Buffer.byteLength(content, 'utf8') > 1024 * 1024
  )
    throw new Error('INVALID_WORKSPACE_WRITE');
  for (const root of roots) {
    const relative = path.isAbsolute(filename) ? path.relative(root, filename) : filename;
    if (
      !relative ||
      path.isAbsolute(relative) ||
      relative.split(/[\\/]/).includes('..') ||
      /[<>:"|?*\u0000]/.test(relative)
    )
      continue;
    const directory = await safeExistingPath(root, path.dirname(relative));
    const target = path.join(directory, path.basename(relative));
    const existing = await fs.lstat(target).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOENT') throw error;
      return null;
    });
    if (existing?.isSymbolicLink()) throw new Error('SYMLINK_NOT_ALLOWED');
    if (existing && !existing.isFile()) throw new Error('TARGET_NOT_FILE');
    const file = await fs.open(
      target,
      constants.O_WRONLY | constants.O_CREAT | constants.O_TRUNC | (constants.O_NOFOLLOW ?? 0),
    );
    try {
      await file.writeFile(content, 'utf8');
    } finally {
      await file.close();
    }
    return { path: filename, bytes: Buffer.byteLength(content, 'utf8') };
  }
  throw new Error('路径不属于当前项目');
}
