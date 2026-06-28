import type { Recipe } from '../domain/entities/recipe.entity';

interface RecipeResponseOptions {
  isFavorite?: boolean;
}

export function toRecipeResponse(
  recipe: Recipe,
  options: RecipeResponseOptions = {},
) {
  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    imageUrl: recipe.imageUrl,
    difficulty: recipe.difficulty,
    servings: recipe.servings,
    recipeType: recipe.recipeType,
    authorUserId: recipe.authorUserId,
    authorName: recipe.authorName,
    prepMinutes: recipe.prepMinutes,
    cookMinutes: recipe.cookMinutes,
    restMinutes: recipe.restMinutes,
    createdAt: recipe.createdAt.toISOString(),
    updatedAt: recipe.updatedAt.toISOString(),
    ingredients: recipe.ingredients.map((ingredient) => ({
      id: ingredient.id,
      position: ingredient.position,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      name: ingredient.name,
    })),
    steps: recipe.steps.map((step) => ({
      id: step.id,
      order: step.order,
      content: step.content,
    })),
    equipment: recipe.equipment.map((item) => ({
      id: item.id,
      label: item.label,
    })),
    isFavorite: options.isFavorite ?? false,
  };
}

export function toRecipeListItemResponse(
  recipe: Recipe,
  options: RecipeResponseOptions = {},
) {
  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    imageUrl: recipe.imageUrl,
    difficulty: recipe.difficulty,
    servings: recipe.servings,
    recipeType: recipe.recipeType,
    authorUserId: recipe.authorUserId,
    authorName: recipe.authorName,
    prepMinutes: recipe.prepMinutes,
    cookMinutes: recipe.cookMinutes,
    restMinutes: recipe.restMinutes,
    createdAt: recipe.createdAt.toISOString(),
    updatedAt: recipe.updatedAt.toISOString(),
    isFavorite: options.isFavorite ?? false,
  };
}
