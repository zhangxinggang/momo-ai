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
  DAgentAppSlashInvocation,
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

function sanitizeSlashInvocation(value: unknown): DAgentAppSlashInvocation | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }
  const input = value as Partial<DAgentAppSlashInvocation>;
  if (
    typeof input.resourceId !== 'string' ||
    typeof input.resourceRevision !== 'string' ||
    typeof input.command !== 'string' ||
    (input.kind !== 'skill' && input.kind !== 'command') ||
    !['application', 'project', 'global'].includes(String(input.scope))
  ) {
    return undefined;
  }
  return {
    resourceId: input.resourceId.slice(0, 500),
    resourceRevision: input.resourceRevision.slice(0, 200),
    command: input.command.slice(0, 200),
    label: typeof input.label === 'string' ? input.label.slice(0, 200) : undefined,
    kind: input.kind,
    scope: input.scope as DAgentAppSlashInvocation['scope'],
    category: typeof input.category === 'string' ? input.category.slice(0, 100) : undefined,
    tags: Array.isArray(input.tags)
      ? input.tags
          .filter((tag): tag is string => typeof tag === 'string')
          .slice(0, 8)
          .map((tag) => tag.slice(0, 100))
      : undefined,
    token: typeof input.token === 'string' ? input.token.slice(0, 8_000) : undefined,
  };
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
      if (!input) {
        return { items: [] };
      }
      const agentAppId =
        typeof input.agentAppId === 'string' && input.agentAppId.trim()
          ? input.agentAppId.trim()
          : undefined;
      const folderPaths = Array.isArray(input.folderPaths)
        ? input.folderPaths.filter((item): item is string => typeof item === 'string')
        : [];
      const roots = resolveGrantedRoots(folderPaths);
      if (roots.denied.length > 0) {
        const applicationOnly = await listAgentAppSlash(
          undefined,
          [],
          typeof input.query === 'string' ? input.query : '',
        );
        return { ...applicationOnly, warning: '工作区目录未授权，Agent 资源暂不可用' };
      }
      return listAgentAppSlash(
        agentAppId,
        roots.granted,
        typeof input.query === 'string' ? input.query : '',
      );
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.AGENT_APP_PREPARE_SUBMIT,
    async (_event, input: DAgentAppPrepareSubmitInput): Promise<DAgentAppPrepareSubmitResult> => {
      if (!input) {
        return {
          action: 'allow',
          content: '',
          displayContent: '',
        };
      }
      const agentAppId =
        typeof input.agentAppId === 'string' && input.agentAppId.trim()
          ? input.agentAppId.trim()
          : undefined;
      const folderPaths = Array.isArray(input.folderPaths)
        ? input.folderPaths.filter((item): item is string => typeof item === 'string')
        : [];
      const roots = resolveGrantedRoots(folderPaths);
      if (agentAppId && roots.denied.length > 0) {
        return { action: 'deny', reason: '工作区目录未授权，请重新选择目录' };
      }
      const invocation = sanitizeSlashInvocation(input.invocation);
      if (Array.isArray(input.invocations) && input.invocations.length > 24) {
        return { action: 'deny', reason: '单条消息最多可组合 24 个技能或命令' };
      }
      const invocations = Array.isArray(input.invocations)
        ? input.invocations
            .map(sanitizeSlashInvocation)
            .filter((item): item is DAgentAppSlashInvocation => Boolean(item))
        : undefined;
      if (Array.isArray(input.invocations) && invocations?.length !== input.invocations.length) {
        return { action: 'deny', reason: '技能或命令数据无效，请重新选择' };
      }
      return prepareAgentAppSubmit({
        agentAppId,
        folderPaths: roots.granted,
        content: typeof input.content === 'string' ? input.content : '',
        displayContent:
          typeof input.displayContent === 'string'
            ? input.displayContent
            : String(input.content || ''),
        invocation,
        invocations,
      });
    },
  );
}
