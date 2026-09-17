import {
  AGENT_CHANNEL,
  AGENT_EVENT_CHANNEL,
  type PermissionMode,
  type RunEvent,
  type RunResponse,
  type RuntimeTurnInput,
  type SourceRef,
} from '@momo/agent-contracts';
import { ipcRenderer } from 'electron';
const invoke = (method: string, input?: unknown) =>
  ipcRenderer.invoke(AGENT_CHANNEL, method, input);
export const agentRuntimeApi = {
  describe: () => invoke('describe'),
  listAgents: (sessionId?: string) => invoke('listAgents', { sessionId }),
  startTurn: (input: RuntimeTurnInput) => invoke('startTurn', input),
  controlGoal: (sessionId: string, action: 'pause' | 'clear'): Promise<void> =>
    invoke('controlGoal', { sessionId, action }),
  exportSession: (sessionId: string): Promise<Record<string, unknown>> =>
    invoke('exportSession', { sessionId }),
  setPermission: (sessionId: string, mode: PermissionMode): Promise<void> =>
    invoke('setPermission', { sessionId, mode }),
  respond: (input: RunResponse) => invoke('respond', input),
  cancel: (input: {
    runId?: string;
    sessionId?: string;
    idempotencyKey?: string;
    reason?: string;
  }) => invoke('cancel', input),
  events: (runId: string, afterSeq = 0): Promise<RunEvent[]> =>
    invoke('events', { runId, afterSeq }),
  onEvent: (listener: (event: RunEvent) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, value: RunEvent) => listener(value);
    ipcRenderer.on(AGENT_EVENT_CHANNEL, handler);
    return () => ipcRenderer.removeListener(AGENT_EVENT_CHANNEL, handler);
  },
  prepareAttachment: (input: { name: string; mimeType: string; data: string }) =>
    invoke('prepareAttachment', input),
  saveSources: (input: unknown[]): Promise<SourceRef[]> => invoke('saveSources', input),
  loadSources: (refs: SourceRef[]) => invoke('loadSources', refs),
  syncProjects: (projects: Array<{ id: string; folderPaths: string[] }>) =>
    invoke('syncProjects', projects),
  sessionBinding: (sessionId: string) => invoke('sessionBinding', { sessionId }),
  toolCatalog: (projectId: string) => invoke('toolCatalog', { projectId }),
  setToolPolicy: (projectId: string, ids: string[]) => invoke('setToolPolicy', { projectId, ids }),
  exportToolCatalog: (projectId: string) => invoke('exportToolCatalog', { projectId }),
  saveArtifact: (id: string) => invoke('saveArtifact', { id }),
  bundles: () => invoke('bundles'),
  importBundle: () => invoke('importBundle'),
  clearGrants: (projectId: string) => invoke('clearGrants', { projectId }),
};
