import { contextBridge } from 'electron';
import {
  agentAppApi,
  agentRuntimeApi,
  aiApi,
  aichatApi,
  apiRequestApi,
  customToolApi,
  desktopApi,
  kbApi,
  mcpApi,
  mediaApi,
  noteApi,
  onlineConfApi,
  rulesApi,
  scraperApi,
  settingsApi,
  skillApi,
  systemApi,
  workspaceApi,
} from './api';
import { createPreloadApi } from './create-api';

const api = createPreloadApi({
  rules: rulesApi,
  skill: skillApi,
  note: noteApi,
  apiRequest: apiRequestApi,
  customTool: customToolApi,
  kb: kbApi,
  settings: settingsApi,
  system: systemApi,
  ai: aiApi,
  aichat: aichatApi,
  agentApp: agentAppApi,
  agentRuntime: agentRuntimeApi,
  workspace: workspaceApi,
  scraper: scraperApi,
  onlineConf: onlineConfApi,
  mcp: mcpApi,
});

contextBridge.exposeInMainWorld('api', api);
contextBridge.exposeInMainWorld('electron', {
  ...desktopApi,
  ...mediaApi,
});

export type TApi = typeof api;

declare global {
  interface Window {
    api: TApi;
    electron?: typeof desktopApi &
      typeof mediaApi & {
        /** E2E / 自动化测试注入标记（可选） */
        e2e?: boolean;
      };
  }
}
