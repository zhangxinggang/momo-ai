export type TCliAgentType = 'claude' | 'codex';

export interface ICliSpawnSpec {
  command: string;
  args: string[];
}

/** Codex 非交互执行常用参数：跳过审批等待，允许非 git 目录 */
const CODEX_NONINTERACTIVE_FLAGS = [
  '--json',
  '--skip-git-repo-check',
  '--dangerously-bypass-approvals-and-sandbox',
] as const;

/** Claude 非交互执行：跳过权限确认，避免无 TTY 时卡住 */
const CLAUDE_NONINTERACTIVE_FLAGS = [
  '-p',
  '--output-format',
  'json',
  '--permission-mode',
  'bypassPermissions',
  '--dangerously-skip-permissions',
  '--strict-mcp-config',
] as const;

/** 构建 CLI Agent spawn 参数（prompt 作为最后一个参数） */
export function buildCliAgentSpawnSpec(
  agent: TCliAgentType,
  prompt: string,
  sessionId?: string,
): ICliSpawnSpec {
  switch (agent) {
    case 'claude': {
      const args: string[] = [...CLAUDE_NONINTERACTIVE_FLAGS];
      if (sessionId?.trim()) {
        args.push('--resume', sessionId.trim());
      }
      args.push(prompt);
      return { command: 'claude', args };
    }
    case 'codex': {
      // resume 是子命令：codex exec resume [flags] <sessionId> <prompt>
      if (sessionId?.trim()) {
        return {
          command: 'codex',
          args: ['exec', 'resume', ...CODEX_NONINTERACTIVE_FLAGS, sessionId.trim(), prompt],
        };
      }
      return {
        command: 'codex',
        args: ['exec', ...CODEX_NONINTERACTIVE_FLAGS, prompt],
      };
    }
    default:
      throw new Error(`不支持的 CLI Agent: ${agent}`);
  }
}

export interface ICliJsonParseResult {
  content: string;
  sessionId: string;
  /** 实际使用的模型名（若 CLI 输出中可解析） */
  model?: string;
}

/** 解析 Claude Code 单段 JSON 输出 */
function parseClaudeJsonOutput(stdout: string): ICliJsonParseResult {
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
    const model = typeof parsed.model === 'string' && parsed.model.trim() ? parsed.model.trim() : undefined;
    return { content, sessionId, model };
  } catch {
    return { content: trimmed, sessionId: '' };
  }
}

function pickModelField(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed || undefined;
}

/** 解析 Codex `exec --json` 的 JSONL 事件流 */
export function parseCodexJsonlOutput(stdout: string): ICliJsonParseResult {
  const lines = stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { content: '', sessionId: '' };
  }

  let sessionId = '';
  let model: string | undefined;
  const messageList: string[] = [];
  let errorMessage = '';

  for (const line of lines) {
    try {
      const event = JSON.parse(line) as Record<string, unknown>;
      const eventType = typeof event.type === 'string' ? event.type : '';

      if (eventType === 'thread.started') {
        if (typeof event.thread_id === 'string') {
          sessionId = event.thread_id;
        }
        model = pickModelField(event.model) ?? model;
      }

      if (eventType === 'turn.completed') {
        model = pickModelField(event.model) ?? model;
        if (event.usage && typeof event.usage === 'object') {
          model = pickModelField((event.usage as Record<string, unknown>).model) ?? model;
        }
      }

      if (eventType === 'item.completed' && event.item && typeof event.item === 'object') {
        const item = event.item as Record<string, unknown>;
        if (item.type === 'agent_message' && typeof item.text === 'string' && item.text.trim()) {
          messageList.push(item.text.trim());
        }
        model = pickModelField(item.model) ?? model;
      }

      if (eventType === 'turn.failed') {
        const error = event.error;
        if (error && typeof error === 'object') {
          const message = (error as Record<string, unknown>).message;
          if (typeof message === 'string' && message.trim()) {
            errorMessage = message.trim();
          }
        }
      }

      if (eventType === 'error') {
        if (typeof event.message === 'string' && event.message.trim()) {
          errorMessage = event.message.trim();
        }
      }
    } catch {
      // 忽略非 JSON 行（如进度提示）
    }
  }

  const content = messageList.join('\n\n').trim();
  if (content) {
    return { content, sessionId, model };
  }
  if (errorMessage) {
    return { content: errorMessage, sessionId, model };
  }
  return { content: stdout.trim(), sessionId, model };
}

/** 解析 CLI JSON / JSONL 输出 */
export function parseCliJsonOutput(stdout: string, agent: TCliAgentType): ICliJsonParseResult {
  if (agent === 'codex') {
    return parseCodexJsonlOutput(stdout);
  }
  return parseClaudeJsonOutput(stdout);
}

/** 未安装时的友好提示 */
export function getCliNotFoundMessage(agent: TCliAgentType): string {
  const names: Record<TCliAgentType, string> = {
    claude: 'Claude Code CLI (claude)',
    codex: 'Codex CLI (codex)',
  };
  return `未检测到 ${names[agent]} 命令。请确认已安装并加入 PATH 后重试。`;
}
