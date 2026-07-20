import {
  EMcpTransportType,
  type IMcpServerEntry,
  type IMcpServersFile,
} from '@/types/modules/mcp';

/** 推断 MCP 传输类型 */
export function inferMcpTransport(entry: IMcpServerEntry): EMcpTransportType {
  // 枚举值本身就是 'stdio' | 'sse' | 'http'，可同时匹配 JSON 字符串与枚举成员
  if (entry.type === EMcpTransportType.EStdio) {
    return EMcpTransportType.EStdio;
  }
  if (entry.type === EMcpTransportType.ESse) {
    return EMcpTransportType.ESse;
  }
  if (entry.type === EMcpTransportType.EHttp) {
    return EMcpTransportType.EHttp;
  }
  if (entry.command) {
    return EMcpTransportType.EStdio;
  }
  if (entry.url) {
    return EMcpTransportType.EHttp;
  }
  throw new Error('无法推断 MCP 传输类型：需要 command 或 url');
}

/** 校验配置：非法单项记入 errors，合法项写入 valid */
export function validateMcpServersFile(file: IMcpServersFile): {
  valid: IMcpServersFile;
  errors: Array<{ name: string; message: string }>;
} {
  const valid: IMcpServersFile = { mcpServers: {} };
  const errors: Array<{ name: string; message: string }> = [];

  for (const [name, entry] of Object.entries(file.mcpServers ?? {})) {
    try {
      const transport = inferMcpTransport(entry);
      if (transport === EMcpTransportType.EStdio && !entry.command?.trim()) {
        throw new Error('stdio 类型需要 command');
      }
      if (
        (transport === EMcpTransportType.ESse || transport === EMcpTransportType.EHttp) &&
        !entry.url?.trim()
      ) {
        throw new Error(`${transport} 类型需要 url`);
      }
      valid.mcpServers[name] = entry;
    } catch (err) {
      errors.push({
        name,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { valid, errors };
}

/** 解析 mcp.json 文本 */
export function parseMcpServersFileJson(text: string): IMcpServersFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('MCP 配置不是合法 JSON');
  }
  if (!parsed || typeof parsed !== 'object' || !('mcpServers' in parsed)) {
    throw new Error('MCP 配置缺少 mcpServers 字段');
  }
  const file = parsed as IMcpServersFile;
  if (!file.mcpServers || typeof file.mcpServers !== 'object') {
    throw new Error('mcpServers 必须是对象');
  }
  return file;
}
