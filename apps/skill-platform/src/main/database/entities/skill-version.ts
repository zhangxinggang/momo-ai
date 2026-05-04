import { Column, Entity, PrimaryColumn } from 'typeorm';

/** skill_versions 表 */
@Entity('skill_versions')
export class SkillVersionEntity {
  @PrimaryColumn('text')
  id: string;

  @Column('text', { name: 'skill_id' })
  skillId: string;

  @Column('integer')
  version: number;

  @Column('text', { nullable: true })
  content: string | null;

  @Column('text', { name: 'files_snapshot', nullable: true })
  filesSnapshot: string | null;

  @Column('text', { nullable: true })
  note: string | null;

  @Column('integer', { name: 'created_at' })
  createdAt: number;
}
