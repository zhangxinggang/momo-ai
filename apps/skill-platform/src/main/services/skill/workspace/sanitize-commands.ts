import { expandCompoundSkillCommand, filterSkillRunCommands } from './skill-command-filter';

const CODE_BLOCK_RE = /```(?:skill-run|bash|sh|shell|powershell|cmd|zsh)\n([\s\S]*?)```/gi;

function isExecutableSkillCommand(line: string): boolean {
  return expandCompoundSkillCommand(line).length > 0;
}

/** 从 AI 回复文本中解析 skill-run / shell 命令块 */
export function parseSkillRunCommandsFromText(reply: string): string[] {
  const commands: string[] = [];
  let match: RegExpExecArray | null;

  CODE_BLOCK_RE.lastIndex = 0;
  while ((match = CODE_BLOCK_RE.exec(reply)) !== null) {
    const block = match[1] ?? '';
    for (const rawLine of block.split('\n')) {
      const line = rawLine.trim();
      for (const command of expandCompoundSkillCommand(line)) {
        if (isExecutableSkillCommand(command)) {
          commands.push(command);
        }
      }
    }
  }

  return [...new Set(commands)];
}

/** 清洗命令行并过滤 install / QA 等 */
export function prepareSkillCommandLines(commandLines: string[]): {
  commands: string[];
  optionalCommands: Set<string>;
  skippedNotes: string[];
} {
  const cleaned: string[] = [];
  for (const raw of commandLines) {
    for (const part of expandCompoundSkillCommand(raw.trim().replace(/^[`'"]+|[`'"]+$/g, ''))) {
      if (isExecutableSkillCommand(part)) {
        cleaned.push(part);
      }
    }
  }
  return filterSkillRunCommands([...new Set(cleaned)]);
}

/** 清洗并规范化待执行的命令行（去重、去空、过滤 install/QA 等） */
export function sanitizeSkillCommandLines(commandLines: string[]): string[] {
  return prepareSkillCommandLines(commandLines).commands;
}

export { filterSkillRunCommands };
