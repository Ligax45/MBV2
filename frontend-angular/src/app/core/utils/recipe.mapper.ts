import {
  RECIPE_PLACEHOLDER_IMAGE,
  UNKNOWN_AUTHOR_LABEL,
} from '@core/constants/recipe.constants';
import type { RecipeDetail } from '@core/models/recipe-detail.model';
import type { RecipeApiResponse } from '@core/models/recipe-api.model';
import type { RecipeListItem } from '@core/models/recipe-list-item.model';

function resolveCreatorName(authorUserId: string | null): string {
  if (!authorUserId) {
    return UNKNOWN_AUTHOR_LABEL;
  }
  return `Utilisateur ${authorUserId.slice(0, 8)}`;
}

function resolveImageUrl(imageUrl: string | null): string {
  return imageUrl?.trim() ? imageUrl : RECIPE_PLACEHOLDER_IMAGE;
}

export function mapRecipeToListItem(api: RecipeApiResponse): RecipeListItem {
  return {
    id: api.id,
    title: api.title,
    description: api.description,
    imageUrl: resolveImageUrl(api.imageUrl),
    totalTimeMinutes: api.prepMinutes + api.cookMinutes + api.restMinutes,
    createdAt: api.createdAt,
    difficulty: api.difficulty,
    creatorName: resolveCreatorName(api.authorUserId),
  };
}

export function mapRecipeToDetail(api: RecipeApiResponse): RecipeDetail {
  return {
    id: api.id,
    title: api.title,
    description: api.description,
    imageUrl: resolveImageUrl(api.imageUrl),
    createdAt: api.createdAt,
    difficulty: api.difficulty,
    creatorName: resolveCreatorName(api.authorUserId),
    servings: api.servings,
    recipeTypeLabel: api.recipeType.label,
    prepMinutes: api.prepMinutes,
    cookMinutes: api.cookMinutes,
    restMinutes: api.restMinutes,
    equipmentLabels: [],
    ingredients: [],
    steps: [],
  };
}
