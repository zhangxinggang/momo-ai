import { contextBridge } from 'electron';
import {
  aiApi,
  aichatApi,
  claudeCodeApi,
  desktopApi,
  folderApi,
  ioApi,
  kbApi,
  mediaApi,
  noteApi,
  onlineConfApi,
  promptApi,
  rulesApi,
  scraperApi,
  settingsApi,
  skillApi,
  systemApi,
  versionApi,
  workflowAgentApi,
  workflowApi,
  workflowBusinessApi,
  workflowFolderApi,
  workspaceApi,
} from './api';
import { createPreloadApi } from './create-api';

const api = createPreloadApi({
  prompt: promptApi,
  rules: rulesApi,
  version: versionApi,
  folder: folderApi,
  skill: skillApi,
  note: noteApi,
  kb: kbApi,
  settings: settingsApi,
  system: systemApi,
  io: ioApi,
  ai: aiApi,
  aichat: aichatApi,
  claudeCode: claudeCodeApi,
  workflow: workflowApi,
  workflowAgent: workflowAgentApi,
  workflowBusiness: workflowBusinessApi,
  workflowFolder: workflowFolderApi,
  workspace: workspaceApi,
  scraper: scraperApi,
  onlineConf: onlineConfApi,
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
