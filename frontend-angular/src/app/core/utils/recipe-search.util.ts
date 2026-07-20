import type { RecipeListItem } from '@core/models/recipe-list-item.model';

/** Normalise une chaîne pour la recherche : minuscules + sans accents. */
export function normalizeForSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '');
}

export function filterRecipesByTitle(
  recipes: RecipeListItem[],
  query: string,
): RecipeListItem[] {
  const normalizedQuery = normalizeForSearch(query.trim());
  if (!normalizedQuery) {
    return recipes;
  }
  return recipes.filter((recipe) =>
    normalizeForSearch(recipe.title).includes(normalizedQuery),
  );
}

export function filterRecipesByType(
  recipes: RecipeListItem[],
  recipeTypeId: string | null,
): RecipeListItem[] {
  if (!recipeTypeId) {
    return recipes;
  }
  return recipes.filter((recipe) => recipe.recipeTypeId === recipeTypeId);
}
