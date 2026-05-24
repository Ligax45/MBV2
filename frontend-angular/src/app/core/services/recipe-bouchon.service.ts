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

  getRecipes(): Observable<RecipeListItem[]> {
    const items = BOUCHON_RECIPES.map(mapBouchonToListItem);
    return of(items).pipe(delay(this.mockDelayMs));
  }

  getRecipeById(id: string): Observable<RecipeDetail> {
    if (id === BOUCHON_RECIPE_DETAILS_TARTE_AUX_POMMES.id) {
      return of(mapBouchonDetailToView(BOUCHON_RECIPE_DETAILS_TARTE_AUX_POMMES)).pipe(
        delay(this.mockDelayMs),
      );
    }

    const fromList = BOUCHON_RECIPES.find((r) => r.id === id);
    if (!fromList) {
      return throwError(() => new Error('NOT_FOUND'));
    }

    return of(mapBouchonListItemToMinimalDetail(fromList)).pipe(
      delay(this.mockDelayMs),
    );
  }
}
