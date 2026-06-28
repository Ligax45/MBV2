import type { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { UserOrmEntity } from '../../../recipe/infrastructure/mikroorm/user.orm-entity';
import { UserRole } from '../../domain/user-role.enum';
import type {
  CreateUserParams,
  UserRecord,
  UserRepository,
  UserSummaryRecord,
} from '../../domain/repositories/user.repository';

@Injectable()
export class MikroOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repo: EntityRepository<UserOrmEntity>,
  ) {}

  async findByIdentifiant(identifiant: string): Promise<UserRecord | null> {
    const row = await this.repo.findOne({ identifiant });
    return row ? this.toRecord(row) : null;
  }

  async findById(id: string): Promise<UserRecord | null> {
    const row = await this.repo.findOne({ id });
    return row ? this.toRecord(row) : null;
  }

  async findAll(): Promise<UserSummaryRecord[]> {
    const rows = await this.repo.findAll({
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row) => this.toSummary(row));
  }

  async create(params: CreateUserParams): Promise<UserRecord> {
    const em = this.repo.getEntityManager();
    const entity = new UserOrmEntity();
    entity.identifiant = params.identifiant;
    entity.pseudo = params.pseudo;
    entity.passwordHash = params.passwordHash;
    entity.role = UserRole.User;
    entity.mfaEnabled = false;
    entity.mfaSecret = null;
    entity.requiresMfa = false;
    em.persist(entity);
    await em.flush();
    return this.toRecord(entity);
  }

  async updateMfa(
    userId: string,
    params: { mfaEnabled: boolean; mfaSecret: string | null },
  ): Promise<UserRecord | null> {
    const entity = await this.repo.findOne({ id: userId });
    if (!entity) return null;

    entity.mfaEnabled = params.mfaEnabled;
    entity.mfaSecret = params.mfaSecret;
    entity.updatedAt = new Date();
    await this.repo.getEntityManager().flush();
    return this.toRecord(entity);
  }

  async updateRole(
    userId: string,
    role: UserRole,
  ): Promise<UserSummaryRecord | null> {
    const entity = await this.repo.findOne({ id: userId });
    if (!entity) return null;

    entity.role = role;
    entity.updatedAt = new Date();
    await this.repo.getEntityManager().flush();
    return this.toSummary(entity);
  }

  private toRecord(row: UserOrmEntity): UserRecord {
    return {
      id: row.id,
      identifiant: row.identifiant,
      pseudo: row.pseudo,
      passwordHash: row.passwordHash,
      role: row.role,
      mfaEnabled: row.mfaEnabled,
      mfaSecret: row.mfaSecret ?? null,
      requiresMfa: row.requiresMfa,
      createdAt: row.createdAt,
    };
  }

  private toSummary(row: UserOrmEntity): UserSummaryRecord {
    return {
      id: row.id,
      pseudo: row.pseudo,
      role: row.role,
      createdAt: row.createdAt,
    };
  }
}
