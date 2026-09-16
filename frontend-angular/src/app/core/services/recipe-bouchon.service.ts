import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';

import { BOUCHON_RECIPES } from '@core/data/bouchon-library.data';
import { BOUCHON_RECIPE_DETAILS_TARTE_AUX_POMMES } from '@core/data/bouchon-recipe-details.data';
import type { RecipeDetail } from '@core/models/recipe-detail.model';
import type { RecipeListItem } from '@core/models/recipe-list-item.model';
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

  getRecipes(favoritesOnly = false): Observable<RecipeListItem[]> {
    const itemsById = new Map(
      BOUCHON_RECIPES.map(mapBouchonToListItem).map((item) => [
        item.id,
        {
          ...item,
          isFavorited: this.favoriteOrder.includes(item.id),
        },
      ]),
    );

    if (favoritesOnly) {
      const items = this.favoriteOrder
        .map((id) => itemsById.get(id))
        .filter((item) => item != null);
      return of(items).pipe(delay(this.mockDelayMs));
    }

    return of([...itemsById.values()]).pipe(delay(this.mockDelayMs));
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

  getRecipeById(id: string): Observable<RecipeDetail> {
    if (id === BOUCHON_RECIPE_DETAILS_TARTE_AUX_POMMES.id) {
      return of({
        ...mapBouchonDetailToView(BOUCHON_RECIPE_DETAILS_TARTE_AUX_POMMES),
        isFavorited: this.isFavorite(id),
      }).pipe(delay(this.mockDelayMs));
    }

    const fromList = BOUCHON_RECIPES.find((r) => r.id === id);
    if (!fromList) {
      return throwError(() => new Error('NOT_FOUND'));
    }

    return of({
      ...mapBouchonListItemToMinimalDetail(fromList),
      isFavorited: this.isFavorite(id),
    }).pipe(delay(this.mockDelayMs));
  }
}
