import type { Recipe } from '../domain/entities/recipe.entity';

interface RecipeResponseOptions {
  isFavorite?: boolean;
  hasCompleted?: boolean;
  userRating?: number | null;
  userComment?: string | null;
  averageRating?: number | null;
  ratingCount?: number;
  favoriteCount?: number;
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
      title: step.title,
      content: step.content,
    })),
    equipment: recipe.equipment.map((item) => ({
      id: item.id,
      label: item.label,
    })),
    isFavorite: options.isFavorite ?? false,
    hasCompleted: options.hasCompleted ?? false,
    userRating: options.userRating ?? null,
    userComment: options.userComment ?? null,
    averageRating: options.averageRating ?? null,
    ratingCount: options.ratingCount ?? 0,
    favoriteCount: options.favoriteCount ?? 0,
    visibility: recipe.visibility,
    moderationStatus: recipe.moderationStatus,
    moderationComment: recipe.moderationComment,
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
    averageRating: options.averageRating ?? null,
    ratingCount: options.ratingCount ?? 0,
    favoriteCount: options.favoriteCount ?? 0,
    visibility: recipe.visibility,
    moderationStatus: recipe.moderationStatus,
    moderationComment: recipe.moderationComment,
  };
}
