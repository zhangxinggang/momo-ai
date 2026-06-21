import type { ISkillPlatform } from '@/types/constants/platforms';
import type {
  DCreateSkill,
  DUpdateSkill,
  IMcpServerConfig,
  IScanLocalResult,
  IScannedSkill,
  ISkill,
  ISkillLocalFileTreeEntry,
  ISkillMcpConfig,
  ISkillSafetyReport,
  ISkillSafetyScanInput,
} from '@/types/modules';

import { getSkillIpc } from '../../ipc';

/** 可选 Skill IPC（Web 降级路径无 API） */
export function getSkillApi() {
  return getSkillIpc();
}

export function isSkillApiAvailable(): boolean {
  return !!getSkillIpc();
}

/** 桌面端 Skill IPC，不可用时抛错 */
export function requireSkillIpc() {
  const skill = getSkillIpc();
  if (!skill) {
    throw new Error('当前环境不支持 Skill IPC');
  }
  return skill;
}

export function listSkills() {
  return requireSkillIpc().getAll();
}

export function createSkill(data: DCreateSkill, options?: { skipInitialVersion?: boolean }) {
  return requireSkillIpc().create(data, options);
}

export function updateSkill(id: string, data: DUpdateSkill) {
  return requireSkillIpc().update(id, data);
}

export function deleteSkill(id: string) {
  return requireSkillIpc().delete(id);
}

export function scanLocalSkills() {
  return requireSkillIpc().scanLocal();
}

export function scanLocalSkillsPreview(customPaths?: string[]) {
  return requireSkillIpc().scanLocalPreview(customPaths);
}

export function syncSkillFromRepo(skillId: string) {
  return requireSkillIpc().syncFromRepo(skillId);
}

export function getSkillRepoPath(skillId: string) {
  return requireSkillIpc().getRepoPath(skillId);
}

export function saveSkillToRepo(skillName: string, sourceDir: string) {
  return requireSkillIpc().saveToRepo(skillName, sourceDir);
}

export function saveRemoteGitSkillToRepo(
  skillId: string,
  options: {
    repoUrl: string;
    branch?: string;
    directory?: string;
    installName?: string;
  },
) {
  return requireSkillIpc().saveRemoteGitToRepo(skillId, options);
}

export function writeSkillLocalFile(skillId: string, relativePath: string, content: string) {
  return requireSkillIpc().writeLocalFile(skillId, relativePath, content);
}

export function readSkillLocalFile(skillId: string, relativePath: string) {
  return requireSkillIpc().readLocalFile(skillId, relativePath);
}

export function readSkillLocalFileBuffer(skillId: string, relativePath: string) {
  return requireSkillIpc().readLocalFileBuffer(skillId, relativePath);
}

export function readSkillLocalFileByPath(localPath: string, relativePath: string) {
  return requireSkillIpc().readLocalFileByPath(localPath, relativePath);
}

export function readSkillLocalFileBufferByPath(localPath: string, relativePath: string) {
  return requireSkillIpc().readLocalFileBufferByPath(localPath, relativePath);
}

export function extractSkillHubArchive(slug: string, version?: string) {
  return requireSkillIpc().extractSkillHubArchive(slug, version);
}

export function extractClawhubArchive(slug: string) {
  return requireSkillIpc().extractClawhubArchive(slug);
}

export function fetchSkillRemoteContent(url: string) {
  return requireSkillIpc().fetchRemoteContent(url);
}

export function fetchSkillRemoteBinary(url: string) {
  return requireSkillIpc().fetchRemoteBinary(url);
}

export function fetchSkillRemotePost(url: string, body: unknown) {
  return requireSkillIpc().fetchRemotePost(url, body);
}

export function syncSkillGitStore(repoUrl: string, forceRefresh?: boolean, gitRef?: string) {
  return requireSkillIpc().syncGitStore(repoUrl, forceRefresh, gitRef);
}

