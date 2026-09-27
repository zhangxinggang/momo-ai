import { pluginEntrySource, validateToolIdentifier } from '@/shared/custom-tool-plugin';
import type {
  ECustomToolViewKind,
  ICustomToolCreateInput,
  ICustomToolDocument,
  ICustomToolPlugin,
  ICustomToolPluginValidation,
  ICustomToolSaveInput,
  ICustomToolTreeNode,
} from '@/types/modules';
import fs from 'node:fs';
import path from 'node:path';
import type { HostTool } from '../../agent-runtime/tools/broker';
import { checkPlugin, executePlugin, pluginRevision, validatePlugin } from './plugin-runtime';

const DEFINITION_FILE = 'momo-tool.json';
const LEGACY_DEFINITION_FILE = 'tool.json';
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
  url?: string;
  plugin?: ICustomToolPlugin;
  source?: string;
  validation?: ICustomToolPluginValidation;
}

interface ILegacyDefinition {
  kind: 'tool';
  name?: string;
  entry?: string;
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
  if (
    !value ||
    value.startsWith('.') ||
    /[. ]$/.test(value) ||
    /^(?:con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(value) ||
    !SAFE_NAME.test(value)
  ) {
    throw new Error('名称包含无效字符');
  }
  return value;
}

function assertView(kind: ECustomToolViewKind, content: string): void {
  if ((kind !== 'openui' && kind !== 'html' && kind !== 'web') || typeof content !== 'string') {
    throw new Error('工具视图无效');
  }
  if (Buffer.byteLength(content, 'utf8') > MAX_VIEW_BYTES) throw new Error('工具视图超过 2MB');
  const source = content.trim();
  if (kind === 'web') {
    if (!source) throw new Error('请输入网页地址');
    let url: URL;
    try {
      url = new URL(source);
    } catch {
      throw new Error('网页地址无效');
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error('网页地址仅支持 HTTP 或 HTTPS');
    }
    return;
  }
  if (!source) return;
  if (kind === 'openui' && !/^root\s*=/.test(source)) {
    throw new Error('工具界面源码必须以 root = 开始');
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
    (record.kind !== 'openui' &&
      record.kind !== 'html' &&
      record.kind !== 'web' &&
      record.kind !== 'plugin') ||
    typeof record.name !== 'string' ||
    !record.components ||
    typeof record.components !== 'object' ||
    Array.isArray(record.components)
  ) {
    throw new Error('自定义工具定义无效');
  }
  if (record.kind === 'web' && typeof record.url !== 'string') {
    throw new Error('自定义工具定义无效');
  }
  return record as unknown as IPersistedDefinition;
}

function readLegacyDefinition(directory: string): ILegacyDefinition {
  const definitionPath = path.join(directory, LEGACY_DEFINITION_FILE);
  let value: unknown;
  try {
    if (fs.statSync(definitionPath).size > MAX_DEFINITION_BYTES) {
      throw new Error('DEFINITION_TOO_LARGE');
    }
    value = JSON.parse(fs.readFileSync(definitionPath, 'utf8'));
  } catch {
    throw new Error('旧版自定义工具定义损坏');
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('旧版自定义工具定义无效');
  }
  const record = value as Record<string, unknown>;
  if (
    record.kind !== 'tool' ||
    (record.name !== undefined && typeof record.name !== 'string') ||
    (record.entry !== undefined && typeof record.entry !== 'string')
  ) {
    throw new Error('旧版自定义工具定义无效');
  }
  return record as unknown as ILegacyDefinition;
}

function resolveLegacyEntry(directory: string, entry: string | undefined): string {
  const normalized = (entry?.trim() || HTML_FILE).replace(/\\/g, '/');
  if (
    path.posix.isAbsolute(normalized) ||
    /^[a-zA-Z]:/.test(normalized) ||
    normalized.split('/').some((part) => !part || part === '.' || part === '..')
  ) {
    throw new Error('旧版自定义工具入口无效');
  }
  const result = path.resolve(directory, normalized);
  const relative = path.relative(directory, result);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('旧版自定义工具入口越界');
  }
  let walked = directory;
  for (const part of normalized.split('/')) {
    walked = path.join(walked, part);
    if (fs.existsSync(walked) && fs.lstatSync(walked).isSymbolicLink()) {
      throw new Error('旧版自定义工具入口不能经过符号链接');
    }
  }
  return result;
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
  private readonly rootDirectory: string;
  private readonly staticDirectory: string;

