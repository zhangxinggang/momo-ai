import { Column, Entity, PrimaryColumn } from 'typeorm';

/** user_settings 表（复合主键 user_id + key） */
@Entity('user_settings')
export class UserSettingEntity {
  @PrimaryColumn('text', { name: 'user_id' })
  userId: string;

  @PrimaryColumn('text', { name: 'key' })
  settingKey: string;

  @Column('text')
  value: string;

  @Column('integer', { name: 'updated_at' })
  updatedAt: number;
}
