import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type {
  DCreateSkill,
  DUpdateSkill,
  IMcpServerConfig,
  ISkillLocalFileEntry,
  ISkillLocalFileTreeEntry,
  ISkillMcpConfig,
  ISkillSafetyReport,
  ISkillSafetyScanInput,
} from '@/types/modules';
import { ipcRenderer } from 'electron';

export const skillApi = {
  create: (data: DCreateSkill, options?: { skipInitialVersion?: boolean }) =>
    ipcRenderer.invoke(IPC_CHANNELS.SKILL_CREATE, data, options),
  get: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.SKILL_GET, id),
  getAll: () => ipcRenderer.invoke(IPC_CHANNELS.SKILL_GET_ALL),
  update: (id: string, data: DUpdateSkill) =>
    ipcRenderer.invoke(IPC_CHANNELS.SKILL_UPDATE, id, data),
  delete: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.SKILL_DELETE, id),
  scanLocal: () => ipcRenderer.invoke(IPC_CHANNELS.SKILL_SCAN_LOCAL),
  scanLocalPreview: (customPaths?: string[]) =>
    ipcRenderer.invoke(IPC_CHANNELS.SKILL_SCAN_LOCAL_PREVIEW, customPaths),
  scanSafety: (input: ISkillSafetyScanInput): Promise<ISkillSafetyReport> =>
    ipcRenderer.invoke(IPC_CHANNELS.SKILL_SCAN_SAFETY, input),
  saveSafetyReport: (skillId: string, report: ISkillSafetyReport): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.SKILL_SAVE_SAFETY_REPORT, skillId, report),
  installToPlatform: (
    platform: 'claude' | 'cursor',
    name: string,
    mcpConfig: ISkillMcpConfig | IMcpServerConfig,
  ) => ipcRenderer.invoke(IPC_CHANNELS.SKILL_INSTALL_TO_PLATFORM, platform, name, mcpConfig),
  uninstallFromPlatform: (platform: 'claude' | 'cursor', name: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SKILL_UNINSTALL_FROM_PLATFORM, platform, name),
  getPlatformStatus: (name: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SKILL_GET_PLATFORM_STATUS, name),
  export: (id: string, format: 'skillmd' | 'json') =>
    ipcRenderer.invoke(IPC_CHANNELS.SKILL_EXPORT, id, format),
  exportZip: (id: string): Promise<{ fileName: string; base64: string }> =>
    ipcRenderer.invoke(IPC_CHANNELS.SKILL_EXPORT_ZIP, id),
  import: (jsonContent: string) => ipcRenderer.invoke(IPC_CHANNELS.SKILL_IMPORT, jsonContent),
  getSupportedPlatforms: () => ipcRenderer.invoke(IPC_CHANNELS.SKILL_GET_SUPPORTED_PLATFORMS),
  detectPlatforms: () => ipcRenderer.invoke(IPC_CHANNELS.SKILL_DETECT_PLATFORMS),
  installMd: (skillName: string, skillMdContent: string, platformId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SKILL_INSTALL_MD, skillName, skillMdContent, platformId),
  uninstallMd: (skillName: string, platformId: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SKILL_UNINSTALL_MD, skillName, platformId),
  getMdInstallStatus: (skillName: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SKILL_GET_MD_INSTALL_STATUS, skillName),
  getMdInstallStatusBatch: (skillNames: string[]) =>
    ipcRenderer.invoke(IPC_CHANNELS.SKILL_GET_MD_INSTALL_STATUS_BATCH, skillNames),
  installMdSymlink: (skillName: string, skillMdContent: string, platformId: string) =>
    ipcRenderer.invoke(
      IPC_CHANNELS.SKILL_INSTALL_MD_SYMLINK,
      skillName,
      skillMdContent,
      platformId,
    ),
  fetchRemoteContent: (url: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SKILL_FETCH_REMOTE_CONTENT, url),
  syncGitStore: (repoUrl: string, forceRefresh?: boolean, gitRef?: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SKILL_SYNC_GIT_STORE, { repoUrl, forceRefresh, gitRef }),
  extractSkillHubArchive: (slug: string, version?: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SKILL_EXTRACT_SKILLHUB_ARCHIVE, { slug, version }),
  extractClawhubArchive: (slug: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SKILL_EXTRACT_CLAWHUB_ARCHIVE, slug),
  fetchRemotePost: (url: string, body: unknown) =>
    ipcRenderer.invoke(IPC_CHANNELS.SKILL_FETCH_REMOTE_POST, url, body),
  fetchRemoteBinary: async (url: string): Promise<ArrayBuffer> => {
    const base64 = await ipcRenderer.invoke(IPC_CHANNELS.SKILL_FETCH_REMOTE_BINARY, url);
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes.buffer;
  },
  saveToRepo: (skillName: string, sourceDir: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SKILL_SAVE_TO_REPO, skillName, sourceDir),
  saveRemoteGitToRepo: (
    skillId: string,
    options: {
      repoUrl: string;
      branch?: string;
      directory?: string;
      installName?: string;
    },
  ) => ipcRenderer.invoke(IPC_CHANNELS.SKILL_SAVE_REMOTE_GIT_TO_REPO, skillId, options),
  listLocalFiles: (skillId: string): Promise<ISkillLocalFileTreeEntry[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.SKILL_LIST_LOCAL_FILES, skillId),
  readLocalFile: (skillId: string, relativePath: string): Promise<ISkillLocalFileEntry | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.SKILL_READ_LOCAL_FILE, skillId, relativePath),
  readLocalFiles: (skillId: string): Promise<ISkillLocalFileEntry[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.SKILL_READ_LOCAL_FILES, skillId),
  renameLocalPath: (skillId: string, oldRelativePath: string, newRelativePath: string) =>
    ipcRenderer.invoke(
      IPC_CHANNELS.SKILL_RENAME_LOCAL_PATH,
      skillId,
      oldRelativePath,
      newRelativePath,
    ),
  writeLocalFile: (skillId: string, relativePath: string, content: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SKILL_WRITE_LOCAL_FILE, skillId, relativePath, content),
  deleteLocalFile: (skillId: string, relativePath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SKILL_DELETE_LOCAL_FILE, skillId, relativePath),
  createLocalDir: (skillId: string, relativePath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SKILL_CREATE_LOCAL_DIR, skillId, relativePath),
  listLocalFilesByPath: (localPath: string): Promise<ISkillLocalFileTreeEntry[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.SKILL_LIST_LOCAL_FILES_BY_PATH, localPath),
  readLocalFileByPath: (
    localPath: string,
    relativePath: string,
  ): Promise<ISkillLocalFileEntry | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.SKILL_READ_LOCAL_FILE_BY_PATH, localPath, relativePath),
  renameLocalPathByPath: (localPath: string, oldRelativePath: string, newRelativePath: string) =>
    ipcRenderer.invoke(
      IPC_CHANNELS.SKILL_RENAME_LOCAL_PATH_BY_PATH,
      localPath,
      oldRelativePath,
      newRelativePath,
    ),
  writeLocalFileByPath: (localPath: string, relativePath: string, content: string) =>
    ipcRenderer.invoke(
      IPC_CHANNELS.SKILL_WRITE_LOCAL_FILE_BY_PATH,
      localPath,
      relativePath,
      content,
    ),
  deleteLocalFileByPath: (localPath: string, relativePath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SKILL_DELETE_LOCAL_FILE_BY_PATH, localPath, relativePath),
  createLocalDirByPath: (localPath: string, relativePath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.SKILL_CREATE_LOCAL_DIR_BY_PATH, localPath, relativePath),
  importLocalFiles: (
    skillId: string,
    parentRelativePath?: string | null,
  ): Promise<{ copiedPaths: string[]; skippedCount: number }> =>
    ipcRenderer.invoke(IPC_CHANNELS.SKILL_IMPORT_LOCAL_FILES, skillId, parentRelativePath ?? null),
  importLocalFilesByPath: (
    localPath: string,
    parentRelativePath?: string | null,
  ): Promise<{ copiedPaths: string[]; skippedCount: number }> =>
    ipcRenderer.invoke(
      IPC_CHANNELS.SKILL_IMPORT_LOCAL_FILES_BY_PATH,
      localPath,
      parentRelativePath ?? null,
    ),
  getRepoPath: (skillId: string) => ipcRenderer.invoke(IPC_CHANNELS.SKILL_GET_REPO_PATH, skillId),
  syncFromRepo: (skillId: string) => ipcRenderer.invoke(IPC_CHANNELS.SKILL_SYNC_FROM_REPO, skillId),
  executeWorkspace: (
    skillId: string,
    userInput: string,
    options?: { commands?: string[]; outputDir?: string },
  ) => ipcRenderer.invoke(IPC_CHANNELS.SKILL_EXECUTE_WORKSPACE, skillId, userInput, options),
};
