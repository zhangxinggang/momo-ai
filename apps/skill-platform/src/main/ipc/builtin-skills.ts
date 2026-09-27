import { IPC_CHANNELS } from '@/types/constants/ipc-channels';
import { ipcMain } from 'electron';
import { loadBuiltinSkillCatalog } from '../services/builtin-skills';

/** 独立于数据库，仅返回固定清单中的内置资源。 */
export function registerBuiltinSkillsIPC(): void {
  ipcMain.handle(IPC_CHANNELS.SKILL_GET_BUILTIN_SKILLS, () => loadBuiltinSkillCatalog());
}
