import { RECIPE_PLACEHOLDER_IMAGE } from '@core/constants/recipe.constants';
import type { RecipeApiResponse } from '@core/models/recipe-api.model';

import type { CreateRecipeFormData } from '../models/create-recipe-form.model';

/** Préremplit le formulaire depuis GET /recipes/:id (mode édition). */
export function mapApiToRecipeForm(api: RecipeApiResponse): CreateRecipeFormData {
  const imageUrl = api.imageUrl?.trim();
  const hasCustomImage =
    !!imageUrl && imageUrl !== RECIPE_PLACEHOLDER_IMAGE && !imageUrl.includes('placehold.co');

  return {
    title: api.title,
    description: api.description,
    photo: null,
    photoPreview: hasCustomImage ? imageUrl : null,
    servings: api.servings,
    recipeType: api.recipeType.id,
    difficulty: api.difficulty,
    equipment: [],
    time: {
      preparationMinutes: api.prepMinutes,
      cookingMinutes: api.cookMinutes,
      restMinutes: api.restMinutes,
    },
    ingredients: [],
    steps: [],
  };
}
