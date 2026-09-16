import type { RecipeDifficulty } from '@core/models/recipe-api.model';
import type { RecipeListSort } from '@core/models/recipe-list-query.model';

export interface LibraryAdvancedFiltersState {
  sort: RecipeListSort;
  difficulties: RecipeDifficulty[];
  timePreset: 'all' | 'under_30' | 'under_60' | 'over_60';
  minRating: number | null;
}

export const DEFAULT_LIBRARY_ADVANCED_FILTERS: LibraryAdvancedFiltersState = {
  sort: 'newest',
  difficulties: [],
  timePreset: 'all',
  minRating: null,
};

export function libraryAdvancedFiltersCount(
  filters: LibraryAdvancedFiltersState,
): number {
  let count = 0;
  if (filters.sort !== 'newest') count += 1;
  if (filters.difficulties.length > 0) count += 1;
  if (filters.timePreset !== 'all') count += 1;
  if (filters.minRating != null) count += 1;
  return count;
}

export function libraryAdvancedFiltersToQuery(
  filters: LibraryAdvancedFiltersState,
): Record<string, string> {
  const params: Record<string, string> = {};
  if (filters.sort !== 'newest') {
    params['sort'] = filters.sort;
  }
  if (filters.difficulties.length > 0) {
    params['difficulty'] = filters.difficulties.join(',');
  }
  if (filters.timePreset === 'under_30') {
    params['maxTotalMinutes'] = '30';
  } else if (filters.timePreset === 'under_60') {
    params['maxTotalMinutes'] = '60';
  } else if (filters.timePreset === 'over_60') {
    params['minTotalMinutes'] = '60';
  }
  if (filters.minRating != null) {
    params['minRating'] = String(filters.minRating);
  }
  return params;
}

export function parseLibraryAdvancedFiltersFromParams(
  params: Record<string, string | undefined>,
): LibraryAdvancedFiltersState {
  const sort = (params['sort'] as RecipeListSort | undefined) ?? 'newest';
  const difficulties = (params['difficulty'] ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter((value): value is RecipeDifficulty =>
      value === 'facile' || value === 'moyen' || value === 'difficile',
    );

  let timePreset: LibraryAdvancedFiltersState['timePreset'] = 'all';
  if (params['maxTotalMinutes'] === '30') {
    timePreset = 'under_30';
  } else if (params['maxTotalMinutes'] === '60') {
    timePreset = 'under_60';
  } else if (params['minTotalMinutes'] === '60') {
    timePreset = 'over_60';
  }

  const minRatingRaw = params['minRating'];
  const minRating =
    minRatingRaw != null && minRatingRaw !== '' ? Number(minRatingRaw) : null;

  return {
    sort,
    difficulties,
    timePreset,
    minRating: Number.isFinite(minRating) ? minRating : null,
  };
}

export function libraryAdvancedFiltersToListQuery(
  filters: LibraryAdvancedFiltersState,
) {
  return {
    sort: filters.sort,
    difficulties: filters.difficulties,
    maxTotalMinutes:
      filters.timePreset === 'under_30'
        ? 30
        : filters.timePreset === 'under_60'
          ? 60
          : undefined,
    minTotalMinutes: filters.timePreset === 'over_60' ? 60 : undefined,
    minRating: filters.minRating ?? undefined,
  };
}
