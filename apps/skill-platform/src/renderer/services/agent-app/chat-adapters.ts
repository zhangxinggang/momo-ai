import type {
  IBeforeSubmitPromptInput,
  IBeforeSubmitPromptResult,
  ISlashCommandsConfig,
} from '@momo/aichat';

import { listAgentAppSlashCommands, prepareAgentAppSubmit } from '@renderer/services/agent-app/api';

interface ICreateAgentAppChatAdaptersOptions {
  getAgentAppIds: () => string[];
  getFolderPaths: () => string[];
  onDenied?: (reason: string) => void;
}

/** 创建斜杠命令与发送前钩子适配，注入 IAiChatServices */
export function createAgentAppChatAdapters(options: ICreateAgentAppChatAdaptersOptions): {
  slashCommands: ISlashCommandsConfig;
  beforeSubmitPrompt: (input: IBeforeSubmitPromptInput) => Promise<IBeforeSubmitPromptResult>;
} {
  const slashCommands: ISlashCommandsConfig = {
    // momo-ai 应用技能不依赖当前项目是否选择了 Agent。
    isActive: () => true,
    list: async (query, ctx) => {
      const agentAppIds = options.getAgentAppIds();
      const folderPaths =
        ctx.workspacePaths?.length > 0 ? ctx.workspacePaths : options.getFolderPaths();
      const result = await listAgentAppSlashCommands({
        agentAppIds,
        folderPaths,
        query,
      });
      return {
        items: result.items.map((item) => ({
          command: item.command,
          resourceId: item.resourceId,
          resourceRevision: item.resourceRevision,
          label: item.label,
          description: item.description,
          kind: item.kind,
          scope: item.scope,
          category: item.category,
          tags: item.tags,
          hasArgs: item.hasArgs,
          agentAppId: item.agentAppId,
          agentAppName: item.agentAppName,
          directoryPath: item.directoryPath,
        })),
        warning: result.warning,
      };
    },
  };

  const beforeSubmitPrompt = async (
    input: IBeforeSubmitPromptInput,
  ): Promise<IBeforeSubmitPromptResult> => {
    const agentAppIds = options.getAgentAppIds();
    const folderPaths =
      input.workspacePaths?.length > 0 ? input.workspacePaths : options.getFolderPaths();

    const result = await prepareAgentAppSubmit({
      agentAppIds,
      folderPaths,
      content: input.content,
      displayContent: input.displayContent,
      invocation: input.invocation,
      invocations: input.invocations,
    });

    if (result.action === 'deny') {
      options.onDenied?.(result.reason || '发送已被 Agent hooks 拦截');
      return {
        action: 'deny',
        reason: result.reason,
      };
    }

    return {
      action: 'allow',
      content: result.content ?? input.content,
      displayContent: result.displayContent ?? input.displayContent,
      invocation: result.invocation,
      invocations: result.invocations,
    };
  };

  return { slashCommands, beforeSubmitPrompt };
}
