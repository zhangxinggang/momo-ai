import fs from 'fs';
import path from 'path';

import type { DCustomToolMeta, ICustomToolTreeNode } from '@/types/modules';

import { getStaticDir, getToolsDir } from '../../runtime-paths';

const TOOL_META_FILE = 'tool.json';
const TOOL_ENTRY_FILE = 'index.html';
const TOOL_META_VERSION = 1;

function ensureToolsRoot(): string {
  const root = getToolsDir();
  if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
  }
  return root;
}

function normalizeRelativePath(relativePath: string): string {
  const normalized = path.normalize(relativePath).replace(/\\/g, '/');
  if (normalized.startsWith('..') || path.isAbsolute(normalized)) {
    throw new Error('Invalid tool path');
  }
  return normalized === '.' ? '' : normalized;
}

function resolveSafePath(relativePath: string): string {
  const root = ensureToolsRoot();
  const safeRelative = normalizeRelativePath(relativePath);
  const abs = path.resolve(root, safeRelative);
  if (!abs.startsWith(root)) {
    throw new Error('Path escapes tools directory');
  }
  return abs;
}

/** 读取并校验 tool.json，非法则视为非工具包 */
function readToolMeta(dirAbs: string): DCustomToolMeta | null {
  const metaPath = path.join(dirAbs, TOOL_META_FILE);
  if (!fs.existsSync(metaPath) || !fs.statSync(metaPath).isFile()) {
    return null;
  }
  try {
    const raw = JSON.parse(fs.readFileSync(metaPath, 'utf-8')) as Partial<DCustomToolMeta>;
    if (raw?.kind !== 'tool') {
      return null;
    }
    return {
      kind: 'tool',
      version: typeof raw.version === 'number' ? raw.version : TOOL_META_VERSION,
    };
  } catch {
    return null;
  }
}

function isToolPackageDir(dirAbs: string): boolean {
  return Boolean(readToolMeta(dirAbs));
}

/** 父路径必须是根或组织目录，不能是工具包 */
function assertParentIsOrgFolder(parentAbs: string, parentRel: string): void {
  if (!parentRel) {
    return;
  }
  if (!fs.existsSync(parentAbs) || !fs.statSync(parentAbs).isDirectory()) {
    throw new Error('Parent folder not found');
  }
  if (isToolPackageDir(parentAbs)) {
    throw new Error('Cannot create under a tool package');
  }
}

function writeToolMeta(dirAbs: string): void {
  const meta: DCustomToolMeta = { kind: 'tool', version: TOOL_META_VERSION };
  fs.writeFileSync(path.join(dirAbs, TOOL_META_FILE), `${JSON.stringify(meta, null, 2)}\n`, 'utf-8');
}

function resolveToolEntryAbs(toolDirAbs: string): string {
  return path.join(toolDirAbs, TOOL_ENTRY_FILE);
}

function scanDirectory(dirPath: string, relativePrefix: string): ICustomToolTreeNode[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const nodes: ICustomToolTreeNode[] = [];

  const sorted = entries.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (!a.isDirectory() && b.isDirectory()) return 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });

  for (const entry of sorted) {
    if (!entry.isDirectory()) {
      // 忽略旧版散落 .html 及其它文件
      continue;
    }

    const rel = relativePrefix ? `${relativePrefix}/${entry.name}` : entry.name;
    const abs = path.join(dirPath, entry.name);

    if (isToolPackageDir(abs)) {
      // 工具包在树中为叶子，不展开内部文件
      nodes.push({
        id: rel,
        name: entry.name,
        kind: 'tool',
      });
      continue;
    }

    const children = scanDirectory(abs, rel);
    nodes.push({
      id: rel,
      name: entry.name,
      kind: 'folder',
      children,
    });
  }

  return nodes;
}

function uniqueDirName(dirAbs: string, baseName: string): string {
  let candidate = baseName;
  let index = 1;
  while (fs.existsSync(path.join(dirAbs, candidate))) {
    candidate = `${baseName}-${index}`;
    index += 1;
  }
  return candidate;
}

function toTreeNode(rel: string, name: string, abs: string): ICustomToolTreeNode {
  if (isToolPackageDir(abs)) {
    return { id: rel, name, kind: 'tool' };
  }
  return {
    id: rel,
    name,
    kind: 'folder',
    children: scanDirectory(abs, rel),
  };
}

export class CustomToolWorkspaceService {
  listTree(): ICustomToolTreeNode[] {
    const root = ensureToolsRoot();
    return scanDirectory(root, '');
  }

  createFolder(parentPath: string | null, name: string): ICustomToolTreeNode {
    const folderName = name.trim() || '新建目录';
    const parentRel = parentPath ? normalizeRelativePath(parentPath) : '';
    const parentAbs = parentRel ? resolveSafePath(parentRel) : ensureToolsRoot();
    assertParentIsOrgFolder(parentAbs, parentRel);
    const finalName = uniqueDirName(parentAbs, folderName);
    const abs = path.join(parentAbs, finalName);
    fs.mkdirSync(abs, { recursive: true });
    const rel = parentRel ? `${parentRel}/${finalName}` : finalName;
    return { id: rel, name: finalName, kind: 'folder', children: [] };
  }

