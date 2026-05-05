import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { RECIPE_REPOSITORY } from '../../domain/repositories/recipe.repository';
import type { RecipeRepository } from '../../domain/repositories/recipe.repository';

const PG_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class GetRecipeByIdUseCase {
  constructor(
    @Inject(RECIPE_REPOSITORY) private readonly recipeRepo: RecipeRepository,
  ) {}

  async execute(id: string) {
    const trimmed = id?.trim() ?? '';
    if (!trimmed)
      throw new BadRequestException('id is required');
    if (!PG_UUID_RE.test(trimmed))
      throw new BadRequestException('id doit être un UUID valide');

    const r = await this.recipeRepo.findById(trimmed);
    if (!r) throw new NotFoundException('Recette introuvable');

    return {
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
    };
  }
}
