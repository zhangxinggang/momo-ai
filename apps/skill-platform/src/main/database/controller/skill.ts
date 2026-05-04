import type {
  DCreateSkill,
  DUpdateSkill,
  ISkill,
  ISkillFileSnapshot,
  ISkillVersion,
} from '@/types/modules';

import { SkillService } from '../service/skill';

/** ISkill 对外接口 */
export class SkillController {
  private readonly service = new SkillService();

  getByName(name: string): Promise<ISkill | null> {
    return this.service.getByName(name);
  }

  create(
    data: DCreateSkill,
    options?: { skipInitialVersion?: boolean; overwriteExisting?: boolean },
  ): Promise<ISkill> {
    return this.service.create(data, options);
  }

  getById(id: string): Promise<ISkill | null> {
    return this.service.getById(id);
  }

  getAll(): Promise<ISkill[]> {
    return this.service.getAll();
  }

  update(id: string, data: DUpdateSkill): Promise<ISkill | null> {
    return this.service.update(id, data);
  }

  createVersion(
    skillId: string,
    note?: string,
    filesSnapshot?: ISkillFileSnapshot[],
    existingSkill?: ISkill,
  ): Promise<ISkillVersion | null> {
    return this.service.createVersion(skillId, note, filesSnapshot, existingSkill);
  }

  getVersions(skillId: string): Promise<ISkillVersion[]> {
    return this.service.getVersions(skillId);
  }

  getVersion(skillId: string, version: number): Promise<ISkillVersion | null> {
    return this.service.getVersion(skillId, version);
  }

  deleteVersion(skillId: string, versionId: string): Promise<boolean> {
    return this.service.deleteVersion(skillId, versionId);
  }

  rollbackVersion(skillId: string, version: number): Promise<ISkill | null> {
    return this.service.rollbackVersion(skillId, version);
  }

  delete(id: string): Promise<boolean> {
    return this.service.delete(id);
  }

  deleteAll(): Promise<void> {
    return this.service.deleteAll();
  }

  insertSkillDirect(skill: ISkill): Promise<void> {
    return this.service.insertSkillDirect(skill);
  }

  insertVersionDirect(version: ISkillVersion): Promise<void> {
    return this.service.insertVersionDirect(version);
  }
}
