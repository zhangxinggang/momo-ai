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

/** 与主进程 skill-command-filter 保持一致 */
const SKIP_INSTALL_RE =
  /^(?:npm(?:\.cmd)?|pnpm|yarn(?:\.cmd)?)\s+(?:install|add|i)\b|^pip(?:3)?\s+install\b|^python\s+-m\s+pip\s+install\b/i;

const OPTIONAL_QA_RE =
  /soffice\.py|pdftoppm|pdftocairo|markitdown|thumbnail\.py|validate\.py|^mv\s|^cp\s|^echo\s|^rename\s/i;

const SKIP_UNIX_ONLY_RE = />\s*\/dev\/null|2>\s*\/dev\/null|\|\s*null\b/i;

/** shell 前置步骤（output 目录由运行时自动创建） */
const SKIP_PREP_COMMAND_RE = /^(?:mkdir|md)\b|^cd\s+(?:\/d\s+)?/i;

function isMainRunSkillCommand(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#') || SKIP_PREP_COMMAND_RE.test(trimmed)) {
    return false;
  }
  const lower = trimmed.toLowerCase();
  if (SKIP_COMMAND_PREFIXES.some((prefix) => lower.startsWith(prefix))) {
    return false;
  }
  if (SKIP_INSTALL_RE.test(trimmed) || SKIP_UNIX_ONLY_RE.test(trimmed)) {
    return false;
  }
  if (RUN_COMMAND_PREFIXES.some((prefix) => lower.startsWith(prefix))) {
    return true;
  }
  return /\.(py|js|mjs|ps1|sh|bat|cmd)(\s|$)/i.test(trimmed);
}

function expandCompoundSkillCommand(commandLine: string): string[] {
  const trimmed = commandLine.trim();
  if (!trimmed) {
    return [];
  }
  const parts = trimmed
    .split(/\s*&&\s*|\s*;\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length <= 1) {
    return isMainRunSkillCommand(parts[0] ?? '') ? parts : [];
  }
  const runParts = parts.filter(isMainRunSkillCommand);
  return runParts.length > 0
    ? runParts
    : isMainRunSkillCommand(parts[parts.length - 1] ?? '')
      ? [parts[parts.length - 1]!]
      : [];
}

function isExecutableSkillCommand(line: string): boolean {
  return expandCompoundSkillCommand(line).length > 0;
}

/** 从 AI 回复中解析可执行的 skill-run / bash 命令块（已过滤 install 等） */
export function parseSkillRunCommands(reply: string): string[] {
  const commands: string[] = [];
  let match: RegExpExecArray | null;

  CODE_BLOCK_RE.lastIndex = 0;
  while ((match = CODE_BLOCK_RE.exec(reply)) !== null) {
    const block = match[1] ?? '';
    for (const rawLine of block.split('\n')) {
      const line = rawLine.trim();
      for (const command of expandCompoundSkillCommand(line)) {
        commands.push(command);
      }
    }
  }

  return [...new Set(commands)];
}

/** 是否为可选 QA 步骤（失败不影响主流程） */
export function isOptionalSkillCommand(commandLine: string): boolean {
  return OPTIONAL_QA_RE.test(commandLine.trim());
}
