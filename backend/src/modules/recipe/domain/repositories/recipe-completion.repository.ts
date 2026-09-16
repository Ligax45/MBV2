export const RECIPE_COMPLETION_REPOSITORY = Symbol('RECIPE_COMPLETION_REPOSITORY');

export interface RecipePublicComment {
  userId: string;
  authorName: string;
  comment: string;
  updatedAt: string;
}

export interface RecipeCompletionRepository {
  hasCompleted(userId: string, recipeId: string): Promise<boolean>;
  markCompleted(userId: string, recipeId: string): Promise<void>;
  getUserComment(userId: string, recipeId: string): Promise<string | null>;
  setUserComment(
    userId: string,
    recipeId: string,
    comment: string | null,
  ): Promise<void>;
  listPublicComments(recipeId: string): Promise<RecipePublicComment[]>;
}
