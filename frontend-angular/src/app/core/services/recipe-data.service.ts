import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';

import type { RecipeDetail } from '@core/models/recipe-detail.model';
import type { RecipeListItem } from '@core/models/recipe-list-item.model';
import { mapRecipeToDetail, mapRecipeToListItem } from '@core/utils/recipe.mapper';

import { environment } from '../../../environments/environment';
import { RecipeApiService } from './recipe-api.service';
import { RecipeBouchonService } from './recipe-bouchon.service';

/**
 * Point d'entrée unique pour les recettes.
 * Bascule bouchon / API selon `environment.useMockData`.
 */
@Injectable({ providedIn: 'root' })
export class RecipeDataService {
  private readonly bouchon = inject(RecipeBouchonService);
  private readonly api = inject(RecipeApiService);

  getRecipes(favoritesOnly = false): Observable<RecipeListItem[]> {
    if (environment.useMockData) {
      return this.bouchon.getRecipes(favoritesOnly);
    }
    return this.api
      .getRecipes(favoritesOnly)
      .pipe(map((items) => items.map(mapRecipeToListItem)));
  }

  getRecipeById(id: string): Observable<RecipeDetail> {
    if (environment.useMockData) {
      return this.bouchon.getRecipeById(id);
    }
    return this.api.getRecipeById(id).pipe(
      map(mapRecipeToDetail),
      catchError((err: unknown) => {
        if (err instanceof HttpErrorResponse && err.status === 404) {
          return throwError(() => new Error('NOT_FOUND'));
        }
        return throwError(() => err);
      }),
    );
  }

  deleteRecipe(id: string): Observable<void> {
    if (environment.useMockData) {
      return throwError(() => new Error('MOCK_DELETE_UNSUPPORTED'));
    }
    return this.api.deleteRecipe(id);
  }

  setRecipeFavorite(id: string, favorited: boolean): Observable<void> {
    if (environment.useMockData) {
      return this.bouchon.setRecipeFavorite(id, favorited);
    }
    const request$ = favorited
      ? this.api.addRecipeFavorite(id)
      : this.api.removeRecipeFavorite(id);
    return request$.pipe(map(() => undefined));
  }
}
