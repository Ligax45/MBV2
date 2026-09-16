import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../../auth/domain/auth-user.model';
import {
  applyRecipeListQuery,
  parseRecipeListQuery,
} from '../recipe-list-query.util';
import { toRecipeListItemResponse } from '../recipe-response.util';
import {
  canModerateRecipes,
  isPubliclyListed,
} from '../recipe-authorization.util';
import { RECIPE_FAVORITE_REPOSITORY } from '../../domain/repositories/recipe-favorite.repository';
import type { RecipeFavoriteRepository } from '../../domain/repositories/recipe-favorite.repository';
import { RECIPE_RATING_REPOSITORY } from '../../domain/repositories/recipe-rating.repository';
import type { RecipeRatingRepository } from '../../domain/repositories/recipe-rating.repository';
import { RECIPE_REPOSITORY } from '../../domain/repositories/recipe.repository';
import type { RecipeRepository } from '../../domain/repositories/recipe.repository';

export interface GetRecipesOptions {
  favoritesOnly?: boolean;
  mineOnly?: boolean;
  pendingOnly?: boolean;
  user?: AuthenticatedUser;
  sort?: string;
  difficulty?: string;
  maxTotalMinutes?: string;
  minTotalMinutes?: string;
  minRating?: string;
}

@Injectable()
export class GetRecipesUseCase {
  constructor(
    @Inject(RECIPE_REPOSITORY) private readonly recipeRepo: RecipeRepository,
    @Inject(RECIPE_FAVORITE_REPOSITORY)
    private readonly favoriteRepo: RecipeFavoriteRepository,
    @Inject(RECIPE_RATING_REPOSITORY)
    private readonly ratingRepo: RecipeRatingRepository,
  ) {}

  async execute(options: GetRecipesOptions = {}) {
    const {
      favoritesOnly = false,
      mineOnly = false,
      pendingOnly = false,
      user,
    } = options;
    const userId = user?.id;
    const listQuery = parseRecipeListQuery(options);

    if (pendingOnly) {
      if (!user) {
        throw new UnauthorizedException(
          'Connexion requise pour consulter la file de modération',
        );
      }
      if (!canModerateRecipes(user)) {
        throw new ForbiddenException('Accès refusé');
      }
    }

    if ((favoritesOnly || mineOnly) && !userId) {
      throw new UnauthorizedException(
        favoritesOnly
          ? 'Connexion requise pour consulter vos favoris'
          : 'Connexion requise pour consulter vos recettes',
      );
    }

    if ([favoritesOnly, mineOnly, pendingOnly].filter(Boolean).length > 1) {
      throw new BadRequestException(
        'Les filtres favorites, mine et pending ne peuvent pas être combinés',
      );
    }

    const hasAdvancedFilters =
      listQuery.sort !== 'newest' ||
      listQuery.difficulties.length > 0 ||
      listQuery.maxTotalMinutes != null ||
      listQuery.minTotalMinutes != null ||
      listQuery.minRating != null;

    if (hasAdvancedFilters && (favoritesOnly || mineOnly || pendingOnly)) {
      throw new BadRequestException(
        'Les filtres avancés ne sont disponibles que sur la bibliothèque publique',
      );
    }

    const recipes = pendingOnly
      ? await this.recipeRepo.findAll({ pendingPublic: true })
      : mineOnly
        ? await this.recipeRepo.findAll({ authorUserId: userId })
        : favoritesOnly
          ? (await this.favoriteRepo.findRecipesByUserId(userId!)).filter(
              isPubliclyListed,
            )
          : await this.recipeRepo.findAll({ listedPublic: true });

    const recipeIds = recipes.map((recipe) => recipe.id);
    const [favoriteCounts, ratingStats] = await Promise.all([
      this.favoriteRepo.getFavoriteCountsByRecipeIds(recipeIds),
      this.ratingRepo.getStatsForRecipeIds(recipeIds),
    ]);

    const favoriteIds = userId
      ? new Set(await this.favoriteRepo.findRecipeIdsByUserId(userId))
      : null;

    const enriched = recipes.map((recipe) => {
      const stats = ratingStats.get(recipe.id) ?? {
        averageRating: null,
        ratingCount: 0,
      };
      return {
        recipe,
        favoriteCount: favoriteCounts.get(recipe.id) ?? 0,
        averageRating: stats.averageRating,
        ratingCount: stats.ratingCount,
      };
    });

    const filtered = favoritesOnly || mineOnly || pendingOnly
      ? enriched
      : applyRecipeListQuery(enriched, listQuery);

    return filtered.map(({ recipe, favoriteCount, averageRating, ratingCount }) =>
      toRecipeListItemResponse(recipe, {
        isFavorite: favoriteIds?.has(recipe.id) ?? false,
        favoriteCount,
        averageRating,
        ratingCount,
      }),
    );
  }
}
