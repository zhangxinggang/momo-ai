# Claude Code 集成（可整块删除）

本目录包含 AI 对话中 Claude Code 斜杠命令补全的全部逻辑。

## 删除步骤

1. 删除本目录 `src/claude-code/`
2. `src/main/ipc/index.ts`：移除 `registerClaudeCodeIPC` 调用与 import
3. `src/types/constants/ipc-channels.ts`：移除 `CLAUDE_CODE_LIST_SLASH`
4. `src/preload/api/claude-code.ts` 与 `preload/index.ts`、`preload/api/index.ts` 中的 `claudeCode`
5. `src/renderer/services/aichat/core/shared-services.ts`：移除 `slashCommands` 注入
6. `packages/momo-aichat`：可选保留通用 `SlashCommandPopover`（无 Claude 依赖）
