import { RefreshTokenEntity } from './refresh-token';
import { SchemaMigrationEntity } from './schema-migration';
import { SettingEntity } from './setting';
import { SkillEntity } from './skill';
import { SkillVersionEntity } from './skill-version';
import { UserEntity } from './user';
import { UserSettingEntity } from './user-setting';

/** 所有业务表对应的 TypeORM 实体 */
export const ALL_ENTITIES = [
  SettingEntity,
  SkillEntity,
  SkillVersionEntity,
  UserEntity,
  RefreshTokenEntity,
  UserSettingEntity,
  SchemaMigrationEntity,
] as const;

export { RefreshTokenEntity } from './refresh-token';
export { SchemaMigrationEntity } from './schema-migration';
export { SettingEntity } from './setting';
export { SkillEntity } from './skill';
export { SkillVersionEntity } from './skill-version';
export { UserEntity } from './user';
export { UserSettingEntity } from './user-setting';
