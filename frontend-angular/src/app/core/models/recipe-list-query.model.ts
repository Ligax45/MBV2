import type { RecipeDifficulty } from './recipe-api.model';

export type RecipeListSort =
  | 'newest'
  | 'oldest'
  | 'popular'
  | 'best_rated'
  | 'quickest'
  | 'title_asc';

export interface RecipeListQuery {
  favoritesOnly?: boolean;
  mineOnly?: boolean;
  sort?: RecipeListSort;
  difficulties?: RecipeDifficulty[];
  maxTotalMinutes?: number;
  minTotalMinutes?: number;
  minRating?: number;
}
