/** 依赖安装类命令（由 ISkill 运行时自动处理，不应在工作区执行） */
const SKIP_INSTALL_RE =
  /^(?:npm(?:\.cmd)?|pnpm|yarn(?:\.cmd)?)\s+(?:install|add|i)\b|^pip(?:3)?\s+install\b|^python\s+-m\s+pip\s+install\b/i;

/** 可选 QA / 后处理步骤，失败不影响主交付物 */
const OPTIONAL_QA_RE =
  /soffice\.py|pdftoppm|pdftocairo|markitdown|thumbnail\.py|validate\.py|^mv\s|^cp\s|^echo\s|^rename\s/i;

/** Unix 专用语法（Windows 下跳过） */
const SKIP_UNIX_ONLY_RE = />\s*\/dev\/null|2>\s*\/dev\/null|\|\s*null\b/i;

/** shell 前置步骤（output 目录由运行时自动创建，无需 mkdir/cd） */
const SKIP_PREP_COMMAND_RE = /^(?:mkdir|md)\b|^cd\s+(?:\/d\s+)?/i;

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

const SKIP_PREP_NOTE = '已跳过 mkdir/cd 等 shell 前置步骤（output 目录由运行时自动创建）';

export interface ISkillCommandFilterResult {
  command: string;
  /** 被跳过，不执行 */
  skipped: boolean;
  /** 可选步骤：执行但失败不计入总退出码 */
  optional: boolean;
  reason?: string;
}

function isMainRunSkillCommand(part: string): boolean {
  const trimmed = part.trim();
  if (!trimmed || SKIP_PREP_COMMAND_RE.test(trimmed)) {
    return false;
  }
  const lower = trimmed.toLowerCase();
  if (RUN_COMMAND_PREFIXES.some((prefix) => lower.startsWith(prefix))) {
    return true;
  }
  return /\.(py|js|mjs|ps1|sh|bat|cmd)(\s|$)/i.test(trimmed);
}

/** 拆分复合命令（&& / ;），剥离 mkdir/cd 等前置步骤，保留主执行命令 */
export function expandCompoundSkillCommand(commandLine: string): string[] {
  const trimmed = commandLine.trim();
  if (!trimmed) {
    return [];
  }

  const parts = trimmed.split(/\s*&&\s*|\s*;\s*/).map((part) => part.trim()).filter(Boolean);
  if (parts.length <= 1) {
    return parts;
  }

  const runParts = parts.filter(isMainRunSkillCommand);
  if (runParts.length > 0) {
    return runParts;
  }

  return [parts[parts.length - 1]!];
}

function classifySkillCommand(commandLine: string): ISkillCommandFilterResult {
  const command = commandLine.trim();
  if (!command) {
    return { command, skipped: true, optional: false, reason: 'empty' };
  }

  if (SKIP_INSTALL_RE.test(command)) {
    return {
      command,
      skipped: true,
      optional: false,
      reason: '依赖安装由 ISkill 运行时自动处理，已跳过 skill-run 中的 install 命令',
    };
  }

  if (SKIP_UNIX_ONLY_RE.test(command)) {
    return {
      command,
      skipped: true,
      optional: false,
      reason: 'Unix shell 语法在 Windows 下不可用，已跳过',
    };
  }

  if (OPTIONAL_QA_RE.test(command)) {
    return {
      command,
      skipped: true,
      optional: false,
      reason: '可选 QA/后处理步骤已跳过（不影响 PPT 等主交付物生成）',
    };
  }

  return { command, skipped: false, optional: false };
}

/** 过滤 skill-run 命令：跳过 install、Unix 语法；标记可选 QA 步骤 */
export function filterSkillRunCommands(commandLines: string[]): {
  commands: string[];
  optionalCommands: Set<string>;
  skippedNotes: string[];
} {
  const commands: string[] = [];
  const optionalCommands = new Set<string>();
  const skippedNotes: string[] = [];
  const seen = new Set<string>();

  for (const raw of commandLines) {
    const parts = raw.trim().split(/\s*&&\s*|\s*;\s*/).map((part) => part.trim()).filter(Boolean);
    const strippedPrep = parts.some((part) => SKIP_PREP_COMMAND_RE.test(part));
    const expanded = expandCompoundSkillCommand(raw);

    for (const part of expanded) {
      const classified = classifySkillCommand(part);
      if (classified.skipped) {
        if (classified.reason && !skippedNotes.includes(classified.reason)) {
          skippedNotes.push(classified.reason);
        }
        continue;
      }
      if (seen.has(classified.command)) {
        continue;
      }
      seen.add(classified.command);
      commands.push(classified.command);
      if (classified.optional) {
        optionalCommands.add(classified.command);
      }
    }

    if (strippedPrep && expanded.some(isMainRunSkillCommand) && !skippedNotes.includes(SKIP_PREP_NOTE)) {
      skippedNotes.push(SKIP_PREP_NOTE);
    }
  }

  return { commands, optionalCommands, skippedNotes };
}
