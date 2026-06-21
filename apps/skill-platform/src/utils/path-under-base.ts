import path from 'path';

/**
 * 将相对路径解析到 baseDir 下，并校验是否仍在 baseDir 内（防路径穿越）。
 * 校验失败返回 null。
 */
export function resolvePathUnderBase(baseDir: string, relativePath: string): string | null {
  const normalized = path.normalize(relativePath).replace(/^([/\\])+/, '');
  const fullPath = path.join(baseDir, normalized);

  if (!fullPath.startsWith(baseDir + path.sep) && fullPath !== baseDir) {
    return null;
  }

  return fullPath;
}

/**
 * 将相对路径（可含子目录）解析到 baseDir 下；拒绝空路径与 `..` 穿越。
 */
export function resolveRelativePathUnderBase(baseDir: string, relativePath: string): string | null {
  const normalized = relativePath.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!normalized || normalized.includes('..')) {
    return null;
  }
  return resolvePathUnderBase(baseDir, normalized);
}

/** 同 resolveRelativePathUnderBase，校验失败时抛出异常 */
export function assertRelativePathUnderBase(baseDir: string, relativePath: string): string {
  const resolved = resolveRelativePathUnderBase(baseDir, relativePath);
  if (!resolved) {
    throw new Error('非法文件路径');
  }
  return resolved;
}
