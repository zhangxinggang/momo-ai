import type { Database } from 'better-sqlite3';
import { SkillDB } from '../database';
import { registerAllIPC } from '../ipc';
import { createMenu } from '../menu';
import { registerLocalMediaProtocols } from '../protocol/local-media';
import { startSilentExternalSkillImportSchedule } from '../services';
import { noteWorkspaceService } from '../services/note';
import { ensureBundledSkills } from '../services/skill/bundled-skills';

export interface IAppStartupResult {
  disposeSilentExternalSkillImport?: () => void;
}

/** 数据库就绪后执行应用启动引导（工作区同步、IPC 注册、菜单等） */
export async function runAppStartup(db: Database): Promise<IAppStartupResult> {
  registerLocalMediaProtocols();

  try {
    noteWorkspaceService.bootstrapCursorRulesFromProject();
  } catch (error) {
    console.error('[startup] bootstrapCursorRulesFromProject failed:', error);
  }

  registerAllIPC(db);

  try {
    await ensureBundledSkills(new SkillDB());
  } catch (error) {
    console.error('[startup] bundled skill installation failed:', error);
  }

  const disposeSilentExternalSkillImport = startSilentExternalSkillImportSchedule(new SkillDB());
  createMenu();

  return { disposeSilentExternalSkillImport };
}
