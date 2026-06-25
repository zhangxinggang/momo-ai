import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';

import type { ENoteType, INoteMetaEntry, INoteTreeNode } from '@/types/modules';

import { getNotesDir, getProjectRoot } from '../../runtime-paths';

const NOTE_FILE_EXT = '.md';
const META_FILE_NAME = '.notes-meta.json';

interface INotesMetaFile {
  entries: Record<string, INoteMetaEntry>;
}

function ensureNoteId(meta: INotesMetaFile, relativePath: string, noteType?: ENoteType): string {
  const entry = meta.entries[relativePath];
  if (entry?.noteId) {
    if (noteType && entry.noteType !== noteType) {
      entry.noteType = noteType;
    }
    return entry.noteId;
  }
  const noteId = randomUUID();
  meta.entries[relativePath] = {
    noteType: noteType ?? entry?.noteType ?? 'text',
    noteId,
  };
  return noteId;
}

function migrateMetaNoteIds(root: string, meta: INotesMetaFile): void {
  let changed = false;
  for (const key of Object.keys(meta.entries)) {
    if (!meta.entries[key].noteId) {
      meta.entries[key].noteId = randomUUID();
      changed = true;
    }
  }
  if (changed) {
    saveMeta(root, meta);
  }
}

function ensureNotesRoot(): string {
  const root = getNotesDir();
  if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
  }
  return root;
}

function normalizeRelativePath(relativePath: string): string {
  const normalized = path.normalize(relativePath).replace(/\\/g, '/');
  if (normalized.startsWith('..') || path.isAbsolute(normalized)) {
    throw new Error('Invalid note path');
  }
  return normalized === '.' ? '' : normalized;
}

function resolveSafePath(relativePath: string): string {
  const root = ensureNotesRoot();
  const safeRelative = normalizeRelativePath(relativePath);
  const abs = path.resolve(root, safeRelative);
  if (!abs.startsWith(root)) {
    throw new Error('Path escapes notes directory');
  }
  return abs;
}

function loadMeta(root: string): INotesMetaFile {
  const metaPath = path.join(root, META_FILE_NAME);
  if (!fs.existsSync(metaPath)) {
    return { entries: {} };
  }
  try {
    const raw = JSON.parse(fs.readFileSync(metaPath, 'utf-8')) as INotesMetaFile;
    return { entries: raw.entries ?? {} };
  } catch {
    return { entries: {} };
  }
}

function saveMeta(root: string, meta: INotesMetaFile): void {
  const metaPath = path.join(root, META_FILE_NAME);
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf-8');
}

function parseNoteTypeFromContent(content: string): ENoteType | null {
  const match = content.match(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---/);
  if (!match) {
    return null;
  }
  const frontmatter = match[1];
  const typeMatch = frontmatter.match(/noteType:\s*(text|image)/i);
  if (!typeMatch) {
    return null;
  }
  return typeMatch[1].toLowerCase() === 'image' ? 'image' : 'text';
}

function getNoteType(relativePath: string, content?: string): ENoteType {
  const root = ensureNotesRoot();
  const meta = loadMeta(root);
  if (meta.entries[relativePath]?.noteType) {
    return meta.entries[relativePath].noteType;
  }
  if (content) {
    const parsed = parseNoteTypeFromContent(content);
    if (parsed) {
      return parsed;
    }
  }
  return 'text';
}

function setNoteType(relativePath: string, noteType: ENoteType): void {
  const root = ensureNotesRoot();
  const meta = loadMeta(root);
  ensureNoteId(meta, relativePath, noteType);
  saveMeta(root, meta);
}

function removeMetaEntry(relativePath: string): void {
  const root = ensureNotesRoot();
  const meta = loadMeta(root);
  delete meta.entries[relativePath];
  for (const key of Object.keys(meta.entries)) {
    if (key.startsWith(`${relativePath}/`)) {
      delete meta.entries[key];
    }
  }
  saveMeta(root, meta);
}

