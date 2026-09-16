import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../../auth/domain/auth-user.model';
import { halfUnitsToRating } from '../recipe-rating.util';
import { toRecipeResponse } from '../recipe-response.util';
import { canViewRecipe } from '../recipe-authorization.util';
import { RECIPE_COMPLETION_REPOSITORY } from '../../domain/repositories/recipe-completion.repository';
import type { RecipeCompletionRepository } from '../../domain/repositories/recipe-completion.repository';
import { RECIPE_FAVORITE_REPOSITORY } from '../../domain/repositories/recipe-favorite.repository';
import type { RecipeFavoriteRepository } from '../../domain/repositories/recipe-favorite.repository';
import { RECIPE_RATING_REPOSITORY } from '../../domain/repositories/recipe-rating.repository';
import type { RecipeRatingRepository } from '../../domain/repositories/recipe-rating.repository';
import { RECIPE_REPOSITORY } from '../../domain/repositories/recipe.repository';
import type { RecipeRepository } from '../../domain/repositories/recipe.repository';

const PG_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class GetRecipeByIdUseCase {
  constructor(
    @Inject(RECIPE_REPOSITORY) private readonly recipeRepo: RecipeRepository,
    @Inject(RECIPE_FAVORITE_REPOSITORY)
    private readonly favoriteRepo: RecipeFavoriteRepository,
    @Inject(RECIPE_RATING_REPOSITORY)
    private readonly ratingRepo: RecipeRatingRepository,
    @Inject(RECIPE_COMPLETION_REPOSITORY)
    private readonly completionRepo: RecipeCompletionRepository,
  ) {}

  async execute(id: string, actor?: AuthenticatedUser) {
    const trimmed = id?.trim() ?? '';
    if (!trimmed) throw new BadRequestException('id is required');
    if (!PG_UUID_RE.test(trimmed))
      throw new BadRequestException('id doit être un UUID valide');

    const recipe = await this.recipeRepo.findById(trimmed);
    if (!recipe || !canViewRecipe(actor, recipe)) {
      throw new NotFoundException('Recette introuvable');
    }

    const [isFavorite, favoriteCounts, ratingStats, hasCompleted, userHalfUnits, userComment] =
      await Promise.all([
        actor?.id
          ? this.favoriteRepo.isFavorite(actor.id, trimmed)
          : Promise.resolve(false),
        this.favoriteRepo.getFavoriteCountsByRecipeIds([trimmed]),
        this.ratingRepo.getStatsForRecipeIds([trimmed]),
        actor?.id
          ? this.completionRepo.hasCompleted(actor.id, trimmed)
          : Promise.resolve(false),
        actor?.id
          ? this.ratingRepo.getUserRating(actor.id, trimmed)
          : Promise.resolve(null),
        actor?.id
          ? this.completionRepo.getUserComment(actor.id, trimmed)
          : Promise.resolve(null),
      ]);

    const stats = ratingStats.get(trimmed) ?? {
      averageRating: null,
      ratingCount: 0,
    };

    return toRecipeResponse(recipe, {
      isFavorite,
      hasCompleted,
      userRating:
        userHalfUnits == null ? null : halfUnitsToRating(userHalfUnits),
      userComment,
      averageRating: stats.averageRating,
      ratingCount: stats.ratingCount,
      favoriteCount: favoriteCounts.get(trimmed) ?? 0,
    });
  }
}
