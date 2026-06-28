import { EntitySchema, ReferenceKind } from '@mikro-orm/core';
import { UserOrmEntity } from '../../../recipe/infrastructure/mikroorm/user.orm-entity';

export class RefreshTokenOrmEntity {
  id!: string;

  user!: UserOrmEntity;

  tokenHash!: string;

  expiresAt!: Date;

  revokedAt?: Date | null;

  createdAt!: Date;
}

export const RefreshTokenOrmEntitySchema =
  new EntitySchema<RefreshTokenOrmEntity>({
    class: RefreshTokenOrmEntity,
    tableName: 'refresh_tokens',
    properties: {
      id: { primary: true, type: 'uuid', defaultRaw: 'gen_random_uuid()' },
      user: {
        kind: ReferenceKind.MANY_TO_ONE,
        entity: () => UserOrmEntity,
        fieldNames: ['user_id'],
      },
      tokenHash: { type: 'text', fieldName: 'token_hash' },
      expiresAt: { type: 'Date', fieldName: 'expires_at' },
      revokedAt: { type: 'Date', fieldName: 'revoked_at', nullable: true },
      createdAt: {
        type: 'Date',
        fieldName: 'created_at',
        defaultRaw: 'NOW()',
      },
    },
  });
