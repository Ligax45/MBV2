import {
  RECIPE_PLACEHOLDER_IMAGE,
  UNKNOWN_AUTHOR_LABEL,
} from '@core/constants/recipe.constants';
import type { RecipeDetail } from '@core/models/recipe-detail.model';
import type { RecipeDetailApiResponse } from '@core/models/recipe-api.model';
import type { RecipeApiResponse } from '@core/models/recipe-api.model';
import type { RecipeListItem } from '@core/models/recipe-list-item.model';

function resolveCreatorName(authorName: string | null | undefined): string {
  const trimmed = authorName?.trim();
  if (!trimmed) {
    return UNKNOWN_AUTHOR_LABEL;
  }
  return trimmed;
}

export function resolveRecipeImageUrl(
  imageUrl: string | null | undefined,
  cacheKey?: string,
): string {
  const trimmed = imageUrl?.trim();
  if (!trimmed) {
    return RECIPE_PLACEHOLDER_IMAGE;
  }
  if (!cacheKey || trimmed.includes('placehold.co')) {
    return trimmed;
  }
  const separator = trimmed.includes('?') ? '&' : '?';
  return `${trimmed}${separator}v=${encodeURIComponent(cacheKey)}`;
}

export function mapRecipeToListItem(api: RecipeApiResponse): RecipeListItem {
  return {
    id: api.id,
    title: api.title,
    description: api.description,
    imageUrl: resolveRecipeImageUrl(api.imageUrl, api.updatedAt),
    totalTimeMinutes: api.prepMinutes + api.cookMinutes + api.restMinutes,
    createdAt: api.createdAt,
    difficulty: api.difficulty,
    creatorName: resolveCreatorName(api.authorName),
    recipeTypeLabel: api.recipeType.label,
    isFavorited: api.isFavorite ?? false,
  };
}

export function mapRecipeToDetail(api: RecipeDetailApiResponse): RecipeDetail {
  return {
    id: api.id,
    title: api.title,
    description: api.description,
    imageUrl: resolveRecipeImageUrl(api.imageUrl, api.updatedAt),
    createdAt: api.createdAt,
    difficulty: api.difficulty,
    creatorName: resolveCreatorName(api.authorName),
    authorUserId: api.authorUserId,
    servings: api.servings,
    recipeTypeLabel: api.recipeType.label,
    prepMinutes: api.prepMinutes,
    cookMinutes: api.cookMinutes,
    restMinutes: api.restMinutes,
    equipmentLabels: api.equipment.map((item) => item.label),
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
    isFavorited: api.isFavorite ?? false,
  };
}
