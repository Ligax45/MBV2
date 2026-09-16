import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../../auth/domain/auth-user.model';
import {
  halfUnitsToRating,
  parseRatingInput,
} from '../recipe-rating.util';
import { isPubliclyListed } from '../recipe-authorization.util';
import { RECIPE_COMPLETION_REPOSITORY } from '../../domain/repositories/recipe-completion.repository';
import type { RecipeCompletionRepository } from '../../domain/repositories/recipe-completion.repository';
import { RECIPE_RATING_REPOSITORY } from '../../domain/repositories/recipe-rating.repository';
import type { RecipeRatingRepository } from '../../domain/repositories/recipe-rating.repository';
import { RECIPE_REPOSITORY } from '../../domain/repositories/recipe.repository';
import type { RecipeRepository } from '../../domain/repositories/recipe.repository';

const PG_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class SetRecipeRatingUseCase {
  constructor(
    @Inject(RECIPE_REPOSITORY) private readonly recipeRepo: RecipeRepository,
    @Inject(RECIPE_COMPLETION_REPOSITORY)
    private readonly completionRepo: RecipeCompletionRepository,
    @Inject(RECIPE_RATING_REPOSITORY)
    private readonly ratingRepo: RecipeRatingRepository,
  ) {}

  async execute(recipeId: string, user: AuthenticatedUser, ratingInput: unknown) {
    const trimmed = recipeId?.trim() ?? '';
    if (!trimmed) throw new BadRequestException('id is required');
    if (!PG_UUID_RE.test(trimmed))
      throw new BadRequestException('id doit être un UUID valide');

    const recipe = await this.recipeRepo.findById(trimmed);
    if (!recipe || !isPubliclyListed(recipe)) {
      throw new NotFoundException('Recette introuvable');
    }

    const hasCompleted = await this.completionRepo.hasCompleted(user.id, trimmed);
    if (!hasCompleted) {
      throw new ForbiddenException(
        'Vous devez d’abord marquer la recette comme réalisée avant de la noter',
      );
    }

    const halfUnits = parseRatingInput(ratingInput);
    await this.ratingRepo.upsertRating(user.id, trimmed, halfUnits);

    const stats = await this.ratingRepo.getStatsForRecipeIds([trimmed]);
    const recipeStats = stats.get(trimmed) ?? {
      averageRating: null,
      ratingCount: 0,
    };

    return {
      success: true,
      userRating: halfUnitsToRating(halfUnits),
      averageRating: recipeStats.averageRating,
      ratingCount: recipeStats.ratingCount,
    };
  }
}
