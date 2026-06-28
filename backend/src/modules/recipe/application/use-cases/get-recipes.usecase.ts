import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { toRecipeListItemResponse } from '../recipe-response.util';
import { RECIPE_FAVORITE_REPOSITORY } from '../../domain/repositories/recipe-favorite.repository';
import type { RecipeFavoriteRepository } from '../../domain/repositories/recipe-favorite.repository';
import { RECIPE_REPOSITORY } from '../../domain/repositories/recipe.repository';
import type { RecipeRepository } from '../../domain/repositories/recipe.repository';

export interface GetRecipesOptions {
  favoritesOnly?: boolean;
  userId?: string;
}

@Injectable()
export class GetRecipesUseCase {
  constructor(
    @Inject(RECIPE_REPOSITORY) private readonly recipeRepo: RecipeRepository,
    @Inject(RECIPE_FAVORITE_REPOSITORY)
    private readonly favoriteRepo: RecipeFavoriteRepository,
  ) {}

  async execute(options: GetRecipesOptions = {}) {
    const { favoritesOnly = false, userId } = options;

    if (favoritesOnly && !userId) {
      throw new UnauthorizedException(
        'Connexion requise pour consulter vos favoris',
      );
    }

    const recipes = favoritesOnly
      ? await this.favoriteRepo.findRecipesByUserId(userId!)
      : await this.recipeRepo.findAll();

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
