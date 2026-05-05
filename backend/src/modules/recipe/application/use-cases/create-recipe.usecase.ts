import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import {
  RECIPE_REPOSITORY,
  type CreateRecipeParams,
  type RecipeRepository,
} from '../../domain/repositories/recipe.repository';

/** Format accepté par Postgres pour le type `uuid` (sans tenir compte des variantes RFC). */
const PG_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function assertUuid(field: string, value: string): void {
  if (!PG_UUID_RE.test(value.trim())) {
    throw new BadRequestException(
      `${field} doit être un UUID valide (ex. id d’une ligne existante dans la table concernée)`,
    );
  }
}

@Injectable()
export class CreateRecipeUseCase {
  constructor(
    @Inject(RECIPE_REPOSITORY) private readonly recipeRepo: RecipeRepository,
  ) {}

  async execute(input: CreateRecipeParams) {
    if (!input.title?.trim())
      throw new BadRequestException('title is required');
    if (!input.description?.trim())
      throw new BadRequestException('description is required');
    if (!input.recipeTypeId?.trim())
      throw new BadRequestException('recipeTypeId is required');
    assertUuid('recipeTypeId', input.recipeTypeId);
    if (input.authorUserId != null && String(input.authorUserId).trim() !== '')
      assertUuid('authorUserId', String(input.authorUserId));

    if (!['facile', 'moyen', 'difficile'].includes(input.difficulty))
      throw new BadRequestException('difficulty is invalid');
    if (typeof input.servings !== 'number' || input.servings < 0)
      throw new BadRequestException('servings is invalid');

    const recipe = await this.recipeRepo.create(input);
    return {
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      imageUrl: recipe.imageUrl,
      difficulty: recipe.difficulty,
      servings: recipe.servings,
      recipeType: recipe.recipeType,
      authorUserId: recipe.authorUserId,
      prepMinutes: recipe.prepMinutes,
      cookMinutes: recipe.cookMinutes,
      restMinutes: recipe.restMinutes,
      createdAt: recipe.createdAt.toISOString(),
      updatedAt: recipe.updatedAt.toISOString(),
    };
  }
}
