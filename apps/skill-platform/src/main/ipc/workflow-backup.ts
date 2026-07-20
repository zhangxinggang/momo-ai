import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import type {
  DUpdatePrompt,
  IPrompt,
  ISkill,
  IWorkflowBackupResourceDecision,
  IWorkflowExportResult,
  IWorkflowImportCommitResult,
  IWorkflowImportPreviewResult,
} from '@/types/modules';
import { getMainWindow } from '@momo/electron';
import { dialog, ipcMain } from 'electron';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';

import type { PromptDB, SkillDB, WorkflowDB } from '../database';
import { syncPromptWorkspaceFromDatabase } from '../services/prompt';
import type { FolderDB } from '../database';
import {
  SkillInstaller,
  isInternalSkillRepoEntry,
  isSkillExportExcludedEntry,
} from '../services/skill';
import {
  buildImportPreviewFromPayload,
  buildWorkflowTemplatePayload,
  commitWorkflowTemplateImport,
  createImportSession,
  decodeWorkflowTemplateZip,
  deleteImportSession,
  encodeWorkflowTemplateZip,
  getImportSession,
  sanitizeExportFileBaseName,
} from '../services/workflow/backup';
import { ensureLocalRepoPath } from './skill/shared';

async function readSkillFilesForExport(skill: ISkill): Promise<Record<string, Uint8Array> | null> {
  try {
    const repoPath =
      (skill.local_repo_path &&
        (await SkillInstaller.isManagedRepoPath(skill.local_repo_path)) &&
        skill.local_repo_path) ||
      (await ensureLocalRepoPath(
        // ensureLocalRepoPath 需要 db；导出时若无路径则尝试按 name 读
        { getById: async () => skill, update: async () => skill } as unknown as SkillDB,
        skill.id,
      ));

    const absolute =
      typeof repoPath === 'string'
        ? repoPath
        : skill.local_repo_path && (await fsp.stat(skill.local_repo_path).then(
            (s) => (s.isDirectory() ? skill.local_repo_path! : null),
            () => null,
          ));

    if (!absolute) {
      return {};
    }

    const entries = await SkillInstaller.readLocalRepoFileBuffersByPath(absolute);
    const files: Record<string, Uint8Array> = {};
    for (const file of entries) {
      if (isInternalSkillRepoEntry(file.path) || isSkillExportExcludedEntry(file.path)) {
        continue;
      }
      files[file.path.replace(/\\/g, '/')] = file.data;
    }
    return files;
  } catch {
    return null;
  }
}

async function writeSkillRepoFiles(
  skillName: string,
  files: Record<string, Uint8Array>,
  contentFallback?: string,
): Promise<string> {
  if (Object.keys(files).length === 0) {
    const content = contentFallback?.trim() ? contentFallback : '# Skill\n';
    return SkillInstaller.saveContentToLocalRepo(skillName, content);
  }

  const destDir = SkillInstaller.getLocalRepoPath(skillName);
  await fsp.mkdir(destDir, { recursive: true });
  for (const [relativePath, data] of Object.entries(files)) {
    const normalized = relativePath.replace(/\\/g, '/').replace(/^\/+/, '');
    if (!normalized || normalized.includes('..')) {
      continue;
    }
    const fullPath = path.join(destDir, ...normalized.split('/'));
    await fsp.mkdir(path.dirname(fullPath), { recursive: true });
    await fsp.writeFile(fullPath, Buffer.from(data));
  }
  return destDir;
}

function promptToUpdate(prompt: IPrompt): DUpdatePrompt {
  return {
    title: prompt.title,
    systemPrompt: prompt.systemPrompt ?? undefined,
    systemPromptEn: prompt.systemPromptEn ?? undefined,
    userPrompt: prompt.userPrompt,
    userPromptEn: prompt.userPromptEn ?? undefined,
    variables: prompt.variables,
    tags: prompt.tags,
    folderId: prompt.folderId ?? undefined,
    isFavorite: prompt.isFavorite,
    isPinned: prompt.isPinned,
    usageCount: prompt.usageCount,
    source: prompt.source ?? undefined,
    lastAiResponse: prompt.lastAiResponse ?? undefined,
  };
}

