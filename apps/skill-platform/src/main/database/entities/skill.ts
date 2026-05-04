import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * skills 表（含迁移追加列）
 * 与 init.ts / SkillDB 使用的列一致
 */
@Entity('skills')
export class SkillEntity {
  @PrimaryColumn('text')
  id: string;

  @Column('text', { name: 'owner_user_id', nullable: true })
  ownerUserId: string | null;

  @Column('text', { name: 'visibility', default: 'private' })
  visibility: string;

  @Column('text')
  name: string;

  @Column('text', { nullable: true })
  description: string | null;

  @Column('text', { nullable: true })
  content: string | null;

  @Column('text', { name: 'mcp_config', nullable: true })
  mcpConfig: string | null;

  @Column('text', { name: 'protocol_type', nullable: true, default: 'mcp' })
  protocolType: string | null;

  @Column('text', { nullable: true })
  version: string | null;

  @Column('text', { nullable: true })
  author: string | null;

  @Column('text', { nullable: true })
  tags: string | null;

  @Column('text', { name: 'original_tags', nullable: true })
  originalTags: string | null;

  @Column('integer', { name: 'is_favorite', default: 0 })
  isFavorite: number;

  @Column('text', { name: 'source_url', nullable: true })
  sourceUrl: string | null;

  @Column('text', { name: 'local_repo_path', nullable: true })
  localRepoPath: string | null;

  @Column('text', { name: 'icon_url', nullable: true })
  iconUrl: string | null;

  @Column('text', { name: 'icon_emoji', nullable: true })
  iconEmoji: string | null;

  @Column('text', { name: 'icon_background', nullable: true })
  iconBackground: string | null;

  @Column('text', { nullable: true, default: 'general' })
  category: string | null;

  @Column('integer', { name: 'is_builtin', default: 0 })
  isBuiltin: number;

  @Column('text', { name: 'registry_slug', nullable: true })
  registrySlug: string | null;

  @Column('text', { name: 'content_url', nullable: true })
  contentUrl: string | null;

  @Column('text', { name: 'installed_content_hash', nullable: true })
  installedContentHash: string | null;

  @Column('text', { name: 'installed_version', nullable: true })
  installedVersion: string | null;

  @Column('integer', { name: 'installed_at', nullable: true })
  installedAt: number | null;

  @Column('integer', { name: 'updated_from_store_at', nullable: true })
  updatedFromStoreAt: number | null;

  @Column('text', { nullable: true })
  prerequisites: string | null;

  @Column('text', { nullable: true })
  compatibility: string | null;

  @Column('integer', { name: 'current_version', default: 0 })
  currentVersion: number;

  @Column('integer', { name: 'version_tracking_enabled', default: 0 })
  versionTrackingEnabled: number;

  @Column('text', { name: 'safety_level', nullable: true })
  safetyLevel: string | null;

  @Column('integer', { name: 'safety_score', nullable: true })
  safetyScore: number | null;

  @Column('text', { name: 'safety_report', nullable: true })
  safetyReport: string | null;

  @Column('integer', { name: 'safety_scanned_at', nullable: true })
  safetyScannedAt: number | null;

  @Column('integer', { name: 'created_at' })
  createdAt: number;

  @Column('integer', { name: 'updated_at' })
  updatedAt: number;
}
