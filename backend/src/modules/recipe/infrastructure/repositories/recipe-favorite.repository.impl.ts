import type { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Recipe } from '../../domain/entities/recipe.entity';
import type { RecipeFavoriteRepository } from '../../domain/repositories/recipe-favorite.repository';
import { RecipeFavoriteOrmEntity } from '../mikroorm/recipe-favorite.orm-entity';
import { RecipeOrmEntity } from '../mikroorm/recipe.orm-entity';
import { UserOrmEntity } from '../mikroorm/user.orm-entity';

@Injectable()
export class MikroOrmRecipeFavoriteRepository implements RecipeFavoriteRepository {
  constructor(
    @InjectRepository(RecipeFavoriteOrmEntity)
    private readonly favoriteRepo: EntityRepository<RecipeFavoriteOrmEntity>,
    @InjectRepository(RecipeOrmEntity)
    private readonly recipeRepo: EntityRepository<RecipeOrmEntity>,
  ) {}

  async findRecipeIdsByUserId(userId: string): Promise<string[]> {
    const rows = await this.favoriteRepo.find(
      { user: userId },
      {
        populate: ['recipe'],
        orderBy: { createdAt: 'desc' },
      },
    );
    return rows.map((row) => row.recipe.id);
  }

  async findRecipesByUserId(userId: string): Promise<Recipe[]> {
    const rows = await this.favoriteRepo.find(
      { user: userId },
      {
        populate: ['recipe', 'recipe.recipeType', 'recipe.author'],
        orderBy: { createdAt: 'desc' },
      },
    );
    return rows.map((row) => this.toDomain(row.recipe));
  }

  async isFavorite(userId: string, recipeId: string): Promise<boolean> {
    const count = await this.favoriteRepo.count({
      user: userId,
      recipe: recipeId,
    });
    return count > 0;
  }

  async addFavorite(userId: string, recipeId: string): Promise<void> {
    const recipeExists = await this.recipeRepo.count({ id: recipeId });
    if (!recipeExists) {
      throw new NotFoundException('Recette introuvable');
    }

    const alreadyFavorite = await this.isFavorite(userId, recipeId);
    if (alreadyFavorite) {
      throw new ConflictException('Cette recette est déjà dans vos favoris');
    }

    const em = this.favoriteRepo.getEntityManager();
    const favorite = new RecipeFavoriteOrmEntity();
    favorite.user = em.getReference(UserOrmEntity, userId);
    favorite.recipe = em.getReference(RecipeOrmEntity, recipeId);
    em.persist(favorite);
    await em.flush();
  }

  async removeFavorite(userId: string, recipeId: string): Promise<void> {
    const deleted = await this.favoriteRepo.nativeDelete({
      user: userId,
      recipe: recipeId,
    });
    if (!deleted) {
      throw new NotFoundException('Favori introuvable');
    }
  }

  private toDomain(r: RecipeOrmEntity): Recipe {
    return new Recipe(
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
  }
}
