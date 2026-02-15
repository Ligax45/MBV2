import type { RecipeTypeId } from './bouchonRecipeTypes';
import type { EquipmentId } from './bouchonEquipment';

export type RecipeTime = {
  preparationMinutes: number;
  cookingMinutes: number;
  restMinutes: number;
};

export type RecipeIngredient = {
  id: string;
  quantity: string;
  unit: string;
  name: string;
};

export type RecipeStep = {
  id: string;
  content: string;
  order: number;
};

export type CreateRecipeFormData = {
  title: string;
  photo: File | null;
  photoPreview: string | null;
  servings: number;
  recipeType: RecipeTypeId | '';
  equipment: EquipmentId[];
  time: RecipeTime;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
};
