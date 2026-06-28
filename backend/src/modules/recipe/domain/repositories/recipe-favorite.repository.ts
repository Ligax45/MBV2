import type { Recipe } from '../entities/recipe.entity';

export const RECIPE_FAVORITE_REPOSITORY = Symbol('RECIPE_FAVORITE_REPOSITORY');

export interface RecipeFavoriteRepository {
  findRecipeIdsByUserId(userId: string): Promise<string[]>;
  findRecipesByUserId(userId: string): Promise<Recipe[]>;
  isFavorite(userId: string, recipeId: string): Promise<boolean>;
  addFavorite(userId: string, recipeId: string): Promise<void>;
  removeFavorite(userId: string, recipeId: string): Promise<void>;
}
