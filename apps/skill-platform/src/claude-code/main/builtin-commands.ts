import type { IClaudeSlashItem } from '../types';
import { EClaudeSlashSource as ESource } from '../types';

interface IBuiltinCommandDef {
  name: string;
  description: string;
  hasArgs?: boolean;
}

/** Claude Code 内置斜杠命令静态清单（/help 探测不完整时的回退） */
const STATIC_BUILTIN_COMMANDS: IBuiltinCommandDef[] = [
  { name: 'add-dir', description: '添加工作目录供当前会话读写文件', hasArgs: true },
  { name: 'agents', description: '管理 Agent 与子 Agent 配置' },
  { name: 'clear', description: '清空对话上下文并开始新会话（别名：/reset、/new）', hasArgs: true },
  { name: 'compact', description: '压缩对话历史以释放上下文', hasArgs: true },
  { name: 'config', description: '打开设置界面（别名：/settings）' },
  { name: 'context', description: '查看当前上下文占用', hasArgs: true },
  { name: 'cost', description: '查看会话成本与用量（/usage 别名）' },
  { name: 'debug', description: '启用调试日志', hasArgs: true },
  { name: 'diff', description: '打开交互式 diff 查看器' },
  { name: 'doctor', description: '诊断 Claude Code 安装与配置' },
  { name: 'effort', description: '设置模型推理强度', hasArgs: true },
  { name: 'exit', description: '退出 CLI（别名：/quit）' },
  { name: 'export', description: '导出当前对话', hasArgs: true },
  { name: 'help', description: '显示帮助与可用命令' },
  { name: 'hooks', description: '查看 Hook 配置' },
  { name: 'init', description: '初始化项目 CLAUDE.md' },
  { name: 'login', description: '登录 Anthropic 账号' },
  { name: 'logout', description: '退出登录' },
  { name: 'mcp', description: '管理 MCP 服务器连接' },
  { name: 'memory', description: '编辑 CLAUDE.md 记忆文件' },
  { name: 'model', description: '切换 AI 模型', hasArgs: true },
  { name: 'permissions', description: '管理工具权限规则' },
  { name: 'plan', description: '进入计划模式', hasArgs: true },
  { name: 'release-notes', description: '查看版本更新日志' },
  { name: 'reload-skills', description: '重新扫描技能与命令目录' },
  { name: 'resume', description: '恢复历史会话', hasArgs: true },
  { name: 'review', description: '审查 Pull Request', hasArgs: true },
  { name: 'rewind', description: '回滚对话或代码到检查点' },
  { name: 'skills', description: '列出可用技能' },
  { name: 'status', description: '查看版本、模型与连接状态' },
  { name: 'tasks', description: '查看后台任务' },
  { name: 'theme', description: '切换颜色主题' },
  { name: 'usage', description: '查看用量与统计' },
  { name: 'branch', description: '分支当前对话', hasArgs: true },
  { name: 'btw', description: '旁路提问，不写入主对话', hasArgs: true },
  { name: 'code-review', description: '审查当前 diff', hasArgs: true },
];

function toSlashItem(def: IBuiltinCommandDef): IClaudeSlashItem {
  return {
    command: `/${def.name}`,
    label: `/${def.name}`,
    description: def.description,
    source: ESource.EBuiltin,
    hasArgs: def.hasArgs,
  };
}

/** 返回静态内置命令列表 */
export function getStaticBuiltinSlashCommands(): IClaudeSlashItem[] {
  return STATIC_BUILTIN_COMMANDS.map(toSlashItem);
}

/** 将静态清单与 /help 解析结果合并，优先保留 help 中的描述 */
export function mergeBuiltinSlashCommands(parsed: IClaudeSlashItem[]): IClaudeSlashItem[] {
  const map = new Map<string, IClaudeSlashItem>();

  for (const item of getStaticBuiltinSlashCommands()) {
    map.set(item.command.toLowerCase(), item);
  }

  for (const item of parsed) {
    map.set(item.command.toLowerCase(), item);
  }

  return Array.from(map.values()).sort((a, b) => a.command.localeCompare(b.command));
}
