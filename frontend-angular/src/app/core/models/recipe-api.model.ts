export type RecipeDifficulty = 'facile' | 'moyen' | 'difficile';
export type RecipeVisibility = 'public' | 'private';
export type RecipeModerationStatus = 'pending' | 'approved' | 'rejected';

export interface RecipeTypeSummary {
  id: string;
  label: string;
}

export interface EquipmentSummary {
  id: string;
  label: string;
}

export interface RecipeIngredientApi {
  id: string;
  position: number;
  quantity: string;
  unit: string;
  name: string;
}

export interface RecipeStepApi {
  id: string;
  order: number;
  title: string | null;
  content: string;
}

export interface CreateRecipeIngredientPayload {
  quantity: string;
  unit: string;
  name: string;
}

export interface CreateRecipeStepPayload {
  order: number;
  title?: string | null;
  content: string;
}

/** Corps JSON de POST /recipes et PATCH /recipes/:id */
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
  ingredients?: CreateRecipeIngredientPayload[];
  steps?: CreateRecipeStepPayload[];
  equipmentIds?: string[];
  visibility?: RecipeVisibility;
}

/** Réponse JSON de GET /recipes/:id, POST /recipes, PATCH /recipes/:id */
export interface RecipeDetailApiResponse extends RecipeApiResponse {
  ingredients: RecipeIngredientApi[];
  steps: RecipeStepApi[];
  equipment: EquipmentSummary[];
}

/** Réponse JSON de GET /recipes (liste) */
export interface RecipeApiResponse {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  difficulty: RecipeDifficulty;
  servings: number;
  recipeType: RecipeTypeSummary;
  authorUserId: string | null;
  authorName: string | null;
  prepMinutes: number;
  cookMinutes: number;
  restMinutes: number;
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
  visibility: RecipeVisibility;
  moderationStatus: RecipeModerationStatus;
  moderationComment: string | null;
}
