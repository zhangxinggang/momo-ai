import { Column, Entity, PrimaryColumn } from 'typeorm';

/** refresh_tokens 表 */
@Entity('refresh_tokens')
export class RefreshTokenEntity {
  @PrimaryColumn('text')
  id: string;

  @Column('text', { name: 'user_id' })
  userId: string;

  @Column('text', { name: 'token_hash' })
  tokenHash: string;

  @Column('integer', { name: 'expires_at' })
  expiresAt: number;

  @Column('integer', { name: 'created_at' })
  createdAt: number;
}
