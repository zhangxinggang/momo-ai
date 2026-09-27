import { setBuiltinSkillCatalog } from '@/shared/builtin-skills';
import { getSkillIpc } from '../ipc';

/** 桌面端读取安装目录的可编辑规则；浏览器端使用同源构建默认值。 */
export async function initializeBuiltinSkills(): Promise<void> {
  const api = getSkillIpc();
  if (api?.getBuiltinSkills) setBuiltinSkillCatalog(await api.getBuiltinSkills());
}
