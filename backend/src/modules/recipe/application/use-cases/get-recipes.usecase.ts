import { Inject, Injectable } from '@nestjs/common';
import { RECIPE_REPOSITORY } from '../../domain/repositories/recipe.repository';
import type { RecipeRepository } from '../../domain/repositories/recipe.repository';

@Injectable()
export class GetRecipesUseCase {
  constructor(
    @Inject(RECIPE_REPOSITORY) private readonly recipeRepo: RecipeRepository,
  ) {}

  async execute() {
    const recipes = await this.recipeRepo.findAll();
    return recipes.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      imageUrl: r.imageUrl,
      difficulty: r.difficulty,
      servings: r.servings,
      recipeType: r.recipeType,
      authorUserId: r.authorUserId,
      prepMinutes: r.prepMinutes,
      cookMinutes: r.cookMinutes,
      restMinutes: r.restMinutes,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }
}