function renameMetaEntry(oldPath: string, newPath: string): void {
  const root = ensureNotesRoot();
  const meta = loadMeta(root);
  const nextEntries: INotesMetaFile['entries'] = {};
  for (const [key, value] of Object.entries(meta.entries)) {
    if (key === oldPath) {
      nextEntries[newPath] = value;
      continue;
    }
    if (key.startsWith(`${oldPath}/`)) {
      nextEntries[`${newPath}/${key.slice(oldPath.length + 1)}`] = value;
      continue;
    }
    nextEntries[key] = value;
  }
  saveMeta(root, { entries: nextEntries });
}

function buildDefaultContent(title: string, noteType?: ENoteType): string {
  if (noteType) {
    return `---\nnoteType: ${noteType}\n---\n\n# ${title}\n`;
  }
  return `# ${title}\n`;
}

function scanDirectory(
  dirPath: string,
  relativePrefix: string,
  meta: INotesMetaFile,
): INoteTreeNode[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const nodes: INoteTreeNode[] = [];

  const sorted = entries
    .filter((entry) => entry.name !== META_FILE_NAME)
    .sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });

  for (const entry of sorted) {
    const rel = relativePrefix ? `${relativePrefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      const children = scanDirectory(path.join(dirPath, entry.name), rel, meta);
      nodes.push({
        id: rel,
        name: entry.name,
        kind: 'folder',
        children,
      });
      continue;
    }

    if (
      !entry.name.toLowerCase().endsWith(NOTE_FILE_EXT) &&
      !entry.name.toLowerCase().endsWith('.mdc')
    ) {
      continue;
    }

    const absFile = path.join(dirPath, entry.name);
    const content = fs.readFileSync(absFile, 'utf-8');
    const noteType = getNoteType(rel, content);
    const noteId = ensureNoteId(meta, rel, noteType);
    nodes.push({
      id: rel,
      name: entry.name,
      kind: 'file',
      noteType,
      noteId,
    });
  }

  return nodes;
}

function uniqueName(dirAbs: string, baseName: string, isDir: boolean): string {
  let candidate = isDir ? baseName : `${baseName}${NOTE_FILE_EXT}`;
  let index = 1;
  while (fs.existsSync(path.join(dirAbs, candidate))) {
    candidate = isDir ? `${baseName}-${index}` : `${baseName}-${index}${NOTE_FILE_EXT}`;
    index += 1;
  }
  return candidate;
}

export class NoteWorkspaceService {
  listTree(): INoteTreeNode[] {
    const root = ensureNotesRoot();
    const meta = loadMeta(root);
    migrateMetaNoteIds(root, meta);
    const tree = scanDirectory(root, '', meta);
    saveMeta(root, meta);
    return tree;
  }

  createFolder(parentPath: string | null, name: string): INoteTreeNode {
    const folderName = name.trim() || '新建文件夹';
    const parentRel = parentPath ? normalizeRelativePath(parentPath) : '';
    const parentAbs = parentRel ? resolveSafePath(parentRel) : ensureNotesRoot();
    if (!fs.existsSync(parentAbs)) {
      throw new Error('Parent folder not found');
    }
    const finalName = uniqueName(parentAbs, folderName, true);
    const abs = path.join(parentAbs, finalName);
    fs.mkdirSync(abs, { recursive: true });
    const rel = parentRel ? `${parentRel}/${finalName}` : finalName;
    return { id: rel, name: finalName, kind: 'folder', children: [] };
  }

  createFile(parentPath: string | null, name: string, noteType?: ENoteType): INoteTreeNode {
    const baseName = (name.trim() || '新建笔记').replace(/\.md$/i, '');
    const parentRel = parentPath ? normalizeRelativePath(parentPath) : '';
    const parentAbs = parentRel ? resolveSafePath(parentRel) : ensureNotesRoot();
    if (!fs.existsSync(parentAbs)) {
      throw new Error('Parent folder not found');
    }
    const fileName = uniqueName(parentAbs, baseName, false);
    const abs = path.join(parentAbs, fileName);
    const content = buildDefaultContent(baseName, noteType);
    fs.writeFileSync(abs, content, 'utf-8');
    const rel = parentRel ? `${parentRel}/${fileName}` : fileName;
    const root = ensureNotesRoot();
    const meta = loadMeta(root);
    const resolvedType = noteType ?? 'text';
    const noteId = ensureNoteId(meta, rel, resolvedType);
    saveMeta(root, meta);
    return { id: rel, name: fileName, kind: 'file', noteType: resolvedType, noteId };
  }

  readFile(relativePath: string): { content: string; noteType: ENoteType; noteId: string } {
    const safeRel = normalizeRelativePath(relativePath);
    const abs = resolveSafePath(safeRel);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
      throw new Error('Note file not found');
    }
    const content = fs.readFileSync(abs, 'utf-8');
    const noteType = getNoteType(safeRel, content);
    const root = ensureNotesRoot();
    const meta = loadMeta(root);
    const noteId = ensureNoteId(meta, safeRel, noteType);
    saveMeta(root, meta);
    return { content, noteType, noteId };
  }

  writeFile(relativePath: string, content: string): void {
    const safeRel = normalizeRelativePath(relativePath);
    const abs = resolveSafePath(safeRel);
    if (!fs.existsSync(abs)) {
      throw new Error('Note file not found');
    }
    fs.writeFileSync(abs, content, 'utf-8');
    const parsed = parseNoteTypeFromContent(content);
    if (parsed) {
      setNoteType(safeRel, parsed);
    }
  }

  rename(relativePath: string, newName: string): INoteTreeNode {
    const safeRel = normalizeRelativePath(relativePath);
    const abs = resolveSafePath(safeRel);
    if (!fs.existsSync(abs)) {
      throw new Error('Node not found');
    }
    const parentRel = path.posix.dirname(safeRel.replace(/\\/g, '/'));
    const parentPrefix = parentRel === '.' ? '' : parentRel;
    const trimmed = newName.trim();
    if (!trimmed) {
      throw new Error('Name is required');
    }

    const isDir = fs.statSync(abs).isDirectory();
    const nextName = isDir ? trimmed : `${trimmed.replace(/\.md$/i, '')}.md`;
    const newRel = parentPrefix ? `${parentPrefix}/${nextName}` : nextName;
    const newAbs = resolveSafePath(newRel);
    if (fs.existsSync(newAbs)) {
      throw new Error('Target name already exists');
    }

    fs.renameSync(abs, newAbs);
    renameMetaEntry(safeRel, newRel);

    if (isDir) {
      const root = ensureNotesRoot();
      const meta = loadMeta(root);
      return {
        id: newRel,
        name: nextName,
        kind: 'folder',
        children: scanDirectory(newAbs, newRel, meta),
      };
    }

    const content = fs.readFileSync(newAbs, 'utf-8');
    const noteType = getNoteType(newRel, content);
    const root = ensureNotesRoot();
    const meta = loadMeta(root);
    const noteId = ensureNoteId(meta, newRel, noteType);
    saveMeta(root, meta);
    return {
      id: newRel,
      name: nextName,
      kind: 'file',
      noteType,
      noteId,
    };
  }

  deleteNode(relativePath: string): void {
    const safeRel = normalizeRelativePath(relativePath);
    const abs = resolveSafePath(safeRel);
    if (!fs.existsSync(abs)) {
      throw new Error('Node not found');
    }
    fs.rmSync(abs, { recursive: true, force: true });
    removeMetaEntry(safeRel);
  }

  copyFile(relativePath: string): INoteTreeNode {
    const safeRel = normalizeRelativePath(relativePath);
    const sourceAbs = resolveSafePath(safeRel);
    if (!fs.existsSync(sourceAbs) || !fs.statSync(sourceAbs).isFile()) {
      throw new Error('Note file not found');
    }

    const parentRel = path.posix.dirname(safeRel.replace(/\\/g, '/'));
    const parentPrefix = parentRel === '.' ? '' : parentRel;
    const parentAbs = parentPrefix ? resolveSafePath(parentPrefix) : ensureNotesRoot();

    const originalBase = path.basename(safeRel, NOTE_FILE_EXT);
    const copyBaseName = `${originalBase}-副本`;
    const fileName = uniqueName(parentAbs, copyBaseName, false);
    const destAbs = path.join(parentAbs, fileName);
    fs.copyFileSync(sourceAbs, destAbs);

    const newRel = parentPrefix ? `${parentPrefix}/${fileName}` : fileName;
    const root = ensureNotesRoot();
    const meta = loadMeta(root);
    const sourceType = meta.entries[safeRel]?.noteType;
    const content = fs.readFileSync(destAbs, 'utf-8');
    const noteType = sourceType ?? getNoteType(newRel, content);
    const noteId = randomUUID();
    meta.entries[newRel] = { noteType, noteId };
    saveMeta(root, meta);

    return {
      id: newRel,
      name: fileName,
      kind: 'file',
      noteType,
      noteId,
    };
  }

  move(sourcePath: string, targetParentPath: string | null): INoteTreeNode {
    const safeSource = normalizeRelativePath(sourcePath);
    const sourceAbs = resolveSafePath(safeSource);
    if (!fs.existsSync(sourceAbs)) {
      throw new Error('Source not found');
    }

    const targetParentRel = targetParentPath ? normalizeRelativePath(targetParentPath) : '';
    const targetParentAbs = targetParentRel ? resolveSafePath(targetParentRel) : ensureNotesRoot();

    if (!fs.existsSync(targetParentAbs) || !fs.statSync(targetParentAbs).isDirectory()) {
      throw new Error('Target folder not found');
    }

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
    renameMetaEntry(safeSource, newRel);

    const isDir = fs.statSync(destAbs).isDirectory();
    if (isDir) {
      const root = ensureNotesRoot();
      const meta = loadMeta(root);
      return {
        id: newRel,
        name: baseName,
        kind: 'folder',
        children: scanDirectory(destAbs, newRel, meta),
      };
    }

    const content = fs.readFileSync(destAbs, 'utf-8');
    const noteType = getNoteType(newRel, content);
    const root = ensureNotesRoot();
    const meta = loadMeta(root);
    const noteId = ensureNoteId(meta, newRel, noteType);
    saveMeta(root, meta);
    return {
      id: newRel,
      name: baseName,
      kind: 'file',
      noteType,
      noteId,
    };
  }

  /** 将项目 .cursor/rules 目录初始化到笔记「规则」文件夹 */
  bootstrapCursorRulesFromProject(): { copied: number; skipped: number } {
    const sourceDir = path.join(getProjectRoot(), '.cursor', 'rules');
    if (!fs.existsSync(sourceDir)) {
      return { copied: 0, skipped: 0 };
    }

    const rulesFolderName = '规则';
    const root = ensureNotesRoot();
    let rulesFolderRel = '';
    const existing = fs
      .readdirSync(root, { withFileTypes: true })
      .find((entry) => entry.isDirectory() && entry.name === rulesFolderName);
    if (existing) {
      rulesFolderRel = existing.name;
    } else {
      const created = this.createFolder(null, rulesFolderName);
      rulesFolderRel = created.id;
    }

    const rulesFolderAbs = resolveSafePath(rulesFolderRel);
    let copied = 0;
    let skipped = 0;
    const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile()) {
        continue;
      }
      const lowerName = entry.name.toLowerCase();
      if (!lowerName.endsWith('.md') && !lowerName.endsWith('.mdc')) {
        continue;
      }
      const targetAbs = path.join(rulesFolderAbs, entry.name);
      if (fs.existsSync(targetAbs)) {
        skipped += 1;
        continue;
      }
      const sourceAbs = path.join(sourceDir, entry.name);
      fs.copyFileSync(sourceAbs, targetAbs);
      copied += 1;
    }

    return { copied, skipped };
  }
}

export const noteWorkspaceService = new NoteWorkspaceService();
