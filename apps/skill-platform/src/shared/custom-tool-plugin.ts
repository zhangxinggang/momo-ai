import type { ICustomToolPlugin } from '@/types/modules';

// A portable subset of Harness/provider tool names, intentionally excluding digits.
export const CUSTOM_TOOL_IDENTIFIER = /^[a-zA-Z][a-zA-Z_-]{0,63}$/;
const RESERVED =
  /^(?:mcp_|workspace_|attachments_|artifact_|execution_|notes_|knowledge_|resources_|web_|momo[-_])|^(?:skill|get_goal|create_goal|update_goal|ask_user_question|exit_plan_mode|run_code|read|write|edit|bash|glob|grep|search|fetch|dispatch|parallel|tools)$/i;
export function validateToolIdentifier(value: unknown): string | null {
  if (typeof value !== 'string' || !CUSTOM_TOOL_IDENTIFIER.test(value))
    return '标识须以英文字母开头，长度 1–64，仅可包含英文字母、下划线和连字符';
  if (RESERVED.test(value)) return '此标识属于系统保留名称，请使用其他标识';
  return null;
}

/** The entry is trusted registration glue; model code only runs through the host executor. */
export function pluginEntrySource(plugin: ICustomToolPlugin): string {
  return `// DeepSeek Harness / Cordis plugin; loaded by momo-host-bridge.\nexport const name = ${JSON.stringify(plugin.identifier)};\nexport const inject = ['tools'];\nexport function apply(ctx, config) {\n  return ctx.tools.register({\n    name,\n    description: config.description ?? ${JSON.stringify(plugin.description)},\n    parameters: config.parameters,\n    output: { schema: {}, render: (_, value) => [{ type: 'text', text: JSON.stringify(value) }] },\n    isConcurrencySafe: () => true,\n    execute: config.execute,\n  });\n}\n`;
}
