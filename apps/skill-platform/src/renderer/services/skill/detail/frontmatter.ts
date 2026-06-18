/**
 * 从 SKILL.md 内容中剥离 YAML frontmatter。
 */
export function stripFrontmatter(content: string): string {
  const trimmed = content.trim();
  if (!trimmed.startsWith('---')) return trimmed;

  const endIdx = trimmed.indexOf('---', 3);
  if (endIdx === -1) return trimmed;
  return trimmed.slice(endIdx + 3).trim();
}

function normalizeInlineText(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_>#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractFrontmatterValue(content: string, key: string): string | null {
  const trimmed = content.trim();
  if (!trimmed.startsWith('---')) return null;

  const frontmatterMatch = trimmed.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if (!frontmatterMatch) return null;

  const lines = frontmatterMatch[1].split('\n');
  const lineIndex = lines.findIndex((entry) => entry.trim().startsWith(`${key}:`));

  if (lineIndex === -1) return null;

  let value = lines[lineIndex]
    .trim()
    .slice(key.length + 1)
    .trim();

  if (/^[|>][-+]?$/u.test(value)) {
    const blockLines: string[] = [];
    for (let i = lineIndex + 1; i < lines.length; i += 1) {
      const line = lines[i];
      if (!/^\s+/.test(line)) {
        break;
      }
      blockLines.push(line.replace(/^\s+/, '').trimEnd());
    }
    value = blockLines.join('\n').trim();
  }

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return normalizeInlineText(value) || null;
}

function extractBodySummary(content: string): string | null {
  const stripped = stripFrontmatter(content);
  if (!stripped) return null;

  const paragraphs = stripped
    .split(/\n\s*\n/)
    .map((paragraph) => normalizeInlineText(paragraph))
    .filter((paragraph) => {
      if (!paragraph) return false;
      if (paragraph.startsWith('#')) return false;
      if (paragraph.startsWith('|')) return false;
      if (paragraph.startsWith('```')) return false;
      if (
        /^(quick reference|reading content|editing content|create from scratch)$/i.test(paragraph)
      ) {
        return false;
      }
      return paragraph.length >= 24;
    });

  return paragraphs[0] || null;
}

export function resolveSkillDescription(instructions?: string): string {
  if (!instructions?.trim()) {
    return '';
  }

  const frontmatterDescription = extractFrontmatterValue(instructions, 'description');
  if (frontmatterDescription) {
    return frontmatterDescription;
  }

  const bodySummary = extractBodySummary(instructions);
  if (bodySummary) {
    return bodySummary;
  }

  return '';
}
