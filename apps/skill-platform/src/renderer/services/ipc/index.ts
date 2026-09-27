import type { TApi } from '@preload';

import { getAppApi } from '../app-api';

export function getAiIpc(): TApi['ai'] | undefined {
  return getAppApi()?.ai;
}

export function getAichatIpc(): TApi['aichat'] | undefined {
  return getAppApi()?.aichat;
}

export function getKbIpc(): TApi['kb'] | undefined {
  return getAppApi()?.kb;
}

export function getMcpIpc(): TApi['mcp'] | undefined {
  return getAppApi()?.mcp;
}

export function getNoteIpc(): TApi['note'] | undefined {
  return getAppApi()?.note;
}

export function getCustomToolIpc(): TApi['customTool'] | undefined {
  return getAppApi()?.customTool;
}

export function getOnlineConfIpc(): TApi['onlineConf'] | undefined {
  return getAppApi()?.onlineConf;
}

export function getRulesIpc(): TApi['rules'] | undefined {
  return getAppApi()?.rules;
}

export function getScraperIpc(): TApi['scraper'] | undefined {
  return getAppApi()?.scraper;
}

export function getSettingsIpc(): TApi['settings'] | undefined {
  return getAppApi()?.settings;
}

export function getSkillIpc(): TApi['skill'] | undefined {
  return getAppApi()?.skill;
}

export function getSystemIpc(): TApi['system'] | undefined {
  return getAppApi()?.system;
}

export function getWorkspaceIpc(): TApi['workspace'] | undefined {
  return getAppApi()?.workspace;
}
