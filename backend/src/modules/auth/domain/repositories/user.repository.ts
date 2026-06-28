import type { UserRole } from '../user-role.enum';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface CreateUserParams {
  identifiant: string;
  pseudo: string;
  passwordHash: string;
}

export interface UserRecord {
  id: string;
  identifiant: string;
  pseudo: string;
  passwordHash: string;
  role: UserRole;
  mfaEnabled: boolean;
  mfaSecret: string | null;
  requiresMfa: boolean;
  createdAt: Date;
}

export interface UserSummaryRecord {
  id: string;
  pseudo: string;
  role: UserRole;
  createdAt: Date;
}

export interface UserRepository {
  findByIdentifiant(identifiant: string): Promise<UserRecord | null>;
  findById(id: string): Promise<UserRecord | null>;
  findAll(): Promise<UserSummaryRecord[]>;
  create(params: CreateUserParams): Promise<UserRecord>;
  updateMfa(
    userId: string,
    params: { mfaEnabled: boolean; mfaSecret: string | null },
  ): Promise<UserRecord | null>;
  updateRole(userId: string, role: UserRole): Promise<UserSummaryRecord | null>;
}
