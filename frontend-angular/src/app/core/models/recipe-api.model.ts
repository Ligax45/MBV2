export type RecipeDifficulty = 'facile' | 'moyen' | 'difficile';

export interface RecipeTypeSummary {
  id: string;
  label: string;
}

/** Corps JSON de POST /recipes */
export interface CreateRecipePayload {
  title: string;
  description: string;
  imageUrl?: string | null;
  difficulty: RecipeDifficulty;
  servings: number;
  recipeTypeId: string;
  authorUserId?: string | null;
  prepMinutes?: number;
  cookMinutes?: number;
  restMinutes?: number;
}

/** Réponse JSON de GET /recipes et GET /recipes/:id */
export interface RecipeApiResponse {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  difficulty: RecipeDifficulty;
  servings: number;
  recipeType: RecipeTypeSummary;
  authorUserId: string | null;
  prepMinutes: number;
  cookMinutes: number;
  restMinutes: number;
  createdAt: string;
  updatedAt: string;
}
