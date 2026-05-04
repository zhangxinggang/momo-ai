export type TCliAgentType = 'claude' | 'codex';

export interface ICliSpawnSpec {
  command: string;
  args: string[];
}

/** 构建 CLI Agent spawn 参数（prompt 作为最后一个参数） */
export function buildCliAgentSpawnSpec(
  agent: TCliAgentType,
  prompt: string,
  sessionId?: string,
): ICliSpawnSpec {
  switch (agent) {
    case 'claude': {
      const args = ['-p', '--output-format', 'json'];
      if (sessionId) {
        args.push('--resume', sessionId);
      }
      args.push(prompt);
      return { command: 'claude', args };
    }
    case 'codex': {
      const args = ['exec', '--json'];
      if (sessionId) {
        args.push('--resume', sessionId);
      }
      args.push(prompt);
      return { command: 'codex', args };
    }
    default:
      throw new Error(`不支持的 CLI Agent: ${agent}`);
  }
}

export interface ICliJsonParseResult {
  content: string;
  sessionId: string;
}

/** 解析 CLI JSON 输出 */
export function parseCliJsonOutput(stdout: string, agent: TCliAgentType): ICliJsonParseResult {
  const trimmed = stdout.trim();
  if (!trimmed) {
    return { content: '', sessionId: '' };
  }

  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>;
    const content =
      (typeof parsed.result === 'string' && parsed.result) ||
      (typeof parsed.content === 'string' && parsed.content) ||
      (typeof parsed.message === 'string' && parsed.message) ||
      trimmed;
    const sessionId =
      (typeof parsed.session_id === 'string' && parsed.session_id) ||
      (typeof parsed.sessionId === 'string' && parsed.sessionId) ||
      '';
    return { content, sessionId };
  } catch {
    return { content: trimmed, sessionId: '' };
  }
}

/** 未安装时的友好提示 */
export function getCliNotFoundMessage(agent: TCliAgentType): string {
  const names: Record<TCliAgentType, string> = {
    claude: 'Claude Code CLI (claude)',
    codex: 'Codex CLI (codex)',
  };
  return `未检测到 ${names[agent]} 命令。请确认已安装并加入 PATH 后重试。`;
}
