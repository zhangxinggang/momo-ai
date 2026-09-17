import fs from 'fs';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import path from 'path';
import {
  validateActionManifest,
  validateCallableActionManifest,
} from '../../agent-runtime/tools/manifest';

import type {
  DCustomToolMeta,
  ICustomToolGeneratedFile,
  ICustomToolTreeNode,
} from '@/types/modules';

import { getStaticDir, getToolsDir } from '../../runtime-paths';

const TOOL_META_FILE = 'tool.json';
const TOOL_ENTRY_FILE = 'index.html';
const TOOL_SUBDIRECTORIES = [
  'assets',
  'backend',
  'scripts',
  'actions',
  'lib',
  'mcp',
  'skills',
  'data',
] as const;
const MAX_GENERATED_FILE_BYTES = 2 * 1024 * 1024;
const MAX_GENERATED_BUNDLE_BYTES = 20 * 1024 * 1024;
const MAX_CONTEXT_FILE_BYTES = 96 * 1024;
const MAX_CONTEXT_BUNDLE_BYTES = 600 * 1024;
const CONTEXT_FILE_EXTENSIONS = new Set([
  '.html',
  '.css',
  '.js',
  '.mjs',
  '.cjs',
  '.ts',
  '.json',
  '.py',
  '.md',
  '.txt',
  '.yaml',
  '.yml',
  '.toml',
  '.xml',
  '.csv',
  '.sql',
  '.sh',
  '.ps1',
]);

const TOOL_README = `# 自定义工具

这个目录是一个独立、可迁移的工具包，工具所需的页面、服务、脚本和数据都应保存在这里。

- \`index.html\`：页面入口，可通过 \`/assets/...\` 引用本地资源。
- \`backend/\`：Node.js 或 Python 后台服务。监听端口必须读取 \`MOMO_TOOL_PORT\`，地址使用 \`MOMO_TOOL_HOST\`。
- \`scripts/\`：一次性 Python/Node 脚本或后台服务调用的辅助脚本。
- \`mcp/\`、\`skills/\`：工具专属的 MCP/Skill 配置、提示或辅助文件。
- \`data/\`：工具运行数据；\`assets/\`：前端静态资源。
- \`tool.json\`：入口、后台服务和 MCP/Skill 权限声明。

页面请求后台时使用 \`window.momoTool.request('/api/path', options)\`，不要写死端口。
页面调用宿主能力时使用 \`window.momoTool.callMcp(name, args)\` 或
\`window.momoTool.runSkill(idOrName, input, options)\`，并在 \`tool.json\` 的 permissions 中显式声明。
`;

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
  const relative = path.relative(root, abs);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Path escapes tools directory');
  }
  return abs;
}

function normalizeToolFilePath(relativePath: string): string {
  const normalized = normalizeRelativePath(relativePath.trim());
  if (!normalized) {
    throw new Error('Invalid generated file path');
  }
  return normalized;
}

