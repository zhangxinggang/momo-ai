import { app } from 'electron';
import fs from 'fs';
import path from 'path';

let grantedRootsCache: string[] | null = null;

function normalizeKey(value: string): string {
  const normalized = path.normalize(value);
  return process.platform === 'win32' ? normalized.toLowerCase() : normalized;
}

function isInside(rootPath: string, targetPath: string): boolean {
  const relative = path.relative(rootPath, targetPath);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function permissionsFilePath(): string {
  return path.join(app.getPath('userData'), 'security', 'workspace-roots.json');
}

function loadGrantedRoots(): string[] {
  if (grantedRootsCache) {
    return grantedRootsCache;
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(permissionsFilePath(), 'utf-8')) as unknown;
    grantedRootsCache = Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    grantedRootsCache = [];
  }
  return grantedRootsCache;
}

function resolveExistingPath(targetPath: string): string {
  return fs.realpathSync.native(path.resolve(targetPath));
}

/** 只由原生目录选择器调用，形成可持久化的目录授权。 */
export function grantWorkspaceRoots(folderPaths: string[]): string[] {
  const existing = loadGrantedRoots();
  const byKey = new Map(existing.map((item) => [normalizeKey(item), item]));
  const granted: string[] = [];
  for (const folderPath of folderPaths) {
    try {
      const realPath = resolveExistingPath(folderPath);
      if (!fs.statSync(realPath).isDirectory()) {
        continue;
      }
      byKey.set(normalizeKey(realPath), realPath);
      granted.push(realPath);
    } catch {
      // 原生选择结果已失效时跳过。
    }
  }

  grantedRootsCache = [...byKey.values()];
  const target = permissionsFilePath();
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(grantedRootsCache, null, 2), 'utf-8');
  return granted;
}

/** 校验目录必须位于用户曾通过原生选择器授权的根目录内。 */
export function assertGrantedWorkspaceDirectory(dirPath: string): string {
  const realPath = resolveExistingPath(dirPath);
  if (!fs.statSync(realPath).isDirectory()) {
    throw new Error('指定路径不是目录');
  }
  const allowed = loadGrantedRoots().some((root) => isInside(root, realPath));
  if (!allowed) {
    throw new Error('目录未获得工作区访问授权，请重新选择目录');
  }
  return realPath;
}

/** 校验文件经过 realpath 后仍位于指定、且已授权的工作区根内。 */
export function assertFileWithinWorkspaceRoot(rootPath: string, filePath: string): string {
  const realRoot = assertGrantedWorkspaceDirectory(rootPath);
  const realFile = resolveExistingPath(filePath);
  if (!isInside(realRoot, realFile) || !fs.statSync(realFile).isFile()) {
    throw new Error('文件不在已授权工作区内');
  }
  return realFile;
}

/** 校验文件至少位于一个已授权工作区内。 */
export function assertGrantedWorkspaceFile(filePath: string): string {
  const realFile = resolveExistingPath(filePath);
  if (!fs.statSync(realFile).isFile()) {
    throw new Error('指定路径不是文件');
  }
  const allowed = loadGrantedRoots().some((root) => isInside(root, realFile));
  if (!allowed) {
    throw new Error('文件未获得工作区访问授权');
  }
  return realFile;
}
