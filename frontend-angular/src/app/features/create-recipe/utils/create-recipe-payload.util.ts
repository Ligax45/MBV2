import type {
  CreateRecipePayload,
  RecipeDifficulty,
} from '@core/models/recipe-api.model';

import type { CreateRecipeFormData } from '../models/create-recipe-form.model';

export function buildCreateRecipePayload(
  form: CreateRecipeFormData,
  options?: { clearImage?: boolean },
): CreateRecipePayload {
  const ingredients = form.ingredients
    .filter((item) => item.name.trim())
    .map((item) => ({
      quantity: item.quantity.trim() || '0',
      unit: item.unit.trim(),
      name: item.name.trim(),
    }));

  const steps = form.steps
    .filter((item) => item.content.trim())
    .map((item) => ({
      order: item.order,
      content: item.content.trim(),
    }));

  const payload: CreateRecipePayload = {
    title: form.title.trim(),
    description: form.description.trim(),
    difficulty: form.difficulty as RecipeDifficulty,
    servings: form.servings,
    recipeTypeId: form.recipeType,
    prepMinutes: form.time.preparationMinutes,
    cookMinutes: form.time.cookingMinutes,
    restMinutes: form.time.restMinutes,
    ingredients,
    steps,
    equipmentIds: form.equipment,
    visibility: form.visibility,
  };

  if (options?.clearImage) {
    payload.imageUrl = null;
  }

  return payload;
}
