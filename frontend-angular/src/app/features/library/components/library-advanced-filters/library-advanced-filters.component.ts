import { Component, input, model } from '@angular/core';

import type { RecipeDifficulty } from '@core/models/recipe-api.model';
import type { RecipeListSort } from '@core/models/recipe-list-query.model';

import type { LibraryAdvancedFiltersState } from '../../models/library-advanced-filters.model';

@Component({
  selector: 'app-library-advanced-filters',
  templateUrl: './library-advanced-filters.component.html',
  styleUrl: './library-advanced-filters.component.scss',
})
export class LibraryAdvancedFiltersComponent {
  readonly filters = model.required<LibraryAdvancedFiltersState>();
  readonly open = input(false);

  protected readonly sortOptions: Array<{ value: RecipeListSort; label: string }> = [
    { value: 'newest', label: 'Plus récentes' },
    { value: 'best_rated', label: 'Mieux notées' },
    { value: 'popular', label: 'Plus populaires' },
    { value: 'oldest', label: 'Plus anciennes' },
    { value: 'quickest', label: 'Plus rapides' },
    { value: 'title_asc', label: 'A → Z' },
  ];

  protected readonly difficultyOptions: Array<{ value: RecipeDifficulty; label: string }> = [
    { value: 'facile', label: 'Facile' },
    { value: 'moyen', label: 'Moyen' },
    { value: 'difficile', label: 'Difficile' },
  ];

  protected readonly timeOptions = [
    { value: 'all' as const, label: 'Tous' },
    { value: 'under_30' as const, label: '≤ 30 min' },
    { value: 'under_60' as const, label: '≤ 1 h' },
    { value: 'over_60' as const, label: '> 1 h' },
  ];

  protected readonly ratingOptions = [
    { value: null, label: 'Toutes' },
    { value: 3, label: '≥ 3' },
    { value: 3.5, label: '≥ 3,5' },
    { value: 4, label: '≥ 4' },
    { value: 4.5, label: '≥ 4,5' },
  ];

  protected setSort(sort: RecipeListSort): void {
    this.filters.update((current) => ({ ...current, sort }));
  }

  protected toggleDifficulty(difficulty: RecipeDifficulty): void {
    this.filters.update((current) => {
      const exists = current.difficulties.includes(difficulty);
      return {
        ...current,
        difficulties: exists
          ? current.difficulties.filter((item) => item !== difficulty)
          : [...current.difficulties, difficulty],
      };
    });
  }

  protected setTimePreset(
    timePreset: LibraryAdvancedFiltersState['timePreset'],
  ): void {
    this.filters.update((current) => ({ ...current, timePreset }));
  }

  protected setMinRating(minRating: number | null): void {
    this.filters.update((current) => ({ ...current, minRating }));
  }

  protected isDifficultyActive(difficulty: RecipeDifficulty): boolean {
    return this.filters().difficulties.includes(difficulty);
  }
}
