import { ipcMain } from 'electron';

import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type {
  DAgentAppContext,
  DAgentAppDetectInput,
  DAgentAppDetectResult,
  DAgentAppListSlashInput,
  DAgentAppListSlashResult,
  DAgentAppPrepareSubmitInput,
  DAgentAppPrepareSubmitResult,
} from '@/types/modules/agent-app';

import {
  detectAgentApps,
  listAgentAppSlash,
  prepareAgentAppSubmit,
  resolveAgentAppContext,
} from '../services/agent-app';
import { assertGrantedWorkspaceDirectory } from '../services/workspace/root-permissions';

function resolveGrantedRoots(folderPaths: string[]): {
  granted: string[];
  denied: string[];
} {
  const granted: string[] = [];
  const denied: string[] = [];
  for (const folderPath of folderPaths) {
    try {
      granted.push(assertGrantedWorkspaceDirectory(folderPath));
    } catch {
      denied.push(folderPath);
    }
  }
  return { granted, denied };
}

/** 注册 Agent 应用探测、斜杠命令与发送前处理 IPC */
export function registerAgentAppIPC(): void {
  ipcMain.handle(
    IPC_CHANNELS.AGENT_APP_DETECT,
    async (_event, input: DAgentAppDetectInput): Promise<DAgentAppDetectResult> => {
      const paths = Array.isArray(input?.folderPaths)
        ? input.folderPaths.filter((item): item is string => typeof item === 'string')
        : [];
      const requestKey =
        typeof input?.requestKey === 'string' ? input.requestKey.slice(0, 200) : '';
      const roots = resolveGrantedRoots(paths);
      const result = await detectAgentApps(roots.granted, requestKey);
      result.errors.push(
        ...roots.denied.map((folderPath) => ({
          folderPath,
          code: 'unauthorized' as const,
        })),
      );
      return result;
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.AGENT_APP_RESOLVE_CONTEXT,
    async (
      _event,
      input: { agentAppId: string; folderPaths: string[] },
    ): Promise<DAgentAppContext | null> => {
      if (!input || typeof input.agentAppId !== 'string' || !input.agentAppId.trim()) {
        return null;
      }
      const folderPaths = Array.isArray(input.folderPaths)
        ? input.folderPaths.filter((item): item is string => typeof item === 'string')
        : [];
      const roots = resolveGrantedRoots(folderPaths);
      if (roots.denied.length > 0) {
        return null;
      }
      return resolveAgentAppContext(input.agentAppId.trim(), roots.granted);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.AGENT_APP_LIST_SLASH,
    async (_event, input: DAgentAppListSlashInput): Promise<DAgentAppListSlashResult> => {
      if (!input || typeof input.agentAppId !== 'string' || !input.agentAppId.trim()) {
        return { items: [] };
      }
      const folderPaths = Array.isArray(input.folderPaths)
        ? input.folderPaths.filter((item): item is string => typeof item === 'string')
        : [];
      const roots = resolveGrantedRoots(folderPaths);
      if (roots.denied.length > 0) {
        return { items: [], warning: '工作区目录未授权，请重新选择目录' };
      }
      return listAgentAppSlash(
        input.agentAppId.trim(),
        roots.granted,
        typeof input.query === 'string' ? input.query : '',
      );
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.AGENT_APP_PREPARE_SUBMIT,
    async (_event, input: DAgentAppPrepareSubmitInput): Promise<DAgentAppPrepareSubmitResult> => {
      if (!input || typeof input.agentAppId !== 'string' || !input.agentAppId.trim()) {
        return {
          action: 'allow',
          content: typeof input?.content === 'string' ? input.content : '',
          displayContent: typeof input?.displayContent === 'string' ? input.displayContent : '',
        };
      }
      const folderPaths = Array.isArray(input.folderPaths)
        ? input.folderPaths.filter((item): item is string => typeof item === 'string')
        : [];
      const roots = resolveGrantedRoots(folderPaths);
      if (roots.denied.length > 0) {
        return { action: 'deny', reason: '工作区目录未授权，请重新选择目录' };
      }
      return prepareAgentAppSubmit({
        agentAppId: input.agentAppId.trim(),
        folderPaths: roots.granted,
        content: typeof input.content === 'string' ? input.content : '',
        displayContent:
          typeof input.displayContent === 'string'
            ? input.displayContent
            : String(input.content || ''),
        invocation:
          input.invocation &&
          typeof input.invocation.resourceId === 'string' &&
          typeof input.invocation.resourceRevision === 'string'
            ? input.invocation
            : undefined,
      });
    },
  );
}
