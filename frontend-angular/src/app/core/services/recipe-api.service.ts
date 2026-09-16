import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import type {
  CreateRecipePayload,
  EquipmentSummary,
  RecipeApiResponse,
  RecipeDetailApiResponse,
  RecipeTypeSummary,
} from '@core/models/recipe-api.model';
import type { RecipeComment } from '@core/models/recipe-comment.model';
import type { RecipeListQuery } from '@core/models/recipe-list-query.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RecipeApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getRecipes(options: RecipeListQuery = {}): Observable<RecipeApiResponse[]> {
    const params: Record<string, string> = {};
    if (options.favoritesOnly) {
      params['favorites'] = 'true';
    }
    if (options.mineOnly) {
      params['mine'] = 'true';
    }
    if (options.sort) {
      params['sort'] = options.sort;
    }
    if (options.difficulties?.length) {
      params['difficulty'] = options.difficulties.join(',');
    }
    if (options.maxTotalMinutes != null) {
      params['maxTotalMinutes'] = String(options.maxTotalMinutes);
    }
    if (options.minTotalMinutes != null) {
      params['minTotalMinutes'] = String(options.minTotalMinutes);
    }
    if (options.minRating != null) {
      params['minRating'] = String(options.minRating);
    }
    return this.http.get<RecipeApiResponse[]>(`${this.baseUrl}/recipes`, {
      params,
    });
  }

  getPendingRecipes(): Observable<RecipeApiResponse[]> {
    return this.http.get<RecipeApiResponse[]>(`${this.baseUrl}/recipes`, {
      params: { pending: 'true' },
    });
  }

  getRecipeById(id: string): Observable<RecipeDetailApiResponse> {
    return this.http.get<RecipeDetailApiResponse>(`${this.baseUrl}/recipes/${id}`);
  }

  getRecipeTypes(): Observable<RecipeTypeSummary[]> {
    return this.http.get<RecipeTypeSummary[]>(`${this.baseUrl}/recipes/types`);
  }

  getEquipment(): Observable<EquipmentSummary[]> {
    return this.http.get<EquipmentSummary[]>(`${this.baseUrl}/recipes/equipment`);
  }

  createRecipe(payload: CreateRecipePayload): Observable<RecipeDetailApiResponse> {
    return this.http.post<RecipeDetailApiResponse>(`${this.baseUrl}/recipes`, payload);
  }

  updateRecipe(
    id: string,
    payload: CreateRecipePayload,
  ): Observable<RecipeDetailApiResponse> {
    return this.http.patch<RecipeDetailApiResponse>(
      `${this.baseUrl}/recipes/${id}`,
      payload,
    );
  }

  uploadRecipeImage(
    recipeId: string,
    file: File,
  ): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ imageUrl: string }>(
      `${this.baseUrl}/recipes/${recipeId}/image`,
      formData,
    );
  }

  deleteRecipe(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/recipes/${id}`);
  }

  approveRecipe(id: string): Observable<RecipeDetailApiResponse> {
    return this.http.post<RecipeDetailApiResponse>(
      `${this.baseUrl}/recipes/${id}/approve`,
      {},
    );
  }

  rejectRecipe(
    id: string,
    comment?: string,
  ): Observable<RecipeDetailApiResponse> {
    return this.http.post<RecipeDetailApiResponse>(
      `${this.baseUrl}/recipes/${id}/reject`,
      { comment },
    );
  }

  addRecipeFavorite(id: string): Observable<{ success: boolean; isFavorite: boolean }> {
    return this.http.post<{ success: boolean; isFavorite: boolean }>(
      `${this.baseUrl}/recipes/${id}/favorite`,
      {},
    );
  }

  removeRecipeFavorite(id: string): Observable<{ success: boolean; isFavorite: boolean }> {
    return this.http.delete<{ success: boolean; isFavorite: boolean }>(
      `${this.baseUrl}/recipes/${id}/favorite`,
    );
  }

  reorderRecipeFavorites(
    recipeIds: string[],
  ): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(
      `${this.baseUrl}/recipes/favorites/order`,
      { recipeIds },
    );
  }

  markRecipeCompleted(id: string): Observable<{ success: boolean; hasCompleted: boolean }> {
    return this.http.post<{ success: boolean; hasCompleted: boolean }>(
      `${this.baseUrl}/recipes/${id}/completed`,
      {},
    );
  }

  setRecipeRating(
    id: string,
    rating: number,
  ): Observable<{
    success: boolean;
    userRating: number;
    averageRating: number | null;
    ratingCount: number;
  }> {
    return this.http.put<{
      success: boolean;
      userRating: number;
      averageRating: number | null;
      ratingCount: number;
    }>(`${this.baseUrl}/recipes/${id}/rating`, { rating });
  }

  getRecipeComments(id: string): Observable<{ comments: RecipeComment[] }> {
    return this.http.get<{ comments: RecipeComment[] }>(
      `${this.baseUrl}/recipes/${id}/comments`,
    );
  }

  setRecipeComment(
    id: string,
    comment: string,
  ): Observable<{ success: boolean; userComment: string | null }> {
    return this.http.put<{ success: boolean; userComment: string | null }>(
      `${this.baseUrl}/recipes/${id}/comment`,
      { comment },
    );
  }
}
