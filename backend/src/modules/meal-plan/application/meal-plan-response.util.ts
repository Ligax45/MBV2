import type { Recipe } from '../../recipe/domain/entities/recipe.entity';
import type { MealPlanEntry } from '../domain/entities/meal-plan-entry.entity';

export function toMealPlanRecipeSummary(recipe: Recipe) {
  return {
    id: recipe.id,
    title: recipe.title,
    imageUrl: recipe.imageUrl,
    totalTimeMinutes:
      recipe.prepMinutes + recipe.cookMinutes + recipe.restMinutes,
    difficulty: recipe.difficulty,
  };
}

export function toMealPlanEntryResponse(entry: MealPlanEntry) {
  return {
    date: entry.planDate,
    recipe: toMealPlanRecipeSummary(entry.recipe),
  };
}

export function toMealPlanWeekResponse(
  weekStart: string,
  weekEnd: string,
  entries: MealPlanEntry[],
) {
  return {
    weekStart,
    weekEnd,
    entries: entries.map(toMealPlanEntryResponse),
  };
}
