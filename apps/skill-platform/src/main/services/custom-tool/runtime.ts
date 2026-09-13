import type {
  DCustomToolMeta,
  ECustomToolRuntimeStatus,
  ICustomToolPermissions,
  ICustomToolRuntimeInfo,
} from '@/types/modules';
import { spawn, type ChildProcessWithoutNullStreams } from 'child_process';
import fs from 'fs';
import http, { type IncomingMessage, type ServerResponse } from 'http';
import net from 'net';
import path from 'path';

import { resolveSkillShellEnv } from '../skill/runtime/toolchain';
import { customToolWorkspaceService } from './workspace';

const LOOPBACK_HOST = '127.0.0.1';
const DEFAULT_STARTUP_TIMEOUT_MS = 15_000;
const MAX_STARTUP_TIMEOUT_MS = 60_000;
const MAX_LOG_LINES = 120;
const PRIVATE_TOP_LEVEL_PATHS = new Set([
  'backend',
  'scripts',
  'mcp',
  'skills',
  'data',
  'tool.json',
  'readme.md',
  'package.json',
  'requirements.txt',
]);
const PRIVATE_STATIC_EXTENSIONS = new Set([
  '.py',
  '.sh',
  '.ps1',
  '.bat',
  '.cmd',
  '.toml',
  '.yaml',
  '.yml',
  '.md',
]);

interface IActiveRuntime {
  toolPath: string;
  toolDirectory: string;
  meta: DCustomToolMeta;
  previewServer: http.Server;
  previewPort: number;
  backendPort?: number;
  backendProcess?: ChildProcessWithoutNullStreams;
  status: ECustomToolRuntimeStatus;
  errorMessage?: string;
  logs: string[];
}

export interface ICustomToolRuntimeWorkspace {
  resolveToolDirectory: (toolPath: string) => string;
  readMeta: (toolPath: string) => DCustomToolMeta;
}

function appendLog(runtime: IActiveRuntime, source: string, chunk: string | Buffer): void {
  const text = typeof chunk === 'string' ? chunk : chunk.toString('utf8');
  for (const line of text.split(/\r?\n/)) {
    if (line.trim()) {
      runtime.logs.push(`[${source}] ${line}`);
    }
  }
  if (runtime.logs.length > MAX_LOG_LINES) {
    runtime.logs.splice(0, runtime.logs.length - MAX_LOG_LINES);
  }
}

function getPermissions(meta: DCustomToolMeta): ICustomToolPermissions {
  return {
    mcp: [...(meta.permissions?.mcp ?? [])],
    skills: [...(meta.permissions?.skills ?? [])],
  };
}

function toRuntimeInfo(runtime: IActiveRuntime): ICustomToolRuntimeInfo {
  return {
    toolPath: runtime.toolPath,
    status: runtime.status,
    previewUrl: `http://${LOOPBACK_HOST}:${runtime.previewPort}/`,
    serviceRuntime: runtime.meta.service?.runtime ?? 'none',
    permissions: getPermissions(runtime.meta),
    errorMessage: runtime.errorMessage,
    logs: [...runtime.logs],
  };
}

function listen(server: http.Server): Promise<number> {
  return new Promise((resolve, reject) => {
    const onError = (error: Error) => reject(error);
    server.once('error', onError);
    server.listen(0, LOOPBACK_HOST, () => {
      server.off('error', onError);
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Unable to allocate preview port'));
        return;
      }
      resolve(address.port);
    });
  });
}

function reservePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, LOOPBACK_HOST, () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close();
        reject(new Error('Unable to allocate backend port'));
        return;
      }
      const port = address.port;
      server.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve(port);
        }
      });
    });
  });
}

function closeServer(server: http.Server): Promise<void> {
  return new Promise((resolve) => {
    if (!server.listening) {
      resolve();
      return;
    }
    server.close(() => resolve());
    server.closeAllConnections?.();
  });
}

function contentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const types: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
  };
  return types[ext] ?? 'application/octet-stream';
}

