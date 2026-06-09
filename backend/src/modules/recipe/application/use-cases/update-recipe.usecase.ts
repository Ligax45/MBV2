import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { toRecipeResponse } from '../recipe-response.util';
import {
  RECIPE_REPOSITORY,
  type CreateRecipeParams,
  type RecipeRepository,
} from '../../domain/repositories/recipe.repository';

const PG_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function assertUuid(field: string, value: string): void {
  if (!PG_UUID_RE.test(value.trim())) {
    throw new BadRequestException(
      `${field} doit être un UUID valide (ex. id d’une ligne existante dans la table concernée)`,
    );
  }
}

function validateRecipeInput(input: CreateRecipeParams): void {
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

  for (const equipmentId of input.equipmentIds ?? []) {
    assertUuid('equipmentIds', equipmentId);
  }
}

@Injectable()
export class UpdateRecipeUseCase {
  constructor(
    @Inject(RECIPE_REPOSITORY) private readonly recipeRepo: RecipeRepository,
  ) {}

  async execute(id: string, input: CreateRecipeParams) {
    const trimmed = id?.trim() ?? '';
    if (!trimmed) throw new BadRequestException('id is required');
    assertUuid('id', trimmed);
    validateRecipeInput(input);

    const recipe = await this.recipeRepo.update(trimmed, input);
    if (!recipe) throw new NotFoundException('Recette introuvable');

    return toRecipeResponse(recipe);
  }
}
