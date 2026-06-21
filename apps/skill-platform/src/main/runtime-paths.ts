import { getAPPRootPath } from '@momo/electron';
import { app } from 'electron';
import fs from 'fs';
import path from 'path';

/** ISkill 全局 Node 运行时 npm 包名 */
const SKILL_RUNTIME_PACKAGE_NAME = '@aim/skill-runtime';

export function getUserDataPath(): string {
  return path.resolve(app.getPath('userData'));
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

export function getRulesDir(): string {
  return path.join(getDataDir(), 'rules');
}

/** ISkill 全局 Node 运行时 npm 包名 */
export function getSkillRuntimePackageName(): string {
  return SKILL_RUNTIME_PACKAGE_NAME;
}

/** ISkill 全局 Node 运行时根目录：<userData>/data/skills/runtime */
export function getSkillRuntimeDir(): string {
  return path.join(getDataDir(), 'skills', 'runtime');
}

/** ISkill 全局 Node 运行时 node_modules：<userData>/data/skills/runtime/node_modules */
export function getSkillRuntimeNodeModulesDir(): string {
  return path.join(getSkillRuntimeDir(), 'node_modules');
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

/** 技能商店下载缓存：<userData>/data/skills/source */
export function getSkillsSourceDir(): string {
  return path.join(getDataDir(), 'skills', 'source');
}

/** 应用根目录（与 @momo/electron getAPPRootPath 一致） */
export function getProjectRoot(): string {
  return getAPPRootPath();
}

/** 应用临时目录：<应用根>/temp */
export function getAppTempDir(): string {
  return path.join(getProjectRoot(), 'temp');
}

/** 消毒会话 id，用于 temp 子目录名 */
export function sanitizeSessionId(sessionId: string): string {
  return sessionId.replace(/[^a-zA-Z0-9_-]/g, '_') || 'session';
}

/** SKILL 对话会话工作区：<应用根>/temp/<sessionId> */
export function getSkillSessionWorkspaceDir(sessionId: string): string {
  return path.join(getAppTempDir(), sanitizeSessionId(sessionId));
}

/** 技能执行产出目录（非会话模式）：<应用根>/temp/<skillId> */
export function getSkillTempOutputDir(skillId: string): string {
  const safeId = skillId.replace(/[^a-zA-Z0-9_-]/g, '_') || 'skill';
  return path.join(getAppTempDir(), safeId);
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

/** 工作流业务实例目录：<userData>/agent/<workflowName>/<businessId> */
export function getWorkflowBusinessAgentDir(workflowName: string, businessId: string): string {
  const safeBiz = businessId.replace(/[^a-zA-Z0-9_-]/g, '_') || 'business';
  return path.join(getWorkflowAgentDir(workflowName), safeBiz);
}

/** 工作流节点产出目录（旧，无 businessId）：<userData>/agent/<workflowName>/<nodeName> */
export function getWorkflowNodeAgentDir(workflowName: string, nodeName: string): string {
  const safeNode = nodeName.replace(/[^a-zA-Z0-9_-]/g, '_') || 'node';
  return path.join(getWorkflowAgentDir(workflowName), safeNode);
}

/** 工作流业务节点产出目录：<userData>/agent/<workflowName>/<businessId>/<nodeName> */
export function getWorkflowBusinessNodeAgentDir(
  workflowName: string,
  businessId: string,
  nodeName: string,
): string {
  const safeNode = nodeName.replace(/[^a-zA-Z0-9_-]/g, '_') || 'node';
  return path.join(getWorkflowBusinessAgentDir(workflowName, businessId), safeNode);
}
