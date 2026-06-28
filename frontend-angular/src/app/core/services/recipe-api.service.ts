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
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RecipeApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getRecipes(favoritesOnly = false): Observable<RecipeApiResponse[]> {
    const params = favoritesOnly ? { favorites: 'true' } : undefined;
    return this.http.get<RecipeApiResponse[]>(`${this.baseUrl}/recipes`, {
      params,
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
}
