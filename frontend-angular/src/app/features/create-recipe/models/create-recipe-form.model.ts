import type { RecipeDifficulty } from '@core/models/recipe-api.model';
import type { RecipeVisibility } from '@core/models/recipe-api.model';
import type { RecipeIngredient } from '@core/models/recipe-ingredient.model';
import type { RecipeStep } from '@core/models/recipe-step.model';

export interface RecipeTimeForm {
  preparationMinutes: number;
  cookingMinutes: number;
  restMinutes: number;
}

export interface CreateRecipeFormData {
  title: string;
  description: string;
  photo: File | null;
  photoPreview: string | null;
  servings: number;
  /** UUID renvoyé par GET /recipes/types */
  recipeType: string;
  difficulty: RecipeDifficulty | '';
  equipment: string[];
  time: RecipeTimeForm;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
  visibility: RecipeVisibility;
}

export const INITIAL_CREATE_RECIPE_FORM: CreateRecipeFormData = {
  title: '',
  description: '',
  photo: null,
  photoPreview: null,
  servings: 2,
  recipeType: '',
  difficulty: '',
  equipment: [],
  time: {
    preparationMinutes: 0,
    cookingMinutes: 0,
    restMinutes: 0,
  },
  ingredients: [],
  steps: [],
  visibility: 'public',
};
