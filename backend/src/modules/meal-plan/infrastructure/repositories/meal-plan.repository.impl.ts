import type { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { Recipe } from '../../../recipe/domain/entities/recipe.entity';
import { RecipeOrmEntity } from '../../../recipe/infrastructure/mikroorm/recipe.orm-entity';
import { UserOrmEntity } from '../../../recipe/infrastructure/mikroorm/user.orm-entity';
import { MealPlanEntry } from '../../domain/entities/meal-plan-entry.entity';
import type { MealPlanRepository } from '../../domain/repositories/meal-plan.repository';
import { MealPlanEntryOrmEntity } from '../mikroorm/meal-plan-entry.orm-entity';

@Injectable()
export class MikroOrmMealPlanRepository implements MealPlanRepository {
  constructor(
    @InjectRepository(MealPlanEntryOrmEntity)
    private readonly entryRepo: EntityRepository<MealPlanEntryOrmEntity>,
  ) {}

  async findByUserAndDateRange(
    userId: string,
    fromDate: string,
    toDate: string,
  ): Promise<MealPlanEntry[]> {
    const rows = await this.entryRepo.find(
      {
        user: userId,
        planDate: { $gte: fromDate, $lte: toDate },
      },
      {
        populate: ['recipe', 'recipe.recipeType', 'recipe.author'],
        orderBy: { planDate: 'asc' },
      },
    );
    return rows.map((row) => this.toDomain(row));
  }

  async upsert(
    userId: string,
    planDate: string,
    recipeId: string,
  ): Promise<MealPlanEntry> {
    const em = this.entryRepo.getEntityManager();
    let row = await this.entryRepo.findOne(
      { user: userId, planDate },
      { populate: ['recipe', 'recipe.recipeType', 'recipe.author'] },
    );

    if (row) {
      row.recipe = em.getReference(RecipeOrmEntity, recipeId);
      row.updatedAt = new Date();
    } else {
      row = new MealPlanEntryOrmEntity();
      row.user = em.getReference(UserOrmEntity, userId);
      row.planDate = planDate;
      row.recipe = em.getReference(RecipeOrmEntity, recipeId);
      em.persist(row);
    }

    await em.flush();
    await em.populate(row, ['recipe', 'recipe.recipeType', 'recipe.author']);
    return this.toDomain(row);
  }

  async deleteByUserAndDate(userId: string, planDate: string): Promise<boolean> {
    const deleted = await this.entryRepo.nativeDelete({
      user: userId,
      planDate,
    });
    return deleted > 0;
  }

  private toDomain(row: MealPlanEntryOrmEntity): MealPlanEntry {
    const r = row.recipe;
    const planDate =
      typeof row.planDate === 'string'
        ? row.planDate
        : (row.planDate as Date).toISOString().slice(0, 10);

    const recipe = new Recipe(
      r.id,
      r.title,
      r.description,
      r.difficulty,
      r.servings,
      { id: r.recipeType.id, label: r.recipeType.label },
      r.imageUrl ?? null,
      r.author?.id ?? null,
      r.author?.pseudo ?? null,
      r.prepMinutes,
      r.cookMinutes,
      r.restMinutes,
      r.createdAt,
      r.updatedAt,
      [],
      [],
      [],
      r.visibility,
      r.moderationStatus,
      r.moderationComment ?? null,
      r.reviewedAt ?? null,
      r.reviewedByUserId ?? null,
    );

    return new MealPlanEntry(planDate, recipe, row.createdAt, row.updatedAt);
  }
}
