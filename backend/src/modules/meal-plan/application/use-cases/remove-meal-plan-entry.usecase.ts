import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { AuthenticatedUser } from '../../../auth/domain/auth-user.model';
import { parseIsoDateParam } from '../meal-plan-date.util';
import {
  MEAL_PLAN_REPOSITORY,
  type MealPlanRepository,
} from '../../domain/repositories/meal-plan.repository';

@Injectable()
export class RemoveMealPlanEntryUseCase {
  constructor(
    @Inject(MEAL_PLAN_REPOSITORY)
    private readonly mealPlanRepo: MealPlanRepository,
  ) {}

  async execute(planDateRaw: string, user: AuthenticatedUser) {
    const planDate = parseIsoDateParam(planDateRaw, 'date');
    const deleted = await this.mealPlanRepo.deleteByUserAndDate(
      user.id,
      planDate,
    );
    if (!deleted) {
      throw new NotFoundException('Aucun repas planifié pour ce jour');
    }
    return { success: true };
  }
}
