import type { BouchonRecipe } from '@core/data/bouchon-library.data';
import type { BouchonRecipeDetail } from '@core/data/bouchon-recipe-details.data';
import { getEquipmentLabels } from '@core/data/bouchon-equipment.data';
import { getRecipeTypeLabel } from '@core/data/bouchon-recipe-types.data';
import type { RecipeDetail } from '@core/models/recipe-detail.model';
import type { RecipeListItem } from '@core/models/recipe-list-item.model';

export function mapBouchonToListItem(recipe: BouchonRecipe): RecipeListItem {
  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    imageUrl: recipe.imageUrl,
    totalTimeMinutes: recipe.preparationTimeMinutes,
    createdAt: recipe.createdAt,
    difficulty: recipe.difficulty,
    creatorName: recipe.creatorName,
    recipeTypeLabel: getRecipeTypeLabel('autres'),
  };
}

export function mapBouchonDetailToView(detail: BouchonRecipeDetail): RecipeDetail {
  return {
    id: detail.id,
    title: detail.title,
    description: detail.description,
    imageUrl: detail.imageUrl,
    createdAt: detail.createdAt,
    difficulty: detail.difficulty,
    creatorName: detail.creatorName,
    authorUserId: null,
    servings: detail.servings,
    recipeTypeLabel: getRecipeTypeLabel(detail.recipeType),
    prepMinutes: detail.prepMinutes,
    cookMinutes: detail.cookMinutes,
    restMinutes: detail.restMinutes,
    equipmentLabels: getEquipmentLabels(detail.equipment),
    ingredients: detail.ingredients,
    steps: [...detail.steps].sort((a, b) => a.order - b.order),
  };
}

export function mapBouchonListItemToMinimalDetail(
  recipe: BouchonRecipe,
): RecipeDetail {
  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    imageUrl: recipe.imageUrl,
    createdAt: recipe.createdAt,
    difficulty: recipe.difficulty,
    creatorName: recipe.creatorName,
    authorUserId: null,
    servings: 2,
    recipeTypeLabel: getRecipeTypeLabel('autres'),
    prepMinutes: recipe.preparationTimeMinutes,
    cookMinutes: 0,
    restMinutes: 0,
    equipmentLabels: [],
    ingredients: [],
    steps: [],
  };
}
