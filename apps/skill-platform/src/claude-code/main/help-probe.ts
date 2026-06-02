import { parseCliJsonOutput } from '../../main/services/aichat/cli-templates';
import type { IClaudeSlashItem } from '../types';
import { EClaudeSlashSource as ESource } from '../types';
import { mergeBuiltinSlashCommands } from './builtin-commands';
import { spawnClaudeProcess } from './spawn-claude';

const HELP_CACHE_TTL_MS = 10 * 60 * 1000;
const HELP_TIMEOUT_MS = 45 * 1000;

interface IHelpCacheEntry {
  items: IClaudeSlashItem[];
  expiresAt: number;
}

let helpCache: IHelpCacheEntry | null = null;

const IGNORED_COMMANDS = new Set(['mcp', 'http', 'https', 'tp', 'bg', 'rc', 'new', 'reset']);

function normalizeCommandName(raw: string): string | null {
  const name = raw.trim().toLowerCase();
  if (!name || name.length > 48 || !/^[a-z][a-z0-9_-]*$/.test(name)) {
    return null;
  }
  if (IGNORED_COMMANDS.has(name)) {
    return null;
  }
  return name;
}

/** 从 /help 纯文本或表格中解析斜杠命令 */
export function parseHelpTextToCommands(text: string): IClaudeSlashItem[] {
  const seen = new Set<string>();
  const items: IClaudeSlashItem[] = [];

  const add = (name: string, description?: string) => {
    const normalized = normalizeCommandName(name);
    if (!normalized || seen.has(normalized)) {
      return;
    }
    seen.add(normalized);
    items.push({
      command: `/${normalized}`,
      label: `/${normalized}`,
      description: description?.trim() || undefined,
      source: ESource.EBuiltin,
      hasArgs: description?.includes('[') ?? false,
    });
  };

  const tableRowRe = /\|\s*`?\/([a-z][a-z0-9_-]*)(?:\s|\[|`)?\s*[^|]*\|\s*([^|]+)\|/gi;
  let match: RegExpExecArray | null;
  while ((match = tableRowRe.exec(text)) !== null) {
    add(match[1], match[2]);
  }

  const inlineRe = /`\/([a-z][a-z0-9_-]*)/gi;
  while ((match = inlineRe.exec(text)) !== null) {
    add(match[1]);
  }

  const lineRe = /^\/([a-z][a-z0-9_-]*)\b[ \t]+(.+)$/gim;
  while ((match = lineRe.exec(text)) !== null) {
    add(match[1], match[2]);
  }

  return items.sort((a, b) => a.command.localeCompare(b.command));
}

function extractHelpText(stdout: string): string {
  const trimmed = stdout.trim();
  if (!trimmed) {
    return '';
  }
  try {
    const parsed = parseCliJsonOutput(trimmed, 'claude');
    return parsed.content || trimmed;
  } catch {
    return trimmed;
  }
}

/** 调用本机 claude 获取内置斜杠命令（带 TTL 缓存） */
export async function fetchBuiltinSlashCommands(cwd: string): Promise<{
  items: IClaudeSlashItem[];
  available: boolean;
  warning?: string;
}> {
  const now = Date.now();
  if (helpCache && helpCache.expiresAt > now) {
    return { items: helpCache.items, available: true };
  }

  const result = await spawnClaudeProcess(
    ['-p', '--output-format', 'json', '/help'],
    cwd,
    HELP_TIMEOUT_MS,
  );

  if (result.spawnError) {
    const items = mergeBuiltinSlashCommands([]);
    return {
      items,
      available: false,
      warning: result.spawnError.includes('ENOENT')
        ? '未检测到 Claude Code CLI，已加载内置命令清单'
        : result.spawnError,
    };
  }

  if (result.exitCode !== 0) {
    const message = (result.stderr || result.stdout || 'help 探测失败').trim();
    const items = mergeBuiltinSlashCommands([]);
    return { items, available: false, warning: message };
  }

  const text = extractHelpText(result.stdout);
  const items = mergeBuiltinSlashCommands(parseHelpTextToCommands(text));
  helpCache = { items, expiresAt: now + HELP_CACHE_TTL_MS };
  return { items, available: true };
}

/** 清除 help 缓存（测试或强制刷新） */
export function clearBuiltinSlashCache(): void {
  helpCache = null;
}
