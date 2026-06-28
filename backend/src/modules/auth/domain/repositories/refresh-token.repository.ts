export const REFRESH_TOKEN_REPOSITORY = Symbol('REFRESH_TOKEN_REPOSITORY');

export interface RefreshTokenRecord {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
}

export interface CreateRefreshTokenParams {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface RefreshTokenRepository {
  findById(id: string): Promise<RefreshTokenRecord | null>;
  create(params: CreateRefreshTokenParams): Promise<RefreshTokenRecord>;
  revoke(id: string): Promise<void>;
  revokeAllForUser(userId: string): Promise<void>;
}
