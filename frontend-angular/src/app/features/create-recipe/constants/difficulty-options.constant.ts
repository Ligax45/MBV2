import type { RecipeDifficulty } from '@core/models/recipe-api.model';

export const DIFFICULTY_OPTIONS: readonly {
  value: RecipeDifficulty;
  label: string;
}[] = [
  { value: 'facile', label: 'Facile' },
  { value: 'moyen', label: 'Moyen' },
  { value: 'difficile', label: 'Difficile' },
] as const;
