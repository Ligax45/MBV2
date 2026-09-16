import { BadRequestException } from '@nestjs/common';
import type { Recipe } from '../domain/entities/recipe.entity';

export type RecipeListSort =
  | 'newest'
  | 'oldest'
  | 'popular'
  | 'best_rated'
  | 'quickest'
  | 'title_asc';

export interface RecipeListItemStats {
  favoriteCount: number;
  averageRating: number | null;
  ratingCount: number;
}

export interface ParsedRecipeListQuery {
  sort: RecipeListSort;
  difficulties: Array<'facile' | 'moyen' | 'difficile'>;
  maxTotalMinutes?: number;
  minTotalMinutes?: number;
  minRating?: number;
}

const VALID_SORTS = new Set<RecipeListSort>([
  'newest',
  'oldest',
  'popular',
  'best_rated',
  'quickest',
  'title_asc',
]);

const VALID_DIFFICULTIES = new Set(['facile', 'moyen', 'difficile']);

export function parseRecipeListQuery(input: {
  sort?: string;
  difficulty?: string;
  maxTotalMinutes?: string;
  minTotalMinutes?: string;
  minRating?: string;
}): ParsedRecipeListQuery {
  const sort = (input.sort?.trim() || 'newest') as RecipeListSort;
  if (!VALID_SORTS.has(sort)) {
    throw new BadRequestException('Paramètre sort invalide');
  }

  const difficulties = (input.difficulty ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean) as Array<'facile' | 'moyen' | 'difficile'>;

  for (const difficulty of difficulties) {
    if (!VALID_DIFFICULTIES.has(difficulty)) {
      throw new BadRequestException('Paramètre difficulty invalide');
    }
  }

  const maxTotalMinutes = parseOptionalPositiveInt(input.maxTotalMinutes);
  const minTotalMinutes = parseOptionalPositiveInt(input.minTotalMinutes);
  const minRating = parseOptionalRating(input.minRating);

  return {
    sort,
    difficulties,
    maxTotalMinutes,
    minTotalMinutes,
    minRating,
  };
}

export function getRecipeTotalMinutes(recipe: Recipe): number {
  return recipe.prepMinutes + recipe.cookMinutes + recipe.restMinutes;
}

export function applyRecipeListQuery<T extends { recipe: Recipe }>(
  items: Array<T & RecipeListItemStats>,
  query: ParsedRecipeListQuery,
): Array<T & RecipeListItemStats> {
  let next = items.filter((item) => {
    if (
      query.difficulties.length > 0 &&
      !query.difficulties.includes(item.recipe.difficulty)
    ) {
      return false;
    }

    const totalMinutes = getRecipeTotalMinutes(item.recipe);
    if (
      query.maxTotalMinutes != null &&
      totalMinutes > query.maxTotalMinutes
    ) {
      return false;
    }
    if (
      query.minTotalMinutes != null &&
      totalMinutes < query.minTotalMinutes
    ) {
      return false;
    }
    if (query.minRating != null) {
      if (
        item.ratingCount === 0 ||
        item.averageRating == null ||
        item.averageRating < query.minRating
      ) {
        return false;
      }
    }
    return true;
  });

  next = [...next].sort((left, right) => compareRecipeListItems(left, right, query.sort));
  return next;
}

function compareRecipeListItems<T extends { recipe: Recipe }>(
  left: T & RecipeListItemStats,
  right: T & RecipeListItemStats,
  sort: RecipeListSort,
): number {
  switch (sort) {
    case 'oldest':
      return left.recipe.createdAt.getTime() - right.recipe.createdAt.getTime();
    case 'popular':
      return (
        right.favoriteCount - left.favoriteCount ||
        right.recipe.createdAt.getTime() - left.recipe.createdAt.getTime()
      );
    case 'best_rated':
      return (
        (right.averageRating ?? -1) - (left.averageRating ?? -1) ||
        right.ratingCount - left.ratingCount ||
        right.recipe.createdAt.getTime() - left.recipe.createdAt.getTime()
      );
    case 'quickest':
      return (
        getRecipeTotalMinutes(left.recipe) - getRecipeTotalMinutes(right.recipe)
      );
    case 'title_asc':
      return left.recipe.title.localeCompare(right.recipe.title, 'fr', {
        sensitivity: 'base',
      });
    case 'newest':
    default:
      return right.recipe.createdAt.getTime() - left.recipe.createdAt.getTime();
  }
}

function parseOptionalPositiveInt(value?: string): number | undefined {
  if (!value?.trim()) {
    return undefined;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new BadRequestException('Paramètre numérique invalide');
  }
  return parsed;
}

function parseOptionalRating(value?: string): number | undefined {
  if (!value?.trim()) {
    return undefined;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0.5 || parsed > 5) {
    throw new BadRequestException('Paramètre minRating invalide');
  }
  if (Math.abs(parsed * 2 - Math.round(parsed * 2)) > 0.001) {
    throw new BadRequestException('Paramètre minRating invalide');
  }
  return parsed;
}