export function executeSkillWorkspace(
  skillId: string,
  userInput: string,
  options?: { commands?: string[]; outputDir?: string; sessionId?: string },
) {
  return requireSkillIpc().executeWorkspace(skillId, userInput, options);
}

export function ensureSkillSessionWorkspace(skillId: string, sessionId: string) {
  return requireSkillIpc().ensureSessionWorkspace(skillId, sessionId);
}

export function writeSessionWorkspaceFile(
  sessionId: string,
  relativePath: string,
  content: string,
) {
  return requireSkillIpc().writeSessionFile(sessionId, relativePath, content);
}

export function getSkillMdInstallStatusBatch(skillNames: string[]) {
  return requireSkillIpc().getMdInstallStatusBatch(skillNames);
}

export function scanSkillSafety(input: ISkillSafetyScanInput) {
  return requireSkillIpc().scanSafety(input);
}

export function saveSkillSafetyReport(skillId: string, report: ISkillSafetyReport) {
  return requireSkillIpc().saveSafetyReport(skillId, report);
}

export function installSkillToPlatform(
  platform: 'claude' | 'cursor',
  name: string,
  mcpConfig: ISkillMcpConfig | IMcpServerConfig,
) {
  return requireSkillIpc().installToPlatform(platform, name, mcpConfig);
}

export function uninstallSkillFromPlatform(platform: 'claude' | 'cursor', name: string) {
  return requireSkillIpc().uninstallFromPlatform(platform, name);
}

export function getSkillPlatformStatus(name: string) {
  return requireSkillIpc().getPlatformStatus(name);
}

export function getSupportedSkillPlatforms(): Promise<ISkillPlatform[]> {
  return requireSkillIpc().getSupportedPlatforms();
}

export function detectSkillPlatforms(): Promise<string[]> {
  return requireSkillIpc().detectPlatforms();
}

export function getSkillMdInstallStatus(skillName: string) {
  return requireSkillIpc().getMdInstallStatus(skillName);
}

export function exportSkill(id: string, format: 'skillmd' | 'json') {
  return requireSkillIpc().export(id, format);
}

export function exportSkillZip(id: string): Promise<{ fileName: string; base64: string }> {
  return requireSkillIpc().exportZip(id);
}

export function installSkillMd(skillName: string, skillMdContent: string, platformId: string) {
  return requireSkillIpc().installMd(skillName, skillMdContent, platformId);
}

export function uninstallSkillMd(skillName: string, platformId: string) {
  return requireSkillIpc().uninstallMd(skillName, platformId);
}

export function installSkillMdSymlink(
  skillName: string,
  skillMdContent: string,
  platformId: string,
) {
  return requireSkillIpc().installMdSymlink(skillName, skillMdContent, platformId);
}

export function listSkillLocalFiles(skillId: string): Promise<ISkillLocalFileTreeEntry[]> {
  return requireSkillIpc().listLocalFiles(skillId);
}

export function listSkillLocalFilesByPath(localPath: string): Promise<ISkillLocalFileTreeEntry[]> {
  return requireSkillIpc().listLocalFilesByPath(localPath);
}

export function writeSkillLocalFileByPath(
  localPath: string,
  relativePath: string,
  content: string,
) {
  return requireSkillIpc().writeLocalFileByPath(localPath, relativePath, content);
}

export function deleteSkillLocalFile(skillId: string, relativePath: string) {
  return requireSkillIpc().deleteLocalFile(skillId, relativePath);
}

export function deleteSkillLocalFileByPath(localPath: string, relativePath: string) {
  return requireSkillIpc().deleteLocalFileByPath(localPath, relativePath);
}

export function createSkillLocalDir(skillId: string, relativePath: string) {
  return requireSkillIpc().createLocalDir(skillId, relativePath);
}

export function createSkillLocalDirByPath(localPath: string, relativePath: string) {
  return requireSkillIpc().createLocalDirByPath(localPath, relativePath);
}

export function canExecuteSkillWorkspace(): boolean {
  return typeof getSkillApi()?.executeWorkspace === 'function';
}

export type { IScanLocalResult, IScannedSkill, ISkill };
