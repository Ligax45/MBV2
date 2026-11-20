import type { Recipe } from '../../../recipe/domain/entities/recipe.entity';

export class MealPlanEntry {
  constructor(
    readonly planDate: string,
    readonly recipe: Recipe,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}
}
