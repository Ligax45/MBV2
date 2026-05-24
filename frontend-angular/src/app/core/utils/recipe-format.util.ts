import type { RecipeDifficulty } from '@core/models/recipe-api.model';
import type { RecipeIngredient } from '@core/models/recipe-ingredient.model';

export function formatMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `${hours} h ${remainder} min` : `${hours} h`;
}

export function formatDateFr(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function getDifficultyLabel(difficulty: RecipeDifficulty): string {
  const labels: Record<RecipeDifficulty, string> = {
    facile: 'Facile',
    moyen: 'Moyen',
    difficile: 'Difficile',
  };
  return labels[difficulty];
}

export type DifficultySeverity = 'success' | 'warn' | 'danger';

export function getDifficultySeverity(
  difficulty: RecipeDifficulty,
): DifficultySeverity {
  const severities: Record<RecipeDifficulty, DifficultySeverity> = {
    facile: 'success',
    moyen: 'warn',
    difficile: 'danger',
  };
  return severities[difficulty];
}

export function formatIngredientLine(ingredient: RecipeIngredient): string {
  const quantity = ingredient.quantity ? `${ingredient.quantity} ` : '';
  const unit = ingredient.unit ? `${ingredient.unit} ` : '';
  return `${quantity}${unit}${ingredient.name}`.trim();
}
