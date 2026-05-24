import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import type {
  CreateRecipePayload,
  RecipeApiResponse,
  RecipeTypeSummary,
} from '@core/models/recipe-api.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RecipeApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getRecipes(): Observable<RecipeApiResponse[]> {
    return this.http.get<RecipeApiResponse[]>(`${this.baseUrl}/recipes`);
  }

  getRecipeById(id: string): Observable<RecipeApiResponse> {
    return this.http.get<RecipeApiResponse>(`${this.baseUrl}/recipes/${id}`);
  }

  getRecipeTypes(): Observable<RecipeTypeSummary[]> {
    return this.http.get<RecipeTypeSummary[]>(`${this.baseUrl}/recipes/types`);
  }

  createRecipe(payload: CreateRecipePayload): Observable<RecipeApiResponse> {
    return this.http.post<RecipeApiResponse>(`${this.baseUrl}/recipes`, payload);
  }

  updateRecipe(
    id: string,
    payload: CreateRecipePayload,
  ): Observable<RecipeApiResponse> {
    return this.http.patch<RecipeApiResponse>(
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
}
