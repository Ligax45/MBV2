import type { RecipeTypeId } from '@/features/createRecipe/bouchonRecipeTypes';
import type { EquipmentId } from '@/features/createRecipe/bouchonEquipment';
import type { RecipeTime, RecipeIngredient, RecipeStep } from '@/features/createRecipe/types';

export type RecipeDetailsDifficulty = 'facile' | 'moyen' | 'difficile';

export type RecipeDetails = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
  difficulty: RecipeDetailsDifficulty;
  creatorName: string;
  servings: number;
  recipeType: RecipeTypeId;
  equipment: EquipmentId[];
  time: RecipeTime;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
};
