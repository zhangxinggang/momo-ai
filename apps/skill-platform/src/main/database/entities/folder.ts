import { Column, Entity, PrimaryColumn } from 'typeorm';

/** folders 表 */
@Entity('folders')
export class FolderEntity {
  @PrimaryColumn('text')
  id: string;

  @Column('text', { name: 'owner_user_id', nullable: true })
  ownerUserId: string | null;

  @Column('text', { name: 'visibility', default: 'private' })
  visibility: string;

  @Column('text')
  name: string;

  @Column('text', { nullable: true })
  icon: string | null;

  @Column('text', { name: 'parent_id', nullable: true })
  parentId: string | null;

  @Column('integer', { name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column('integer', { name: 'is_private', default: 0 })
  isPrivate: number;

  @Column('integer', { name: 'created_at' })
  createdAt: number;

  @Column('integer', { name: 'updated_at', nullable: true })
  updatedAt: number | null;
}
