import { EntitySchema } from '@mikro-orm/core';
import { UserRole } from '../../../auth/domain/user-role.enum';

export class UserOrmEntity {
  id!: string;

  identifiant!: string;

  pseudo!: string;

  passwordHash!: string;

  role!: UserRole;

  mfaEnabled!: boolean;

  mfaSecret?: string | null;

  requiresMfa!: boolean;

  createdAt!: Date;

  updatedAt!: Date;
}

export const UserOrmEntitySchema = new EntitySchema<UserOrmEntity>({
  class: UserOrmEntity,
  tableName: 'users',
  properties: {
    id: { primary: true, type: 'uuid', defaultRaw: 'gen_random_uuid()' },
    identifiant: { type: 'string', length: 255, unique: true },
    pseudo: { type: 'string', length: 50 },
    passwordHash: {
      type: 'text',
      fieldName: 'password_hash',
    },
    role: {
      type: 'string',
      length: 20,
      default: UserRole.User,
    },
    mfaEnabled: {
      type: 'boolean',
      fieldName: 'mfa_enabled',
      default: false,
    },
    mfaSecret: {
      type: 'text',
      fieldName: 'mfa_secret',
      nullable: true,
    },
    requiresMfa: {
      type: 'boolean',
      fieldName: 'requires_mfa',
      default: false,
    },
    createdAt: {
      type: 'Date',
      fieldName: 'created_at',
      defaultRaw: 'NOW()',
    },
    updatedAt: {
      type: 'Date',
      fieldName: 'updated_at',
      defaultRaw: 'NOW()',
    },
  },
});
