import type { Recipe } from '../entities/recipe.entity';

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
}

export interface RecipeRepository {
  findAll(): Promise<Recipe[]>;
  findById(id: string): Promise<Recipe | null>;
  create(params: CreateRecipeParams): Promise<Recipe>;
  update(id: string, params: CreateRecipeParams): Promise<Recipe | null>;
  updateImageUrl(id: string, imageUrl: string): Promise<Recipe | null>;
}
