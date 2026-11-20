import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import type { MealPlanEntry, MealPlanWeek } from '@core/models/meal-plan.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MealPlanApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/meal-plan`;

  getWeek(weekStart: string): Observable<MealPlanWeek> {
    return this.http.get<MealPlanWeek>(this.baseUrl, {
      params: { weekStart },
    });
  }

  setEntry(date: string, recipeId: string): Observable<MealPlanEntry> {
    return this.http.put<MealPlanEntry>(`${this.baseUrl}/${date}`, {
      recipeId,
    });
  }

  removeEntry(date: string): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.baseUrl}/${date}`);
  }
}
