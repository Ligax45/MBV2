import type { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { averageHalfUnitsToRating } from '../../application/recipe-rating.util';
import type {
  RecipeRatingRepository,
  RecipeRatingStats,
} from '../../domain/repositories/recipe-rating.repository';
import { RecipeRatingOrmEntity } from '../mikroorm/recipe-rating.orm-entity';
import { RecipeOrmEntity } from '../mikroorm/recipe.orm-entity';
import { UserOrmEntity } from '../mikroorm/user.orm-entity';

@Injectable()
export class MikroOrmRecipeRatingRepository implements RecipeRatingRepository {
  constructor(
    @InjectRepository(RecipeRatingOrmEntity)
    private readonly ratingRepo: EntityRepository<RecipeRatingOrmEntity>,
    @InjectRepository(RecipeOrmEntity)
    private readonly recipeRepo: EntityRepository<RecipeOrmEntity>,
  ) {}

  async getUserRating(userId: string, recipeId: string): Promise<number | null> {
    const row = await this.ratingRepo.findOne({
      user: userId,
      recipe: recipeId,
    });
    return row ? row.rating : null;
  }

  async getStatsForRecipeIds(
    recipeIds: string[],
  ): Promise<Map<string, RecipeRatingStats>> {
    const stats = new Map<string, RecipeRatingStats>();
    if (recipeIds.length === 0) {
      return stats;
    }

    const em = this.ratingRepo.getEntityManager();
    const placeholders = recipeIds.map(() => '?').join(',');
    const rows = await em.getConnection().execute<
      Array<{
        recipe_id: string;
        avg_rating: number | string | null;
        rating_count: number | string;
      }>
    >(
      `SELECT recipe_id,
              AVG(rating) AS avg_rating,
              COUNT(*)::int AS rating_count
       FROM recipe_ratings
       WHERE recipe_id IN (${placeholders})
       GROUP BY recipe_id`,
      recipeIds,
    );

    for (const row of rows) {
      const ratingCount = Number(row.rating_count) || 0;
      const averageHalfUnits =
        row.avg_rating == null ? null : Number(row.avg_rating);
      stats.set(row.recipe_id, {
        averageRating: averageHalfUnitsToRating(averageHalfUnits),
        ratingCount,
      });
    }

    return stats;
  }

  async upsertRating(
    userId: string,
    recipeId: string,
    halfUnits: number,
  ): Promise<void> {
    const recipeExists = await this.recipeRepo.count({ id: recipeId });
    if (!recipeExists) {
      throw new NotFoundException('Recette introuvable');
    }

    const em = this.ratingRepo.getEntityManager();
    const existing = await this.ratingRepo.findOne({
      user: userId,
      recipe: recipeId,
    });

    if (existing) {
      existing.rating = halfUnits;
      existing.updatedAt = new Date();
      await em.flush();
      return;
    }

    const rating = new RecipeRatingOrmEntity();
    rating.user = em.getReference(UserOrmEntity, userId);
    rating.recipe = em.getReference(RecipeOrmEntity, recipeId);
    rating.rating = halfUnits;
    em.persist(rating);
    await em.flush();
  }
}
