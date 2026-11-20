import { Inject, Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '../../../auth/domain/auth-user.model';
import { canViewRecipe } from '../../../recipe/application/recipe-authorization.util';
import {
  addDaysToIsoDate,
  parseIsoDateParam,
} from '../meal-plan-date.util';
import { toMealPlanWeekResponse } from '../meal-plan-response.util';
import {
  MEAL_PLAN_REPOSITORY,
  type MealPlanRepository,
} from '../../domain/repositories/meal-plan.repository';

@Injectable()
export class GetMealPlanWeekUseCase {
  constructor(
    @Inject(MEAL_PLAN_REPOSITORY)
    private readonly mealPlanRepo: MealPlanRepository,
  ) {}

  async execute(weekStartRaw: string | undefined, user: AuthenticatedUser) {
    const weekStart = parseIsoDateParam(weekStartRaw, 'weekStart');
    const weekEnd = addDaysToIsoDate(weekStart, 6);

    const entries = await this.mealPlanRepo.findByUserAndDateRange(
      user.id,
      weekStart,
      weekEnd,
    );

    const visibleEntries = entries.filter((entry) =>
      canViewRecipe(user, entry.recipe),
    );

    return toMealPlanWeekResponse(weekStart, weekEnd, visibleEntries);
  }
}
