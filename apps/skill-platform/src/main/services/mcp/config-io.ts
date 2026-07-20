import fs from 'fs';
import path from 'path';

import type { IMcpServersFile } from '@/types/modules/mcp';

import { getUserDataPath } from '../../runtime-paths';
import { parseMcpServersFileJson } from './config';

/** mcp.json 绝对路径 */
export function getMcpConfigPath(): string {
  return path.join(getUserDataPath(), 'mcp.json');
}

/** 读取 mcp.json，不存在则返回空配置 */
export function readMcpServersFile(): IMcpServersFile {
  const configPath = getMcpConfigPath();
  if (!fs.existsSync(configPath)) {
    return { mcpServers: {} };
  }
  const text = fs.readFileSync(configPath, 'utf8');
  if (!text.trim()) {
    return { mcpServers: {} };
  }
  return parseMcpServersFileJson(text);
}

/** 写入 mcp.json */
export function writeMcpServersFile(file: IMcpServersFile): void {
  const configPath = getMcpConfigPath();
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, `${JSON.stringify(file, null, 2)}\n`, 'utf8');
}
