import type { RecipeDifficulty } from './recipe-api.model';

export interface MealPlanRecipeSummary {
  id: string;
  title: string;
  imageUrl: string | null;
  totalTimeMinutes: number;
  difficulty: RecipeDifficulty;
}

export interface MealPlanEntry {
  date: string;
  recipe: MealPlanRecipeSummary;
}

export interface MealPlanWeek {
  weekStart: string;
  weekEnd: string;
  entries: MealPlanEntry[];
}

export interface MealPlanDayView {
  date: string;
  weekdayLabel: string;
  shortDateLabel: string;
  entry: MealPlanEntry | null;
}
