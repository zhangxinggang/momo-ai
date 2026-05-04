import { getAppConfig, resolveInitialUserDataPath } from '@momo/electron';
import { app } from 'electron';
import fs from 'fs';
import path from 'path';

const { appName } = getAppConfig();
const appDataPath = app.getPath('appData');
const userDataPath = app.getPath('userData');

const productConfig = {
  productName: 'PromptHub',
  configDirName: 'PromptHub',
  dataMarkers: [
    'prompthub.db',
    'data',
    'config',
    'backups',
    'logs',
    'workspace',
    'IndexedDB',
    'Local Storage',
    'Session Storage',
    'images',
    'videos',
    'skills',
    'shortcuts.json',
    'shortcut-mode.json',
  ],
};
export function getUserDataPath(): string {
  if (userDataPath) {
    return path.resolve(userDataPath);
  }
  return resolveInitialUserDataPath(productConfig);
}

function resolvePreferredPath(primaryPath: string, legacyPath?: string): string {
  if (fs.existsSync(primaryPath)) {
    return primaryPath;
  }
  if (legacyPath && fs.existsSync(legacyPath)) {
    return legacyPath;
  }
  return primaryPath;
}

export function getDataDir(): string {
  return path.join(getUserDataPath(), 'data');
}

export function getConfigDir(): string {
  return path.join(getUserDataPath(), 'config');
}

export function getAssetsDir(): string {
  return path.join(getDataDir(), 'assets');
}

export function getAttachmentsDir(): string {
  return path.join(getAssetsDir(), 'attachments');
}

export function getLegacySkillsDir(): string {
  return path.join(getUserDataPath(), 'skills');
}

export function getSkillsDir(): string {
  return resolvePreferredPath(path.join(getDataDir(), 'skills'), getLegacySkillsDir());
}

export function getLegacyWorkspaceDir(): string {
  return path.join(getUserDataPath(), 'workspace');
}

export function getLegacyPromptsWorkspaceDir(): string {
  return path.join(getLegacyWorkspaceDir(), 'prompts');
}

export function getPromptsDir(): string {
  return resolvePreferredPath(path.join(getDataDir(), 'prompts'), getLegacyPromptsWorkspaceDir());
}

export function getWorkspaceDir(): string {
  const dataDir = getDataDir();
  if (
    fs.existsSync(path.join(dataDir, 'prompts')) ||
    fs.existsSync(path.join(dataDir, 'folders.json'))
  ) {
    return dataDir;
  }

  const legacyWorkspaceDir = getLegacyWorkspaceDir();
  if (fs.existsSync(legacyWorkspaceDir)) {
    return legacyWorkspaceDir;
  }

  return dataDir;
}

export function getPromptsWorkspaceDir(): string {
  return getPromptsDir();
}

export function getLegacyImagesDir(): string {
  return path.join(getUserDataPath(), 'images');
}

export function getImagesDir(): string {
  return resolvePreferredPath(path.join(getAssetsDir(), 'images'), getLegacyImagesDir());
}

export function getLegacyVideosDir(): string {
  return path.join(getUserDataPath(), 'videos');
}

export function getVideosDir(): string {
  return resolvePreferredPath(path.join(getAssetsDir(), 'videos'), getLegacyVideosDir());
}

export function getNotesDir(): string {
  return path.join(getDataDir(), 'notes');
}

/** 启动项目根目录（开发/打包均以 process.cwd() 为准） */
export function getProjectRoot(): string {
  return process.cwd();
}

/** 技能执行产出目录：<项目根>/temp/<skillId> */
export function getSkillTempOutputDir(skillId: string): string {
  const safeId = skillId.replace(/[^a-zA-Z0-9_-]/g, '_') || 'skill';
  return path.join(getProjectRoot(), 'temp', safeId);
}

/** 工作流 Agent 根目录：<userData>/agent */
export function getAgentDir(): string {
  return path.join(getUserDataPath(), 'agent');
}

/** 单个工作流产出目录：<userData>/agent/<workflowName> */
export function getWorkflowAgentDir(workflowName: string): string {
  const safeName = workflowName.replace(/[^a-zA-Z0-9_-]/g, '_') || 'workflow';
  return path.join(getAgentDir(), safeName);
}

/** 工作流节点产出目录：<userData>/agent/<workflowName>/<nodeName> */
export function getWorkflowNodeAgentDir(workflowName: string, nodeName: string): string {
  const safeNode = nodeName.replace(/[^a-zA-Z0-9_-]/g, '_') || 'node';
  return path.join(getWorkflowAgentDir(workflowName), safeNode);
}
