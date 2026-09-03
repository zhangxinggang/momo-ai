import type {
  IBeforeSubmitPromptInput,
  IBeforeSubmitPromptResult,
  ISlashCommandsConfig,
} from '@momo/aichat';

import { listAgentAppSlashCommands, prepareAgentAppSubmit } from '@renderer/services/agent-app/api';

interface ICreateAgentAppChatAdaptersOptions {
  getAgentAppId: () => string | null;
  getFolderPaths: () => string[];
  onDenied?: (reason: string) => void;
}

/** 创建斜杠命令与发送前钩子适配，注入 IAiChatServices */
export function createAgentAppChatAdapters(options: ICreateAgentAppChatAdaptersOptions): {
  slashCommands: ISlashCommandsConfig;
  beforeSubmitPrompt: (input: IBeforeSubmitPromptInput) => Promise<IBeforeSubmitPromptResult>;
} {
  const slashCommands: ISlashCommandsConfig = {
    isActive: () => Boolean(options.getAgentAppId()?.trim()),
    list: async (query, ctx) => {
      const agentAppId = options.getAgentAppId()?.trim();
      if (!agentAppId) {
        return { items: [] };
      }
      const folderPaths =
        ctx.workspacePaths?.length > 0 ? ctx.workspacePaths : options.getFolderPaths();
      const result = await listAgentAppSlashCommands({
        agentAppId,
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
          hasArgs: item.hasArgs,
        })),
        warning: result.warning,
      };
    },
  };

  const beforeSubmitPrompt = async (
    input: IBeforeSubmitPromptInput,
  ): Promise<IBeforeSubmitPromptResult> => {
    const agentAppId = options.getAgentAppId()?.trim();
    if (!agentAppId) {
      return {
        action: 'allow',
        content: input.content,
        displayContent: input.displayContent,
      };
    }

    const folderPaths =
      input.workspacePaths?.length > 0 ? input.workspacePaths : options.getFolderPaths();

    const result = await prepareAgentAppSubmit({
      agentAppId,
      folderPaths,
      content: input.content,
      displayContent: input.displayContent,
      invocation: input.invocation,
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
    };
  };

  return { slashCommands, beforeSubmitPrompt };
}
