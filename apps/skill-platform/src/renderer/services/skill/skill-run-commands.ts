const CODE_BLOCK_RE = /```(?:skill-run|bash|sh|shell|powershell|cmd|zsh)\n([\s\S]*?)```/gi;

const SKIP_COMMAND_PREFIXES = [
  'find ',
  'cat ',
  'ls ',
  'head ',
  'tail ',
  'grep ',
  'echo ',
  'pwd',
  'which ',
  'type ',
  'dir ',
  'more ',
  'less ',
];

const RUN_COMMAND_PREFIXES = [
  'python',
  'py ',
  'node ',
  'npm ',
  'npx ',
  'pnpm ',
  'yarn ',
  'bash ',
  'sh ',
  'powershell',
  '.\\',
  './',
];

function isExecutableSkillCommand(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) {
    return false;
  }
  const lower = trimmed.toLowerCase();
  if (SKIP_COMMAND_PREFIXES.some((prefix) => lower.startsWith(prefix))) {
    return false;
  }
  if (RUN_COMMAND_PREFIXES.some((prefix) => lower.startsWith(prefix))) {
    return true;
  }
  return /\.(py|js|mjs|ps1|sh|bat|cmd)(\s|$)/i.test(trimmed);
}

/** 从 AI 回复中解析可执行的 skill-run / bash 命令块 */
export function parseSkillRunCommands(reply: string): string[] {
  const commands: string[] = [];
  let match: RegExpExecArray | null;

  CODE_BLOCK_RE.lastIndex = 0;
  while ((match = CODE_BLOCK_RE.exec(reply)) !== null) {
    const block = match[1] ?? '';
    for (const rawLine of block.split('\n')) {
      const line = rawLine.trim();
      if (isExecutableSkillCommand(line)) {
        commands.push(line);
      }
    }
  }

  return [...new Set(commands)];
}
