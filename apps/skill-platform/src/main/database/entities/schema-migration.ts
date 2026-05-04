import { Column, Entity, PrimaryColumn } from 'typeorm';

/** schema_migrations 表（应用内迁移记录） */
@Entity('schema_migrations')
export class SchemaMigrationEntity {
  @PrimaryColumn('text')
  name: string;

  @Column('integer', { name: 'applied_at' })
  appliedAt: number;
}
