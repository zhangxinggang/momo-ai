import type {
  ECustomToolViewKind,
  ICustomToolDocument,
  ICustomToolSaveInput,
  ICustomToolTreeNode,
} from '@/types/modules';
import fs from 'node:fs';
import path from 'node:path';

const DEFINITION_FILE = 'momo-tool.json';
const OPENUI_FILE = 'view.openui';
const HTML_FILE = 'index.html';
const MAX_VIEW_BYTES = 2 * 1024 * 1024;
const MAX_DEFINITION_BYTES = 2 * 1024 * 1024;
const SAFE_NAME = /^[^<>:"/\\|?*\u0000-\u001f]+$/u;

interface IPersistedDefinition {
  version: 1;
  kind: ECustomToolViewKind;
  name: string;
  components: ICustomToolSaveInput['components'];
}

function normalizeRelativePath(value: string | null): string {
  if (!value) return '';
  const normalized = value.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  if (
    !normalized ||
    path.posix.isAbsolute(normalized) ||
    /^[a-zA-Z]:/.test(normalized) ||
    normalized.split('/').some((part) => !part || part === '.' || part === '..')
  ) {
    throw new Error('工具路径无效');
  }
  return normalized;
}

function validateName(name: string): string {
  const value = name.trim();
  if (!value || value === '.' || value === '..' || !SAFE_NAME.test(value)) {
    throw new Error('名称包含无效字符');
  }
  return value;
}

function assertView(kind: ECustomToolViewKind, content: string): void {
  if ((kind !== 'openui' && kind !== 'html') || typeof content !== 'string') {
    throw new Error('工具视图无效');
  }
  if (Buffer.byteLength(content, 'utf8') > MAX_VIEW_BYTES) throw new Error('工具视图超过 2MB');
  const source = content.trim();
  if (!source) return;
  if (kind === 'openui' && !/^root\s*=/.test(source)) {
    throw new Error('OpenUI 内容必须以 root = 开始');
  }
  if (kind === 'html' && !/^\s*(?:<!doctype\s+html\b|<[a-z][\w:-]*\b)/i.test(source)) {
    throw new Error('HTML 内容不是完整页面');
  }
}

function readDefinition(directory: string): IPersistedDefinition {
  let value: unknown;
  try {
    const definitionPath = path.join(directory, DEFINITION_FILE);
    if (fs.statSync(definitionPath).size > MAX_DEFINITION_BYTES) {
      throw new Error('DEFINITION_TOO_LARGE');
    }
    value = JSON.parse(fs.readFileSync(definitionPath, 'utf8'));
  } catch {
    throw new Error('自定义工具定义损坏');
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('自定义工具定义无效');
  }
  const record = value as Record<string, unknown>;
  if (
    record.version !== 1 ||
    (record.kind !== 'openui' && record.kind !== 'html') ||
    typeof record.name !== 'string' ||
    !record.components ||
    typeof record.components !== 'object' ||
    Array.isArray(record.components)
  ) {
    throw new Error('自定义工具定义无效');
  }
  return record as unknown as IPersistedDefinition;
}

function writeAtomic(filePath: string, content: string): void {
  const temporary = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  try {
    fs.writeFileSync(temporary, content, 'utf8');
    fs.renameSync(temporary, filePath);
  } finally {
    if (fs.existsSync(temporary)) fs.rmSync(temporary, { force: true });
  }
}

export class CustomToolWorkspaceService {
  constructor(private readonly rootDirectory: string) {}

  private ensureRoot(): string {
    fs.mkdirSync(this.rootDirectory, { recursive: true });
    return fs.realpathSync(this.rootDirectory);
  }

  private resolve(relativePath: string | null): string {
    const root = this.ensureRoot();
    const normalized = normalizeRelativePath(relativePath);
    const result = path.resolve(root, normalized);
    const relative = path.relative(root, result);
    if (relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('工具路径越界');
    let walked = root;
    for (const part of normalized.split('/').filter(Boolean)) {
      walked = path.join(walked, part);
      if (fs.existsSync(walked) && fs.lstatSync(walked).isSymbolicLink()) {
        throw new Error('工具路径不能经过符号链接');
      }
    }
    return result;
  }

  private assertAvailable(parentPath: string | null, name: string): string {
    const directory = path.join(this.resolve(parentPath), validateName(name));
    if (fs.existsSync(directory)) throw new Error('同级下已存在相同名称');
    return directory;
  }

  private isTool(directory: string): boolean {
    return fs.existsSync(path.join(directory, DEFINITION_FILE));
  }

  listTree(): ICustomToolTreeNode[] {
    const root = this.ensureRoot();
    const walk = (directory: string): ICustomToolTreeNode[] =>
      fs
        .readdirSync(directory, { withFileTypes: true })
        .filter((item) => item.isDirectory() && !item.name.startsWith('.'))
        .sort((left, right) => left.name.localeCompare(right.name, 'zh-CN'))
        .map((item) => {
          const absolute = path.join(directory, item.name);
          const id = path.relative(root, absolute).replace(/\\/g, '/');
          if (this.isTool(absolute)) return { id, name: item.name, kind: 'tool' as const };
          const children = walk(absolute);
          return { id, name: item.name, kind: 'folder' as const, children };
        });
    return walk(root);
  }

  createFolder(parentPath: string | null, name: string): ICustomToolTreeNode {
    const directory = this.assertAvailable(parentPath, name);
    const parent = this.resolve(parentPath);
    if (this.isTool(parent)) throw new Error('不能在工具内创建目录');
    fs.mkdirSync(directory, { recursive: false });
    return {
      id: path.relative(this.ensureRoot(), directory).replace(/\\/g, '/'),
      name: path.basename(directory),
      kind: 'folder',
      children: [],
    };
  }

  createTool(parentPath: string | null, name: string): ICustomToolTreeNode {
    const directory = this.assertAvailable(parentPath, name);
    const parent = this.resolve(parentPath);
    if (this.isTool(parent)) throw new Error('不能在工具内创建工具');
    fs.mkdirSync(directory, { recursive: false });
    const definition: IPersistedDefinition = {
      version: 1,
      kind: 'openui',
      name: path.basename(directory),
      components: {},
    };
    writeAtomic(path.join(directory, DEFINITION_FILE), JSON.stringify(definition, null, 2));
    writeAtomic(path.join(directory, OPENUI_FILE), '');
    return {
      id: path.relative(this.ensureRoot(), directory).replace(/\\/g, '/'),
      name: path.basename(directory),
      kind: 'tool',
    };
  }

  readDocument(toolPath: string): ICustomToolDocument {
    const directory = this.resolve(toolPath);
    if (!this.isTool(directory)) throw new Error('自定义工具不存在或仍使用旧格式');
    const definition = readDefinition(directory);
    const entry = definition.kind === 'openui' ? OPENUI_FILE : HTML_FILE;
    const filePath = path.join(directory, entry);
    const content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
    assertView(definition.kind, content);
    return {
      id: normalizeRelativePath(toolPath),
      name: definition.name || path.basename(directory),
      kind: definition.kind,
      content,
      components: definition.components,
    };
  }

  saveDocument(toolPath: string, input: ICustomToolSaveInput): ICustomToolDocument {
    const directory = this.resolve(toolPath);
    if (!this.isTool(directory)) throw new Error('自定义工具不存在或仍使用旧格式');
    if (!input || typeof input !== 'object') throw new Error('工具视图无效');
    assertView(input.kind, input.content);
    if (
      !input.components ||
      typeof input.components !== 'object' ||
      Array.isArray(input.components)
    ) {
      throw new Error('组件配置无效');
    }
    const current = readDefinition(directory);
    const definition: IPersistedDefinition = {
      version: 1,
      kind: input.kind,
      name: current.name || path.basename(directory),
      components: input.components,
    };
    let serializedDefinition: string;
    try {
      serializedDefinition = JSON.stringify(definition, null, 2);
    } catch {
      throw new Error('组件配置必须是可序列化 JSON');
    }
    if (Buffer.byteLength(serializedDefinition, 'utf8') > MAX_DEFINITION_BYTES) {
      throw new Error('组件配置超过 2MB');
    }
    const entry = input.kind === 'openui' ? OPENUI_FILE : HTML_FILE;
    writeAtomic(path.join(directory, entry), input.content);
    writeAtomic(path.join(directory, DEFINITION_FILE), serializedDefinition);
    return this.readDocument(toolPath);
  }

  rename(nodePath: string, newName: string): ICustomToolTreeNode {
    const source = this.resolve(nodePath);
    if (!fs.existsSync(source)) throw new Error('节点不存在');
    const target = path.join(path.dirname(source), validateName(newName));
    if (fs.existsSync(target)) throw new Error('同级下已存在相同名称');
    fs.renameSync(source, target);
    if (this.isTool(target)) {
      const definition = readDefinition(target);
      writeAtomic(
        path.join(target, DEFINITION_FILE),
        JSON.stringify({ ...definition, name: path.basename(target) }, null, 2),
      );
    }
    return {
      id: path.relative(this.ensureRoot(), target).replace(/\\/g, '/'),
      name: path.basename(target),
      kind: this.isTool(target) ? 'tool' : 'folder',
    };
  }

  deleteNode(nodePath: string): void {
    const target = this.resolve(nodePath);
    if (!fs.existsSync(target)) return;
    fs.rmSync(target, { recursive: true, force: false });
  }

  move(sourcePath: string, targetParentPath: string | null): ICustomToolTreeNode {
    const source = this.resolve(sourcePath);
    const targetParent = this.resolve(targetParentPath);
    if (!fs.existsSync(source) || !fs.statSync(source).isDirectory()) throw new Error('节点不存在');
    if (!fs.existsSync(targetParent) || !fs.statSync(targetParent).isDirectory()) {
      throw new Error('目标目录不存在');
    }
    if (this.isTool(targetParent)) throw new Error('不能移动到工具内部');
    const relativeParent = path.relative(source, targetParent);
    if (!relativeParent.startsWith('..') && !path.isAbsolute(relativeParent)) {
      throw new Error('不能移动到自身或子目录');
    }
    const target = path.join(targetParent, path.basename(source));
    if (fs.existsSync(target)) throw new Error('目标目录已存在同名节点');
    fs.renameSync(source, target);
    return {
      id: path.relative(this.ensureRoot(), target).replace(/\\/g, '/'),
      name: path.basename(target),
      kind: this.isTool(target) ? 'tool' : 'folder',
    };
  }
}
