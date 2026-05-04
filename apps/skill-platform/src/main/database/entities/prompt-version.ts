import { Column, Entity, PrimaryColumn } from 'typeorm';

/** prompt_versions 表 */
@Entity('prompt_versions')
export class PromptVersionEntity {
  @PrimaryColumn('text')
  id: string;

  @Column('text', { name: 'prompt_id' })
  promptId: string;

  @Column('integer')
  version: number;

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
  note: string | null;

  @Column('text', { name: 'ai_response', nullable: true })
  aiResponse: string | null;

  @Column('integer', { name: 'created_at' })
  createdAt: number;
}
