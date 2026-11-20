import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RecipeModule } from '../recipe/recipe.module';
import { GetMealPlanWeekUseCase } from './application/use-cases/get-meal-plan-week.usecase';
import { RemoveMealPlanEntryUseCase } from './application/use-cases/remove-meal-plan-entry.usecase';
import { SetMealPlanEntryUseCase } from './application/use-cases/set-meal-plan-entry.usecase';
import { MEAL_PLAN_REPOSITORY } from './domain/repositories/meal-plan.repository';
import {
  MealPlanEntryOrmEntity,
  MealPlanEntryOrmEntitySchema,
} from './infrastructure/mikroorm/meal-plan-entry.orm-entity';
import {
  RecipeOrmEntity,
  RecipeOrmEntitySchema,
} from '../recipe/infrastructure/mikroorm/recipe.orm-entity';
import {
  RecipeTypeOrmEntity,
  RecipeTypeOrmEntitySchema,
} from '../recipe/infrastructure/mikroorm/recipe-type.orm-entity';
import {
  UserOrmEntity,
  UserOrmEntitySchema,
} from '../recipe/infrastructure/mikroorm/user.orm-entity';
import { MikroOrmMealPlanRepository } from './infrastructure/repositories/meal-plan.repository.impl';
import { MealPlanController } from './presentation/meal-plan.controller';

@Module({
  imports: [
    AuthModule,
    RecipeModule,
    MikroOrmModule.forFeature([
      MealPlanEntryOrmEntitySchema,
      MealPlanEntryOrmEntity,
      RecipeOrmEntitySchema,
      RecipeOrmEntity,
      RecipeTypeOrmEntitySchema,
      RecipeTypeOrmEntity,
      UserOrmEntitySchema,
      UserOrmEntity,
    ]),
  ],
  controllers: [MealPlanController],
  providers: [
    GetMealPlanWeekUseCase,
    SetMealPlanEntryUseCase,
    RemoveMealPlanEntryUseCase,
    {
      provide: MEAL_PLAN_REPOSITORY,
      useClass: MikroOrmMealPlanRepository,
    },
  ],
})
export class MealPlanModule {}
