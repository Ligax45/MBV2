import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import type { MealPlanEntry, MealPlanWeek } from '@core/models/meal-plan.model';
import { environment } from '../../../environments/environment';

import { MealPlanApiService } from './meal-plan-api.service';
import { MealPlanBouchonService } from './meal-plan-bouchon.service';

@Injectable({ providedIn: 'root' })
export class MealPlanDataService {
  private readonly api = inject(MealPlanApiService);
  private readonly bouchon = inject(MealPlanBouchonService);

  getWeek(weekStart: string): Observable<MealPlanWeek> {
    if (environment.useMockData) {
      return this.bouchon.getWeek(weekStart);
    }
    return this.api.getWeek(weekStart);
  }

  setEntry(date: string, recipeId: string): Observable<MealPlanEntry> {
    if (environment.useMockData) {
      return this.bouchon.setEntry(date, recipeId);
    }
    return this.api.setEntry(date, recipeId);
  }

  removeEntry(date: string): Observable<{ success: boolean }> {
    if (environment.useMockData) {
      return this.bouchon.removeEntry(date);
    }
    return this.api.removeEntry(date);
  }
}
