import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** 软件授权记录表 */
@Entity('software_license')
export class SoftwareLicense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', name: 'auth_code' })
  authCode: string;

  @Column({ type: 'integer', name: 'created_at' })
  createdAt: number;
}
