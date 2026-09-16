import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';

import { BOUCHON_RECIPES } from '@core/data/bouchon-library.data';
import { BOUCHON_RECIPE_DETAILS_TARTE_AUX_POMMES } from '@core/data/bouchon-recipe-details.data';
import type { RecipeComment } from '@core/models/recipe-comment.model';
import type { RecipeDetail } from '@core/models/recipe-detail.model';
import type { RecipeListItem } from '@core/models/recipe-list-item.model';
import type { RecipeListQuery } from '@core/models/recipe-list-query.model';
import {
  mapBouchonDetailToView,
  mapBouchonListItemToMinimalDetail,
  mapBouchonToListItem,
} from '@core/utils/recipe-bouchon.mapper';

/**
 * Données bouchon — utilisé uniquement si `environment.useMockData === true`.
 * Fichiers sources conservés dans `core/data/bouchon-*.ts`.
 */
@Injectable({ providedIn: 'root' })
export class RecipeBouchonService {
  private readonly mockDelayMs = 200;
  private readonly favoriteOrder: string[] = [];
  private readonly completedRecipeIds = new Set<string>();
  private readonly ratings = new Map<string, number>();
  private readonly comments = new Map<string, RecipeComment>();

  getRecipes(options: RecipeListQuery = {}): Observable<RecipeListItem[]> {
    const itemsById = new Map(
      BOUCHON_RECIPES.map(mapBouchonToListItem).map((item) => [
        item.id,
        this.withMockStats({
          ...item,
          isFavorited: this.favoriteOrder.includes(item.id),
        }),
      ]),
    );

    let items = options.favoritesOnly
      ? this.favoriteOrder
          .map((id) => itemsById.get(id))
          .filter((item) => item != null)
      : [...itemsById.values()];

    if (!options.favoritesOnly && !options.mineOnly) {
      items = this.applyListQuery(items, options);
    }

    return of(items).pipe(delay(this.mockDelayMs));
  }

  private isFavorite(id: string): boolean {
    return this.favoriteOrder.includes(id);
  }

  setRecipeFavorite(id: string, favorited: boolean): Observable<void> {
    if (favorited) {
      if (!this.favoriteOrder.includes(id)) {
        this.favoriteOrder.push(id);
      }
    } else {
      const index = this.favoriteOrder.indexOf(id);
      if (index >= 0) {
        this.favoriteOrder.splice(index, 1);
      }
    }
    return of(undefined).pipe(delay(this.mockDelayMs));
  }

  reorderRecipeFavorites(recipeIds: string[]): Observable<void> {
    const allowed = new Set(this.favoriteOrder);
    if (
      recipeIds.length !== this.favoriteOrder.length ||
      recipeIds.some((id) => !allowed.has(id))
    ) {
      return throwError(() => new Error('INVALID_FAVORITE_ORDER'));
    }
    this.favoriteOrder.splice(0, this.favoriteOrder.length, ...recipeIds);
    return of(undefined).pipe(delay(this.mockDelayMs));
  }

  markRecipeCompleted(id: string): Observable<void> {
    this.completedRecipeIds.add(id);
    return of(undefined).pipe(delay(this.mockDelayMs));
  }

  getRecipeComments(id: string): Observable<RecipeComment[]> {
    const comment = this.comments.get(id);
    return of(comment ? [comment] : []).pipe(delay(this.mockDelayMs));
  }

  setRecipeComment(id: string, comment: string): Observable<string | null> {
    if (!this.completedRecipeIds.has(id)) {
      return throwError(() => new Error('NOT_COMPLETED'));
    }

    const trimmed = comment.trim();
    if (!trimmed) {
      this.comments.delete(id);
      return of(null).pipe(delay(this.mockDelayMs));
    }

    const entry: RecipeComment = {
      userId: 'mock-user',
      authorName: 'Vous',
      comment: trimmed,
      updatedAt: new Date().toISOString(),
    };
    this.comments.set(id, entry);
    return of(trimmed).pipe(delay(this.mockDelayMs));
  }

