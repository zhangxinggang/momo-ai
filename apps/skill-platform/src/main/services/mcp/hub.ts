import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';

import {
  EMcpConnectionStatus,
  EMcpTransportType,
  type DMcpCallToolRequest,
  type DMcpCallToolResult,
  type DMcpTool,
  type IMcpServerEntry,
  type IMcpServerRuntimeStatus,
  type IMcpServersFile,
} from '@/types/modules/mcp';

import { inferMcpTransport, validateMcpServersFile } from './config';
import { readMcpServersFile, writeMcpServersFile } from './config-io';
import { decodeMcpToolName, encodeMcpToolName } from './tool-name';

const CALL_TOOL_TIMEOUT_MS = 60_000;
const RESULT_MAX_CHARS = 100_000;
const CONNECT_RETRY_TIMES = 1;

interface IMcpRuntimeServer {
  entry: IMcpServerEntry;
  transportType: EMcpTransportType;
  status: EMcpConnectionStatus;
  errorMessage?: string;
  client?: Client;
  transport?: Transport;
  tools: DMcpTool[];
}

function stringifyToolContent(content: unknown): string {
  if (typeof content === 'string') {
    return content;
  }
  try {
    return JSON.stringify(content, null, 2);
  } catch {
    return String(content);
  }
}

function truncateContent(text: string): string {
  if (text.length <= RESULT_MAX_CHARS) {
    return text;
  }
  return `${text.slice(0, RESULT_MAX_CHARS)}\n\n…（结果过长，已截断）`;
}

function buildRequestInitHeaders(headers?: Record<string, string>): RequestInit | undefined {
  if (!headers || Object.keys(headers).length === 0) {
    return undefined;
  }
  return { headers };
}

/** 主进程 MCP 连接池单例 */
export class McpHub {
  private config: IMcpServersFile = { mcpServers: {} };
  private readonly servers = new Map<string, IMcpRuntimeServer>();
  private started = false;

  async start(): Promise<void> {
    if (this.started) {
      return;
    }
    this.started = true;
    this.config = readMcpServersFile();
    await this.syncConnectionsFromConfig();
  }

  async stop(): Promise<void> {
    const names = [...this.servers.keys()];
    await Promise.all(names.map((name) => this.disconnectServer(name)));
    this.started = false;
  }

  getConfig(): IMcpServersFile {
    return {
      mcpServers: { ...this.config.mcpServers },
    };
  }

  async setConfig(
    file: IMcpServersFile,
  ): Promise<{ errors: Array<{ name: string; message: string }> }> {
    const { valid, errors } = validateMcpServersFile(file);
    // 保留用户提交的完整结构写入（含非法项会被丢掉仅写 valid）
    this.config = valid;
    writeMcpServersFile(valid);
    await this.syncConnectionsFromConfig();
    return { errors };
  }

  async setServerDisabled(name: string, disabled: boolean): Promise<void> {
    const entry = this.config.mcpServers[name];
    if (!entry) {
      throw new Error(`MCP Server 不存在: ${name}`);
    }
    const nextEntry: IMcpServerEntry = { ...entry, disabled };
    this.config = {
      mcpServers: {
        ...this.config.mcpServers,
        [name]: nextEntry,
      },
    };
    writeMcpServersFile(this.config);
    await this.reconnect(name);
  }

  listServers(): IMcpServerRuntimeStatus[] {
    const names = new Set([...Object.keys(this.config.mcpServers), ...this.servers.keys()]);
    return [...names].map((name) => {
      const runtime = this.servers.get(name);
      const entry = this.config.mcpServers[name] ?? runtime?.entry ?? {};
      let transport: EMcpTransportType = EMcpTransportType.EStdio;
      try {
        transport = runtime?.transportType ?? inferMcpTransport(entry);
      } catch {
        transport = EMcpTransportType.EStdio;
      }
      const status =
        runtime?.status ??
        (entry.disabled ? EMcpConnectionStatus.EDisabled : EMcpConnectionStatus.EIdle);
      return {
        name,
        entry,
        transport,
        status,
        errorMessage: runtime?.errorMessage,
        toolCount: runtime?.tools.length ?? 0,
      };
    });
  }

  listTools(): DMcpTool[] {
    const tools: DMcpTool[] = [];
    for (const runtime of this.servers.values()) {
      if (runtime.status !== EMcpConnectionStatus.EConnected) {
        continue;
      }
      tools.push(...runtime.tools);
    }
    return tools;
  }

