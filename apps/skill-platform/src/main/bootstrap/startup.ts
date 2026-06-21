import type { Database } from 'better-sqlite3';
import { FolderDB, PromptDB, SkillDB } from '../database';
import { registerAllIPC } from '../ipc';
import { createMenu } from '../menu';
import { registerLocalMediaProtocols } from '../protocol/local-media';
import { bootstrapPromptWorkspace, startSilentExternalSkillImportSchedule } from '../services';
import { noteWorkspaceService } from '../services/note';

export interface IAppStartupResult {
  disposeSilentExternalSkillImport?: () => void;
}

/** 数据库就绪后执行应用启动引导（工作区同步、IPC 注册、菜单等） */
export async function runAppStartup(db: Database): Promise<IAppStartupResult> {
  registerLocalMediaProtocols();

  try {
    const bootstrapResult = await bootstrapPromptWorkspace(new PromptDB(), new FolderDB());
    if (bootstrapResult.quadrant === 'empty') {
      console.warn('[startup] Both database and workspace are empty.');
    }
  } catch (error) {
    console.error(
      '[startup] bootstrapPromptWorkspace failed, continuing without workspace sync:',
      error,
    );
  }

  try {
    noteWorkspaceService.bootstrapCursorRulesFromProject();
  } catch (error) {
    console.error('[startup] bootstrapCursorRulesFromProject failed:', error);
  }

  registerAllIPC(db);

  const disposeSilentExternalSkillImport = startSilentExternalSkillImportSchedule(new SkillDB());
  createMenu();

  return { disposeSilentExternalSkillImport };
}
