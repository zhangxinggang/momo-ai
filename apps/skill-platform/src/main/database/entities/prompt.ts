import { Column, Entity, PrimaryColumn } from 'typeorm';

/** prompts 表 */
@Entity('prompts')
export class PromptEntity {
  @PrimaryColumn('text')
  id: string;

  @Column('text', { name: 'owner_user_id', nullable: true })
  ownerUserId: string | null;

  @Column('text', { name: 'visibility', default: 'private' })
  visibility: string;

  @Column('text')
  title: string;

  @Column('text', { name: 'system_prompt', nullable: true })
  systemPrompt: string | null;

  @Column('text', { name: 'system_prompt_en', nullable: true })
  systemPromptEn: string | null;

  @Column('text', { name: 'user_prompt' })
  userPrompt: string;

  @Column('text', { name: 'user_prompt_en', nullable: true })
  userPromptEn: string | null;

  @Column('text', { nullable: true })
  variables: string | null;

  @Column('text', { nullable: true })
  tags: string | null;

  @Column('text', { name: 'folder_id', nullable: true })
  folderId: string | null;

  @Column('integer', { name: 'is_favorite', default: 0 })
  isFavorite: number;

  @Column('integer', { name: 'is_pinned', default: 0 })
  isPinned: number;

  @Column('integer', { name: 'current_version', default: 0 })
  currentVersion: number;

  @Column('integer', { name: 'usage_count', default: 0 })
  usageCount: number;

  @Column('text', { nullable: true })
  source: string | null;

  @Column('text', { name: 'last_ai_response', nullable: true })
  lastAiResponse: string | null;

  @Column('integer', { name: 'created_at' })
  createdAt: number;

  @Column('integer', { name: 'updated_at' })
  updatedAt: number;
}
