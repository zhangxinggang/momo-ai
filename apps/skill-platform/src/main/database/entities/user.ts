import { Column, Entity, PrimaryColumn } from 'typeorm';

/** users 表 */
@Entity('users')
export class UserEntity {
  @PrimaryColumn('text')
  id: string;

  @Column('text', { unique: true })
  username: string;

  @Column('text', { name: 'password_hash' })
  passwordHash: string;

  @Column('text', { default: 'user' })
  role: string;

  @Column('integer', { name: 'created_at' })
  createdAt: number;

  @Column('integer', { name: 'updated_at' })
  updatedAt: number;
}
