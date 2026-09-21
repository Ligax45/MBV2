import type { MealPlanEntry } from '../entities/meal-plan-entry.entity';

export const MEAL_PLAN_REPOSITORY = Symbol('MEAL_PLAN_REPOSITORY');

export interface MealPlanRepository {
  findByUserAndDateRange(
    userId: string,
    fromDate: string,
    toDate: string,
  ): Promise<MealPlanEntry[]>;

  upsert(
    userId: string,
    planDate: string,
    recipeId: string,
  ): Promise<MealPlanEntry>;

  deleteByUserAndDate(userId: string, planDate: string): Promise<boolean>;
}
