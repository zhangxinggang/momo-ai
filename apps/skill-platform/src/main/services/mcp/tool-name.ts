const SEPARATOR = '__';

/** 编码跨 Server 唯一的工具名 */
export function encodeMcpToolName(serverName: string, toolName: string): string {
  return `${serverName}${SEPARATOR}${toolName}`;
}

/** 解码聚合工具名 */
export function decodeMcpToolName(encoded: string): { serverName: string; toolName: string } {
  const index = encoded.indexOf(SEPARATOR);
  if (index <= 0) {
    throw new Error(`无效的 MCP 工具名: ${encoded}`);
  }
  return {
    serverName: encoded.slice(0, index),
    toolName: encoded.slice(index + SEPARATOR.length),
  };
}
