import { Routes } from '@angular/router';

import { authGuard } from '@core/guards/auth.guard';

export const mealPlanRoutes: Routes = [
  {
    path: 'planification',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./meal-plan.component').then((m) => m.MealPlanComponent),
  },
];