function createBrowserBridge(toolPath: string, meta: DCustomToolMeta): string {
  const config = JSON.stringify({
    toolPath,
    apiBase: '/__tool_api__',
    permissions: getPermissions(meta),
  }).replace(/</g, '\\u003c');

  return `<script data-momo-tool-bridge>
(() => {
  const config = ${config};
  let sequence = 0;
  const pending = new Map();
  window.addEventListener('message', (event) => {
    const data = event.data;
    if (!data || data.type !== 'momo-tool:result' || !pending.has(data.requestId)) return;
    const item = pending.get(data.requestId);
    pending.delete(data.requestId);
    if (data.ok) item.resolve(data.result);
    else item.reject(new Error(data.error || '宿主能力调用失败'));
  });
  const invoke = (action, payload) => new Promise((resolve, reject) => {
    const requestId = 'tool-' + Date.now() + '-' + (++sequence);
    pending.set(requestId, { resolve, reject });
    window.parent.postMessage({
      type: 'momo-tool:invoke', requestId, toolPath: config.toolPath, action, payload
    }, '*');
    window.setTimeout(() => {
      if (!pending.has(requestId)) return;
      pending.delete(requestId);
      reject(new Error('宿主能力调用超时'));
    }, 60000);
  });
  window.momoTool = Object.freeze({
    config,
    request: (url, options) => fetch(config.apiBase + (String(url).startsWith('/') ? url : '/' + url), options),
    invoke,
    callMcp: (name, args = {}) => invoke('mcp.call', { name, arguments: args }),
    runSkill: (skill, input, options) => invoke('skill.execute', { skill, input, options })
  });
  window.dispatchEvent(new CustomEvent('momo-tool-ready', { detail: config }));
})();
</script>`;
}

function injectBrowserBridge(html: string, toolPath: string, meta: DCustomToolMeta): string {
  const bridge = createBrowserBridge(toolPath, meta);
  const headClose = html.search(/<\/head\s*>/i);
  if (headClose >= 0) {
    return `${html.slice(0, headClose)}${bridge}${html.slice(headClose)}`;
  }
  const bodyOpen = html.match(/<body(?:\s[^>]*)?>/i);
  if (bodyOpen?.index != null) {
    const index = bodyOpen.index + bodyOpen[0].length;
    return `${html.slice(0, index)}${bridge}${html.slice(index)}`;
  }
  return `${bridge}${html}`;
}

function isPrivateStaticPath(relativePath: string): boolean {
  const parts = relativePath.replace(/\\/g, '/').split('/');
  const topLevel = parts[0]?.toLowerCase();
  return (
    parts.some((part) => part.startsWith('.')) ||
    PRIVATE_TOP_LEVEL_PATHS.has(topLevel) ||
    PRIVATE_STATIC_EXTENSIONS.has(path.extname(relativePath).toLowerCase())
  );
}

function sendJson(response: ServerResponse, status: number, body: unknown): void {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(JSON.stringify(body));
}

function proxyBackend(
  request: IncomingMessage,
  response: ServerResponse,
  backendPort: number | undefined,
): void {
  if (!backendPort) {
    sendJson(response, 503, { error: '当前工具未配置后台服务' });
    return;
  }

  const sourceUrl = new URL(request.url ?? '/', `http://${LOOPBACK_HOST}`);
  const proxiedPath = sourceUrl.pathname.replace(/^\/__tool_api__/, '') || '/';
  const headers = { ...request.headers, host: `${LOOPBACK_HOST}:${backendPort}` };
  const upstream = http.request(
    {
      host: LOOPBACK_HOST,
      port: backendPort,
      method: request.method,
      path: `${proxiedPath}${sourceUrl.search}`,
      headers,
    },
    (upstreamResponse) => {
      response.writeHead(upstreamResponse.statusCode ?? 502, upstreamResponse.headers);
      upstreamResponse.pipe(response);
    },
  );
  upstream.on('error', (error) => {
    if (!response.headersSent) {
      sendJson(response, 502, { error: `后台服务不可用: ${error.message}` });
    } else {
      response.end();
    }
  });
  request.pipe(upstream);
}

function waitForBackend(
  port: number,
  healthPath: string | undefined,
  timeoutMs: number,
  shouldContinue: () => boolean,
): Promise<void> {
  const startedAt = Date.now();
  return new Promise((resolve, reject) => {
    function retry() {
      if (!shouldContinue()) {
        reject(new Error('工具启动已取消'));
        return;
      }
      if (Date.now() - startedAt >= timeoutMs) {
        reject(new Error(`后台服务启动超时（${timeoutMs}ms）`));
        return;
      }
      setTimeout(probe, 150);
    }
    function probe() {
      if (!shouldContinue()) {
        reject(new Error('工具启动已取消'));
        return;
      }
      const probePath = healthPath?.trim() || '/';
      const request = http.get(
        { host: LOOPBACK_HOST, port, path: probePath, timeout: 800 },
        (response) => {
          response.resume();
          if (!healthPath || (response.statusCode ?? 500) < 500) {
            resolve();
            return;
          }
          retry();
        },
      );
      request.on('timeout', () => request.destroy());
      request.on('error', retry);
    }
    probe();
  });
}

export class CustomToolRuntimeService {
  private active: IActiveRuntime | null = null;

  private transition: Promise<void> = Promise.resolve();

  private transitionVersion = 0;

  private readonly workspace: ICustomToolRuntimeWorkspace;

  constructor(workspace: ICustomToolRuntimeWorkspace) {
    this.workspace = workspace;
  }

