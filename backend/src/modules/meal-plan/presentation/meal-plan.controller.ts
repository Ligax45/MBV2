import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../auth/domain/auth-user.model';
import { CurrentUser } from '../../auth/presentation/current-user.decorator';
import { JwtAuthGuard } from '../../auth/presentation/jwt-auth.guard';
import { GetMealPlanWeekUseCase } from '../application/use-cases/get-meal-plan-week.usecase';
import { RemoveMealPlanEntryUseCase } from '../application/use-cases/remove-meal-plan-entry.usecase';
import { SetMealPlanEntryUseCase } from '../application/use-cases/set-meal-plan-entry.usecase';

@Controller('meal-plan')
@UseGuards(JwtAuthGuard)
export class MealPlanController {
  constructor(
    private readonly getMealPlanWeek: GetMealPlanWeekUseCase,
    private readonly setMealPlanEntry: SetMealPlanEntryUseCase,
    private readonly removeMealPlanEntry: RemoveMealPlanEntryUseCase,
  ) {}

  @Get()
  getWeek(
    @Query('weekStart') weekStart: string | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.getMealPlanWeek.execute(weekStart, user);
  }

  @Put(':date')
  setEntry(
    @Param('date') date: string,
    @Body() body: { recipeId?: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.setMealPlanEntry.execute(date, body.recipeId, user);
  }

  @Delete(':date')
  removeEntry(
    @Param('date') date: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.removeMealPlanEntry.execute(date, user);
  }
}
