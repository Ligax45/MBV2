import type { Recipe } from '../entities/recipe.entity';
import type {
  RecipeModerationStatus,
  RecipeVisibility,
} from '../recipe-visibility';

export const RECIPE_REPOSITORY = Symbol('RECIPE_REPOSITORY');

export interface CreateRecipeIngredientParams {
  quantity: string;
  unit: string;
  name: string;
}

export interface CreateRecipeStepParams {
  order: number;
  content: string;
}

export interface CreateRecipeParams {
  title: string;
  description: string;
  imageUrl?: string | null;
  difficulty: 'facile' | 'moyen' | 'difficile';
  servings: number;
  recipeTypeId: string;
  authorUserId?: string | null;
  prepMinutes?: number;
  cookMinutes?: number;
  restMinutes?: number;
  ingredients?: CreateRecipeIngredientParams[];
  steps?: CreateRecipeStepParams[];
  equipmentIds?: string[];
  visibility?: RecipeVisibility;
  moderationStatus?: RecipeModerationStatus;
  moderationComment?: string | null;
  reviewedAt?: Date | null;
  reviewedByUserId?: string | null;
}

export interface RecipeListFilter {
  listedPublic?: boolean;
  authorUserId?: string;
  pendingPublic?: boolean;
}

export interface RecipeModerationUpdateParams {
  moderationStatus: RecipeModerationStatus;
  moderationComment: string | null;
  reviewedAt: Date;
  reviewedByUserId: string;
}

export interface RecipeRepository {
  findAll(filter?: RecipeListFilter): Promise<Recipe[]>;
  findById(id: string): Promise<Recipe | null>;
  create(params: CreateRecipeParams): Promise<Recipe>;
  update(id: string, params: CreateRecipeParams): Promise<Recipe | null>;
  updateModeration(
    id: string,
    params: RecipeModerationUpdateParams,
  ): Promise<Recipe | null>;
  updateImageUrl(id: string, imageUrl: string): Promise<Recipe | null>;
  delete(id: string): Promise<boolean>;
}