  activate(toolPath: string): Promise<ICustomToolRuntimeInfo> {
    const version = ++this.transitionVersion;
    const operation = this.transition.then(() =>
      this.activateNow(toolPath, () => version === this.transitionVersion),
    );
    this.transition = operation.then(
      () => undefined,
      () => undefined,
    );
    return operation;
  }

  deactivate(toolPath?: string): Promise<void> {
    this.transitionVersion += 1;
    const operation = this.transition.then(async () => {
      if (
        !toolPath ||
        this.active?.toolPath === toolPath ||
        this.active?.toolPath.startsWith(`${toolPath}/`)
      ) {
        await this.stopActive();
      }
    });
    this.transition = operation.catch(() => undefined);
    return operation;
  }

  getStatus(toolPath: string): ICustomToolRuntimeInfo | null {
    return this.active?.toolPath === toolPath ? toRuntimeInfo(this.active) : null;
  }

  async dispose(): Promise<void> {
    await this.deactivate();
  }

  /** 应用退出不能等待异步切换队列，立即关闭监听并终止子进程。 */
  disposeNow(): void {
    this.transitionVersion += 1;
    const runtime = this.active;
    this.active = null;
    if (!runtime) {
      return;
    }
    runtime.previewServer.closeAllConnections?.();
    runtime.previewServer.close();
    const child = runtime.backendProcess;
    runtime.backendProcess = undefined;
    if (child && child.exitCode == null && child.signalCode == null) {
      child.kill('SIGTERM');
    }
  }

  private async activateNow(
    toolPath: string,
    shouldContinue: () => boolean,
  ): Promise<ICustomToolRuntimeInfo> {
    await this.stopActive();
    if (!shouldContinue()) {
      throw new Error('工具启动已取消');
    }

    const toolDirectory = this.workspace.resolveToolDirectory(toolPath);
    const meta = this.workspace.readMeta(toolPath);
    const entryPath = meta.entry || 'index.html';
    const entryAbs = path.resolve(toolDirectory, entryPath);
    const relativeEntry = path.relative(toolDirectory, entryAbs);
    if (
      relativeEntry.startsWith('..') ||
      path.isAbsolute(relativeEntry) ||
      !fs.existsSync(entryAbs)
    ) {
      throw new Error(`工具页面入口不存在: ${entryPath}`);
    }

    const runtime: IActiveRuntime = {
      toolPath,
      toolDirectory,
      meta,
      previewServer: http.createServer(),
      previewPort: 0,
      status: 'starting',
      logs: [],
    };
    this.active = runtime;

    try {
      await this.startBackend(runtime, shouldContinue);
    } catch (error) {
      runtime.status = 'error';
      runtime.errorMessage = error instanceof Error ? error.message : String(error);
      appendLog(runtime, 'host', runtime.errorMessage);
      runtime.backendProcess?.kill('SIGTERM');
      runtime.backendProcess = undefined;
      runtime.backendPort = undefined;
    }

    if (!shouldContinue()) {
      await this.stopRuntime(runtime);
      if (this.active === runtime) {
        this.active = null;
      }
      throw new Error('工具启动已取消');
    }

    runtime.previewServer.removeAllListeners('request');
    runtime.previewServer.on('request', (request, response) =>
      this.handlePreviewRequest(runtime, request, response),
    );
    try {
      runtime.previewPort = await listen(runtime.previewServer);
    } catch (error) {
      await this.stopRuntime(runtime);
      if (this.active === runtime) {
        this.active = null;
      }
      throw error;
    }

    if (runtime.status !== 'error') {
      runtime.status = 'running';
    }
    return toRuntimeInfo(runtime);
  }

