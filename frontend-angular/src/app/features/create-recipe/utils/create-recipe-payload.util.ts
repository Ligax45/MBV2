import type {
  CreateRecipePayload,
  RecipeDifficulty,
} from '@core/models/recipe-api.model';

import type { CreateRecipeFormData } from '../models/create-recipe-form.model';

export function buildCreateRecipePayload(
  form: CreateRecipeFormData,
): CreateRecipePayload {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    imageUrl: null,
    difficulty: form.difficulty as RecipeDifficulty,
    servings: form.servings,
    recipeTypeId: form.recipeType,
    prepMinutes: form.time.preparationMinutes,
    cookMinutes: form.time.cookingMinutes,
    restMinutes: form.time.restMinutes,
  };
}