  constructor(rootDirectory: string, staticDirectory = path.join(rootDirectory, '.static')) {
    this.rootDirectory = rootDirectory;
    this.staticDirectory = staticDirectory;
  }

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

  assertIdentifierAvailable(identifier: string, exceptPath?: string): void {
    const error = validateToolIdentifier(identifier);
    if (error) throw Error(error);
    const walk = (nodes: ICustomToolTreeNode[]) => {
      for (const node of nodes) {
        if (
          node.id !== exceptPath &&
          node.toolIdentifier?.toLowerCase() === identifier.toLowerCase()
        )
          throw Error('工具标识已存在，请使用全局唯一的标识');
        if (node.children) walk(node.children);
      }
    };
    walk(this.listTree());
  }

  private isModernTool(directory: string): boolean {
    return fs.existsSync(path.join(directory, DEFINITION_FILE));
  }

  private isLegacyTool(directory: string): boolean {
    if (!fs.existsSync(path.join(directory, LEGACY_DEFINITION_FILE))) return false;
    try {
      readLegacyDefinition(directory);
      return true;
    } catch {
      return false;
    }
  }

  private isTool(directory: string): boolean {
    return this.isModernTool(directory) || this.isLegacyTool(directory);
  }

  resolveNodeDirectory(nodePath: string): string {
    const directory = this.resolve(nodePath);
    if (!fs.existsSync(directory) || !fs.statSync(directory).isDirectory()) {
      throw new Error('工具目录不存在');
    }
    return directory;
  }

  readSnapEditHtml(): string {
    const filePath = path.join(this.staticDirectory, 'snapEdit.html');
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      throw new Error('snapEdit.html 不存在');
    }
    return fs.readFileSync(filePath, 'utf8');
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
          if (this.isTool(absolute)) {
            let definition: IPersistedDefinition | null = null;
            try {
              if (this.isModernTool(absolute)) definition = readDefinition(absolute);
            } catch {
              /* A damaged document remains a removable leaf, never an Agent capability. */
            }
            return {
              id,
              name: item.name,
              kind: 'tool' as const,
              ...(definition?.kind === 'web' ? { webUrl: definition.url } : {}),
              ...(definition?.kind === 'plugin' && typeof definition.plugin?.identifier === 'string'
                ? { toolIdentifier: definition.plugin?.identifier }
                : {}),
            };
          }
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

  createTool(
    parentPath: string | null,
    name: string,
    input: ICustomToolCreateInput = { kind: 'openui' },
  ): ICustomToolTreeNode {
    if (!input || (input.kind !== 'openui' && input.kind !== 'web' && input.kind !== 'plugin')) {
      throw new Error('工具类型无效');
    }
    const kind = input.kind;
    const url = input.url?.trim() ?? '';
    if (kind === 'web') assertView('web', url);
    if (kind === 'plugin') this.assertIdentifierAvailable(input.identifier ?? '');
    const directory = this.assertAvailable(parentPath, name);
    const parent = this.resolve(parentPath);
    if (this.isTool(parent)) throw new Error('不能在工具内创建工具');
    fs.mkdirSync(directory, { recursive: false });
    const definition: IPersistedDefinition = {
      version: 1,
      kind,
      name: path.basename(directory),
      components: {},
      ...(kind === 'web' ? { url } : {}),
      ...(kind === 'plugin'
        ? {
            source: '',
            plugin: {
              identifier: input.identifier!,
              description: '',
              inputSchema: { type: 'object', properties: {}, additionalProperties: false },
              outputSchema: {},
              tests: [],
            },
          }
        : {}),
    };
    writeAtomic(path.join(directory, DEFINITION_FILE), JSON.stringify(definition, null, 2));
    if (kind === 'openui') writeAtomic(path.join(directory, OPENUI_FILE), '');
    return {
      id: path.relative(this.ensureRoot(), directory).replace(/\\/g, '/'),
      name: path.basename(directory),
      kind: 'tool',
    };
  }

