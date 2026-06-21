import type { SkillDB } from '../../database';
import { registerSkillCrudHandlers } from './crud-handlers';
import { registerSkillLocalRepoHandlers } from './local-repo-handlers';
import { registerSkillPlatformHandlers } from './platform-handlers';
import type { ISkillIPCContext } from './shared';

/**
 * 注册 Skill 相关 IPC（按域拆分 handler，保持 channel 稳定）
 */
export function registerSkillIPC(db: SkillDB): void {
  const context: ISkillIPCContext = { db };

  registerSkillCrudHandlers(context);
  registerSkillPlatformHandlers(context);
  registerSkillLocalRepoHandlers(context);
}
