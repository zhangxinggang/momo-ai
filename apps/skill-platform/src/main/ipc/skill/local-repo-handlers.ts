import { IPC_CHANNELS } from '@/types/constants';
import { getMainWindow } from '@momo/electron';
import { dialog, ipcMain } from 'electron';
import path from 'path';
import {
  SkillInstaller,
  buildSkillSyncUpdateFromRepo,
  ensureSkillSessionWorkspace,
  executeSkillWorkspace,
  writeSessionWorkspaceFile,
} from '../../services/skill';
import type { ISkillIPCContext } from './shared';
import { ensureLocalRepoPath } from './shared';

async function resolveManagedRepoPath(context: ISkillIPCContext, skillId: string): Promise<string> {
  const skill = await context.db.getById(skillId);
  if (!skill) {
    throw new Error(`ISkill not found: ${skillId}`);
  }

  if (skill.local_repo_path && (await SkillInstaller.isManagedRepoPath(skill.local_repo_path))) {
    return skill.local_repo_path;
  }

  const ensuredRepoPath = await ensureLocalRepoPath(context.db, skillId);
  if (ensuredRepoPath && (await SkillInstaller.isManagedRepoPath(ensuredRepoPath))) {
    return ensuredRepoPath;
  }

  const managedRepoPath = SkillInstaller.getLocalRepoPath(skill.name);
  if (skill.local_repo_path !== managedRepoPath) {
    await context.db.update(skillId, { local_repo_path: managedRepoPath });
  }
  return managedRepoPath;
}

async function resolveSkillRepoPath(context: ISkillIPCContext, skillId: string): Promise<string> {
  const skill = await context.db.getById(skillId);
  if (!skill) {
    throw new Error(`ISkill not found: ${skillId}`);
  }

  let repoPath = skill.local_repo_path?.trim() || '';
  if (!repoPath) {
    repoPath = (await ensureLocalRepoPath(context.db, skillId)) || '';
  }
  if (!repoPath) {
    repoPath = await resolveManagedRepoPath(context, skillId);
  }
  return repoPath;
}

async function syncSkillContentFromRepo(
  context: ISkillIPCContext,
  skillId: string,
  repoPath: string,
): Promise<void> {
  await syncSkillFromRepo(context, skillId, repoPath);
}

let lastSkillImportSourcePaths = new Set<string>();

async function pickSkillImportSourcePaths(): Promise<string[]> {
  const result = await dialog.showOpenDialog(getMainWindow()!, {
    properties: ['openFile', 'multiSelections'],
    title: '选择要导入的文件',
  });
  if (result.canceled || result.filePaths.length === 0) {
    lastSkillImportSourcePaths = new Set();
    return [];
  }
  lastSkillImportSourcePaths = new Set(result.filePaths.map((filePath) => path.resolve(filePath)));
  return [...lastSkillImportSourcePaths];
}

function consumePickedSkillImportPaths(sourcePaths: string[]): string[] {
  const allowed = sourcePaths.filter((sourcePath) =>
    lastSkillImportSourcePaths.has(path.resolve(sourcePath)),
  );
  lastSkillImportSourcePaths = new Set();
  return allowed;
}

async function syncSkillFromRepo(context: ISkillIPCContext, skillId: string, repoPath?: string) {
  const skill = await context.db.getById(skillId);
  if (!skill) {
    return null;
  }

  const resolvedRepoPath = repoPath ?? (await ensureLocalRepoPath(context.db, skillId));
  if (!resolvedRepoPath) {
    return skill;
  }

  const files = await SkillInstaller.readLocalRepoFilesByPath(resolvedRepoPath);
  const skillMdFile = files.find(
    (file) => !file.isDirectory && file.path.toLowerCase() === 'skill.md',
  );
  if (!skillMdFile?.content) {
    return skill;
  }

  const nextUpdate = buildSkillSyncUpdateFromRepo(skill, skillMdFile.content);
  if (!nextUpdate) {
    return skill;
  }

  return await context.db.update(skillId, nextUpdate);
}