  readDocument(toolPath: string): ICustomToolDocument {
    const directory = this.resolve(toolPath);
    if (!this.isModernTool(directory) && this.isLegacyTool(directory)) {
      const definition = readLegacyDefinition(directory);
      const filePath = resolveLegacyEntry(directory, definition.entry);
      const content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
      assertView('html', content);
      return {
        id: normalizeRelativePath(toolPath),
        name: definition.name?.trim() || path.basename(directory),
        kind: 'html',
        content,
        components: {},
      };
    }
    if (!this.isModernTool(directory)) throw new Error('自定义工具不存在');
    const definition = readDefinition(directory);
    if (definition.kind === 'plugin') {
      if (
        !definition.plugin ||
        validateToolIdentifier(definition.plugin.identifier) ||
        typeof definition.source !== 'string'
      )
        throw Error('AI 工具定义损坏');
      if (definition.source.trim()) checkPlugin(definition.source, definition.plugin);
      else if (
        typeof definition.plugin.description !== 'string' ||
        !definition.plugin.inputSchema ||
        !definition.plugin.outputSchema ||
        !Array.isArray(definition.plugin.tests)
      )
        throw Error('AI 工具草稿损坏');
      return {
        id: normalizeRelativePath(toolPath),
        name: definition.name,
        kind: 'plugin',
        content: definition.source ?? '',
        components: {},
        plugin: definition.plugin,
        validation: definition.validation,
      };
    }
    if (definition.kind === 'web') {
      const url = definition.url?.trim() ?? '';
      assertView('web', url);
      return {
        id: normalizeRelativePath(toolPath),
        name: definition.name || path.basename(directory),
        kind: 'web',
        content: url,
        components: {},
      };
    }
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
    if (!this.isModernTool(directory) && this.isLegacyTool(directory)) {
      if (!input || typeof input !== 'object' || input.kind !== 'html') {
        throw new Error('旧版自定义工具仅支持 HTML 视图');
      }
      assertView('html', input.content);
      const definition = readLegacyDefinition(directory);
      writeAtomic(resolveLegacyEntry(directory, definition.entry), input.content);
      return this.readDocument(toolPath);
    }
    if (!this.isModernTool(directory)) throw new Error('自定义工具不存在');
    if (!input || typeof input !== 'object') throw new Error('工具视图无效');
    if (readDefinition(directory).kind === 'plugin' || input.kind === 'plugin')
      throw Error('AI 工具必须通过插件校验后保存');
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
      components: input.kind === 'web' ? {} : input.components,
      ...(input.kind === 'web' ? { url: input.content.trim() } : {}),
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
    if (input.kind !== 'web') {
      const entry = input.kind === 'openui' ? OPENUI_FILE : HTML_FILE;
      writeAtomic(path.join(directory, entry), input.content);
    }
    writeAtomic(path.join(directory, DEFINITION_FILE), serializedDefinition);
    return this.readDocument(toolPath);
  }

