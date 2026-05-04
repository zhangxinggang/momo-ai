import { IPC_CHANNELS } from '@/types/constants';
import type { DCreateSkill, DUpdateSkill } from '@/types/modules';
import { ipcMain } from 'electron';
import {
  SkillInstaller,
  hasMetadataChanges,
  isInternalSkillRepoEntry,
  syncFrontmatterToRepo,
} from '../../services/skill';
import type { ISkillIPCContext } from './shared';
import { ensureLocalRepoPath, readCurrentFilesSnapshot } from './shared';

export function registerSkillCrudHandlers({ db }: ISkillIPCContext): void {
  ipcMain.handle(
    IPC_CHANNELS.SKILL_CREATE,
    async (
      _,
      data: DCreateSkill,
      options?: { skipInitialVersion?: boolean; overwriteExisting?: boolean },
    ) => {
      if (!data || !data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
        throw new Error('skill:create requires a non-empty name field');
      }

      if (
        data.source_url &&
        /^https?:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+/.test(data.source_url) &&
        !data.content &&
        !data.instructions
      ) {
        const id = await SkillInstaller.installFromGithub(data.source_url, db);
        return await db.getById(id);
      }

      // Strip overwriteExisting from IPC — only internal callers (e2e
      // seeding) should be able to silently overwrite existing skills.
      // Renderer-initiated creates must go through the normal
      // duplicate-name check in SkillDB.create().
      const safeOptions = options ? { skipInitialVersion: options.skipInitialVersion } : undefined;

      return await db.create(data, safeOptions);
    },
  );

  ipcMain.handle(IPC_CHANNELS.SKILL_GET, async (_, id: string) => {
    if (typeof id !== 'string' || id.trim().length === 0) {
      throw new Error('skill:get requires a non-empty id');
    }
    return await db.getById(id);
  });

  ipcMain.handle(IPC_CHANNELS.SKILL_GET_ALL, async () => await db.getAll());

  ipcMain.handle(IPC_CHANNELS.SKILL_UPDATE, async (_, id: string, data: DUpdateSkill) => {
    if (typeof id !== 'string' || id.trim().length === 0) {
      throw new Error('skill:update requires a non-empty id');
    }
    if (!data || typeof data !== 'object') {
      throw new Error('skill:update requires a non-null data object');
    }

    const existingSkill = await db.getById(id);
    if (!existingSkill) {
      return null;
    }

    const nextName = typeof data.name === 'string' ? data.name.trim() : undefined;
    const isRenaming = typeof nextName === 'string' && nextName !== existingSkill.name;
    const nextData: DUpdateSkill = { ...data };
    let deployedPlatforms: string[] = [];

    if (isRenaming && nextName) {
      try {
        const platformStatus = await SkillInstaller.getSkillMdInstallStatus(existingSkill.name);
        deployedPlatforms = Object.entries(platformStatus)
          .filter(([, installed]) => installed)
          .map(([platformId]) => platformId);
      } catch (error) {
        console.warn(
          `Failed to inspect deployed status before renaming "${existingSkill.name}":`,
          error,
        );
      }

      const migratedRepoPath = await SkillInstaller.renameManagedLocalRepo(
        existingSkill.name,
        nextName,
        existingSkill.local_repo_path,
      );
      if (migratedRepoPath !== existingSkill.local_repo_path) {
        nextData.local_repo_path = migratedRepoPath ?? undefined;
      }
      nextData.name = nextName;
    }

    if (data.instructions !== undefined || data.content !== undefined) {
      const filesSnapshot = await readCurrentFilesSnapshot(db, id);
      await db.createVersion(id, 'Before updating SKILL.md', filesSnapshot, existingSkill);
    }

    const updatedSkill = await db.update(id, nextData);

    // When metadata-only fields changed (no instructions/content update),
    // sync the frontmatter back to SKILL.md so that `syncSkillFromRepo`
    // does not revert the edit with stale file data.
    if (
      updatedSkill &&
      hasMetadataChanges(data) &&
      data.instructions === undefined &&
      data.content === undefined
    ) {
      try {
        const repoPath = await ensureLocalRepoPath(db, id);
        await syncFrontmatterToRepo(updatedSkill, repoPath);
      } catch (err) {
        console.warn(`Failed to sync frontmatter to SKILL.md for "${updatedSkill.name}":`, err);
      }
    }

    if (updatedSkill && isRenaming && nextName && deployedPlatforms.length > 0) {
      const nextContent =
        updatedSkill.instructions ??
        updatedSkill.content ??
        existingSkill.instructions ??
        existingSkill.content ??
        '';

      await Promise.allSettled(
        deployedPlatforms.map(async (platformId) => {
          if (nextContent.trim()) {
            await SkillInstaller.installSkillMd(nextName, nextContent, platformId);
          }
          await SkillInstaller.uninstallSkillMd(existingSkill.name, platformId);
        }),
      );
    }

    return updatedSkill;
  });

  ipcMain.handle(IPC_CHANNELS.SKILL_DELETE, async (_, id: string) => {
    if (typeof id !== 'string' || id.trim().length === 0) {
      throw new Error('skill:delete requires a non-empty id');
    }

    const skill = await db.getById(id);
    if (skill?.name) {
      // Only uninstall SKILL.md from platforms, do NOT delete the source directory.
      // Deletion from PromptHub only removes the library record, not the original files.
      try {
        const platforms = SkillInstaller.getSupportedPlatforms();
        await Promise.allSettled(
          platforms.map((platform) => SkillInstaller.uninstallSkillMd(skill.name, platform.id)),
        );
      } catch (error) {
        console.warn(`Failed to uninstall SKILL.md for skill "${skill.name}":`, error);
      }
    }

    return await db.delete(id);
  });

  ipcMain.handle(IPC_CHANNELS.SKILL_SCAN_LOCAL, async () => SkillInstaller.scanLocal(db));

  ipcMain.handle(IPC_CHANNELS.SKILL_SCAN_LOCAL_PREVIEW, async (_, customPaths?: string[]) => {
    if (customPaths !== undefined && !Array.isArray(customPaths)) {
      throw new Error('skill:scanLocalPreview expects customPaths to be an array');
    }
    return SkillInstaller.scanLocalPreview(customPaths, db);
  });

  ipcMain.handle(IPC_CHANNELS.SKILL_EXPORT, async (_, id: string, format) => {
    if (typeof id !== 'string' || id.trim().length === 0) {
      throw new Error('skill:export requires a non-empty id');
    }
    if (format !== 'skillmd' && format !== 'json') {
      throw new Error("skill:export format must be 'skillmd' or 'json'");
    }
    const skill = await db.getById(id);
    if (!skill) throw new Error('ISkill not found');
    return format === 'skillmd'
      ? SkillInstaller.exportAsSkillMd(skill)
      : SkillInstaller.exportAsJson(skill);
  });

  ipcMain.handle(IPC_CHANNELS.SKILL_EXPORT_ZIP, async (_, id: string) => {
    if (typeof id !== 'string' || id.trim().length === 0) {
      throw new Error('skill:exportZip requires a non-empty id');
    }

    const skill = await db.getById(id);
    if (!skill) {
      throw new Error('ISkill not found');
    }

    const repoPath = await ensureLocalRepoPath(db, id);
    if (!repoPath) {
      throw new Error(`Unable to resolve local repo for skill: ${id}`);
    }

    const fileEntries = await SkillInstaller.readLocalRepoFileBuffersByPath(repoPath);

    if (fileEntries.length === 0) {
      throw new Error(`ISkill repo is empty: ${skill.name}`);
    }

    const { zipSync } = await import('fflate');
    const zipFiles: Record<string, Uint8Array> = {};

    for (const file of fileEntries) {
      if (isInternalSkillRepoEntry(file.path)) {
        continue;
      }
      zipFiles[file.path.replace(/\\/g, '/')] = file.data;
    }

    const zipped = zipSync(zipFiles, { level: 1 });

    return {
      fileName: `${skill.name}.zip`,
      base64: Buffer.from(zipped).toString('base64'),
    };
  });

  ipcMain.handle(IPC_CHANNELS.SKILL_IMPORT, async (_, jsonContent: string) => {
    if (typeof jsonContent !== 'string' || jsonContent.trim().length === 0) {
      throw new Error('skill:import requires a non-empty JSON content string');
    }
    const id = await SkillInstaller.importFromJson(jsonContent, db);
    return await db.getById(id);
  });
}
