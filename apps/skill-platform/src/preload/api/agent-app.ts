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
import { ipcRenderer } from 'electron';

export const agentAppApi = {
  detect: (input: DAgentAppDetectInput): Promise<DAgentAppDetectResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.AGENT_APP_DETECT, input),

  resolveContext: (input: {
    agentAppId: string;
    folderPaths: string[];
  }): Promise<DAgentAppContext | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.AGENT_APP_RESOLVE_CONTEXT, input),

  listSlash: (input: DAgentAppListSlashInput): Promise<DAgentAppListSlashResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.AGENT_APP_LIST_SLASH, input),

  prepareSubmit: (input: DAgentAppPrepareSubmitInput): Promise<DAgentAppPrepareSubmitResult> =>
    ipcRenderer.invoke(IPC_CHANNELS.AGENT_APP_PREPARE_SUBMIT, input),
};