  setRecipeRating(
    id: string,
    rating: number,
  ): Observable<{
    userRating: number;
    averageRating: number | null;
    ratingCount: number;
  }> {
    if (!this.completedRecipeIds.has(id)) {
      return throwError(() => new Error('NOT_COMPLETED'));
    }
    this.ratings.set(id, rating);
    return of({
      userRating: rating,
      averageRating: rating,
      ratingCount: 1,
    }).pipe(delay(this.mockDelayMs));
  }

  getRecipeById(id: string): Observable<RecipeDetail> {
    if (id === BOUCHON_RECIPE_DETAILS_TARTE_AUX_POMMES.id) {
      const detail = {
        ...mapBouchonDetailToView(BOUCHON_RECIPE_DETAILS_TARTE_AUX_POMMES),
        isFavorited: this.isFavorite(id),
        hasCompleted: this.completedRecipeIds.has(id),
        userRating: this.ratings.get(id) ?? null,
        userComment: this.comments.get(id)?.comment ?? null,
        averageRating: this.ratings.get(id) ?? null,
        ratingCount: this.ratings.has(id) ? 1 : 0,
        favoriteCount: this.favoriteOrder.includes(id) ? 1 : 0,
      };
      return of(detail).pipe(delay(this.mockDelayMs));
    }

    const fromList = BOUCHON_RECIPES.find((r) => r.id === id);
    if (!fromList) {
      return throwError(() => new Error('NOT_FOUND'));
    }

    return of({
      ...mapBouchonListItemToMinimalDetail(fromList),
      isFavorited: this.isFavorite(id),
      hasCompleted: this.completedRecipeIds.has(id),
      userRating: this.ratings.get(id) ?? null,
      userComment: this.comments.get(id)?.comment ?? null,
      averageRating: this.ratings.get(id) ?? null,
      ratingCount: this.ratings.has(id) ? 1 : 0,
      favoriteCount: this.favoriteOrder.includes(id) ? 1 : 0,
    }).pipe(delay(this.mockDelayMs));
  }

  private withMockStats(item: RecipeListItem): RecipeListItem {
    const userRating = this.ratings.get(item.id) ?? null;
    return {
      ...item,
      averageRating: userRating,
      ratingCount: userRating != null ? 1 : 0,
      favoriteCount: this.favoriteOrder.includes(item.id) ? 1 : 0,
    };
  }

  private applyListQuery(
    items: RecipeListItem[],
    options: RecipeListQuery,
  ): RecipeListItem[] {
    let next = items.filter((item) => {
      if (
        options.difficulties?.length &&
        !options.difficulties.includes(item.difficulty)
      ) {
        return false;
      }
      if (
        options.maxTotalMinutes != null &&
        item.totalTimeMinutes > options.maxTotalMinutes
      ) {
        return false;
      }
      if (
        options.minTotalMinutes != null &&
        item.totalTimeMinutes < options.minTotalMinutes
      ) {
        return false;
      }
      if (options.minRating != null) {
        if (
          (item.ratingCount ?? 0) === 0 ||
          item.averageRating == null ||
          item.averageRating < options.minRating
        ) {
          return false;
        }
      }
      return true;
    });

    next = [...next].sort((left, right) => {
      switch (options.sort) {
        case 'oldest':
          return left.createdAt.localeCompare(right.createdAt);
        case 'popular':
          return (right.favoriteCount ?? 0) - (left.favoriteCount ?? 0);
        case 'best_rated':
          return (
            (right.averageRating ?? -1) - (left.averageRating ?? -1) ||
            (right.ratingCount ?? 0) - (left.ratingCount ?? 0)
          );
        case 'quickest':
          return left.totalTimeMinutes - right.totalTimeMinutes;
        case 'title_asc':
          return left.title.localeCompare(right.title, 'fr', { sensitivity: 'base' });
        case 'newest':
        default:
          return right.createdAt.localeCompare(left.createdAt);
      }
    });

    return next;
  }
}
