export const RECIPE_RATING_REPOSITORY = Symbol('RECIPE_RATING_REPOSITORY');

export interface RecipeRatingStats {
  averageRating: number | null;
  ratingCount: number;
}

export interface RecipeRatingRepository {
  getUserRating(userId: string, recipeId: string): Promise<number | null>;
  getStatsForRecipeIds(recipeIds: string[]): Promise<Map<string, RecipeRatingStats>>;
  upsertRating(userId: string, recipeId: string, halfUnits: number): Promise<void>;
}
