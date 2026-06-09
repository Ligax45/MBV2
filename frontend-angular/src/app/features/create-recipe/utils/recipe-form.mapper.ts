import type { RecipeDetailApiResponse } from '@core/models/recipe-api.model';
import { resolveRecipeImageUrl } from '@core/utils/recipe.mapper';

import type { CreateRecipeFormData } from '../models/create-recipe-form.model';

/** Préremplit le formulaire depuis GET /recipes/:id (mode édition). */
export function mapApiToRecipeForm(api: RecipeDetailApiResponse): CreateRecipeFormData {
  const previewUrl = resolveRecipeImageUrl(api.imageUrl, api.updatedAt);
  const hasCustomImage = !previewUrl.includes('placehold.co');

  return {
    title: api.title,
    description: api.description,
    photo: null,
    photoPreview: hasCustomImage ? previewUrl : null,
    servings: api.servings,
    recipeType: api.recipeType.id,
    difficulty: api.difficulty,
    equipment: api.equipment.map((item) => item.id),
    time: {
      preparationMinutes: api.prepMinutes,
      cookingMinutes: api.cookMinutes,
      restMinutes: api.restMinutes,
    },
    ingredients: api.ingredients.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      unit: item.unit,
      name: item.name,
    })),
    steps: api.steps.map((item) => ({
      id: item.id,
      order: item.order,
      content: item.content,
    })),
  };
}