/** 注册工作流模板导入导出 IPC */
export function registerWorkflowBackupIPC(
  workflowDb: WorkflowDB,
  promptDb: PromptDB,
  folderDb: FolderDB,
  skillDb: SkillDB,
): void {
  ipcMain.handle(
    IPC_CHANNELS.WORKFLOW_EXPORT_TEMPLATE,
    async (_, workflowId: string): Promise<IWorkflowExportResult> => {
      if (typeof workflowId !== 'string' || workflowId.trim().length === 0) {
        throw new Error('workflow:exportTemplate 需要非空 workflowId');
      }

      const { payload, skillFileWarnings } = await buildWorkflowTemplatePayload({
        workflowId,
        getWorkflow: (id) => workflowDb.getById(id),
        getPrompt: (id) => promptDb.getById(id),
        getSkill: (id) => skillDb.getById(id),
        readSkillFiles: async (skill) => {
          try {
            let repoPath: string | null = null;
            if (skill.local_repo_path) {
              try {
                const st = await fsp.stat(skill.local_repo_path);
                if (st.isDirectory()) {
                  repoPath = skill.local_repo_path;
                }
              } catch {
                repoPath = null;
              }
            }
            if (!repoPath) {
              repoPath = await ensureLocalRepoPath(skillDb, skill.id);
            }
            if (!repoPath) {
              return {};
            }
            const entries = await SkillInstaller.readLocalRepoFileBuffersByPath(repoPath);
            const files: Record<string, Uint8Array> = {};
            for (const file of entries) {
              if (isInternalSkillRepoEntry(file.path) || isSkillExportExcludedEntry(file.path)) {
                continue;
              }
              files[file.path.replace(/\\/g, '/')] = file.data;
            }
            return files;
          } catch {
            return null;
          }
        },
      });

      const defaultName = `${sanitizeExportFileBaseName(payload.workflow.name)}-workflow.zip`;
      const dialogResult = await dialog.showSaveDialog(getMainWindow()!, {
        title: '导出工作流',
        defaultPath: defaultName,
        filters: [{ name: 'Zip', extensions: ['zip'] }],
      });

      if (dialogResult.canceled || !dialogResult.filePath) {
        return { canceled: true };
      }

      const bytes = encodeWorkflowTemplateZip(payload);
      fs.writeFileSync(dialogResult.filePath, Buffer.from(bytes));

      return {
        canceled: false,
        path: dialogResult.filePath,
        promptCount: payload.prompts.length,
        skillCount: payload.skills.length,
        missingCount: payload.manifest.missingResourceIds.length,
        strippedLocalPathCount: payload.manifest.strippedLocalPathCount,
        skillFileWarnings,
      };
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKFLOW_PREVIEW_IMPORT,
    async (): Promise<IWorkflowImportPreviewResult> => {
      const dialogResult = await dialog.showOpenDialog(getMainWindow()!, {
        title: '导入工作流',
        properties: ['openFile'],
        filters: [{ name: 'Zip', extensions: ['zip'] }],
      });

      if (dialogResult.canceled || dialogResult.filePaths.length === 0) {
        return { canceled: true };
      }

      try {
        const bytes = new Uint8Array(fs.readFileSync(dialogResult.filePaths[0]));
        const payload = decodeWorkflowTemplateZip(bytes);
        const localPrompts = await promptDb.getAll();
        const localSkills = await skillDb.getAll();
        const preview = buildImportPreviewFromPayload(payload, localPrompts, localSkills);
        const sessionId = createImportSession(payload);
        return {
          canceled: false,
          sessionId,
          ...preview,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { canceled: false, error: message };
      }
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKFLOW_COMMIT_IMPORT,
    async (
      _,
      sessionId: string,
      decisions: IWorkflowBackupResourceDecision[],
    ): Promise<IWorkflowImportCommitResult> => {
      if (typeof sessionId !== 'string' || sessionId.trim().length === 0) {
        return { canceled: false, error: '无效的导入会话' };
      }
      const session = getImportSession(sessionId);
      if (!session) {
        return { canceled: false, error: '导入会话不存在或已过期' };
      }

      const safeDecisions = Array.isArray(decisions) ? decisions : [];

      const result = await commitWorkflowTemplateImport({
        payload: session.payload,
        decisions: safeDecisions,
        getLocalPrompts: () => promptDb.getAll(),
        getLocalSkills: () => skillDb.getAll(),
        listWorkflowNames: async () => {
          const all = await workflowDb.getAll();
          return all.map((item) => item.name);
        },
        createPrompt: async (prompt) => {
          await promptDb.insertPromptDirect(prompt);
        },
        updatePrompt: async (id, prompt) => {
          await promptDb.update(id, promptToUpdate(prompt));
        },
        createSkill: async (skill, files) => {
          const repoPath = await writeSkillRepoFiles(
            skill.name,
            files,
            skill.instructions || skill.content || undefined,
          );
          const toInsert: ISkill = {
            ...skill,
            local_repo_path: repoPath,
            created_at: skill.created_at ?? Date.now(),
            updated_at: Date.now(),
          };
          await skillDb.insertSkillDirect(toInsert);
          return skill.id;
        },
        updateSkill: async (id, skill, files) => {
          const existing = await skillDb.getById(id);
          const name = skill.name || existing?.name || id;
          const repoPath = await writeSkillRepoFiles(
            name,
            files,
            skill.instructions || skill.content || existing?.content || undefined,
          );
          await skillDb.update(id, {
            name: skill.name,
            description: skill.description,
            content: skill.content ?? skill.instructions,
            instructions: skill.instructions ?? skill.content,
            protocol_type: skill.protocol_type,
            version: skill.version,
            author: skill.author,
            tags: skill.tags,
            local_repo_path: repoPath,
          });
        },
        deletePrompt: async (id) => {
          await promptDb.delete(id);
        },
        deleteSkill: async (id) => {
          await skillDb.delete(id);
        },
        createWorkflow: async (data) => {
          const created = await workflowDb.create({
            name: data.name,
            graphJson: data.graphJson,
            folderId: null,
          });
          return { id: created.id, name: created.name };
        },
        deleteWorkflow: async (id) => {
          await workflowDb.delete(id);
        },
      });

      deleteImportSession(sessionId);

      if (!result.error) {
        await syncPromptWorkspaceFromDatabase(promptDb, folderDb);
      }

      return result;
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKFLOW_CANCEL_IMPORT,
    async (_, sessionId: string): Promise<{ canceled: true }> => {
      if (typeof sessionId === 'string' && sessionId.trim()) {
        deleteImportSession(sessionId);
      }
      return { canceled: true };
    },
  );
}
