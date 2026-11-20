import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../../auth/domain/auth-user.model';
import { canViewRecipe } from '../../../recipe/application/recipe-authorization.util';
import { RECIPE_REPOSITORY } from '../../../recipe/domain/repositories/recipe.repository';
import type { RecipeRepository } from '../../../recipe/domain/repositories/recipe.repository';
import { parseIsoDateParam } from '../meal-plan-date.util';
import { toMealPlanEntryResponse } from '../meal-plan-response.util';
import {
  MEAL_PLAN_REPOSITORY,
  type MealPlanRepository,
} from '../../domain/repositories/meal-plan.repository';

const PG_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class SetMealPlanEntryUseCase {
  constructor(
    @Inject(MEAL_PLAN_REPOSITORY)
    private readonly mealPlanRepo: MealPlanRepository,
    @Inject(RECIPE_REPOSITORY)
    private readonly recipeRepo: RecipeRepository,
  ) {}

  async execute(
    planDateRaw: string,
    recipeIdRaw: string | undefined,
    user: AuthenticatedUser,
  ) {
    const planDate = parseIsoDateParam(planDateRaw, 'date');
    const recipeId = recipeIdRaw?.trim() ?? '';
    if (!recipeId) {
      throw new BadRequestException('recipeId est requis');
    }
    if (!PG_UUID_RE.test(recipeId)) {
      throw new BadRequestException('recipeId doit être un UUID valide');
    }

    const recipe = await this.recipeRepo.findById(recipeId);
    if (!recipe || !canViewRecipe(user, recipe)) {
      throw new NotFoundException('Recette introuvable');
    }

    const entry = await this.mealPlanRepo.upsert(user.id, planDate, recipeId);
    return toMealPlanEntryResponse(entry);
  }
}
