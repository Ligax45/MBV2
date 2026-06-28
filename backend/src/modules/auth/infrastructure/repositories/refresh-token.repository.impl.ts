import type { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { UserOrmEntity } from '../../../recipe/infrastructure/mikroorm/user.orm-entity';
import type {
  CreateRefreshTokenParams,
  RefreshTokenRecord,
  RefreshTokenRepository,
} from '../../domain/repositories/refresh-token.repository';
import { RefreshTokenOrmEntity } from '../mikroorm/refresh-token.orm-entity';

@Injectable()
export class MikroOrmRefreshTokenRepository implements RefreshTokenRepository {
  constructor(
    @InjectRepository(RefreshTokenOrmEntity)
    private readonly repo: EntityRepository<RefreshTokenOrmEntity>,
  ) {}

  async findById(id: string): Promise<RefreshTokenRecord | null> {
    const row = await this.repo.findOne({ id }, { populate: ['user'] });
    return row ? this.toRecord(row) : null;
  }

  async create(params: CreateRefreshTokenParams): Promise<RefreshTokenRecord> {
    const em = this.repo.getEntityManager();
    const entity = new RefreshTokenOrmEntity();
    entity.id = params.id;
    entity.user = em.getReference(UserOrmEntity, params.userId);
    entity.tokenHash = params.tokenHash;
    entity.expiresAt = params.expiresAt;
    em.persist(entity);
    await em.flush();
    return {
      id: entity.id,
      userId: params.userId,
      tokenHash: entity.tokenHash,
      expiresAt: entity.expiresAt,
      revokedAt: null,
    };
  }

  async revoke(id: string): Promise<void> {
    const entity = await this.repo.findOne({ id });
    if (!entity || entity.revokedAt) return;
    entity.revokedAt = new Date();
    await this.repo.getEntityManager().flush();
  }

  async revokeAllForUser(userId: string): Promise<void> {
    const rows = await this.repo.find({
      user: userId,
      revokedAt: null,
    });
    const now = new Date();
    for (const row of rows) {
      row.revokedAt = now;
    }
    if (rows.length > 0) {
      await this.repo.getEntityManager().flush();
    }
  }

  private toRecord(row: RefreshTokenOrmEntity): RefreshTokenRecord {
    return {
      id: row.id,
      userId: row.user.id,
      tokenHash: row.tokenHash,
      expiresAt: row.expiresAt,
      revokedAt: row.revokedAt ?? null,
    };
  }
}