  rename(nodePath: string, newName: string): ICustomToolTreeNode {
    const source = this.resolve(nodePath);
    if (!fs.existsSync(source)) throw new Error('节点不存在');
    const target = path.join(path.dirname(source), validateName(newName));
    if (fs.existsSync(target)) throw new Error('同级下已存在相同名称');
    fs.renameSync(source, target);
    if (this.isModernTool(target)) {
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
    if (!normalizeRelativePath(nodePath)) throw Error('不能删除工具根目录');
    const target = this.resolve(nodePath);
    if (!fs.existsSync(target)) return;
    fs.rmSync(target, { recursive: true, force: false });
  }

  async savePlugin(toolPath: string, input: ICustomToolSaveInput): Promise<ICustomToolDocument> {
    const directory = this.resolve(toolPath);
    const before = fs.readFileSync(path.join(directory, DEFINITION_FILE), 'utf8');
    const current = readDefinition(directory);
    if (current.kind !== 'plugin' || input.kind !== 'plugin' || !input.plugin)
      throw Error('AI 工具定义无效');
    if (input.plugin.identifier !== current.plugin?.identifier)
      throw Error('工具标识创建后不可更改');
    this.assertIdentifierAvailable(input.plugin.identifier, normalizeRelativePath(toolPath));
    // No mutation until all tests pass. Recheck after asynchronous validation to prevent stale saves/deletes.
    const validation = await validatePlugin(input.content, input.plugin);
    if (fs.readFileSync(path.join(directory, DEFINITION_FILE), 'utf8') !== before)
      throw Error('工具已被修改，请重新加载后保存');
    const definition: IPersistedDefinition = {
      ...current,
      plugin: input.plugin,
      source: input.content,
      validation,
    };
    writeAtomic(path.join(directory, 'execute.js'), input.content);
    writeAtomic(path.join(directory, 'plugin.json'), JSON.stringify(input.plugin, null, 2));
    writeAtomic(path.join(directory, 'index.mjs'), pluginEntrySource(input.plugin));
    writeAtomic(path.join(directory, DEFINITION_FILE), JSON.stringify(definition, null, 2));
    return this.readDocument(toolPath);
  }

  async invokePlugin(toolPath: string, input: unknown, signal?: AbortSignal): Promise<unknown> {
    const document = this.readDocument(toolPath);
    if (
      document.kind !== 'plugin' ||
      !document.plugin ||
      document.validation?.revision !== pluginRevision(document.content, document.plugin)
    )
      throw Error('插件尚未通过校验或内容已改变，请先生成并保存');
    return executePlugin(document.content, document.plugin, input, signal);
  }

  pluginTools(): HostTool[] {
    const result: HostTool[] = [];
    const names = new Set<string>();
    const walk = (nodes: ICustomToolTreeNode[]) => {
      for (const node of nodes) {
        if (node.children) walk(node.children);
        if (!node.toolIdentifier) continue;
        let document: ICustomToolDocument;
        try {
          document = this.readDocument(node.id);
        } catch {
          continue;
        }
        const plugin = document.plugin;
        if (!plugin || !document.content || !document.validation) continue;
        try {
          checkPlugin(document.content, plugin);
        } catch {
          continue;
        }
        const revision = pluginRevision(document.content, plugin);
        if (revision !== document.validation.revision) continue;
        if (names.has(plugin.identifier.toLowerCase())) throw Error('插件标识重复，无法注册');
        names.add(plugin.identifier.toLowerCase());
        result.push({
          id: 'custom.' + plugin.identifier,
          name: plugin.identifier,
          title: document.name,
          description: plugin.description,
          inputSchema: plugin.inputSchema,
          outputSchema: plugin.outputSchema,
          revision,
          effects: ['read'],
          timeoutMs: 6000,
          parallelSafe: true,
          idempotent: true,
          registrationSource: pluginEntrySource(plugin),
          execute: async (input, context) => {
            // Resolve by stable identifier so moves/renames never leave a stale path behind.
            const find = (items: ICustomToolTreeNode[]): ICustomToolTreeNode | undefined => {
              for (const item of items) {
                if (item.toolIdentifier === plugin.identifier) return item;
                const nested = item.children && find(item.children);
                if (nested) return nested;
              }
            };
            const currentNode = find(this.listTree());
            if (!currentNode) throw Error('插件已删除或不可用');
            const current = this.readDocument(currentNode.id);
            if (current.validation?.revision !== revision)
              throw Error('插件已更新，请使用最新参数重新调用');
            return this.invokePlugin(currentNode.id, input, context.signal);
          },
        });
      }
    };
    walk(this.listTree());
    return result;
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
