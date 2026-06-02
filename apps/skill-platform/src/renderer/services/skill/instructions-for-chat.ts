import type { ISkill } from '@/types/modules';

const MARKDOWN_LINK_MD_RE = /\[[^\]]*\]\(([^)]+\.md)\)/gi;
const BACKTICK_MD_RE = /`([^`]+\.md)`/g;

const CHAT_PATH_HINT =
  '\n\n---\n\n**执行环境说明**：当前技能命令在本地仓库根目录（SKILL.md 所在目录）执行，请使用相对仓库根的路径（如 `html2pptx.md`、`scripts/html2pptx.js`），不要使用 `skills/<技能名>/` 前缀。\n';

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** 将 SKILL 文档中的 monorepo 路径改写为仓库内相对路径 */
export function rewriteSkillMonorepoPaths(text: string, skillName: string): string {
  const trimmedName = skillName.trim();
  if (!trimmedName) {
    return text;
  }

  const escaped = escapeRegex(trimmedName);
  return text.replace(new RegExp(`skills[/\\\\]${escaped}[/\\\\]`, 'gi'), '');
}

function extractReferencedMdFiles(skillMd: string): string[] {
  const refs = new Set<string>();

  let match: RegExpExecArray | null;
  MARKDOWN_LINK_MD_RE.lastIndex = 0;
  while ((match = MARKDOWN_LINK_MD_RE.exec(skillMd)) !== null) {
    const ref = (match[1] ?? '').trim().replace(/^\.\//, '');
    if (ref && !ref.includes('://') && ref.toLowerCase() !== 'skill.md') {
      refs.add(ref);
    }
  }

  BACKTICK_MD_RE.lastIndex = 0;
  while ((match = BACKTICK_MD_RE.exec(skillMd)) !== null) {
    const ref = (match[1] ?? '').trim().replace(/^\.\//, '');
    if (ref.endsWith('.md') && !ref.includes('://') && ref.toLowerCase() !== 'skill.md') {
      refs.add(ref);
    }
  }

  return [...refs];
}

function getSkillBody(skill: ISkill): string {
  return (skill.instructions || skill.content || '').trim();
}

/** 为 SKILL AI 对话加载完整指令（含仓库 SKILL.md 与引用的 .md 文件） */
export async function loadSkillInstructionsForChat(skill: ISkill): Promise<string> {
  let body = getSkillBody(skill);
  const skillId = skill.id;
  const skillName = skill.name?.trim() || '';

  if (window.api?.skill?.readLocalFile) {
    try {
      const skillMd = await window.api.skill.readLocalFile(skillId, 'SKILL.md');
      if (skillMd?.content?.trim()) {
        body = skillMd.content.trim();
      }
    } catch {
      // 回退数据库缓存内容
    }
  }

  body = rewriteSkillMonorepoPaths(body, skillName);

  const refFiles = extractReferencedMdFiles(body);
  if (window.api?.skill?.readLocalFile) {
    for (const ref of refFiles) {
      try {
        const file = await window.api.skill.readLocalFile(skillId, ref);
        if (file?.content?.trim()) {
          body += `\n\n---\n\n## 参考文件：${ref}\n\n${file.content.trim()}`;
        }
      } catch {
        // 引用文件不存在则跳过
      }
    }
  }

  return body + CHAT_PATH_HINT;
}
