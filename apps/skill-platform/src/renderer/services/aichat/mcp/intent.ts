import type { ISkill } from '@/types/modules';

/** 用户文本是否明确涉及 MCP / 外部工具调用 */
export function isMcpRelatedText(text?: string): boolean {
  const content = (text || '').trim();
  if (!content) {
    return false;
  }
  return (
    /\bmcp\b/i.test(content) ||
    /调用\s*(mcp|工具)|使用\s*(mcp|工具)|tool[_ -]?call/i.test(content)
  );
}

/** 技能是否声明需要 MCP（协议类型 / 配置 / 指令提及） */
export function shouldEnableMcpForSkill(
  skill?: Pick<ISkill, 'protocol_type' | 'mcp_config'> | null,
  instructions?: string,
): boolean {
  if (!skill) {
    return false;
  }
  if (skill.protocol_type === 'mcp') {
    return true;
  }
  if (skill.mcp_config?.trim()) {
    return true;
  }
  if (instructions && /\bmcp\b/i.test(instructions)) {
    return true;
  }
  return false;
}
