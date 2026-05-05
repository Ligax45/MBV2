/* eslint-disable
  @typescript-eslint/no-unsafe-assignment,
  @typescript-eslint/no-unsafe-member-access
*/
import type { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { Recipe } from '../../domain/entities/recipe.entity';
import type {
  CreateRecipeParams,
  RecipeRepository,
} from '../../domain/repositories/recipe.repository';
import { RecipeOrmEntity } from '../mikroorm/recipe.orm-entity';
import { RecipeTypeOrmEntity } from '../mikroorm/recipe-type.orm-entity';

@Injectable()
export class MikroOrmRecipeRepository implements RecipeRepository {
  constructor(
    @InjectRepository(RecipeOrmEntity)
    private readonly repo: EntityRepository<RecipeOrmEntity>,
  ) {}

  async findById(id: string): Promise<Recipe | null> {
    const r = await this.repo.findOne({ id }, { populate: ['recipeType'] });
    if (!r) return null;
    return new Recipe(
      r.id,
      r.title,
      r.description,
      r.difficulty,
      r.servings,
      { id: r.recipeType.id, label: r.recipeType.label },
      r.imageUrl ?? null,
      r.authorUserId ?? null,
      r.prepMinutes,
      r.cookMinutes,
      r.restMinutes,
      r.createdAt,
      r.updatedAt,
    );
  }

  async findAll(): Promise<Recipe[]> {
    const rows = await this.repo.findAll({
      populate: ['recipeType'],
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(
      (r) =>
        new Recipe(
          r.id,
          r.title,
          r.description,
          r.difficulty,
          r.servings,
          { id: r.recipeType.id, label: r.recipeType.label },
          r.imageUrl ?? null,
          r.authorUserId ?? null,
          r.prepMinutes,
          r.cookMinutes,
          r.restMinutes,
          r.createdAt,
          r.updatedAt,
        ),
    );
  }

  async create(params: CreateRecipeParams): Promise<Recipe> {
    const em = this.repo.getEntityManager();
    const entity = new RecipeOrmEntity();
    entity.title = params.title;
    entity.description = params.description;
    entity.imageUrl = params.imageUrl ?? null;
    entity.difficulty = params.difficulty;
    entity.servings = params.servings;
    entity.recipeType = em.getReference(RecipeTypeOrmEntity, params.recipeTypeId);
    entity.authorUserId = params.authorUserId ?? null;
    entity.prepMinutes = params.prepMinutes ?? 0;
    entity.cookMinutes = params.cookMinutes ?? 0;
    entity.restMinutes = params.restMinutes ?? 0;

    em.persist(entity);
    await em.flush();
    await em.populate(entity, ['recipeType']);

    return new Recipe(
      entity.id,
      entity.title,
      entity.description,
      entity.difficulty,
      entity.servings,
      { id: entity.recipeType.id, label: entity.recipeType.label },
      entity.imageUrl ?? null,
      entity.authorUserId ?? null,
      entity.prepMinutes,
      entity.cookMinutes,
      entity.restMinutes,
      entity.createdAt,
      entity.updatedAt,
    );
  }
}