  /** 创建工具包：文件夹 + tool.json + 空 index.html */
  createFile(parentPath: string | null, name: string): ICustomToolTreeNode {
    const baseName = (name.trim() || '新建工具').replace(/\.html?$/i, '');
    const parentRel = parentPath ? normalizeRelativePath(parentPath) : '';
    const parentAbs = parentRel ? resolveSafePath(parentRel) : ensureToolsRoot();
    assertParentIsOrgFolder(parentAbs, parentRel);

    const finalName = uniqueDirName(parentAbs, baseName);
    const abs = path.join(parentAbs, finalName);
    fs.mkdirSync(abs, { recursive: true });
    writeToolMeta(abs);
    // 空内容：查看态显示「暂无工具」，编辑态引导生成
    fs.writeFileSync(resolveToolEntryAbs(abs), '', 'utf-8');

    const rel = parentRel ? `${parentRel}/${finalName}` : finalName;
    return { id: rel, name: finalName, kind: 'tool' };
  }

  readFile(relativePath: string): { path: string; content: string } {
    const safeRel = normalizeRelativePath(relativePath);
    const abs = resolveSafePath(safeRel);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory() || !isToolPackageDir(abs)) {
      throw new Error('Tool package not found');
    }
    const entryAbs = resolveToolEntryAbs(abs);
    if (!fs.existsSync(entryAbs) || !fs.statSync(entryAbs).isFile()) {
      throw new Error('工具入口缺失');
    }
    const content = fs.readFileSync(entryAbs, 'utf-8');
    return { path: safeRel, content };
  }

  writeFile(relativePath: string, content: string): void {
    const safeRel = normalizeRelativePath(relativePath);
    const abs = resolveSafePath(safeRel);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory() || !isToolPackageDir(abs)) {
      throw new Error('Tool package not found');
    }
    fs.writeFileSync(resolveToolEntryAbs(abs), content, 'utf-8');
  }

  rename(relativePath: string, newName: string): ICustomToolTreeNode {
    const safeRel = normalizeRelativePath(relativePath);
    const abs = resolveSafePath(safeRel);
    if (!fs.existsSync(abs)) {
      throw new Error('Node not found');
    }
    if (!fs.statSync(abs).isDirectory()) {
      throw new Error('Node not found');
    }

    const parentRel = path.posix.dirname(safeRel.replace(/\\/g, '/'));
    const parentPrefix = parentRel === '.' ? '' : parentRel;
    const trimmed = newName.trim().replace(/\.html?$/i, '');
    if (!trimmed) {
      throw new Error('Name is required');
    }

    const nextName = trimmed;
    const newRel = parentPrefix ? `${parentPrefix}/${nextName}` : nextName;
    const newAbs = resolveSafePath(newRel);
    if (fs.existsSync(newAbs)) {
      throw new Error('Target name already exists');
    }

    fs.renameSync(abs, newAbs);
    return toTreeNode(newRel, nextName, newAbs);
  }

  deleteNode(relativePath: string): void {
    const safeRel = normalizeRelativePath(relativePath);
    const abs = resolveSafePath(safeRel);
    if (!fs.existsSync(abs)) {
      throw new Error('Node not found');
    }
    fs.rmSync(abs, { recursive: true, force: true });
  }

  move(sourcePath: string, targetParentPath: string | null): ICustomToolTreeNode {
    const safeSource = normalizeRelativePath(sourcePath);
    const sourceAbs = resolveSafePath(safeSource);
    if (!fs.existsSync(sourceAbs) || !fs.statSync(sourceAbs).isDirectory()) {
      throw new Error('Source not found');
    }

    const targetParentRel = targetParentPath ? normalizeRelativePath(targetParentPath) : '';
    const targetParentAbs = targetParentRel ? resolveSafePath(targetParentRel) : ensureToolsRoot();
    assertParentIsOrgFolder(targetParentAbs, targetParentRel);

    if (
      targetParentRel &&
      (targetParentRel === safeSource || targetParentRel.startsWith(`${safeSource}/`))
    ) {
      throw new Error('Cannot move into own descendant');
    }

    const baseName = path.basename(safeSource);
    const destAbs = path.join(targetParentAbs, baseName);
    if (fs.existsSync(destAbs)) {
      throw new Error('Target already exists');
    }

    fs.renameSync(sourceAbs, destAbs);
    const newRel = targetParentRel ? `${targetParentRel}/${baseName}` : baseName;
    return toTreeNode(newRel, baseName, destAbs);
  }

  readSnapEditHtml(): string {
    const snapPath = path.join(getStaticDir(), 'snapEdit.html');
    if (!fs.existsSync(snapPath)) {
      throw new Error('snapEdit.html not found');
    }
    return fs.readFileSync(snapPath, 'utf-8');
  }
}

export const customToolWorkspaceService = new CustomToolWorkspaceService();