/** 读取并校验 tool.json，非法则视为非工具包 */
function readToolMeta(dirAbs: string): DCustomToolMeta | null {
  const metaPath = path.join(dirAbs, TOOL_META_FILE);
  if (!fs.existsSync(metaPath) || !fs.statSync(metaPath).isFile()) {
    return null;
  }
  try {
    const raw = JSON.parse(fs.readFileSync(metaPath, 'utf-8')) as Partial<DCustomToolMeta>;
    if (raw?.kind !== 'tool' || 'version' in raw || 'packageVersion' in raw) {
      return null;
    }
    validateActionManifest(raw);
    const service = raw.service;
    const runtime = service?.runtime;
    return {
      kind: 'tool',
      id: raw.id!,
      name: typeof raw.name === 'string' ? raw.name.trim() : undefined,
      description: typeof raw.description === 'string' ? raw.description.trim() : undefined,
      aliases: Array.isArray(raw.aliases) ? raw.aliases.map((item) => item.trim()) : undefined,
      actions: raw.actions!,
      entry: typeof raw.entry === 'string' && raw.entry.trim() ? raw.entry : TOOL_ENTRY_FILE,
      service:
        runtime === 'node' || runtime === 'python'
          ? {
              runtime,
              entry: typeof service.entry === 'string' ? service.entry : undefined,
              args: Array.isArray(service.args)
                ? service.args.filter((item): item is string => typeof item === 'string')
                : undefined,
              healthPath: typeof service.healthPath === 'string' ? service.healthPath : undefined,
              startupTimeoutMs:
                typeof service.startupTimeoutMs === 'number' ? service.startupTimeoutMs : undefined,
              env:
                service.env && typeof service.env === 'object'
                  ? Object.fromEntries(
                      Object.entries(service.env).filter(
                        (entry): entry is [string, string] => typeof entry[1] === 'string',
                      ),
                    )
                  : undefined,
            }
          : { runtime: 'none' },
      permissions: {
        mcp: Array.isArray(raw.permissions?.mcp)
          ? raw.permissions.mcp.filter((item): item is string => typeof item === 'string')
          : [],
        skills: Array.isArray(raw.permissions?.skills)
          ? raw.permissions.skills.filter((item): item is string => typeof item === 'string')
          : [],
      },
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

function writeToolMeta(dirAbs: string, displayName: string): void {
  const meta: DCustomToolMeta = {
    kind: 'tool',
    id: randomUUID(),
    name: displayName,
    aliases: [displayName],
    actions: [],
    entry: TOOL_ENTRY_FILE,
    service: { runtime: 'none' },
    permissions: { mcp: [], skills: [] },
  };
  fs.writeFileSync(
    path.join(dirAbs, TOOL_META_FILE),
    `${JSON.stringify(meta, null, 2)}\n`,
    'utf-8',
  );
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

  /** 创建可扩展工具包；所有实现文件均收敛在该工具目录内。 */
  createFile(parentPath: string | null, name: string): ICustomToolTreeNode {
    const baseName = (name.trim() || '新建工具').replace(/\.html?$/i, '');
    const parentRel = parentPath ? normalizeRelativePath(parentPath) : '';
    const parentAbs = parentRel ? resolveSafePath(parentRel) : ensureToolsRoot();
    assertParentIsOrgFolder(parentAbs, parentRel);

    const finalName = uniqueDirName(parentAbs, baseName);
    const abs = path.join(parentAbs, finalName);
    fs.mkdirSync(abs, { recursive: true });
    writeToolMeta(abs, finalName);
    for (const dirName of TOOL_SUBDIRECTORIES) {
      fs.mkdirSync(path.join(abs, dirName), { recursive: true });
    }
    fs.writeFileSync(path.join(abs, 'README.md'), TOOL_README, 'utf-8');
    // 空内容：查看态显示「暂无工具」，编辑态引导生成。
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

  readMeta(relativePath: string): DCustomToolMeta {
    const safeRel = normalizeRelativePath(relativePath);
    const abs = resolveSafePath(safeRel);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory()) {
      throw new Error('Tool package not found');
    }
    const meta = readToolMeta(abs);
    if (!meta) {
      throw new Error('Invalid tool.json');
    }
    return meta;
  }

  /** 仅供工具运行器使用，始终返回 tools 根目录内部的工具目录。 */
  resolveToolDirectory(relativePath: string): string {
    const safeRel = normalizeRelativePath(relativePath);
    const abs = resolveSafePath(safeRel);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory() || !isToolPackageDir(abs)) {
      throw new Error('Tool package not found');
    }
    return abs;
  }

  /**
   * 写入 AI 生成的多文件产物。文件路径只允许位于当前工具包内，且限制单文件/总大小。
   * 未包含 index.html 时保留现有页面，避免异常模型输出清空工具。
   */
  writeGeneratedFiles(
    relativePath: string,
    files: ICustomToolGeneratedFile[],
    options?: { requireCallable?: boolean },
  ): void {
    const toolAbs = this.resolveToolDirectory(relativePath);
    const seen = new Set<string>();
    let totalBytes = 0;

    const normalizedFiles = files.map((file) => {
      if (!file || typeof file.path !== 'string' || typeof file.content !== 'string') {
        throw new Error('Invalid generated file');
      }
      const filePath = normalizeToolFilePath(file.path);
      const key = filePath.toLowerCase();
      if (seen.has(key)) {
        throw new Error(`Duplicate generated file: ${filePath}`);
      }
      seen.add(key);
      const bytes = Buffer.byteLength(file.content, 'utf8');
      if (bytes > MAX_GENERATED_FILE_BYTES) {
        throw new Error(`Generated file is too large: ${filePath}`);
      }
      totalBytes += bytes;
      if (totalBytes > MAX_GENERATED_BUNDLE_BYTES) {
        throw new Error('Generated tool bundle is too large');
      }

      const targetAbs = path.resolve(toolAbs, filePath);
      const relative = path.relative(toolAbs, targetAbs);
      if (relative.startsWith('..') || path.isAbsolute(relative)) {
        throw new Error(`Generated file escapes tool directory: ${filePath}`);
      }
      return { filePath, targetAbs, content: file.content };
    });

    const manifestFile = normalizedFiles.find((file) => file.filePath === 'tool.json');
    const candidate = manifestFile ? JSON.parse(manifestFile.content) : readToolMeta(toolAbs);
    if (!candidate || 'version' in candidate || 'packageVersion' in candidate)
      throw new Error('工具规范不支持版本字段');
    const manifest = options?.requireCallable
      ? validateCallableActionManifest(candidate)
      : validateActionManifest(candidate);
    const previousMeta = readToolMeta(toolAbs);
    if (previousMeta && previousMeta.id !== manifest.id) throw new Error('工具 id 必须保持稳定');
    for (const action of manifest.actions) {
      if (action.executor.runtime === 'http') continue;
      const entry = action.executor.entry!;
      const generated = normalizedFiles.find((file) => file.filePath === entry);
      if (!generated && !fs.existsSync(path.join(toolAbs, entry)))
        throw new Error('Action 入口不存在：' + entry);
    }
    // Validate the complete proposal before publishing any generated file; the manifest is published last.
    normalizedFiles.sort(
      (a, b) => Number(a.filePath === 'tool.json') - Number(b.filePath === 'tool.json'),
    );
    for (const file of normalizedFiles) {
      if (
        /\.(mjs|cjs|js)$/.test(file.filePath) &&
        /^(actions|backend|lib|scripts)\//.test(file.filePath)
      ) {
        const syntax = spawnSync(
          process.execPath,
          ['--check', '--input-type=' + (file.filePath.endsWith('.cjs') ? 'commonjs' : 'module')],
          {
            input: file.content,
            encoding: 'utf8',
            windowsHide: true,
            timeout: 10000,
            env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
          },
        );
        if (syntax.status !== 0) throw new Error('工具代码语法错误：' + file.filePath);
      }
      const parent = path.dirname(file.targetAbs);
      let ancestor = parent;
      while (!fs.existsSync(ancestor)) ancestor = path.dirname(ancestor);
      const realRoot = fs.realpathSync(toolAbs);
      const relativeParent = path.relative(realRoot, fs.realpathSync(ancestor));
      if (
        relativeParent.startsWith('..') ||
        path.isAbsolute(relativeParent) ||
        (fs.existsSync(file.targetAbs) && fs.lstatSync(file.targetAbs).isSymbolicLink())
      )
        throw new Error('工具路径包含外部链接');
    }
    const before = normalizedFiles.map((file) => ({
      file,
      bytes: fs.existsSync(file.targetAbs) ? fs.readFileSync(file.targetAbs) : null,
    }));
    const staged: string[] = [];
    try {
      for (const file of normalizedFiles) {
        fs.mkdirSync(path.dirname(file.targetAbs), { recursive: true });
        const temporary = file.targetAbs + '.harness-' + randomUUID();
        staged.push(temporary);
        fs.writeFileSync(temporary, file.content, 'utf8');
      }
      for (let i = 0; i < normalizedFiles.length; i++)
        fs.renameSync(staged[i], normalizedFiles[i].targetAbs);
    } catch (error) {
      for (const old of before) {
        if (old.bytes) fs.writeFileSync(old.file.targetAbs, old.bytes);
        else if (fs.existsSync(old.file.targetAbs)) fs.unlinkSync(old.file.targetAbs);
      }
      throw error;
    } finally {
      for (const file of staged) if (fs.existsSync(file)) fs.unlinkSync(file);
    }
  }

  /** 为下一轮 AI 改写读取当前工具的文本实现；跳过运行数据、依赖和大文件。 */
  readContextFiles(relativePath: string): ICustomToolGeneratedFile[] {
    const toolAbs = this.resolveToolDirectory(relativePath);
    const files: ICustomToolGeneratedFile[] = [];
    let totalBytes = 0;

    const visit = (dirAbs: string, prefix: string) => {
      const entries = fs
        .readdirSync(dirAbs, { withFileTypes: true })
        .sort((left, right) => left.name.localeCompare(right.name));
      for (const entry of entries) {
        const childRel = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (entry.isSymbolicLink()) {
          continue;
        }
        if (entry.isDirectory()) {
          if (['data', 'node_modules', '.venv', 'venv', '__pycache__'].includes(entry.name)) {
            continue;
          }
          visit(path.join(dirAbs, entry.name), childRel);
          continue;
        }
        if (!entry.isFile() || entry.name.toLowerCase() === 'readme.md') {
          continue;
        }
        const ext = path.extname(entry.name).toLowerCase();
        if (!CONTEXT_FILE_EXTENSIONS.has(ext)) {
          continue;
        }
        const fileAbs = path.join(dirAbs, entry.name);
        const bytes = fs.statSync(fileAbs).size;
        if (bytes > MAX_CONTEXT_FILE_BYTES || totalBytes + bytes > MAX_CONTEXT_BUNDLE_BYTES) {
          continue;
        }
        files.push({ path: childRel, content: fs.readFileSync(fileAbs, 'utf8') });
        totalBytes += bytes;
      }
    };

    visit(toolAbs, '');
    files.sort((left, right) => {
      const order = (value: string) => (value === 'index.html' ? 0 : value === 'tool.json' ? 1 : 2);
      return order(left.path) - order(right.path) || left.path.localeCompare(right.path);
    });
    return files;
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
