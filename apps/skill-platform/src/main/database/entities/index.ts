import { FolderEntity } from './folder';
import { PromptEntity } from './prompt';
import { PromptVersionEntity } from './prompt-version';
import { RefreshTokenEntity } from './refresh-token';
import { SchemaMigrationEntity } from './schema-migration';
import { SettingEntity } from './setting';
import { SkillEntity } from './skill';
import { SkillVersionEntity } from './skill-version';
import { UserEntity } from './user';
import { UserSettingEntity } from './user-setting';

/** 所有业务表对应的 TypeORM 实体（不含 FTS 虚拟表 prompts_fts） */
export const ALL_ENTITIES = [
  PromptEntity,
  PromptVersionEntity,
  FolderEntity,
  SettingEntity,
  SkillEntity,
  SkillVersionEntity,
  UserEntity,
  RefreshTokenEntity,
  UserSettingEntity,
  SchemaMigrationEntity,
] as const;

export { FolderEntity } from './folder';
export { PromptEntity } from './prompt';
export { PromptVersionEntity } from './prompt-version';
export { RefreshTokenEntity } from './refresh-token';
export { SchemaMigrationEntity } from './schema-migration';
export { SettingEntity } from './setting';
export { SkillEntity } from './skill';
export { SkillVersionEntity } from './skill-version';
export { UserEntity } from './user';
export { UserSettingEntity } from './user-setting';
