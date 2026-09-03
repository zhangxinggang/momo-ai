import type { ISkill } from '@/types/modules';

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