  private async startBackend(
    runtime: IActiveRuntime,
    shouldContinue: () => boolean,
  ): Promise<void> {
    const config = runtime.meta.service;
    if (!config || config.runtime === 'none') {
      return;
    }
    if (!config.entry?.trim()) {
      throw new Error('tool.json 缺少 service.entry');
    }

    const entryAbs = path.resolve(runtime.toolDirectory, config.entry);
    const relativeEntry = path.relative(runtime.toolDirectory, entryAbs);
    if (relativeEntry.startsWith('..') || path.isAbsolute(relativeEntry)) {
      throw new Error('后台入口不能位于工具目录之外');
    }
    if (!fs.existsSync(entryAbs) || !fs.statSync(entryAbs).isFile()) {
      throw new Error(`后台入口不存在: ${config.entry}`);
    }

    runtime.backendPort = await reservePort();
    const command =
      config.runtime === 'node'
        ? process.execPath
        : process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
    const commandArgs = [entryAbs, ...(config.args ?? [])];
    const child = spawn(command, commandArgs, {
      cwd: runtime.toolDirectory,
      windowsHide: true,
      shell: false,
      env: {
        ...process.env,
        ...(config.env ?? {}),
        PATH: resolveSkillShellEnv().pathEnv,
        MOMO_TOOL_PORT: String(runtime.backendPort),
        MOMO_TOOL_HOST: LOOPBACK_HOST,
        MOMO_TOOL_ROOT: runtime.toolDirectory,
        PYTHONIOENCODING: 'utf-8',
        PYTHONUTF8: '1',
        ...(config.runtime === 'node' ? { ELECTRON_RUN_AS_NODE: '1' } : {}),
      },
    });
    runtime.backendProcess = child;
    child.stdout.on('data', (chunk) => appendLog(runtime, 'stdout', chunk));
    child.stderr.on('data', (chunk) => appendLog(runtime, 'stderr', chunk));
    child.on('error', (error) => {
      runtime.status = 'error';
      runtime.errorMessage = error.message;
      appendLog(runtime, 'process', error.message);
    });
    child.on('exit', (code, signal) => {
      if (this.active === runtime && runtime.backendProcess === child) {
        runtime.status = 'error';
        runtime.errorMessage = `后台服务已退出（code=${String(code)}, signal=${String(signal)}）`;
        appendLog(runtime, 'process', runtime.errorMessage);
      }
    });

    const requestedTimeout = config.startupTimeoutMs ?? DEFAULT_STARTUP_TIMEOUT_MS;
    const timeoutMs = Math.max(1_000, Math.min(MAX_STARTUP_TIMEOUT_MS, requestedTimeout));
    let ready = false;
    const earlyFailure = new Promise<never>((_resolve, reject) => {
      child.once('error', reject);
      child.once('exit', (code, signal) => {
        if (!ready) {
          reject(
            new Error(`后台服务启动前已退出（code=${String(code)}, signal=${String(signal)}）`),
          );
        }
      });
    });
    await Promise.race([
      waitForBackend(runtime.backendPort, config.healthPath, timeoutMs, shouldContinue),
      earlyFailure,
    ]);
    ready = true;
  }

  private handlePreviewRequest(
    runtime: IActiveRuntime,
    request: IncomingMessage,
    response: ServerResponse,
  ): void {
    const requestUrl = new URL(request.url ?? '/', `http://${LOOPBACK_HOST}`);
    if (requestUrl.pathname === '/__tool_runtime__.json') {
      sendJson(response, 200, toRuntimeInfo(runtime));
      return;
    }
    if (
      requestUrl.pathname === '/__tool_api__' ||
      requestUrl.pathname.startsWith('/__tool_api__/')
    ) {
      proxyBackend(request, response, runtime.backendPort);
      return;
    }

    let relativePath: string;
    try {
      relativePath = decodeURIComponent(requestUrl.pathname).replace(/^\/+/, '');
    } catch {
      sendJson(response, 400, { error: '无效路径' });
      return;
    }
    if (!relativePath) {
      relativePath = runtime.meta.entry || 'index.html';
    }
    if (isPrivateStaticPath(relativePath)) {
      sendJson(response, 403, { error: '该工具文件不可由页面直接访问' });
      return;
    }
    const fileAbs = path.resolve(runtime.toolDirectory, relativePath);
    const relative = path.relative(runtime.toolDirectory, fileAbs);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      sendJson(response, 403, { error: '路径越界' });
      return;
    }
    if (!fs.existsSync(fileAbs) || !fs.statSync(fileAbs).isFile()) {
      sendJson(response, 404, { error: '文件不存在' });
      return;
    }

    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Content-Type', contentType(fileAbs));
    if (path.extname(fileAbs).toLowerCase() === '.html') {
      const html = fs.readFileSync(fileAbs, 'utf8');
      response.end(injectBrowserBridge(html, runtime.toolPath, runtime.meta));
      return;
    }
    fs.createReadStream(fileAbs).pipe(response);
  }

  private async stopActive(): Promise<void> {
    const runtime = this.active;
    this.active = null;
    if (runtime) {
      await this.stopRuntime(runtime);
    }
  }

  private async stopRuntime(runtime: IActiveRuntime): Promise<void> {
    await closeServer(runtime.previewServer);
    const child = runtime.backendProcess;
    runtime.backendProcess = undefined;
    if (child && child.exitCode == null && child.signalCode == null) {
      child.kill('SIGTERM');
      const exited = await new Promise<boolean>((resolve) => {
        const timer = setTimeout(() => resolve(false), 1_500);
        child.once('exit', () => {
          clearTimeout(timer);
          resolve(true);
        });
      });
      if (!exited && child.exitCode == null && child.signalCode == null) {
        child.kill('SIGKILL');
      }
    }
  }
}

export const customToolRuntimeService = new CustomToolRuntimeService(customToolWorkspaceService);