export function registerSkillLocalRepoHandlers({ db }: ISkillIPCContext): void {
  ipcMain.handle(
    IPC_CHANNELS.SKILL_SAVE_TO_REPO,
    async (_, skillName: string, sourceDir: string) => {
      if (typeof skillName !== 'string' || skillName.trim().length === 0) {
        throw new Error('skill:saveToRepo requires a non-empty skillName');
      }
      if (typeof sourceDir !== 'string' || sourceDir.trim().length === 0) {
        throw new Error('skill:saveToRepo requires a non-empty sourceDir');
      }
      return SkillInstaller.saveToLocalRepo(skillName, sourceDir);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SKILL_SAVE_REMOTE_GIT_TO_REPO,
    async (
      _,
      skillId: string,
      options?: {
        repoUrl?: string;
        branch?: string;
        directory?: string;
        installName?: string;
      },
    ) => {
      if (typeof skillId !== 'string' || skillId.trim().length === 0) {
        throw new Error('skill:saveRemoteGitToRepo requires a non-empty skillId');
      }
      if (!options || typeof options.repoUrl !== 'string' || options.repoUrl.trim().length === 0) {
        throw new Error('skill:saveRemoteGitToRepo requires a non-empty repoUrl');
      }

      const skill = await db.getById(skillId);
      if (!skill) {
        throw new Error(`ISkill not found: ${skillId}`);
      }

      const repoPath = await SkillInstaller.saveRemoteGitSkillToLocalRepo(skill.name, {
        repoUrl: options.repoUrl,
        branch: options.branch,
        directory: options.directory,
        installName: options.installName,
      });
      await db.update(skillId, { local_repo_path: repoPath });
      return repoPath;
    },
  );

  ipcMain.handle(IPC_CHANNELS.SKILL_LIST_LOCAL_FILES, async (_, skillId: string) => {
    if (typeof skillId !== 'string' || skillId.trim() === '') {
      return [];
    }
    const skill = await db.getById(skillId);
    if (!skill) return [];
    const repoPath = await ensureLocalRepoPath(db, skillId);
    if (repoPath) {
      return SkillInstaller.listLocalRepoFilesByPath(repoPath);
    }
    return SkillInstaller.listLocalRepoFiles(skill.name);
  });

  ipcMain.handle(IPC_CHANNELS.SKILL_LIST_LOCAL_FILES_BY_PATH, async (_, localPath: string) => {
    if (typeof localPath !== 'string' || localPath.trim() === '') {
      return [];
    }
    return SkillInstaller.listLocalRepoFilesByPath(localPath);
  });

  ipcMain.handle(
    IPC_CHANNELS.SKILL_READ_LOCAL_FILE,
    async (_, skillId: string, relativePath: string) => {
      if (typeof skillId !== 'string' || skillId.trim() === '') {
        return null;
      }
      if (typeof relativePath !== 'string' || relativePath.trim() === '') {
        return null;
      }
      const skill = await db.getById(skillId);
      if (!skill) return null;
      const repoPath = await ensureLocalRepoPath(db, skillId);
      if (repoPath) {
        return SkillInstaller.readLocalRepoFileByPath(repoPath, relativePath);
      }
      return SkillInstaller.readLocalRepoFile(skill.name, relativePath);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SKILL_READ_LOCAL_FILE_BY_PATH,
    async (_, localPath: string, relativePath: string) => {
      if (typeof localPath !== 'string' || localPath.trim() === '') {
        return null;
      }
      if (typeof relativePath !== 'string' || relativePath.trim() === '') {
        return null;
      }
      return SkillInstaller.readLocalRepoFileByPath(localPath, relativePath);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SKILL_READ_LOCAL_FILE_BUFFER,
    async (_, skillId: string, relativePath: string) => {
      if (typeof skillId !== 'string' || skillId.trim() === '') {
        return null;
      }
      if (typeof relativePath !== 'string' || relativePath.trim() === '') {
        return null;
      }
      const skill = await db.getById(skillId);
      if (!skill) return null;
      const repoPath = await ensureLocalRepoPath(db, skillId);
      if (!repoPath) {
        return null;
      }
      const buffer = await SkillInstaller.readLocalRepoFileBufferByPath(repoPath, relativePath);
      return buffer ? Buffer.from(buffer).toString('base64') : null;
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SKILL_READ_LOCAL_FILE_BUFFER_BY_PATH,
    async (_, localPath: string, relativePath: string) => {
      if (typeof localPath !== 'string' || localPath.trim() === '') {
        return null;
      }
      if (typeof relativePath !== 'string' || relativePath.trim() === '') {
        return null;
      }
      const buffer = await SkillInstaller.readLocalRepoFileBufferByPath(localPath, relativePath);
      return buffer ? Buffer.from(buffer).toString('base64') : null;
    },
  );

  ipcMain.handle(IPC_CHANNELS.SKILL_READ_LOCAL_FILES, async (_, skillId: string) => {
    if (typeof skillId !== 'string' || skillId.trim() === '') {
      return [];
    }
    const skill = await db.getById(skillId);
    if (!skill) return [];
    const repoPath = await ensureLocalRepoPath(db, skillId);
    if (repoPath) {
      return SkillInstaller.readLocalRepoFilesByPath(repoPath);
    }
    return SkillInstaller.readLocalRepoFiles(skill.name);
  });

  ipcMain.handle(
    IPC_CHANNELS.SKILL_RENAME_LOCAL_PATH,
    async (_, skillId: string, oldRelativePath: string, newRelativePath: string) => {
      if (typeof skillId !== 'string' || skillId.trim() === '') {
        throw new Error('skill:renameLocalPath requires a non-empty skillId');
      }
      if (typeof oldRelativePath !== 'string' || oldRelativePath.trim().length === 0) {
        throw new Error('skill:renameLocalPath requires a non-empty oldRelativePath');
      }
      if (typeof newRelativePath !== 'string' || newRelativePath.trim().length === 0) {
        throw new Error('skill:renameLocalPath requires a non-empty newRelativePath');
      }
      const repoPath = await resolveManagedRepoPath({ db }, skillId);
      const result = await SkillInstaller.renameLocalRepoPathByPath(
        repoPath,
        oldRelativePath,
        newRelativePath,
      );
      if (
        oldRelativePath.toLowerCase() === 'skill.md' ||
        newRelativePath.toLowerCase() === 'skill.md'
      ) {
        await syncSkillContentFromRepo({ db }, skillId, repoPath);
      }
      return result;
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SKILL_RENAME_LOCAL_PATH_BY_PATH,
    async (_, localPath: string, oldRelativePath: string, newRelativePath: string) => {
      if (typeof localPath !== 'string' || localPath.trim() === '') {
        throw new Error('skill:renameLocalPathByPath requires a non-empty localPath');
      }
      if (typeof oldRelativePath !== 'string' || oldRelativePath.trim().length === 0) {
        throw new Error('skill:renameLocalPathByPath requires a non-empty oldRelativePath');
      }
      if (typeof newRelativePath !== 'string' || newRelativePath.trim().length === 0) {
        throw new Error('skill:renameLocalPathByPath requires a non-empty newRelativePath');
      }
      return SkillInstaller.renameLocalRepoPathByPath(localPath, oldRelativePath, newRelativePath);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SKILL_WRITE_LOCAL_FILE,
    async (_, skillId: string, relativePath: string, content: string) => {
      if (typeof skillId !== 'string' || skillId.trim() === '') {
        throw new Error('skill:writeLocalFile requires a non-empty skillId');
      }
      const repoPath = await resolveManagedRepoPath({ db }, skillId);
      const result = await SkillInstaller.writeLocalRepoFileByPath(repoPath, relativePath, content);
      if (relativePath.toLowerCase() === 'skill.md') {
        await db.update(skillId, {
          content,
          instructions: content,
        });
      }
      return result;
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SKILL_WRITE_LOCAL_FILE_BY_PATH,
    async (_, localPath: string, relativePath: string, content: string) => {
      if (typeof localPath !== 'string' || localPath.trim() === '') {
        throw new Error('skill:writeLocalFileByPath requires a non-empty localPath');
      }
      if (typeof relativePath !== 'string' || relativePath.trim() === '') {
        throw new Error('skill:writeLocalFileByPath requires a non-empty relativePath');
      }
      if (typeof content !== 'string') {
        throw new Error('skill:writeLocalFileByPath requires string content');
      }
      return SkillInstaller.writeLocalRepoFileByPath(localPath, relativePath, content);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SKILL_DELETE_LOCAL_FILE,
    async (_, skillId: string, relativePath: string) => {
      if (typeof skillId !== 'string' || skillId.trim() === '') {
        throw new Error('skill:deleteLocalFile requires a non-empty skillId');
      }
      const repoPath = await resolveManagedRepoPath({ db }, skillId);
      const result = await SkillInstaller.deleteLocalRepoFileByPath(repoPath, relativePath);
      if (relativePath.toLowerCase() === 'skill.md') {
        await syncSkillContentFromRepo({ db }, skillId, repoPath);
      }
      return result;
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SKILL_DELETE_LOCAL_FILE_BY_PATH,
    async (_, localPath: string, relativePath: string) => {
      if (typeof localPath !== 'string' || localPath.trim() === '') {
        throw new Error('skill:deleteLocalFileByPath requires a non-empty localPath');
      }
      if (typeof relativePath !== 'string' || relativePath.trim() === '') {
        throw new Error('skill:deleteLocalFileByPath requires a non-empty relativePath');
      }
      return SkillInstaller.deleteLocalRepoFileByPath(localPath, relativePath);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATE_LOCAL_DIR,
    async (_, skillId: string, relativePath: string) => {
      if (typeof skillId !== 'string' || skillId.trim() === '') {
        throw new Error('skill:createLocalDir requires a non-empty skillId');
      }
      const repoPath = await resolveManagedRepoPath({ db }, skillId);
      return SkillInstaller.createLocalRepoDirByPath(repoPath, relativePath);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATE_LOCAL_DIR_BY_PATH,
    async (_, localPath: string, relativePath: string) => {
      if (typeof localPath !== 'string' || localPath.trim() === '') {
        throw new Error('skill:createLocalDirByPath requires a non-empty localPath');
      }
      if (typeof relativePath !== 'string' || relativePath.trim() === '') {
        throw new Error('skill:createLocalDirByPath requires a non-empty relativePath');
      }
      return SkillInstaller.createLocalRepoDirByPath(localPath, relativePath);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SKILL_IMPORT_LOCAL_FILES,
    async (_, skillId: string, parentRelativePath?: string | null) => {
      if (typeof skillId !== 'string' || skillId.trim() === '') {
        throw new Error('skill:importLocalFiles requires a non-empty skillId');
      }
      const pickedPaths = await pickSkillImportSourcePaths();
      if (pickedPaths.length === 0) {
        return { copiedPaths: [], skippedCount: 0 };
      }

      const repoPath = await resolveManagedRepoPath({ db }, skillId);

      const importResult = await SkillInstaller.copyExternalFilesToLocalRepoByPath(
        repoPath,
        parentRelativePath ?? null,
        consumePickedSkillImportPaths(pickedPaths),
      );

      if (
        importResult.copiedPaths.some((relativePath) => relativePath.toLowerCase() === 'skill.md')
      ) {
        await syncSkillContentFromRepo({ db }, skillId, repoPath);
      }

      return importResult;
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SKILL_IMPORT_LOCAL_FILES_BY_PATH,
    async (_, localPath: string, parentRelativePath?: string | null) => {
      if (typeof localPath !== 'string' || localPath.trim() === '') {
        throw new Error('skill:importLocalFilesByPath requires a non-empty localPath');
      }
      const pickedPaths = await pickSkillImportSourcePaths();
      if (pickedPaths.length === 0) {
        return { copiedPaths: [], skippedCount: 0 };
      }

      return SkillInstaller.copyExternalFilesToLocalRepoByPath(
        localPath,
        parentRelativePath ?? null,
        consumePickedSkillImportPaths(pickedPaths),
      );
    },
  );

  ipcMain.handle(IPC_CHANNELS.SKILL_GET_REPO_PATH, async (_, skillId: string) => {
    if (typeof skillId !== 'string' || skillId.trim() === '') {
      return null;
    }
    return ensureLocalRepoPath(db, skillId);
  });

  ipcMain.handle(IPC_CHANNELS.SKILL_SYNC_FROM_REPO, async (_, skillId: string) => {
    if (typeof skillId !== 'string' || skillId.trim() === '') {
      return null;
    }
    return syncSkillFromRepo({ db }, skillId);
  });

  ipcMain.handle(
    IPC_CHANNELS.SKILL_ENSURE_SESSION_WORKSPACE,
    async (_, skillId: string, sessionId: string) => {
      if (typeof skillId !== 'string' || skillId.trim() === '') {
        throw new Error('skill:ensureSessionWorkspace requires skillId');
      }
      if (typeof sessionId !== 'string' || sessionId.trim() === '') {
        throw new Error('skill:ensureSessionWorkspace requires sessionId');
      }
      const repoPath = await resolveSkillRepoPath({ db }, skillId);
      const workspaceDir = await ensureSkillSessionWorkspace(repoPath, sessionId);
      return { workspaceDir };
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SKILL_WRITE_SESSION_FILE,
    async (_, sessionId: string, relativePath: string, content: string) => {
      if (typeof sessionId !== 'string' || sessionId.trim() === '') {
        throw new Error('skill:writeSessionFile requires sessionId');
      }
      if (typeof relativePath !== 'string' || relativePath.trim() === '') {
        throw new Error('skill:writeSessionFile requires relativePath');
      }
      if (typeof content !== 'string') {
        throw new Error('skill:writeSessionFile requires string content');
      }
      await writeSessionWorkspaceFile(sessionId, relativePath, content);
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.SKILL_EXECUTE_WORKSPACE,
    async (
      _,
      skillId: string,
      userInput: string,
      options?: { commands?: string[]; outputDir?: string; sessionId?: string },
    ) => {
      if (typeof skillId !== 'string' || skillId.trim() === '') {
        throw new Error('skill:executeWorkspace requires skillId');
      }

      const sessionId = typeof options?.sessionId === 'string' ? options.sessionId.trim() : '';
      const repoPath = await resolveSkillRepoPath({ db }, skillId);

      if (sessionId) {
        const workspaceDir = await ensureSkillSessionWorkspace(repoPath, sessionId);
        return executeSkillWorkspace({
          repoPath: workspaceDir,
          sourceRepoPath: repoPath,
          userInput: typeof userInput === 'string' ? userInput : '',
          skillId,
          commands: Array.isArray(options?.commands) ? options.commands : undefined,
          sessionMode: true,
        });
      }

      return executeSkillWorkspace({
        repoPath,
        userInput: typeof userInput === 'string' ? userInput : '',
        skillId,
        commands: Array.isArray(options?.commands) ? options.commands : undefined,
        outputDir: typeof options?.outputDir === 'string' ? options.outputDir : undefined,
      });
    },
  );
}
