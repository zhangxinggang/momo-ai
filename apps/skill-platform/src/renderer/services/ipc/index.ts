import type { TApi } from '@preload';

import { getAppApi } from '../app-api';

export function getAiIpc(): TApi['ai'] | undefined {
  return getAppApi()?.ai;
}

export function getAichatIpc(): TApi['aichat'] | undefined {
  return getAppApi()?.aichat;
}

export function getClaudeCodeIpc(): TApi['claudeCode'] | undefined {
  return getAppApi()?.claudeCode;
}

export function getFolderIpc(): TApi['folder'] | undefined {
  return getAppApi()?.folder;
}

export function getIoIpc(): TApi['io'] | undefined {
  return getAppApi()?.io;
}

export function getKbIpc(): TApi['kb'] | undefined {
  return getAppApi()?.kb;
}

export function getNoteIpc(): TApi['note'] | undefined {
  return getAppApi()?.note;
}

export function getOnlineConfIpc(): TApi['onlineConf'] | undefined {
  return getAppApi()?.onlineConf;
}

export function getPromptIpc(): TApi['prompt'] | undefined {
  return getAppApi()?.prompt;
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

export function getVersionIpc(): TApi['version'] | undefined {
  return getAppApi()?.version;
}

export function getWorkflowIpc(): TApi['workflow'] | undefined {
  return getAppApi()?.workflow;
}

export function getWorkflowAgentIpc(): TApi['workflowAgent'] | undefined {
  return getAppApi()?.workflowAgent;
}

export function getWorkflowBusinessIpc(): TApi['workflowBusiness'] | undefined {
  return getAppApi()?.workflowBusiness;
}

export function getWorkflowFolderIpc(): TApi['workflowFolder'] | undefined {
  return getAppApi()?.workflowFolder;
}

export function getWorkspaceIpc(): TApi['workspace'] | undefined {
  return getAppApi()?.workspace;
}
