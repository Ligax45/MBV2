import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';

import type { MealPlanEntry, MealPlanWeek } from '@core/models/meal-plan.model';
import {
  addDaysToIsoDate,
  buildWeekDates,
} from '@core/utils/meal-plan-week.util';

const STORAGE_KEY = 'miambook_meal_plan_bouchon';

type StoredPlan = Record<string, MealPlanEntry>;

@Injectable({ providedIn: 'root' })
export class MealPlanBouchonService {
  getWeek(weekStart: string): Observable<MealPlanWeek> {
    const store = this.readStore();
    const weekEnd = addDaysToIsoDate(weekStart, 6);
    const dates = buildWeekDates(weekStart);
    const entries = dates
      .map((date) => store[date])
      .filter((entry): entry is MealPlanEntry => entry != null);

    return of({ weekStart, weekEnd, entries }).pipe(delay(200));
  }

  setEntry(date: string, recipeId: string): Observable<MealPlanEntry> {
    const store = this.readStore();
    const existing = Object.values(store).find((e) => e.recipe.id === recipeId);
    const recipe =
      existing?.recipe ??
      ({
        id: recipeId,
        title: 'Recette bouchon',
        imageUrl: null,
        totalTimeMinutes: 45,
        difficulty: 'facile',
      } as MealPlanEntry['recipe']);

    const entry: MealPlanEntry = { date, recipe };
    store[date] = entry;
    this.writeStore(store);
    return of(entry).pipe(delay(150));
  }

  removeEntry(date: string): Observable<{ success: boolean }> {
    const store = this.readStore();
    if (!store[date]) {
      return of({ success: false }).pipe(delay(100));
    }
    delete store[date];
    this.writeStore(store);
    return of({ success: true }).pipe(delay(100));
  }

  private readStore(): StoredPlan {
    if (typeof localStorage === 'undefined') {
      return {};
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return {};
      }
      return JSON.parse(raw) as StoredPlan;
    } catch {
      return {};
    }
  }

  private writeStore(store: StoredPlan): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }
}
