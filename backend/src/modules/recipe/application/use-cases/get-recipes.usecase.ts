import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../../auth/domain/auth-user.model';
import { toRecipeListItemResponse } from '../recipe-response.util';
import {
  canModerateRecipes,
  isPubliclyListed,
} from '../recipe-authorization.util';
import { RECIPE_FAVORITE_REPOSITORY } from '../../domain/repositories/recipe-favorite.repository';
import type { RecipeFavoriteRepository } from '../../domain/repositories/recipe-favorite.repository';
import { RECIPE_REPOSITORY } from '../../domain/repositories/recipe.repository';
import type { RecipeRepository } from '../../domain/repositories/recipe.repository';

export interface GetRecipesOptions {
  favoritesOnly?: boolean;
  mineOnly?: boolean;
  pendingOnly?: boolean;
  user?: AuthenticatedUser;
}

@Injectable()
export class GetRecipesUseCase {
  constructor(
    @Inject(RECIPE_REPOSITORY) private readonly recipeRepo: RecipeRepository,
    @Inject(RECIPE_FAVORITE_REPOSITORY)
    private readonly favoriteRepo: RecipeFavoriteRepository,
  ) {}

  async execute(options: GetRecipesOptions = {}) {
    const {
      favoritesOnly = false,
      mineOnly = false,
      pendingOnly = false,
      user,
    } = options;
    const userId = user?.id;

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

    const recipes = pendingOnly
      ? await this.recipeRepo.findAll({ pendingPublic: true })
      : mineOnly
        ? await this.recipeRepo.findAll({ authorUserId: userId })
        : favoritesOnly
          ? (await this.favoriteRepo.findRecipesByUserId(userId!)).filter(
              isPubliclyListed,
            )
          : await this.recipeRepo.findAll({ listedPublic: true });

    const favoriteIds = userId
      ? new Set(await this.favoriteRepo.findRecipeIdsByUserId(userId))
      : null;

    return recipes.map((recipe) =>
      toRecipeListItemResponse(recipe, {
        isFavorite: favoriteIds?.has(recipe.id) ?? false,
      }),
    );
  }
}