  async callTool(request: DMcpCallToolRequest): Promise<DMcpCallToolResult> {
    let serverName: string;
    let toolName: string;
    try {
      ({ serverName, toolName } = decodeMcpToolName(request.name));
    } catch (err) {
      return {
        ok: false,
        isError: true,
        content: err instanceof Error ? err.message : String(err),
      };
    }

    const runtime = this.servers.get(serverName);
    if (!runtime?.client || runtime.status !== EMcpConnectionStatus.EConnected) {
      return {
        ok: false,
        isError: true,
        content: `MCP Server 未连接: ${serverName}`,
      };
    }

    try {
      const result = await Promise.race([
        runtime.client.callTool({
          name: toolName,
          arguments: request.arguments ?? {},
        }),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`MCP 工具调用超时（${CALL_TOOL_TIMEOUT_MS}ms）`)), CALL_TOOL_TIMEOUT_MS);
        }),
      ]);

      const content = truncateContent(stringifyToolContent(result.content ?? result));
      const isError = Boolean((result as { isError?: boolean }).isError);
      return { ok: !isError, isError, content };
    } catch (err) {
      return {
        ok: false,
        isError: true,
        content: err instanceof Error ? err.message : String(err),
      };
    }
  }

  async reconnect(name?: string): Promise<void> {
    if (name) {
      await this.disconnectServer(name);
      const entry = this.config.mcpServers[name];
      if (!entry) {
        return;
      }
      if (entry.disabled) {
        this.servers.set(name, {
          entry,
          transportType: this.safeInferTransport(entry),
          status: EMcpConnectionStatus.EDisabled,
          tools: [],
        });
        return;
      }
      await this.connectServerWithRetry(name, entry);
      return;
    }
    await this.syncConnectionsFromConfig();
  }

  private safeInferTransport(entry: IMcpServerEntry): EMcpTransportType {
    try {
      return inferMcpTransport(entry);
    } catch {
      return EMcpTransportType.EStdio;
    }
  }

  private async syncConnectionsFromConfig(): Promise<void> {
    const desired = new Set(Object.keys(this.config.mcpServers));
    for (const name of [...this.servers.keys()]) {
      if (!desired.has(name)) {
        await this.disconnectServer(name);
        this.servers.delete(name);
      }
    }

    for (const [name, entry] of Object.entries(this.config.mcpServers)) {
      await this.disconnectServer(name);
      if (entry.disabled) {
        this.servers.set(name, {
          entry,
          transportType: this.safeInferTransport(entry),
          status: EMcpConnectionStatus.EDisabled,
          tools: [],
        });
        continue;
      }
      await this.connectServerWithRetry(name, entry);
    }
  }

  private async connectServerWithRetry(name: string, entry: IMcpServerEntry): Promise<void> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= CONNECT_RETRY_TIMES; attempt += 1) {
      try {
        await this.connectServer(name, entry);
        return;
      } catch (err) {
        lastError = err;
        await this.disconnectServer(name);
      }
    }
    const message = lastError instanceof Error ? lastError.message : String(lastError);
    this.servers.set(name, {
      entry,
      transportType: this.safeInferTransport(entry),
      status: EMcpConnectionStatus.EError,
      errorMessage: message,
      tools: [],
    });
  }

  private async connectServer(name: string, entry: IMcpServerEntry): Promise<void> {
    const transportType = inferMcpTransport(entry);
    this.servers.set(name, {
      entry,
      transportType,
      status: EMcpConnectionStatus.EConnecting,
      tools: [],
    });

    const transport = this.createTransport(entry, transportType);
    const client = new Client({ name: `aim-mcp-${name}`, version: '1.0.0' });
    await client.connect(transport);

    const listed = await client.listTools();
    const tools: DMcpTool[] = (listed.tools ?? []).map((tool) => ({
      name: encodeMcpToolName(name, tool.name),
      description: tool.description,
      inputSchema: (tool.inputSchema as Record<string, unknown> | undefined) ?? {
        type: 'object',
        properties: {},
      },
      serverName: name,
      toolName: tool.name,
    }));

    this.servers.set(name, {
      entry,
      transportType,
      status: EMcpConnectionStatus.EConnected,
      client,
      transport,
      tools,
    });
  }

  private createTransport(entry: IMcpServerEntry, transportType: EMcpTransportType): Transport {
    if (transportType === EMcpTransportType.EStdio) {
      if (!entry.command?.trim()) {
        throw new Error('stdio 类型需要 command');
      }
      return new StdioClientTransport({
        command: entry.command,
        args: entry.args,
        env: entry.env,
        cwd: entry.cwd,
        stderr: 'pipe',
      });
    }

    if (!entry.url?.trim()) {
      throw new Error(`${transportType} 类型需要 url`);
    }
    // sse / http 统一走 Streamable HTTP（SDK 已弃用 SSEClientTransport）
    const url = new URL(entry.url);
    const requestInit = buildRequestInitHeaders(entry.headers);
    return new StreamableHTTPClientTransport(url, { requestInit });
  }

  private async disconnectServer(name: string): Promise<void> {
    const runtime = this.servers.get(name);
    if (!runtime) {
      return;
    }
    try {
      await runtime.client?.close();
    } catch {
      // ignore
    }
    try {
      await runtime.transport?.close?.();
    } catch {
      // ignore
    }
    runtime.client = undefined;
    runtime.transport = undefined;
    runtime.tools = [];
  }
}

let hubInstance: McpHub | null = null;

export function getMcpHub(): McpHub {
  if (!hubInstance) {
    hubInstance = new McpHub();
  }
  return hubInstance;
}
