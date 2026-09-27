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

export function getDefaultPluginsDir(): string {
  return path.join(getProjectRoot(), 'default', 'plugins');
}

/** 用户自定义工具与插件的唯一可编辑目录。 */
export function getToolsDir(): string {
  return path.join(getDefaultPluginsDir(), 'user');
}

/** 静态资源目录（snapEdit.html 等） */
export function getStaticDir(): string {
  const projectRoot = getProjectRoot();
  const distStatic = path.join(projectRoot, 'dist', 'static');
  if (fs.existsSync(distStatic)) {
    return distStatic;
  }
  return path.join(projectRoot, 'static');
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
