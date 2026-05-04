import { Column, Entity, PrimaryColumn } from 'typeorm';

/** settings 表（键值配置） */
@Entity('settings')
export class SettingEntity {
  @PrimaryColumn('text')
  key: string;

  @Column('text')
  value: string;
}
