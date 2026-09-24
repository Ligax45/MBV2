import type {
  Recipe,
  RecipeIngredientSummary,
  RecipeStepSummary,
} from '../domain/entities/recipe.entity';

export function formatMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `${hours} h ${remainder} min` : `${hours} h`;
}

export function formatIngredientLine(ingredient: RecipeIngredientSummary): string {
  const quantity = ingredient.quantity ? `${ingredient.quantity} ` : '';
  const unit = ingredient.unit ? `${ingredient.unit} ` : '';
  return `${quantity}${unit}${ingredient.name}`.trim();
}

export function formatRecipeTimesLine(
  recipe: Pick<Recipe, 'prepMinutes' | 'cookMinutes' | 'restMinutes'>,
): string {
  const parts: string[] = [];
  if (recipe.prepMinutes > 0) {
    parts.push(`Préparation ${formatMinutes(recipe.prepMinutes)}`);
  }
  if (recipe.cookMinutes > 0) {
    parts.push(`Cuisson ${formatMinutes(recipe.cookMinutes)}`);
  }
  if (recipe.restMinutes > 0) {
    parts.push(`Repos ${formatMinutes(recipe.restMinutes)}`);
  }
  return parts.join(' · ');
}

export function formatStepLine(step: RecipeStepSummary): string {
  const title = step.title ? `${step.title} — ` : '';
  return `${title}${step.content}`;
}
